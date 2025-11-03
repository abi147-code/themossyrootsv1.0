'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

if (typeof window !== 'undefined') {
  (window as any).NEXT_PUBLIC_INVOICE_API_URL = process.env.NEXT_PUBLIC_INVOICE_API_URL;
}

type CurrencyCode = 'USD' | 'EUR' | 'INR';

type SendResult = { message?: string } | null;

type InvoiceItemInput = {
  description: string;
  quantity: number;
  price: number;
};

type InvoiceItemFormRow = InvoiceItemInput & { id: string };

type InvoiceSummaryPayload = {
  invoice_id?: string | null;
  from_name?: string;
  from_address?: string;
  to_name?: string;
  to_address?: string;
  title?: string;
  issue_date?: string | null;
  notes?: string;
  terms?: string;
  customer: {
    name: string;
    email: string;
  };
  items: InvoiceItemInput[];
  taxRate: number;
  vatRate?: number;
  shippingRate?: number;
  paymentTerm?: string;
  poNumber?: string;
  currency?: CurrencyCode;
  dueDate?: string | null;
  invoiceId?: string | null;
  logo?: string | null;
  logoAlignment?: LogoAlignment;
  logoMaxWidth?: number;
  logoMaxHeight?: number;
  organization?: {
    name: string;
    logoUrl?: string | null;
  };
};

type ToastState =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

type LogoAlignment = 'left' | 'center' | 'right';

type FieldKey =
  | 'billingFromName'
  | 'billingFromAddress'
  | 'customerName'
  | 'customerEmail'
  | 'billingToAddress'
  | 'invoiceTitle'
  | 'issueDate'
  | 'notes'
  | 'terms'
  | 'invoiceTo'
  | 'paymentTerm'
  | 'poNumber';

type FieldErrors = Partial<Record<FieldKey, string>>;
type ItemFieldErrors = Partial<Record<keyof InvoiceItemInput, string>>;
type ItemErrorsMap = Record<string, ItemFieldErrors>;

type MarketingDraft = {
  open?: boolean;
  headline?: string;
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  fontColor?: string;
  fontStyle?: string[];
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageName?: string;
  backgroundImageUrl?: string;
  backgroundImageOpacity?: number;
};

type InvoiceMarketingPayload = {
  headline?: string;
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  fontStyle?: string[];
  fontColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
};

type DraftShape = {
  formValues: FormValues;
  invoiceItems: InvoiceItemFormRow[];
  invoiceTaxRate: string;
  invoiceVatRate: string;
  invoiceShippingRate: string;
  invoiceTo: string;
  currency: CurrencyCode;
  paymentTerm?: string;
  poNumber?: string;
  invoiceSequence: number;
  companyLogoData?: string;
  companyLogoName?: string;
  companyLogoUrl?: string;
  companyLogoAlignment?: LogoAlignment;
  companyLogoMaxWidth?: number;
  companyLogoMaxHeight?: number;
  marketing?: MarketingDraft;
};

type PersistDraftOptions = {
  showSuccessToast?: boolean;
  suppressErrorToast?: boolean;
  errorMessage?: string;
};

const DRAFT_STORAGE_KEY = 'tmr_invoice_draft';
const SEQUENCE_STORAGE_KEY = 'tmr_invoice_sequence';

const initialInvoiceValues: InvoiceItemInput = {
  description: '',
  quantity: 1,
  price: 0,
};

const DEFAULT_MARKETING_FONT_COLOR = '#1F2937';
const DEFAULT_MARKETING_BACKGROUND_COLOR = '#F3F4F6';
const DEFAULT_MARKETING_IMAGE_OPACITY = 1;
const DEFAULT_LOGO_ALIGNMENT: LogoAlignment = 'left';
const DEFAULT_LOGO_MAX_WIDTH = 160;
const DEFAULT_LOGO_MAX_HEIGHT = 80;

const getTodayIsoDate = () => {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - tzOffsetMs);
  return localTime.toISOString().slice(0, 10);
};

const initialFormValues = {
  billingFromName: '',
  billingFromAddress: '',
  customerName: '',
  billingToAddress: '',
  customerEmail: '',
  dueDate: '',
  issueDate: getTodayIsoDate(),
  invoiceTitle: '',
  notes: '',
  terms: '',
  paymentTerm: '',
  poNumber: '',
};

type FormValues = typeof initialFormValues;

const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  EUR: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }),
  INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
};

const formatMoney = (value: number, currency: CurrencyCode): string => {
  const formatter = currencyFormatters[currency];
  return formatter.format(Number.isFinite(value) ? value : 0);
};

const invoiceApiUrl =
  process.env.NEXT_PUBLIC_INVOICE_API_URL ||
  (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_INVOICE_API_URL : '') ||
  'http://localhost:5000';

const INVOICE_API_BASE_URL = invoiceApiUrl.replace(/\/$/, '');

const extractFilename = (header: string | null, fallback: string): string => {
  if (!header) return fallback;
  const filenameMatch = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(header);
  if (!filenameMatch || !filenameMatch[1]) {
    return fallback;
  }
  const raw = filenameMatch[1].replace(/"/g, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const generateRowId = (): string => {
  const cryptoObject = globalThis.crypto as Crypto | undefined;
  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const createInvoiceItem = (): InvoiceItemFormRow => ({
  id: generateRowId(),
  ...initialInvoiceValues,
});

const sanitizeInvoiceItems = (items: InvoiceItemFormRow[]): InvoiceItemInput[] =>
  items
    .map((item) => ({
      description: item.description.trim(),
      quantity: Number.parseFloat(String(item.quantity)) || 0,
      price: Number.parseFloat(String(item.price)) || 0,
    }))
    .filter((item) => item.description && item.quantity > 0 && item.price >= 0);

const parseTaxRateInput = (value: string): number => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  const decimal = parsed / 100;
  return Math.min(Math.max(decimal, 0), 1);
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InvoicePreviewModal({
  open,
  onClose,
  invoiceNumber,
  organizationName,
  organizationEmail,
  fromName,
  fromAddress,
  toName,
  toAddress,
  customerEmail,
  invoiceTitle,
  issueDate,
  dueDate,
  notes,
  terms,
  items,
  totals,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  organizationName: string;
  organizationEmail: string;
  fromName?: string;
  fromAddress?: string;
  toName?: string;
  toAddress?: string;
  customerEmail?: string;
  invoiceTitle?: string;
  issueDate?: string | null;
  dueDate?: string | null;
  notes?: string;
  terms?: string;
  items: InvoiceItemInput[];
  totals: { subtotal: number; taxAmount: number; total: number };
  currency: CurrencyCode;
}) {
  const portalRef = useRef<HTMLDivElement | null>(null);

  if (typeof document !== 'undefined' && portalRef.current === null) {
    portalRef.current = document.createElement('div');
  }

  useEffect(() => {
    if (!open || !portalRef.current || typeof document === 'undefined') return;
    const element = portalRef.current;
    document.body.appendChild(element);
    return () => {
      document.body.removeChild(element);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !portalRef.current) {
    return null;
  }

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'Due upon receipt';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString() : 'Not set';
  const headerTitle = invoiceTitle?.trim() || 'Invoice snapshot';
  const displayFromName = fromName?.trim() || organizationName;
  const displayFromAddress = fromAddress?.trim() || '';
  const displayToName = toName?.trim() || 'Client name';
  const displayToAddress = toAddress?.trim() || '';
  const displayToEmail = customerEmail || 'client@example.com';
  const safeNotes = notes?.trim() || 'No notes provided.';
  const safeTerms = terms?.trim() || 'No terms provided.';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/80"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{headerTitle}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {displayFromName}
              {organizationEmail ? <span> | {organizationEmail}</span> : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">From</p>
              <p className="mt-2 text-sm font-semibold text-white">{displayFromName}</p>
              {organizationEmail ? <p className="text-xs text-slate-300">{organizationEmail}</p> : null}
              {displayFromAddress ? (
                <p className="mt-3 whitespace-pre-line text-xs text-slate-400">{displayFromAddress}</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bill to</p>
              <p className="mt-2 text-sm font-semibold text-white">{displayToName}</p>
              <p className="text-xs text-slate-300">{displayToEmail}</p>
              {displayToAddress ? (
                <p className="mt-3 whitespace-pre-line text-xs text-slate-400">{displayToAddress}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invoice #</p>
                <p className="mt-1 text-sm text-slate-300">{invoiceNumber}</p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <p>
                  Issue date <span className="text-slate-100">{formattedIssueDate}</span>
                </p>
                <p>
                  Due date <span className="text-slate-100">{formattedDueDate}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subtotal</p>
                <p className="mt-2 text-sm font-semibold text-white">{formatMoney(totals.subtotal, currency)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tax</p>
                <p className="mt-2 text-sm font-semibold text-white">{formatMoney(totals.taxAmount, currency)}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Line items</p>
                <p className="mt-2 text-sm font-semibold text-white">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Description</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-300">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-300">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                {items.map((item, index) => {
                  const lineTotal = item.quantity * item.price;
                  return (
                    <tr key={`${item.description}-${index}`}>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(item.price, currency)}</td>
                      <td className="px-4 py-3 text-right">{formatMoney(lineTotal, currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900/60 text-slate-300">
                <tr>
                  <td className="px-4 py-3" colSpan={3}>
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right">{formatMoney(totals.subtotal, currency)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3" colSpan={3}>
                    Tax
                  </td>
                  <td className="px-4 py-3 text-right">{formatMoney(totals.taxAmount, currency)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold" colSpan={3}>
                    Total due
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatMoney(totals.total, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Notes</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-200">{safeNotes}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Terms &amp; conditions</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-200">{safeTerms}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalRef.current
  );
}
export default function InvoicesPage() {
  const { token, user, loading } = useAuth();

  const [invoiceFormLoading, setInvoiceFormLoading] = useState(false);
  const [fontColor, setFontColor] = useState<string>('#111111');
  const [pageColor, setPageColor] = useState<string>('#FFFFFF');
  const [invoiceVatRate, setInvoiceVatRate] = useState<string>('0');
  const [invoiceShippingRate, setInvoiceShippingRate] = useState<string>('0');
  const [marketingOpen, setMarketingOpen] = useState<boolean>(false);
  const [marketingHeadline, setMarketingHeadline] = useState<string>('');
  const [marketingMessage, setMarketingMessage] = useState<string>('');
  const [marketingCtaText, setMarketingCtaText] = useState<string>('');
  const [marketingCtaLink, setMarketingCtaLink] = useState<string>('');
  const [marketingFontColor, setMarketingFontColor] = useState<string>(DEFAULT_MARKETING_FONT_COLOR);
  const [marketingBackgroundColor, setMarketingBackgroundColor] = useState<string>(DEFAULT_MARKETING_BACKGROUND_COLOR);
  const [marketingBackgroundImage, setMarketingBackgroundImage] = useState<string>('');
  const [marketingBackgroundImageName, setMarketingBackgroundImageName] = useState<string>('');
  const [marketingBackgroundImageUrl, setMarketingBackgroundImageUrl] = useState<string>('');
  const [marketingBackgroundImageOpacity, setMarketingBackgroundImageOpacity] = useState<number>(DEFAULT_MARKETING_IMAGE_OPACITY);
  const [marketingStyles, setMarketingStyles] = useState<string[]>([]);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyLogoName, setCompanyLogoName] = useState<string>('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>('');
  const [companyLogoAlignment, setCompanyLogoAlignment] = useState<LogoAlignment>(DEFAULT_LOGO_ALIGNMENT);
  const [companyLogoMaxWidth, setCompanyLogoMaxWidth] = useState<string>(String(DEFAULT_LOGO_MAX_WIDTH));
  const [companyLogoMaxHeight, setCompanyLogoMaxHeight] = useState<string>(String(DEFAULT_LOGO_MAX_HEIGHT));
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSendResult, setInvoiceSendResult] = useState<SendResult>(null);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [invoiceTo, setInvoiceTo] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormRow[]>(() => [createInvoiceItem()]);
  const [invoiceItemsError, setInvoiceItemsError] = useState<string | null>(null);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState<string>('0');
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [itemErrors, setItemErrors] = useState<ItemErrorsMap>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [pendingDraft, setPendingDraft] = useState<DraftShape | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [allowAutosave, setAllowAutosave] = useState(false);
  const [invoiceSequence, setInvoiceSequence] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const trimmedValues = useMemo(
    () => ({
      billingFromName: formValues.billingFromName.trim(),
      billingFromAddress: formValues.billingFromAddress.trim(),
      customerName: formValues.customerName.trim(),
      customerEmail: formValues.customerEmail.trim(),
      billingToAddress: formValues.billingToAddress.trim(),
      invoiceTitle: formValues.invoiceTitle.trim(),
      paymentTerm: formValues.paymentTerm.trim(),
      poNumber: formValues.poNumber.trim(),
      notes: formValues.notes.trim(),
      terms: formValues.terms.trim(),
      invoiceTo: invoiceTo.trim(),
      issueDate: formValues.issueDate,
    }),
    [formValues, invoiceTo]
  );

  const sanitizedInvoiceItems = useMemo(() => sanitizeInvoiceItems(invoiceItems), [invoiceItems]);

  const marketingHasContent = useMemo(
    () =>
      Boolean(
        marketingHeadline ||
          marketingMessage ||
          marketingCtaText ||
          marketingCtaLink ||
          marketingBackgroundImage ||
          marketingBackgroundColor !== DEFAULT_MARKETING_BACKGROUND_COLOR
      ),
    [
      marketingHeadline,
      marketingMessage,
      marketingCtaText,
      marketingCtaLink,
      marketingBackgroundImage,
      marketingBackgroundColor,
    ]
  );

  const marketingPayload = useMemo<InvoiceMarketingPayload | undefined>(() => {
    if (!marketingHasContent) {
      return undefined;
    }

    return {
      headline: marketingHeadline,
      message: marketingMessage,
      ctaText: marketingCtaText,
      ctaLink: marketingCtaLink,
      fontStyle: marketingStyles,
      fontColor: marketingFontColor,
      backgroundColor: marketingBackgroundColor,
      backgroundImageOpacity: marketingBackgroundImageOpacity,
      ...(marketingBackgroundImage ? { backgroundImage: marketingBackgroundImage } : {}),
    };
  }, [
    marketingHasContent,
    marketingHeadline,
    marketingMessage,
    marketingCtaText,
    marketingCtaLink,
    marketingStyles,
    marketingFontColor,
    marketingBackgroundColor,
    marketingBackgroundImageOpacity,
    marketingBackgroundImage,
  ]);

  const invoiceApiBaseUrl = INVOICE_API_BASE_URL;

  const invoiceTotals = useMemo(() => {
    const subtotal = sanitizedInvoiceItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const taxRateDecimal = Number.isFinite(Number.parseFloat(invoiceTaxRate))
      ? parseTaxRateInput(invoiceTaxRate)
      : 0;
    const taxAmount = subtotal * taxRateDecimal;
    const total = subtotal + taxAmount;
    return {
      subtotal,
      taxAmount,
      total,
      taxRateDecimal,
    };
  }, [sanitizedInvoiceItems, invoiceTaxRate]);

  // For PDF generation, do not require 'invoiceTo' (recipient email).
  const canGeneratePdf = useMemo(
    () =>
      Boolean(
        trimmedValues.billingFromName &&
          trimmedValues.billingFromAddress &&
          trimmedValues.customerName &&
          trimmedValues.billingToAddress &&
          trimmedValues.customerEmail &&
          trimmedValues.invoiceTitle &&
          trimmedValues.issueDate &&
          sanitizedInvoiceItems.length > 0
      ),
    [
      trimmedValues.billingFromName,
      trimmedValues.billingFromAddress,
      trimmedValues.customerName,
      trimmedValues.billingToAddress,
      trimmedValues.customerEmail,
      trimmedValues.invoiceTitle,
      trimmedValues.issueDate,
      sanitizedInvoiceItems.length,
    ]
  );

  const invoiceNumber = useMemo(() => {
    const year = new Date().getFullYear();
    return `INV-${year}-${String(invoiceSequence).padStart(3, '0')}`;
  }, [invoiceSequence]);

  const shouldDeferRender = loading || !token;

  const showToast = useCallback((payload: Exclude<ToastState, null>) => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setToast(payload);
    toastTimeout.current = setTimeout(() => {
      setToast(null);
      toastTimeout.current = null;
    }, 4000);
  }, []);

  const persistDraft = useCallback(
    (payload: DraftShape, options?: PersistDraftOptions): boolean => {
      if (typeof window === 'undefined') return false;
      const { showSuccessToast = false, suppressErrorToast = false, errorMessage } = options ?? {};
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        if (showSuccessToast) {
          showToast({ type: 'success', message: 'Draft saved.' });
        }
        return true;
      } catch (error) {
        console.error('Failed to persist invoice draft:', error);
        if (!suppressErrorToast) {
          showToast({
            type: 'error',
            message: errorMessage ?? 'Unable to save draft. Try a smaller logo or paste a logo URL instead.',
          });
        }
        setAllowAutosave(false);
        return false;
      }
    },
    [showToast, setAllowAutosave],
  );

  const buildDraftState = useCallback((): DraftShape => {
    const parsedLogoWidth = Number.parseFloat(companyLogoMaxWidth);
    const parsedLogoHeight = Number.parseFloat(companyLogoMaxHeight);
    return {
      formValues,
      invoiceItems,
      invoiceTaxRate,
      invoiceVatRate,
      invoiceShippingRate,
      invoiceTo,
      currency,
      paymentTerm: formValues.paymentTerm,
      poNumber: formValues.poNumber,
      invoiceSequence,
      companyLogoData: companyLogo || undefined,
      companyLogoName: companyLogoName || undefined,
      companyLogoUrl: companyLogoUrl || undefined,
      companyLogoAlignment,
      companyLogoMaxWidth: Number.isFinite(parsedLogoWidth) && parsedLogoWidth > 0 ? parsedLogoWidth : undefined,
      companyLogoMaxHeight: Number.isFinite(parsedLogoHeight) && parsedLogoHeight > 0 ? parsedLogoHeight : undefined,
      marketing: {
        open: marketingOpen,
        headline: marketingHeadline,
        message: marketingMessage,
        ctaText: marketingCtaText,
        ctaLink: marketingCtaLink,
        fontColor: marketingFontColor,
        fontStyle: marketingStyles,
        backgroundColor: marketingBackgroundColor,
        backgroundImage: marketingBackgroundImage,
        backgroundImageName: marketingBackgroundImageName,
        backgroundImageUrl: marketingBackgroundImageUrl,
        backgroundImageOpacity: marketingBackgroundImageOpacity,
      },
    };
  }, [
    formValues,
    invoiceItems,
    invoiceTaxRate,
    invoiceVatRate,
    invoiceShippingRate,
    invoiceTo,
    currency,
    invoiceSequence,
    companyLogo,
    companyLogoName,
    companyLogoUrl,
    companyLogoAlignment,
    companyLogoMaxWidth,
    companyLogoMaxHeight,
    marketingOpen,
    marketingHeadline,
    marketingMessage,
    marketingCtaText,
    marketingCtaLink,
    marketingFontColor,
    marketingStyles,
    marketingBackgroundColor,
    marketingBackgroundImage,
    marketingBackgroundImageName,
    marketingBackgroundImageUrl,
    marketingBackgroundImageOpacity,
  ]);

  const companyLogoPreview = companyLogo || companyLogoUrl.trim();

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as DraftShape;
        setPendingDraft(parsed);
        setShowRestorePrompt(true);
      } catch (error) {
        console.error('Failed to parse invoice draft:', error);
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        setAllowAutosave(true);
      }
    } else {
      setAllowAutosave(true);
    }

    const storedSequence = window.localStorage.getItem(SEQUENCE_STORAGE_KEY);
    if (storedSequence) {
      const parsedSequence = Number.parseInt(storedSequence, 10);
      if (Number.isFinite(parsedSequence) && parsedSequence > 0) {
        setInvoiceSequence(parsedSequence);
      }
    }
  }, []);

  useEffect(() => {
    if (!allowAutosave || typeof window === 'undefined') return;
    const payload = buildDraftState();
    persistDraft(payload, {
      showSuccessToast: false,
      suppressErrorToast: false,
      errorMessage: 'Autosave paused: unable to store draft. Try a smaller logo or paste a logo URL instead.',
    });
  }, [allowAutosave, buildDraftState, persistDraft]);
  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    setFormValues({ ...initialFormValues, ...pendingDraft.formValues });
    const restoredItems = (pendingDraft.invoiceItems || []).map((item) => ({
      id: item.id || generateRowId(),
      description: item.description ?? '',
      quantity: item.quantity ?? 0,
      price: item.price ?? 0,
    }));
    setInvoiceItems(restoredItems.length > 0 ? restoredItems : [createInvoiceItem()]);
    setInvoiceTaxRate(pendingDraft.invoiceTaxRate ?? '0');
    setInvoiceVatRate(pendingDraft.invoiceVatRate ?? '0');
    setInvoiceShippingRate(pendingDraft.invoiceShippingRate ?? '0');
    setInvoiceTo(pendingDraft.invoiceTo ?? '');
    setCurrency(pendingDraft.currency ?? 'EUR');
    setFormValues((prev) => ({
      ...prev,
      paymentTerm: pendingDraft.paymentTerm ?? prev.paymentTerm,
      poNumber: pendingDraft.poNumber ?? prev.poNumber,
    }));
    setCompanyLogo(pendingDraft.companyLogoData ?? '');
    setCompanyLogoName(pendingDraft.companyLogoName ?? '');
    setCompanyLogoUrl(pendingDraft.companyLogoUrl ?? '');
    const draftLogoAlignment = pendingDraft.companyLogoAlignment;
    setCompanyLogoAlignment(
      draftLogoAlignment === 'left' || draftLogoAlignment === 'center' || draftLogoAlignment === 'right'
        ? draftLogoAlignment
        : DEFAULT_LOGO_ALIGNMENT,
    );
    setCompanyLogoMaxWidth(
      typeof pendingDraft.companyLogoMaxWidth === 'number' && pendingDraft.companyLogoMaxWidth > 0
        ? String(pendingDraft.companyLogoMaxWidth)
        : String(DEFAULT_LOGO_MAX_WIDTH),
    );
    setCompanyLogoMaxHeight(
      typeof pendingDraft.companyLogoMaxHeight === 'number' && pendingDraft.companyLogoMaxHeight > 0
        ? String(pendingDraft.companyLogoMaxHeight)
        : String(DEFAULT_LOGO_MAX_HEIGHT),
    );
    const marketingDraft = pendingDraft.marketing;
    if (marketingDraft) {
      setMarketingOpen(Boolean(marketingDraft.open));
      setMarketingHeadline(marketingDraft.headline ?? '');
      setMarketingMessage(marketingDraft.message ?? '');
      setMarketingCtaText(marketingDraft.ctaText ?? '');
      setMarketingCtaLink(marketingDraft.ctaLink ?? '');
      setMarketingFontColor(marketingDraft.fontColor ?? DEFAULT_MARKETING_FONT_COLOR);
      setMarketingStyles(marketingDraft.fontStyle ?? []);
      setMarketingBackgroundColor(marketingDraft.backgroundColor ?? DEFAULT_MARKETING_BACKGROUND_COLOR);
      setMarketingBackgroundImage(marketingDraft.backgroundImage ?? '');
      setMarketingBackgroundImageName(marketingDraft.backgroundImageName ?? '');
      setMarketingBackgroundImageUrl(marketingDraft.backgroundImageUrl ?? '');
      setMarketingBackgroundImageOpacity(
        typeof marketingDraft.backgroundImageOpacity === 'number'
          ? Math.min(Math.max(marketingDraft.backgroundImageOpacity, 0), 1)
          : DEFAULT_MARKETING_IMAGE_OPACITY,
      );
    } else {
      setMarketingOpen(false);
      setMarketingHeadline('');
      setMarketingMessage('');
      setMarketingCtaText('');
      setMarketingCtaLink('');
      setMarketingFontColor(DEFAULT_MARKETING_FONT_COLOR);
      setMarketingStyles([]);
      setMarketingBackgroundColor(DEFAULT_MARKETING_BACKGROUND_COLOR);
      setMarketingBackgroundImage('');
      setMarketingBackgroundImageName('');
      setMarketingBackgroundImageUrl('');
      setMarketingBackgroundImageOpacity(DEFAULT_MARKETING_IMAGE_OPACITY);
    }
    if (pendingDraft.invoiceSequence) {
      setInvoiceSequence(pendingDraft.invoiceSequence);
    }
    setPendingDraft(null);
    setShowRestorePrompt(false);
    setAllowAutosave(true);
    setFieldErrors({});
    setItemErrors({});
    setInvoiceItemsError(null);
    setTouchedFields({});
    setInvoiceSendResult({ message: 'Draft restored.' });
  };

  const handleDismissDraft = () => {
    setPendingDraft(null);
    setShowRestorePrompt(false);
    setAllowAutosave(true);
  };

  const handleManualSaveDraft = () => {
    if (typeof window === 'undefined') return;
    const payload = buildDraftState();
    const saved = persistDraft(payload, {
      showSuccessToast: false,
      suppressErrorToast: false,
      errorMessage: 'Unable to save draft. Try a smaller logo or paste a logo URL instead.',
    });
    if (saved) {
      showToast({ type: 'success', message: 'Draft saved.' });
      if (!allowAutosave) {
        setAllowAutosave(true);
      }
    }
  };

  const handleClearDraft = () => {
    setFormValues(initialFormValues);
    setInvoiceTo('');
    setInvoiceItems([createInvoiceItem()]);
    setInvoiceTaxRate('0');
    setInvoiceVatRate('0');
    setInvoiceShippingRate('0');
    setCurrency('EUR');
    setCompanyLogo('');
    setCompanyLogoName('');
    setCompanyLogoUrl('');
    setCompanyLogoAlignment(DEFAULT_LOGO_ALIGNMENT);
    setCompanyLogoMaxWidth(String(DEFAULT_LOGO_MAX_WIDTH));
    setCompanyLogoMaxHeight(String(DEFAULT_LOGO_MAX_HEIGHT));
    setMarketingOpen(false);
    setMarketingHeadline('');
    setMarketingMessage('');
    setMarketingCtaText('');
    setMarketingCtaLink('');
    setMarketingFontColor(DEFAULT_MARKETING_FONT_COLOR);
    setMarketingStyles([]);
    setMarketingBackgroundColor(DEFAULT_MARKETING_BACKGROUND_COLOR);
    setMarketingBackgroundImage('');
    setMarketingBackgroundImageName('');
    setMarketingBackgroundImageUrl('');
    setMarketingBackgroundImageOpacity(DEFAULT_MARKETING_IMAGE_OPACITY);
    setFieldErrors({});
    setItemErrors({});
    setInvoiceItemsError(null);
    setTouchedFields({});
    setInvoiceSendResult(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setAllowAutosave(true);
    showToast({ type: 'success', message: 'Draft cleared.' });
  };

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: FieldKey) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const value = field === 'invoiceTo' ? trimmedValues.invoiceTo : trimmedValues[field] ?? '';
    const message = getFieldErrorMessage(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleRecipientChange = (value: string) => {
    setInvoiceTo(value);
  };

  const handleInvoiceItemChange = (id: string, field: keyof InvoiceItemInput, value: string) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'quantity' || field === 'price') {
          return { ...item, [field]: Number.parseFloat(value) || 0 };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const addInvoiceItem = () => {
    setInvoiceItems((prev) => [...prev, createInvoiceItem()]);
  };

  const handleCompanyLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Please select an image file for the logo.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCompanyLogo(reader.result);
        setCompanyLogoName(file.name);
        setCompanyLogoUrl('');
        setAllowAutosave(true);
      } else {
        showToast({ type: 'error', message: 'Unable to read the selected logo.' });
      }
    };
    reader.onerror = () => {
      showToast({ type: 'error', message: 'Failed to load the selected logo file.' });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCompanyLogoUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCompanyLogoUrl(value);
    if (value.trim()) {
      setCompanyLogo('');
      setCompanyLogoName('');
    }
    setAllowAutosave(true);
  };

  const clearCompanyLogo = () => {
    setCompanyLogo('');
    setCompanyLogoName('');
    setCompanyLogoUrl('');
    setCompanyLogoAlignment(DEFAULT_LOGO_ALIGNMENT);
    setCompanyLogoMaxWidth(String(DEFAULT_LOGO_MAX_WIDTH));
    setCompanyLogoMaxHeight(String(DEFAULT_LOGO_MAX_HEIGHT));
    setAllowAutosave(true);
  };

  const handleMarketingImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Please select an image file.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMarketingBackgroundImage(reader.result);
        setMarketingBackgroundImageName(file.name);
        setMarketingBackgroundImageUrl('');
        setMarketingOpen(true);
      } else {
        showToast({ type: 'error', message: 'Unable to read the selected image.' });
      }
    };
    reader.onerror = () => {
      showToast({ type: 'error', message: 'Failed to load the selected image.' });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleMarketingImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMarketingBackgroundImageUrl(value);
    const trimmed = value.trim();
    setMarketingBackgroundImage(trimmed);
    setMarketingBackgroundImageName('');
    if (trimmed) {
      setMarketingOpen(true);
    } else {
      setMarketingBackgroundImageOpacity(DEFAULT_MARKETING_IMAGE_OPACITY);
    }
  };

  const clearMarketingBackgroundImage = () => {
    setMarketingBackgroundImage('');
    setMarketingBackgroundImageName('');
    setMarketingBackgroundImageUrl('');
    setMarketingBackgroundImageOpacity(DEFAULT_MARKETING_IMAGE_OPACITY);
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const getFieldErrorMessage = (field: FieldKey, value: string) => {
    const isOptional = field === 'notes' || field === 'terms';
    if (!value && !isOptional) {
      switch (field) {
        case 'billingFromName':
          return 'Enter the billing from company name.';
        case 'billingFromAddress':
          return 'Add the billing from address.';
        case 'customerName':
          return 'Provide the billing to name.';
        case 'billingToAddress':
          return 'Add the billing to address.';
        case 'customerEmail':
          return 'Provide a valid contact email.';
        case 'invoiceTo':
          return 'Provide the recipient email.';
        case 'invoiceTitle':
          return 'Add an invoice title.';
        case 'issueDate':
          return 'Select the issue date.';
        default:
          return 'This field is required.';
      }
    }
    if (
      value &&
      (field === 'customerEmail' || field === 'invoiceTo') &&
      !emailPattern.test(value)
    ) {
      return 'Enter a valid email address.';
    }
    return undefined;
  };

  const validateForm = () => {
    const nextFieldErrors: FieldErrors = {};
    const nextItemErrors: ItemErrorsMap = {};

    ([
      'billingFromName',
      'billingFromAddress',
      'customerName',
      'billingToAddress',
      'customerEmail',
      'invoiceTo',
      'invoiceTitle',
      'issueDate',
    ] as FieldKey[]).forEach((field) => {
      const value = field === 'invoiceTo' ? trimmedValues.invoiceTo : trimmedValues[field];
      const message = getFieldErrorMessage(field, value);
      if (message) {
        nextFieldErrors[field] = message;
      }
    });

    invoiceItems.forEach((item) => {
      const errors: ItemFieldErrors = {};
      if (!item.description.trim()) {
        errors.description = 'Add a description.';
      }
      if (!Number.isFinite(item.quantity) || Number(item.quantity) <= 0) {
        errors.quantity = 'Quantity must be greater than 0.';
      }
      if (!Number.isFinite(item.price) || Number(item.price) < 0) {
        errors.price = 'Price cannot be negative.';
      }
      if (Object.keys(errors).length > 0) {
        nextItemErrors[item.id] = errors;
      }
    });

    const sanitizedItems = sanitizeInvoiceItems(invoiceItems);
    const itemsMessage = sanitizedItems.length === 0 ? 'Add at least one valid line item.' : null;

    setFieldErrors(nextFieldErrors);
    setItemErrors(nextItemErrors);
    setInvoiceItemsError(itemsMessage);

    const hasError =
      Object.keys(nextFieldErrors).length > 0 ||
      Object.keys(nextItemErrors).length > 0 ||
      Boolean(itemsMessage);

    return { hasError, sanitizedItems };
  };

  // Lighter validation for PDF generation (does not require 'invoiceTo')
  const validateFormForPdf = () => {
    const nextFieldErrors: FieldErrors = {};
    const nextItemErrors: ItemErrorsMap = {};

    ([
      'billingFromName',
      'billingFromAddress',
      'customerName',
      'billingToAddress',
      'customerEmail',
      'invoiceTitle',
      'issueDate',
    ] as FieldKey[]).forEach((field) => {
      const value = trimmedValues[field] ?? '';
      const message = getFieldErrorMessage(field, value);
      if (message) {
        nextFieldErrors[field] = message;
      }
    });

    invoiceItems.forEach((item) => {
      const errors: ItemFieldErrors = {};
      if (!item.description.trim()) {
        errors.description = 'Add a description.';
      }
      if (!Number.isFinite(item.quantity) || Number(item.quantity) <= 0) {
        errors.quantity = 'Quantity must be greater than 0.';
      }
      if (!Number.isFinite(item.price) || Number(item.price) < 0) {
        errors.price = 'Price cannot be negative.';
      }
      if (Object.keys(errors).length > 0) {
        nextItemErrors[item.id] = errors;
      }
    });

    const sanitizedItems = sanitizeInvoiceItems(invoiceItems);
    const itemsMessage = sanitizedItems.length === 0 ? 'Add at least one valid line item.' : null;

    setFieldErrors(nextFieldErrors);
    setItemErrors(nextItemErrors);
    setInvoiceItemsError(itemsMessage);

    const hasError =
      Object.keys(nextFieldErrors).length > 0 ||
      Object.keys(nextItemErrors).length > 0 ||
      Boolean(itemsMessage);

    return { hasError, sanitizedItems };
  };

  const buildSummaryPayload = useCallback(
    (sanitizedItems: InvoiceItemInput[]): InvoiceSummaryPayload => {
      const trimmedLogoUrl = companyLogoUrl.trim();
      const resolvedLogo = companyLogo || (trimmedLogoUrl ? trimmedLogoUrl : null);
      const parsedLogoWidth = Number.parseFloat(companyLogoMaxWidth);
      const parsedLogoHeight = Number.parseFloat(companyLogoMaxHeight);
      const organizationName = trimmedValues.billingFromName || user?.organization?.name || 'The Mossy Roots';
      const organizationBlock: InvoiceSummaryPayload['organization'] = {
        name: organizationName,
        ...(resolvedLogo ? { logoUrl: resolvedLogo } : {}),
      };

      const payload: InvoiceSummaryPayload = {
        invoice_id: invoiceNumber,
        from_name: trimmedValues.billingFromName,
        from_address: trimmedValues.billingFromAddress,
        to_name: trimmedValues.customerName,
        to_address: trimmedValues.billingToAddress,
        title: trimmedValues.invoiceTitle,
        issue_date: formValues.issueDate || null,
        notes: trimmedValues.notes,
        terms: trimmedValues.terms,
        customer: {
          name: trimmedValues.customerName,
          email: trimmedValues.customerEmail,
        },
        items: sanitizedItems,
        taxRate: invoiceTotals.taxRateDecimal,
        vatRate: Number.parseFloat(invoiceVatRate) || 0,
        shippingRate: Number.parseFloat(invoiceShippingRate) || 0,
        paymentTerm: formValues.paymentTerm,
        poNumber: formValues.poNumber,
        currency,
        dueDate: formValues.dueDate || null,
        invoiceId: invoiceNumber,
        organization: organizationBlock,
      };

      if (resolvedLogo) {
        payload.logo = resolvedLogo;
        payload.logoAlignment = companyLogoAlignment;
        if (Number.isFinite(parsedLogoWidth) && parsedLogoWidth > 0) {
          payload.logoMaxWidth = parsedLogoWidth;
        }
        if (Number.isFinite(parsedLogoHeight) && parsedLogoHeight > 0) {
          payload.logoMaxHeight = parsedLogoHeight;
        }
      }

      return payload;
    },
    [
      companyLogo,
      companyLogoUrl,
      companyLogoAlignment,
      companyLogoMaxWidth,
      companyLogoMaxHeight,
      trimmedValues.billingFromName,
      trimmedValues.billingFromAddress,
      trimmedValues.customerName,
      trimmedValues.billingToAddress,
      trimmedValues.customerEmail,
      trimmedValues.invoiceTitle,
      trimmedValues.notes,
      trimmedValues.terms,
      formValues.issueDate,
      formValues.dueDate,
      formValues.paymentTerm,
      formValues.poNumber,
      invoiceVatRate,
      invoiceShippingRate,
      invoiceTotals.taxRateDecimal,
      invoiceNumber,
      currency,
      user?.organization?.name,
    ]
  );

  const handlePreview = () => {
    const { hasError } = validateForm();
    if (hasError) {
      setShowValidationBanner(true);
      return;
    }
    setShowValidationBanner(false);
    setPreviewOpen(true);
  };

  const handleSendInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const validation = validateFormForPdf();
    if (validation.hasError) {
      setShowValidationBanner(true);
      return;
    }

    setShowValidationBanner(false);
    setInvoiceFormLoading(true);
    setInvoiceError(null);
    setInvoiceSendResult(null);

    const sanitizedItems = validation.sanitizedItems;
    const summaryPayload = buildSummaryPayload(sanitizedItems);

    try {
      const summaryRequestPayload = marketingPayload
        ? { data: summaryPayload, marketing: marketingPayload }
        : { data: summaryPayload };

      const summaryResponse = await fetch('/api/invoice/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(summaryRequestPayload),
      });

      const summaryJson = (await summaryResponse
        .json()
        .catch(() => null)) as { message?: string; html?: string } | null;

      if (!summaryResponse.ok) {
        setInvoiceError(summaryJson?.message ?? 'Failed to generate invoice summary.');
        setInvoiceFormLoading(false);
        return;
      }

      const emailHtml = summaryJson?.html?.trim();
      if (!emailHtml) {
        setInvoiceError('Invoice summary unavailable.');
        setInvoiceFormLoading(false);
        return;
      }

      const sendRequestPayload: Record<string, unknown> = {
        to: trimmedValues.invoiceTo,
        subject: 'Invoice From TMR',
        summaryPayload,
        html: emailHtml,
        fontColor,
        pageColor,
      };
      if (marketingPayload) {
        sendRequestPayload.marketing = marketingPayload;
      }
      const sendResponse = await fetch('/api/invoice/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sendRequestPayload),
      });

      if (!sendResponse.ok) {
        const body = (await sendResponse.json()) as { message?: string };
        setInvoiceError(body.message ?? 'Failed to send invoice.');
        setInvoiceFormLoading(false);
        return;
      }

      const raw = await sendResponse.json();
      const message = raw?.message || raw?.data?.message || 'Invoice email sent.';
      setInvoiceSendResult({ message });
      setInvoiceError(null);
      setInvoiceItemsError(null);
      setFieldErrors({});
      setItemErrors({});
      setTouchedFields({});
      setInvoiceItems([createInvoiceItem()]);
      setFormValues(initialFormValues);
      setInvoiceTo('');
      setInvoiceTaxRate('0');
      setCurrency('EUR');
      setCompanyLogo('');
      setCompanyLogoName('');
      setCompanyLogoUrl('');
      setCompanyLogoAlignment(DEFAULT_LOGO_ALIGNMENT);
      setCompanyLogoMaxWidth(String(DEFAULT_LOGO_MAX_WIDTH));
      setCompanyLogoMaxHeight(String(DEFAULT_LOGO_MAX_HEIGHT));
      setMarketingOpen(false);
      setMarketingHeadline('');
      setMarketingMessage('');
      setMarketingCtaText('');
      setMarketingCtaLink('');
      setMarketingFontColor(DEFAULT_MARKETING_FONT_COLOR);
      setMarketingStyles([]);
      setMarketingBackgroundColor(DEFAULT_MARKETING_BACKGROUND_COLOR);
      setMarketingBackgroundImage('');
      setMarketingBackgroundImageName('');
      setMarketingBackgroundImageUrl('');
      setMarketingBackgroundImageOpacity(DEFAULT_MARKETING_IMAGE_OPACITY);

      const nextSequence = invoiceSequence + 1;
      setInvoiceSequence(nextSequence);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SEQUENCE_STORAGE_KEY, String(nextSequence));
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setAllowAutosave(true);
    } catch (error) {
      console.error(error);
      setInvoiceError('Failed to send invoice.');
    } finally {
      setInvoiceFormLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!invoiceApiBaseUrl) {
      setInvoiceError('Invoice API URL is not configured.');
      return;
    }

    const validation = validateForm();
    if (validation.hasError) {
      setShowValidationBanner(true);
      return;
    }

    setShowValidationBanner(false);
    setInvoiceError(null);
    setIsGeneratingPdf(true);

    const sanitizedItems = validation.sanitizedItems;
    const summaryPayload = buildSummaryPayload(sanitizedItems);

    try {
      const response = await fetch(`${invoiceApiBaseUrl}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: summaryPayload,
          fontColor,
          pageColor,
          ...(marketingPayload ? { marketing: marketingPayload } : {}),
        }),
      });

      if (!response.ok) {
        let message = 'Failed to generate PDF.';
        try {
          const errorBody = await response.json();
          if (errorBody?.message) {
            message = errorBody.message;
          }
        } catch {
          // ignore: non-json response
        }
        setInvoiceError(message);
        return;
      }

      const blob = await response.blob();
      if (!blob.size) {
        setInvoiceError('Received an empty PDF document.');
        return;
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = extractFilename(contentDisposition, `${invoiceNumber}.pdf`);

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast({ type: 'success', message: 'Invoice PDF downloaded.' });
    } catch (error) {
      console.error(error);
      setInvoiceError('Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (shouldDeferRender) {
    return null;
  }

  const organizationName = user?.organization?.name || 'The Mossy Roots';
  const organizationEmail = user?.email || 'founder@tmr.local';
  // TODO: Future integration – load global brand settings and open invoice builder here

  const fieldHasError = (field: FieldKey) =>
    Boolean(fieldErrors[field]) && (touchedFields[field] || showValidationBanner);

  const itemFieldHasError = (id: string, field: keyof InvoiceItemInput) =>
    Boolean(itemErrors[id]?.[field]);
  return (
    <div className="relative mx-auto max-w-5xl space-y-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {toast ? (
        <div
          className={`pointer-events-none fixed left-1/2 top-6 z-40 -translate-x-1/2 transform rounded-2xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
              : 'border-rose-400/50 bg-rose-500/20 text-rose-100'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-200"
      >
        &larr; Back to Dashboard
      </Link>

      {showRestorePrompt && pendingDraft ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-100">
          <p>We found a saved invoice draft. Would you like to restore it?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="rounded-lg border border-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100 transition hover:border-emerald-300 hover:text-white"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDismissDraft}
              className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <header className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-sm shadow-slate-950/40 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400/70">Invoices</p>
            <h2 className="text-3xl font-semibold text-white">Invoice Marketing Generator</h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Generate invoice follow-up assets via the Flask microservice, then dispatch the nurture sequence. Everything runs with a single send action so you can stay focused on the relationship.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="group relative inline-flex">
              <button
                type="button"
                className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 opacity-60"
                disabled
                aria-disabled="true"
              >
                Customize Invoice (soon)
              </button>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-300 opacity-0 transition group-hover:opacity-100">
                Coming soon
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <button
                type="button"
                onClick={handleManualSaveDraft}
                className="rounded-lg border border-slate-700 px-4 py-2 uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={!canGeneratePdf || isGeneratingPdf}
                className={`rounded-lg border px-4 py-2 uppercase tracking-[0.3em] transition ${
                  !canGeneratePdf || isGeneratingPdf
                    ? 'cursor-not-allowed border-slate-700 text-slate-500 opacity-60'
                    : 'border-sky-500/60 text-sky-200 hover:border-sky-400 hover:text-white'
                }`}
              >
                {isGeneratingPdf ? 'Generating…' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="rounded-lg border border-slate-700 px-4 py-2 uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Clear draft
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-sm shadow-slate-950/40 sm:p-8">
        <form className="space-y-8" onSubmit={handleSendInvoice}>
          <div className="space-y-6 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invoice details</p>
                <h4 className="text-lg font-semibold text-white">Billing & metadata</h4>
              </div>
              <p className="text-xs text-slate-400 sm:text-right">
                These details appear in the generated PDF header and footer.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="billingFromName"
                >
                  Company / Billing From Name
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('billingFromName')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="billingFromName"
                  name="billingFromName"
                  autoComplete="off"
                  placeholder="The Mossy Roots SARL"
                  value={formValues.billingFromName}
                  onChange={(event) => handleFieldChange('billingFromName', event.target.value)}
                  onBlur={() => handleFieldBlur('billingFromName')}
                />
                {fieldHasError('billingFromName') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.billingFromName}</p>
                ) : null}
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="billingFromAddress"
                >
                  Billing From Address
                </label>
                <textarea
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('billingFromAddress')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="billingFromAddress"
                  name="billingFromAddress"
                  rows={3}
                  placeholder="123 Green Street, Paris FR 75010"
                  value={formValues.billingFromAddress}
                  onChange={(event) => handleFieldChange('billingFromAddress', event.target.value)}
                  onBlur={() => handleFieldBlur('billingFromAddress')}
                />
                {fieldHasError('billingFromAddress') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.billingFromAddress}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="customerName"
                >
                  Billing To Name
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('customerName')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="customerName"
                  name="customerName"
                  autoComplete="off"
                  placeholder="John Doe Enterprises"
                  value={formValues.customerName}
                  onChange={(event) => handleFieldChange('customerName', event.target.value)}
                  onBlur={() => handleFieldBlur('customerName')}
                />
                {fieldHasError('customerName') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.customerName}</p>
                ) : null}
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="billingToAddress"
                >
                  Billing To Address
                </label>
                <textarea
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('billingToAddress')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="billingToAddress"
                  name="billingToAddress"
                  rows={3}
                  placeholder="221B Baker Street, London UK"
                  value={formValues.billingToAddress}
                  onChange={(event) => handleFieldChange('billingToAddress', event.target.value)}
                  onBlur={() => handleFieldBlur('billingToAddress')}
                />
                {fieldHasError('billingToAddress') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.billingToAddress}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="customerEmail"
                >
                  Billing Contact Email
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('customerEmail')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  autoComplete="off"
                  placeholder="cara@client.com"
                  value={formValues.customerEmail}
                  onChange={(event) => handleFieldChange('customerEmail', event.target.value)}
                  onBlur={() => handleFieldBlur('customerEmail')}
                />
                {fieldHasError('customerEmail') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.customerEmail}</p>
                ) : null}
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="recipientEmail"
                >
                  Recipient Email
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('invoiceTo')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  autoComplete="off"
                  placeholder="billing@client.com"
                  value={invoiceTo}
                  onChange={(event) => handleRecipientChange(event.target.value)}
                  onBlur={() => handleFieldBlur('invoiceTo')}
                />
                {fieldHasError('invoiceTo') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.invoiceTo}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="invoiceTitle"
                >
                  Invoice Title
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('invoiceTitle')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="invoiceTitle"
                  name="invoiceTitle"
                  autoComplete="off"
                  placeholder="Marketing Consulting Invoice"
                  value={formValues.invoiceTitle}
                  onChange={(event) => handleFieldChange('invoiceTitle', event.target.value)}
                  onBlur={() => handleFieldBlur('invoiceTitle')}
                />
                {fieldHasError('invoiceTitle') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.invoiceTitle}</p>
                ) : null}
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="issueDate"
                >
                  Issue Date
                </label>
                <input
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('issueDate')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formValues.issueDate}
                  onChange={(event) => handleFieldChange('issueDate', event.target.value)}
                  onBlur={() => handleFieldBlur('issueDate')}
                />
                {fieldHasError('issueDate') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.issueDate}</p>
                ) : null}
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="dueDate"
                >
                  Due Date
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formValues.dueDate}
                  onChange={(event) => handleFieldChange('dueDate', event.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                  htmlFor="taxRate"
                >
                  Tax rate (%)
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceTaxRate}
                  onChange={(event) => {
                    setInvoiceTaxRate(event.target.value);
                    setShowValidationBanner(false);
                  }}
                />
              </div>
            </div>

            {/* Rates and terms */}
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="vatRate">
                  VAT Rate (%)
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="vatRate"
                  name="vatRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceVatRate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInvoiceVatRate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="shippingRate">
                  Shipping (%)
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="shippingRate"
                  name="shippingRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceShippingRate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInvoiceShippingRate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="paymentTerm">
                  Payment Term
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="paymentTerm"
                  name="paymentTerm"
                  type="text"
                  placeholder="30 days"
                  value={formValues.paymentTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('paymentTerm', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="poNumber">
                  PO Number
                </label>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  id="poNumber"
                  name="poNumber"
                  type="text"
                  value={formValues.poNumber}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('poNumber', e.target.value)}
                />
              </div>
            </div>

            {/* Company Logo */}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Company Logo</p>
                  <p className="text-sm text-slate-300">
                    Upload your logo or paste an image URL to display it at the top of the invoice PDF.
                  </p>
                </div>
                {companyLogoPreview ? (
                  <button
                    type="button"
                    onClick={clearCompanyLogo}
                    className="self-start rounded-lg border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                    htmlFor="companyLogoFile"
                  >
                    Upload Logo
                  </label>
                  <input
                    id="companyLogoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoFileChange}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-none file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:uppercase file:tracking-[0.3em] file:text-slate-950 hover:border-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    aria-label="Upload company logo"
                  />
                  {companyLogoName ? (
                    <p className="mt-2 text-xs text-slate-400">Selected file: {companyLogoName}</p>
                  ) : null}
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    Supported formats: PNG, JPG, SVG. The image is embedded directly in the PDF.
                  </p>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                    htmlFor="companyLogoUrl"
                  >
                    Logo URL
                  </label>
                  <input
                    id="companyLogoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={companyLogoUrl}
                    onChange={handleCompanyLogoUrlChange}
                    className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    Paste a public image link if you host your logo elsewhere.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Alignment</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['left', 'center', 'right'] as LogoAlignment[]).map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => setCompanyLogoAlignment(option)}
                        className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.3em] transition ${
                          companyLogoAlignment === option
                            ? 'border-sky-400 text-sky-200'
                            : 'border-slate-700 text-slate-300 hover:border-sky-400 hover:text-slate-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                      htmlFor="companyLogoWidth"
                    >
                      Max Width (px)
                    </label>
                    <input
                      id="companyLogoWidth"
                      type="number"
                      min={40}
                      max={400}
                      step={10}
                      value={companyLogoMaxWidth}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setCompanyLogoMaxWidth(event.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
                      htmlFor="companyLogoHeight"
                    >
                      Max Height (px)
                    </label>
                    <input
                      id="companyLogoHeight"
                      type="number"
                      min={40}
                      max={300}
                      step={10}
                      value={companyLogoMaxHeight}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setCompanyLogoMaxHeight(event.target.value)}
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>
                </div>
                {companyLogoPreview ? (
                  <div className="md:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Preview</p>
                    <div className="mt-3 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <img
                        src={companyLogoPreview}
                        alt="Company logo preview"
                        className="h-16 w-auto max-w-[200px] rounded-md border border-slate-800 bg-slate-950 object-contain p-2"
                      />
                      <div className="text-xs text-slate-400">
                        <p>Alignment: <span className="uppercase tracking-[0.3em] text-slate-200">{companyLogoAlignment}</span></p>
                        <p className="mt-1">
                          Max size: {companyLogoMaxWidth || '—'}px × {companyLogoMaxHeight || '—'}px
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Marketing Section (optional) */}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Marketing Section</p>
                  <p className="text-sm text-slate-300">Optional headline, message and CTA link</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketingOpen((v) => !v)}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  {marketingOpen ? 'Hide' : 'Edit'}
                </button>
              </div>
              {marketingOpen ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktHeadline">
                      Headline
                    </label>
                    <input
                      id="mktHeadline"
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                      type="text"
                      placeholder="Thank you for your order!"
                      value={marketingHeadline}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingHeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktCtaText">
                      CTA Text
                    </label>
                    <input
                      id="mktCtaText"
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                      type="text"
                      placeholder="Shop Again"
                      value={marketingCtaText}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingCtaText(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktMessage">
                      Message
                    </label>
                    <textarea
                      id="mktMessage"
                      rows={3}
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                      placeholder="Enjoy 10% off your next purchase with code GROCERY10."
                      value={marketingMessage}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMarketingMessage(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktCtaLink">
                      CTA Link (URL)
                    </label>
                    <input
                      id="mktCtaLink"
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                      type="url"
                      placeholder="https://kagicstudyo.com"
                      value={marketingCtaLink}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingCtaLink(e.target.value)}
                    />
                  </div>
                  {/* Marketing style controls */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Font Style</p>
                    <div className="mt-3 flex gap-2">
                      {(['bold','italic','underline'] as const).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setMarketingStyles((prev) => prev.includes(key) ? prev.filter(k => k!==key) : [...prev, key]);
                          }}
                          className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.3em] ${marketingStyles.includes(key) ? 'border-sky-400 text-sky-200' : 'border-slate-700 text-slate-300'} hover:border-sky-400`}
                          title={key}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktFontColor">
                      Font Color
                    </label>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        id="mktFontColor"
                        type="color"
                        value={marketingFontColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingFontColor(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded border border-slate-700 bg-slate-900/50"
                        aria-label="Marketing font color"
                      />
                      <span className="text-[11px] tracking-widest text-slate-300">{marketingFontColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktBackgroundColor">
                      Background Color
                    </label>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        id="mktBackgroundColor"
                        type="color"
                        value={marketingBackgroundColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketingBackgroundColor(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded border border-slate-700 bg-slate-900/50"
                        aria-label="Marketing background color"
                      />
                      <span className="text-[11px] tracking-widest text-slate-300">{marketingBackgroundColor}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktBackgroundImage">
                      Background Image
                    </label>
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          id="mktBackgroundImage"
                          type="file"
                          accept="image/*"
                          onChange={handleMarketingImageFileChange}
                          className="block w-full max-w-xs text-xs text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-[0.3em] file:text-slate-200 hover:file:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={clearMarketingBackgroundImage}
                          disabled={!marketingBackgroundImage && !marketingBackgroundImageUrl}
                          className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.3em] transition ${
                            marketingBackgroundImage || marketingBackgroundImageUrl
                              ? 'border-rose-500/60 text-rose-200 hover:border-rose-400 hover:text-rose-100'
                              : 'cursor-not-allowed border-slate-800 text-slate-500'
                          }`}
                        >
                          Clear image
                        </button>
                        {marketingBackgroundImageName ? (
                          <span className="text-[11px] tracking-widest text-slate-300">
                            {marketingBackgroundImageName}
                          </span>
                        ) : null}
                      </div>
                      <input
                        type="url"
                        placeholder="https://example.com/banner.png"
                        value={marketingBackgroundImageUrl}
                        onChange={handleMarketingImageUrlChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                      />
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        Paste an image URL or upload a file to add a banner background. Uploaded files are embedded in the PDF.
                      </p>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="mktBackgroundOpacity">
                          Image Opacity
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            id="mktBackgroundOpacity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={marketingBackgroundImageOpacity}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const next = Number.parseFloat(e.target.value);
                              setMarketingBackgroundImageOpacity(
                                Number.isFinite(next) ? Math.min(Math.max(next, 0), 1) : DEFAULT_MARKETING_IMAGE_OPACITY,
                              );
                              if (!marketingOpen) {
                                setMarketingOpen(true);
                              }
                            }}
                            className="h-2 w-40 cursor-pointer accent-sky-500"
                            aria-label="Marketing background image opacity"
                          />
                          <span className="w-12 text-right text-[11px] tracking-[0.3em] text-slate-300">
                            {`${Math.round(marketingBackgroundImageOpacity * 100)}%`}
                          </span>
                        </div>
                      </div>
                      {marketingBackgroundImage ? (
                        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Preview</p>
                          <div className="mt-2 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/80">
                            <img
                              src={marketingBackgroundImage}
                              alt="Marketing banner preview"
                              className="h-32 w-full object-cover"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('notes')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Thank you for your business."
                  value={formValues.notes}
                  onChange={(event) => handleFieldChange('notes', event.target.value)}
                  onBlur={() => handleFieldBlur('notes')}
                />
                {fieldHasError('notes') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.notes}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="terms">
                  Terms &amp; Conditions
                </label>
                <textarea
                  className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    fieldHasError('terms')
                      ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                      : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                  }`}
                  id="terms"
                  name="terms"
                  rows={4}
                  placeholder="Payment due within 15 days."
                  value={formValues.terms}
                  onChange={(event) => handleFieldChange('terms', event.target.value)}
                  onBlur={() => handleFieldBlur('terms')}
                />
                {fieldHasError('terms') ? (
                  <p className="mt-2 text-xs text-rose-300">{fieldErrors.terms}</p>
                ) : null}
              </div>
            </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invoice number</p>
              <p className="text-sm font-semibold text-white">{invoiceNumber}</p>
            </div>
              <label className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                Currency
                <select
                  className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">&euro; EUR</option>
                  <option value="INR">&#8377; INR</option>
                </select>
              </label>
          </div>

          {/* Brand colors */}
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs uppercase tracking-[0.3em] text-slate-400">
              Font Color
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFontColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-slate-700 bg-slate-900/50"
                  aria-label="Font color"
                />
                <span className="text-[11px] tracking-widest text-slate-300">{fontColor}</span>
              </div>
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs uppercase tracking-[0.3em] text-slate-400">
              Page Color
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={pageColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPageColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-slate-700 bg-slate-900/50"
                  aria-label="Page color"
                />
                <span className="text-[11px] tracking-widest text-slate-300">{pageColor}</span>
              </div>
            </label>
          </div>
          </div>
          <div className="space-y-6 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-sm font-semibold text-white">Line items</h4>
              <button
                type="button"
                onClick={addInvoiceItem}
                className="inline-flex items-center justify-center rounded-lg border border-sky-500/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-400 hover:text-sky-100"
              >
                Add line item
              </button>
            </div>
            <div className="space-y-5">
              {invoiceItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-5">
                  <div className="grid gap-4 md:grid-cols-4 md:items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Description
                      </label>
                      <input
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm text-slate-100 outline-none transition ${
                          itemFieldHasError(item.id, 'description')
                            ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                            : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                        }`}
                        value={item.description}
                        onChange={(event) => handleInvoiceItemChange(item.id, 'description', event.target.value)}
                      />
                      {itemFieldHasError(item.id, 'description') ? (
                        <p className="mt-2 text-xs text-rose-300">{itemErrors[item.id]?.description}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Quantity
                      </label>
                      <input
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm text-slate-100 outline-none transition ${
                          itemFieldHasError(item.id, 'quantity')
                            ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                            : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                        }`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleInvoiceItemChange(item.id, 'quantity', event.target.value)
                        }
                      />
                      {itemFieldHasError(item.id, 'quantity') ? (
                        <p className="mt-2 text-xs text-rose-300">{itemErrors[item.id]?.quantity}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Price
                      </label>
                      <input
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm text-slate-100 outline-none transition ${
                          itemFieldHasError(item.id, 'price')
                            ? 'border-rose-500/70 bg-rose-500/5 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40'
                            : 'border-slate-700 bg-slate-900/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40'
                        }`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleInvoiceItemChange(item.id, 'price', event.target.value)
                        }
                      />
                      {itemFieldHasError(item.id, 'price') ? (
                        <p className="mt-2 text-xs text-rose-300">{itemErrors[item.id]?.price}</p>
                      ) : null}
                    </div>
                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(item.id)}
                        disabled={invoiceItems.length <= 1}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {invoiceItemsError ? <p className="text-xs text-rose-300">{invoiceItemsError}</p> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-400 hover:text-white"
            >
              Preview invoice
            </button>
            <button
              type="submit"
              disabled={invoiceFormLoading}
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {invoiceFormLoading ? 'Sending invoice...' : 'Send invoice'}
            </button>
          </div>

          {invoiceError ? (
            <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
              {invoiceError}
            </p>
          ) : null}

          {invoiceSendResult ? (
            <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
              {invoiceSendResult.message}
            </p>
          ) : null}

          {showValidationBanner ? (
            <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
              Please fill in the highlighted fields before continuing.
            </p>
          ) : null}
        </form>
      </section>

      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoiceNumber={invoiceNumber}
        organizationName={organizationName}
        organizationEmail={organizationEmail}
        fromName={trimmedValues.billingFromName}
        fromAddress={trimmedValues.billingFromAddress}
        toName={trimmedValues.customerName}
        toAddress={trimmedValues.billingToAddress}
        customerEmail={trimmedValues.customerEmail}
        invoiceTitle={trimmedValues.invoiceTitle}
        issueDate={formValues.issueDate}
        dueDate={formValues.dueDate}
        notes={trimmedValues.notes}
        terms={trimmedValues.terms}
        items={sanitizedInvoiceItems}
        totals={{
          subtotal: invoiceTotals.subtotal,
          taxAmount: invoiceTotals.taxAmount,
          total: invoiceTotals.total,
        }}
        currency={currency}
      />
    </div>
  );
}
