import React, { useEffect, useRef, useState } from 'react';
import { InvoiceData, MarketingBannerData } from '../types';
import { Printer, Download, Send } from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

interface InvoicePreviewProps {
  data: InvoiceData;
  banner: MarketingBannerData;
  showControls?: boolean;
  viewMode?: 'full' | 'header' | 'banner';
  registerAnchor?: (key: string, el: HTMLElement | null) => void;
  showTour?: boolean;
  tourStepId?: string;
  onSaveCampaign?: () => void;
  onCreateNewCampaign?: () => void;
  onOpenCampaigns?: () => void;
  onLoadCampaign?: (id: number) => void;
  campaigns?: { id: number; name: string; description?: string; apiBase?: string | null }[];
  campaignsLoading?: boolean;
  selectedCampaignId?: string | null;
  setSelectedCampaignId?: (id: string | null) => void;
  isSavingCampaign?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  data,
  banner,
  showControls = true,
  viewMode = 'full',
  registerAnchor,
  showTour = false,
  tourStepId,
  onSaveCampaign,
  onCreateNewCampaign,
  onOpenCampaigns,
  onLoadCampaign,
  campaigns = [],
  campaignsLoading = false,
  selectedCampaignId = null,
  setSelectedCampaignId,
  isSavingCampaign = false,
}) => {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;
  const [bannerOrientation, setBannerOrientation] = useState<'portrait' | 'landscape'>('portrait');
  // Temporarily disable futuristic template by falling back to professional
  const rawTemplate = data.invoiceTemplateKey || 'luxury';
  const template = rawTemplate === 'futuristic' ? 'professional' : rawTemplate;
  // STRICT: apiBase must be explicitly defined in environment, match InvoiceTool logic
  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
    : (() => {
      // Don't throw here to avoid crashing the whole component if it's just a preview, 
      // but warn loudly. InvoiceTool checks this strictly.
      console.warn('VITE_API_BASE_URL missing in InvoicePreview');
      return '';
    })();

  const PUBLIC_API_URL = (import.meta.env.VITE_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const tourOpenedEmailForm = useRef(false);
  const isTourCampaignStep =
    showTour &&
    ['campaignSelect', 'campaignSave', 'campaignCreate', 'campaignReset'].includes(tourStepId ?? '');
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>(
    data.invoiceNumber ? `Invoice ${data.invoiceNumber}` : 'Your invoice'
  );
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(data.clientName || '');
  const [customerEmail, setCustomerEmail] = useState<string>(data.clientEmail || '');
  const [emailErrors, setEmailErrors] = useState<{ to?: string; subject?: string }>({});
  const futuristicRef = useRef<HTMLDivElement | null>(null);
  const [futuristicScale, setFuturisticScale] = useState(1);
  const [futuristicHeight, setFuturisticHeight] = useState<number | null>(null);
  const luxuryTitleRef = useRef<HTMLHeadingElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const selectedCampaign = selectedCampaignId
    ? campaigns.find((campaign) => String(campaign.id) === String(selectedCampaignId))
    : null;
  const resolveTrackingBase = () => {
    const base = (selectedCampaign?.apiBase || apiBase || '').trim();
    return base ? base.replace(/\/+$/, '') : '';
  };

  // Keep dropdown interactive when campaigns are already loaded; only disable during initial empty load
  const selectDisabled = campaignsLoading && campaigns.length === 0;

  const triggerToast = (msg: string) => {
    toast.success(msg);
  };

  // Dynamic invoice styles based on user selection
  const invoiceStyle = {
    backgroundColor: data.invoicePageColor || '#ffffff',
    color: data.invoiceTextColor || '#1e293b',
  };

  useEffect(() => {
    if (showEmailForm && emailInputRef.current) {
      const node = emailInputRef.current;
      node.focus({ preventScroll: true });
    }
  }, [showEmailForm]);

  useEffect(() => {
    if (isTourCampaignStep && !showEmailForm) {
      setShowEmailForm(true);
      tourOpenedEmailForm.current = true;
      return;
    }
    if (!isTourCampaignStep && tourOpenedEmailForm.current) {
      setShowEmailForm(false);
      tourOpenedEmailForm.current = false;
    }
  }, [isTourCampaignStep, showEmailForm]);

  useEffect(() => {
    setCustomerName(data.clientName || '');
    setCustomerEmail(data.clientEmail || '');
  }, [data.clientName, data.clientEmail]);

  useEffect(() => {
    if (!showEmailForm) {
      setEmailErrors({});
    }
  }, [showEmailForm]);

  // Auto-scale futuristic template to stay on one page without removing content
  useEffect(() => {
    if (template !== 'futuristic') {
      if (futuristicScale !== 1) setFuturisticScale(1);
      if (futuristicHeight !== null) setFuturisticHeight(null);
      return;
    }
    const el = futuristicRef.current;
    if (!el) return;
    // Target A4 height in px (~1123px at 96dpi). Keep a small buffer.
    const targetHeight = 1123;
    const contentHeight = el.scrollHeight;
    const overage = contentHeight - targetHeight;
    // Scale only if meaningfully over, allow down to 0.85 for dense invoices.
    const nextScale =
      overage > 16 ? Math.max(0.85, Math.min(1, targetHeight / contentHeight)) : 1;
    if (nextScale !== futuristicScale) {
      setFuturisticScale(nextScale);
    }
    if (futuristicHeight !== contentHeight) {
      setFuturisticHeight(contentHeight);
    }
  }, [template, data, banner, viewMode, futuristicScale, futuristicHeight]);

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    // Prioritize sessionStorage, then localStorage. Strip quotes defensively.
    const raw = window.sessionStorage.getItem('tmr-token') || window.localStorage.getItem('tmr-token') || '';
    return raw.trim().replace(/^["']|["']$/g, '');
  };

  const resolveAuthHeaders = () => {
    const token = getToken();
    if (!token) {
      console.error('Missing auth token — user must log in');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const resolveAuthHeadersOptional = () => {
    const token = getToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const buildInvoiceHtml = (element: HTMLElement) => {
    const clone = element.cloneNode(true) as HTMLElement;

    const isSelectorUsed = (selector: string) => {
      if (!selector) return false;
      if (selector.includes('body') || selector.includes('html') || selector.includes(':root')) return true;
      try {
        if (clone.matches && clone.matches(selector)) return true;
        return !!clone.querySelector(selector);
      } catch (_err) {
        return false;
      }
    };

    const collectRules = (rules: CSSRuleList | undefined): string[] => {
      const collected: string[] = [];
      if (!rules) return collected;

      Array.from(rules).forEach((rule) => {
        switch (rule.type) {
          case CSSRule.STYLE_RULE: {
            const styleRule = rule as CSSStyleRule;
            if (isSelectorUsed(styleRule.selectorText)) {
              collected.push(styleRule.cssText);
            }
            break;
          }
          case CSSRule.MEDIA_RULE: {
            const mediaRule = rule as CSSMediaRule;
            const inner = collectRules(mediaRule.cssRules);
            if (inner.length) {
              collected.push(`@media ${mediaRule.conditionText} { ${inner.join(' ')} }`);
            }
            break;
          }
          case CSSRule.SUPPORTS_RULE: {
            const supportsRule = rule as CSSSupportsRule;
            const inner = collectRules(supportsRule.cssRules);
            if (inner.length) {
              collected.push(`@supports ${supportsRule.conditionText} { ${inner.join(' ')} }`);
            }
            break;
          }
          case CSSRule.FONT_FACE_RULE:
          case CSSRule.KEYFRAMES_RULE: {
            collected.push(rule.cssText);
            break;
          }
          default:
            collected.push(rule.cssText);
            break;
        }
      });

      return collected;
    };

    const collectedCss: string[] = [];

    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        const rules = sheet.cssRules;
        collectedCss.push(...collectRules(rules));
      } catch (_err) {
        // Ignore cross-origin or unreadable stylesheets
      }
    });

    const finalCss = collectedCss.join('\n');
    let htmlContent = clone.outerHTML;

    const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${finalCss}
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    return finalHtml;
  };

  const dataUrlToBlob = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error('Failed to read image data.');
    }
    return response.blob();
  };

  const uploadTempAsset = async (
    source: string | undefined | null,
    filenameHint: string
  ): Promise<{ url: string }> => {
    const trimmed = (source || '').trim();
    if (!trimmed) return { url: '' };
    if (!trimmed.startsWith('data:')) {
      return /^https?:\/\//i.test(trimmed) ? { url: trimmed } : { url: '' };
    }

    const blob = await dataUrlToBlob(trimmed);
    const extension = blob.type === 'image/jpeg' ? 'jpg' : 'png';
    const formData = new FormData();
    formData.append('file', blob, `${filenameHint}.${extension}`);

    const uploadResponse = await fetch(`${apiBase}/api/vite-invoice/upload-temp-asset`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(errorText || 'Failed to upload asset.');
    }

    const json = await uploadResponse.json().catch(() => null);
    return { url: (json && json.url) || '' };
  };

  const normalizeAssetUrl = (url: string) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (PUBLIC_API_URL && trimmed.startsWith(PUBLIC_API_URL)) return trimmed;

    const pathStart = trimmed.indexOf('/temp-assets/');
    if (PUBLIC_API_URL && pathStart !== -1) {
      const assetPath = trimmed.substring(pathStart);
      return `${PUBLIC_API_URL}${assetPath}`;
    }

    if (trimmed.startsWith('http://')) {
      return trimmed.replace(/^http:\/\//i, 'https://');
    }

    return trimmed;
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;

    const element = document.getElementById('invoice-content');
    if (!element) return;

    setIsGeneratingPdf(true);

    if (!apiBase) {
      console.error('Missing VITE_TMR_API_URL');
      setIsGeneratingPdf(false);
      return;
    }

    try {
      const finalHtml = buildInvoiceHtml(element);

      const response = await fetch(`${apiBase}/api/vite-invoice/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: finalHtml,
          invoiceNumber: data.invoiceNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${data.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (isSendingEmail) return;

    setEmailErrors({});
    const element = document.getElementById('invoice-content');
    if (!element) {
      toast.error('Unable to locate invoice content.');
      return;
    }

    if (!apiBase) {
      toast.error('Missing API base URL (VITE_TMR_API_URL).');
      return;
    }

    const trimmedTo = emailTo.trim();
    const trimmedSubject =
      (emailSubject || '').trim() ||
      (data.invoiceNumber ? `Invoice ${data.invoiceNumber}` : 'Invoice');
    const resolvedCampaignId = selectedCampaignId ? Number(selectedCampaignId) : null;
    const campaignIdForPayload = Number.isFinite(resolvedCampaignId) ? resolvedCampaignId : null;
    const trackingBase = resolveTrackingBase();
    const buildTrackedUrl = (raw?: string | null) => {
      const trimmed = (raw || '').trim();
      if (!trimmed) return '';
      if (campaignIdForPayload && trackingBase) {
        return `${trackingBase}/api/campaigns/${campaignIdForPayload}/click?u=${encodeURIComponent(trimmed)}`;
      }
      return trimmed;
    };

    if (!trimmedTo || !trimmedTo.includes('@')) {
      setEmailErrors((prev) => ({ ...prev, to: 'Please enter a valid recipient email.' }));
      toast.error('Please enter a valid recipient email.');
      return;
    }

    if (!trimmedSubject) {
      setEmailErrors((prev) => ({ ...prev, subject: 'Subject is required.' }));
      toast.error('Subject is required.');
      return;
    }

    // Auth is optional for send-email; include token if available but don't block when absent.
    const authHeaders = resolveAuthHeadersOptional() || {};

    const invoiceNumber = data.invoiceNumber || 'invoice';
    const invoiceBgForEmail = (data.invoicePageColor && data.invoicePageColor.trim()) || '#0f172a';

    setIsSendingEmail(true);
    try {
      const finalHtml = buildInvoiceHtml(element);
      const logoUploadResult = await uploadTempAsset(data.logoUrl, 'logo');
      const bannerUploadResult = await uploadTempAsset(banner?.bannerUrl, 'banner');
      const logoUrlForEmail = normalizeAssetUrl(logoUploadResult.url);
      const bannerImageUrlForEmail = normalizeAssetUrl(bannerUploadResult.url);

      const bannerPayloadBase = banner && typeof banner === 'object' ? banner : { enabled: false, bannerUrl: null };
      const trackedCtaLink = buildTrackedUrl(bannerPayloadBase.ctaTargetUrl);
      const bannerPayload = {
        enabled: !!bannerPayloadBase.enabled,
        text: bannerPayloadBase.bannerCopyText || '',
        textColor:
          bannerPayloadBase.bannerCopyTextColor ||
          bannerPayloadBase.bannerTextColor ||
          '#ffffff',
        backgroundColor: bannerPayloadBase.bannerBackgroundColor || '#0f172a',
        imageUrl: bannerImageUrlForEmail || null,
        ctaText: bannerPayloadBase.ctaText || '',
        ctaLink: trackedCtaLink,
        ctaBackgroundColor:
          bannerPayloadBase.ctaBackgroundColor ||
          bannerPayloadBase.bannerTextColor ||
          '#ffffff',
        ctaTextColor:
          bannerPayloadBase.ctaTextColor ||
          bannerPayloadBase.bannerBackgroundColor ||
          '#0f172a',
        // legacy fields kept for compatibility
        bannerCopyText: bannerPayloadBase.bannerCopyText || '',
        bannerCopyTextColor:
          bannerPayloadBase.bannerCopyTextColor ||
          bannerPayloadBase.bannerTextColor ||
          '#ffffff',
        bannerCopyOpacity: bannerPayloadBase.bannerCopyOpacity ?? 1,
        bannerBackgroundColor: bannerPayloadBase.bannerBackgroundColor || '#0f172a',
        bannerTextColor: bannerPayloadBase.bannerTextColor || '#ffffff',
        bannerUrl: bannerImageUrlForEmail || null,
        ctaTargetUrl: trackedCtaLink || '',
      };

      const resolvedCustomerName = (customerName || data.clientName || '').trim();
      const resolvedCustomerEmail = (customerEmail || data.clientEmail || '').trim();

      const response = await fetch(`${apiBase}/api/vite-invoice/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          html: finalHtml,
          invoiceNumber,
          toEmail: trimmedTo,
          subject: trimmedSubject,
          message: emailMessage,
          senderName: (data as any)?.from?.businessName || data.senderName,
          senderEmail: data.senderEmail,
          senderAddress: data.senderAddress,
          amount: total,
          currency: data.currency,
          invoicePageColor: invoiceBgForEmail,
          logoUrl: logoUrlForEmail,
          banner: bannerPayload,
          customerName: resolvedCustomerName,
          customerEmail: resolvedCustomerEmail || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to send invoice email');
      }

      const sentAt = new Date().toISOString();
      const historyPayload = {
        customerName: resolvedCustomerName || 'Unknown customer',
        customerEmail: resolvedCustomerEmail || null,
        recipient: trimmedTo,
        subject: trimmedSubject,
        invoiceNumber,
        currency: data.currency || 'USD',
        totalAmount: total,
        sentAt,
        senderName: (data as any)?.from?.businessName || data.senderName,
        senderEmail: data.senderEmail,
        senderAddress: data.senderAddress,
        message: emailMessage,
        banner: bannerPayload,
        logoUrl: logoUrlForEmail,
        invoicePageColor: invoiceBgForEmail,
        campaignId: campaignIdForPayload ?? undefined,
        summary: {
          invoiceNumber,
          currency: data.currency || 'USD',
          amount: total,
          senderName: (data as any)?.from?.businessName || data.senderName,
          senderEmail: data.senderEmail,
          senderAddress: data.senderAddress,
          message: emailMessage,
          banner: bannerPayload,
          logoUrl: logoUrlForEmail,
          invoicePageColor: invoiceBgForEmail,
          campaignId: campaignIdForPayload ?? undefined,
        },
      };

      // Notify parent dashboard (if embedded) that the invoice was sent so it can persist history.
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({ type: 'tmr:vite-invoice:sent', payload: historyPayload }, '*');
      }
      // Also attempt to persist history directly when auth is available, so analytics stay in sync.
      if (apiBase && Object.keys(authHeaders).length > 0) {
        try {
          const historyResponse = await fetch(`${apiBase}/api/vite-invoice/save-history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            body: JSON.stringify(historyPayload),
          });
          if (!historyResponse.ok) {
            console.warn('[InvoicePreview] Failed to persist invoice history for analytics');
          }
        } catch (historyErr) {
          console.error('[InvoicePreview] Error saving invoice history', historyErr);
        }
      }

      triggerToast('Invoice email sent successfully!');
      setShowEmailForm(false);
    } catch (err) {
      console.error('Invoice email send failed', err);
      const message =
        err instanceof Error && err.message ? err.message : 'Failed to send invoice email.';
      toast.error(message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getBannerStyle = () => {
    const copyColor = banner.bannerCopyTextColor || banner.bannerTextColor;
    const base = {
      color: copyColor,
      backgroundColor: banner.bannerBackgroundColor,
    };

    if (banner.style === 'gradient') {
      return {
        ...base,
        background: `linear-gradient(135deg, ${banner.bannerBackgroundColor} 0%, ${adjustColor(banner.bannerBackgroundColor, -40)} 100%)`,
      };
    }
    if (banner.style === 'bordered') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `1px solid ${banner.bannerBackgroundColor}`,
        color: copyColor, // Use selected text color for bordered style too
      };
    }
    return base;
  };

  // Helper to darken color for gradient
  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  const formatCurrency = (val: number) => {
    const amount = Number.isFinite(val) ? val : 0;
    const code = (data.currency || 'USD').trim();
    if (code === 'INR') {
      return `INR ${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
    } catch (_err) {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  // Font Configuration Logic - Removed 'Modern'
  const getFonts = () => {
    switch (data.invoiceTypographyKey) {
      case 'clean':
        return { body: 'font-sans', header: 'font-sans', accent: 'font-sans', title: 'font-sans' };
      case 'classic':
        return { body: 'font-serif', header: 'font-serif', accent: 'font-serif', title: 'font-serif' };
      case 'professional':
        return { body: 'font-professional', header: 'font-professional', accent: 'font-professional', title: 'font-professional' };
      case 'elegant':
        return { body: 'font-elegant', header: 'font-elegant', accent: 'font-elegant', title: 'font-elegant' };
      case 'tech':
        return { body: 'font-mono', header: 'font-mono', accent: 'font-mono', title: 'font-mono' };
      case 'editorial':
      default:
        return {
          body: 'font-sans',
          header: 'font-serif',
          accent: 'font-mono',
          title: 'font-serif'
        };
    }
  };

  const fonts = getFonts();

  const actionButtons = (
    <div
      ref={(el) => registerAnchor?.('actions', el)}
      className="absolute top-6 -right-16 no-print z-50 flex flex-col gap-2 group-hover:opacity-100 transition-opacity"
      data-html2canvas-ignore
    >
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className={`flex items-center justify-center h-10 bg-emerald-600 text-white rounded-full transition-all shadow-lg shadow-emerald-200 border border-emerald-200 ${isGeneratingPdf ? 'opacity-50 pointer-events-none px-4' : 'w-10 hover:bg-emerald-500 hover:scale-110'}`}
        title="Download a finalized PDF of this invoice"
      >
        {isGeneratingPdf ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="text-xs font-semibold">Generating PDF...</span>
          </div>
        ) : (
          <Download size={18} />
        )}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center justify-center w-10 h-10 bg-white text-slate-900 rounded-full hover:bg-slate-100 hover:scale-110 transition-all shadow-lg border border-slate-200"
        title="Print or save as PDF"
      >
        <Printer size={18} />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmailForm(true)}
          disabled={isSendingEmail}
          className={`flex items-center justify-center h-10 bg-amber-400 text-white rounded-full transition-all shadow-lg shadow-amber-200 border border-amber-200 ${isSendingEmail ? 'opacity-50 pointer-events-none px-4' : 'w-10 hover:bg-amber-300 hover:scale-110'}`}
          title="Send this invoice by email"
        >
          {isSendingEmail ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              <span className="text-xs font-semibold">Sending...</span>
            </div>
          ) : (
            <Send size={18} />
          )}
        </button>
        <div
          className={`absolute right-full mr-3 top-0 w-64 bg-white text-slate-900 shadow-2xl rounded-xl border border-black/10 p-3 space-y-2 ${showEmailForm ? 'block' : 'hidden'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Send invoice</span>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-700"
              onClick={() => setShowEmailForm(false)}
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-600">To</label>
            <input
              type="email"
              ref={emailInputRef}
              value={emailTo}
              onChange={(e) => {
                setEmailTo(e.target.value);
                if (emailErrors.to) {
                  setEmailErrors((prev) => ({ ...prev, to: undefined }));
                }
              }}
              placeholder="customer@example.com"
              className={`w-full text-sm px-2 py-1 rounded border focus:outline-none focus:ring-1 ${emailErrors.to
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:ring-slate-400'
                }`}
            />
            {emailErrors.to && (
              <p className="text-[11px] text-red-600">{emailErrors.to}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-600">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => {
                setEmailSubject(e.target.value);
                if (emailErrors.subject) {
                  setEmailErrors((prev) => ({ ...prev, subject: undefined }));
                }
              }}
              className={`w-full text-sm px-2 py-1 rounded border focus:outline-none focus:ring-1 ${emailErrors.subject
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:ring-slate-400'
                }`}
            />
            {emailErrors.subject && (
              <p className="text-[11px] text-red-600">{emailErrors.subject}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-600">Customer name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Client Name"
              className="w-full text-sm px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-600">Customer email (optional)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full text-sm px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-600">Message (optional)</label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={3}
              className="w-full text-sm px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
            />
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wide text-slate-600">Load Campaign</label>
              <button
                type="button"
                onClick={() => onOpenCampaigns?.()}
                className="text-[11px] text-emerald-700 hover:text-emerald-800"
                disabled={campaignsLoading}
              >
                Refresh
              </button>
            </div>
            <select
              ref={(el) => registerAnchor?.('campaignSelect', el)}
              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 bg-white"
              value={selectedCampaignId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                const nextId = id || null;
                setSelectedCampaignId?.(nextId);
                if (nextId) onLoadCampaign?.(Number(nextId));
              }}
              onFocus={() => {
                if (campaigns.length === 0) onOpenCampaigns?.();
              }}
              disabled={selectDisabled}
            >
              <option value="">Select a saved campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              ref={(el) => registerAnchor?.('campaignReset', el)}
              className="w-full text-xs rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2"
              onClick={() => {
                if (selectedCampaignId) onLoadCampaign?.(Number(selectedCampaignId));
              }}
            >
              Reset invoice to campaign settings
            </button>
            <button
              type="button"
              onClick={() => onSaveCampaign?.()}
              disabled={isSavingCampaign}
              ref={(el) => registerAnchor?.('campaignSave', el)}
              className={`w-full flex items-center justify-center h-9 rounded-md font-semibold transition-colors ${isSavingCampaign
                  ? 'bg-emerald-200 text-emerald-800 opacity-70'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
            >
              {isSavingCampaign
                ? 'Saving...'
                : selectedCampaignId
                  ? 'Update Campaign'
                  : 'Save Campaign'}
            </button>
            <button
              type="button"
              onClick={() => onCreateNewCampaign?.()}
              disabled={isSavingCampaign}
              ref={(el) => registerAnchor?.('campaignCreate', el)}
              className="w-full text-xs rounded-md border border-dashed border-slate-200 bg-white hover:bg-slate-50 py-2 text-slate-700"
            >
              Create new campaign
            </button>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className={`w-full flex items-center justify-center h-9 rounded-md font-semibold transition-colors ${isSendingEmail ? 'bg-emerald-200 text-emerald-800 opacity-70' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
          >
            {isSendingEmail ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );

  const PaymentWidget = () => {
    if (!data.paymentLink) return null;
    if (template === 'luxury' && data.paymentMethod !== 'button') return null;

    if (data.paymentMethod === 'button') {
      return (
        <a
          href={data.paymentLink}
          target="_blank"
          rel="noreferrer"
          className={`inline-block text-center px-8 py-3 rounded transition-all hover:opacity-90 print:border print:border-current no-underline ${fonts.accent}`}
          style={{
            backgroundColor: invoiceStyle.color, // High contrast button
            color: invoiceStyle.backgroundColor,
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {data.paymentButtonText || 'Pay Now'}
        </a>
      );
    }

    const qrWrapperStyle: React.CSSProperties = {
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    };

    const qrCodeStyle: React.CSSProperties = {
      height: 'auto',
      maxWidth: '160px',
      width: '100%',
      marginTop: '16px',
    };

    // QR Code Style
    return (
      <div id="qr-wrapper" className="flex flex-col items-center w-fit print:break-inside-avoid" style={qrWrapperStyle}>
        <div className="bg-white p-3 inline-block rounded-lg shadow-sm border border-black/5">
          <QRCode
            value={data.paymentLink}
            size={160}
            style={qrCodeStyle}
            viewBox={`0 0 256 256`}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        <p className={`text-[10px] uppercase tracking-widest mt-2 opacity-60 ${fonts.accent} text-center w-full`}>Scan to Pay</p>
      </div>
    );
  };

  const MarketingBanner = ({ className }: { className?: string }) => {
    if (!banner.enabled || (!banner.bannerCopyText && !banner.bannerUrl)) return null;

    const imgPosition = banner.imagePosition || { x: 50, y: 50 };
    const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
    const copyColor = banner.bannerCopyTextColor || banner.bannerTextColor || '#ffffff';
    const copyOpacity = banner.bannerCopyOpacity ?? 1;
    const isPortraitBanner = bannerOrientation === 'portrait';
    const renderPosition = isPortraitBanner
      ? { x: clamp(imgPosition.x, 35, 65), y: clamp(imgPosition.y, 35, 65) }
      : imgPosition;
    const bannerImageStyle = {
      width: isPortraitBanner ? '100%' : '120%',
      height: isPortraitBanner ? '100%' : '120%',
      objectFit: isPortraitBanner ? 'contain' as const : 'cover' as const,
    };
    const trackingBase = resolveTrackingBase();
    const rawCtaUrl = (banner.ctaTargetUrl || '').trim();
    const trackingUrl =
      selectedCampaignId && trackingBase && rawCtaUrl
        ? `${trackingBase}/api/campaigns/${selectedCampaignId}/click?u=${encodeURIComponent(
          rawCtaUrl
        )}`
        : rawCtaUrl;
    const handleBannerLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      if (naturalWidth && naturalHeight) {
        setBannerOrientation(naturalHeight > naturalWidth ? 'portrait' : 'landscape');
      }
    };
    const transformOrigin = 'center center';

    return (
      <div
        className={`mt-auto w-full print:break-inside-avoid relative overflow-hidden min-h-[200px] flex flex-col md:flex-row items-center rounded-sm ${className || ''}`}
        style={getBannerStyle()}
      >
        {/* Image layer using absolute img to avoid background-position drift */}
        {banner.bannerUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={banner.bannerUrl}
              alt=""
              className="absolute left-1/2 top-1/2"
              style={{
                width: bannerImageStyle.width,
                height: bannerImageStyle.height,
                transform: `translate(${renderPosition.x - 100}%, ${renderPosition.y - 100}%)`,
                transformOrigin,
                opacity: banner.bannerImageOpacity ?? 0.2,
                filter: 'grayscale(20%) contrast(120%)',
                objectFit: bannerImageStyle.objectFit,
              }}
              onLoad={handleBannerLoad}
              ref={(node) => {
                if (!node) return;
                const containerRect = node.parentElement?.getBoundingClientRect();
                const imgRect = node.getBoundingClientRect();
              }}
            />
          </div>
        )}

        {/* Decorative Line if no image */}
        {!banner.bannerUrl && banner.style === 'solid' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
        )}

        <div className="relative z-10 p-8 w-full flex flex-col md:flex-row items-center md:justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <p
              className={`text-xl md:text-2xl font-bold leading-tight ${fonts.header}`}
              style={{ color: copyColor, opacity: copyOpacity }}
            >
              {banner.bannerCopyText}
            </p>
          </div>

          {banner.ctaText && (
            <div className="flex-shrink-0">
              <a
                href={trackingUrl || undefined}
                target="_blank"
                rel="noreferrer"
                className={`inline-block px-8 py-3 text-sm font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 border border-current print:border-2 ${fonts.accent}`}
                style={{
                  backgroundColor: banner.ctaBackgroundColor || '#ffffff',
                  color: banner.ctaTextColor || '#000000',
                  textDecoration: 'none',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.2)'
                }}
              >
                {banner.ctaText}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wrapper class to separate shadows and layout from the printable/captured area
  const wrapperClasses = "relative w-full max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:m-0 mb-8 group";
  // Inner classes for the actual invoice content to be captured
  const innerClasses = "w-full min-h-[297mm] flex flex-col relative transition-colors duration-500 overflow-hidden";

  // --- ISOLATED VIEWS FOR LANDING PAGE ---

  if (viewMode === 'banner') {
    return (
      <>
        <div className="w-full mx-auto shadow-2xl rounded-sm overflow-hidden transform transition-transform hover:scale-[1.01]">
          <MarketingBanner className="rounded-sm" />
        </div>
      </>
    )
  }

  if (viewMode === 'header' && template === 'luxury') {
    return (
      <>
        <div className="relative w-full mx-auto shadow-2xl rounded-sm overflow-hidden">
          {/* Smaller padding for compact view */}
          <div className={`w-full p-6 md:p-8 flex flex-col relative z-10 ${fonts.body}`} style={invoiceStyle}>
            {/* Luxury Header Content Only */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-current opacity-[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Top Bar */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-current/10 pb-6 mb-6">
              <div className="flex flex-col">
                {/* Smaller text size for compact view */}
                <h1 className={`text-5xl md:text-6xl leading-[0.8] font-black tracking-tighter opacity-90 ${fonts.title}`}>
                  INVOICE
                </h1>
                <div className="flex items-center gap-4 pl-2 mt-2">
                  <span className={`text-xs uppercase tracking-[0.2em] opacity-60 ${fonts.accent}`}>
                    No. {data.invoiceNumber}
                  </span>
                  <span className="h-px w-12 bg-current opacity-30"></span>
                </div>
              </div>
              <div className="text-right mb-2 flex flex-col items-end">
                {data.logoUrl && (
                  <div className="mb-4">
                    <img src={data.logoUrl} alt="Brand Logo" className="h-16 w-auto object-contain" />
                  </div>
                )}
                <h2 className={`text-xl md:text-2xl italic ${fonts.header}`}>{data.senderName || 'Sender Name'}</h2>
                <p className="text-sm opacity-60 mt-1 font-light">{data.senderEmail}</p>
              </div>
            </header>

            {/* Contextual Info - Compact */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 ${fonts.accent}`}>Billed To</h6>
                <h3 className={`text-2xl ${fonts.header}`}>{data.clientName || 'Client Name'}</h3>
              </div>
              <div className="flex gap-12">
                <div>
                  <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 ${fonts.accent}`}>Issued</h6>
                  <p className={`text-lg ${fonts.header}`}>{data.date}</p>
                </div>
                <div className="text-right">
                  <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 ${fonts.accent}`}>Due</h6>
                  <p className={`text-lg ${fonts.header}`}>{data.dueDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- FUTURISTIC TEMPLATE ---
  if (template === 'futuristic') {
    const formattedTotal = formatCurrency(total);
    const totalLen = formattedTotal.length;

    // Dynamically scale font size to keep on one line, more aggressive for long numbers
    const totalSizeClass = totalLen > 24
      ? 'text-base md:text-lg'
      : totalLen > 18
        ? 'text-lg md:text-xl'
        : totalLen > 13
          ? 'text-xl md:text-2xl'
          : totalLen > 9
            ? 'text-2xl md:text-3xl'
            : 'text-3xl md:text-4xl';

    return (
      <>
        <div className={wrapperClasses}>
          {showControls && actionButtons}
          <div
            id="invoice-content"
            ref={futuristicRef}
            className={`${innerClasses} ${fonts.body}`}
            style={{
              ...invoiceStyle,
              transform: futuristicScale < 1 ? `scale(${futuristicScale})` : undefined,
              transformOrigin: 'top center',
              height:
                futuristicScale < 1 && futuristicHeight
                  ? `${futuristicHeight * futuristicScale}px`
                  : undefined,
            }}
          >
            {/* Geometric Background Elements */}
            <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-current opacity-[0.03] clip-path-polygon-[0_0,100%_0,100%_100%,20%_100%] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[60%] h-[30%] bg-current opacity-[0.02] clip-path-polygon-[0_100%,100%_100%,80%_0,0_0] pointer-events-none"></div>

            {/* Main Content Area with padding, pushing banner to bottom */}
            <div className="flex-grow flex flex-col relative z-10 p-8 md:p-10">

              {/* Header Section */}
              <header className="flex flex-col md:flex-row justify-between items-start mb-10 pb-4">
                <div className="flex flex-col gap-4">
                  {/* Logo Area - Clean: Only show if exists, no placeholder */}
                  {data.logoUrl && (
                    <img src={data.logoUrl} alt="Brand Logo" className="h-16 w-auto object-contain self-start mb-2" />
                  )}
                  <div>
                    <h2 className={`text-xl font-bold uppercase tracking-widest ${fonts.title}`}>{data.senderName || 'SENDER NAME'}</h2>
                    <div className={`text-xs opacity-70 mt-1 ${fonts.accent} leading-relaxed`}>
                      {data.senderAddress}<br />
                      {data.senderEmail}
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 text-right">
                  <h1 className={`text-5xl md:text-6xl font-black tracking-tighter opacity-10 ${fonts.title} leading-none`}>INVOICE</h1>
                  <div className="flex flex-col items-end mt-4 gap-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">NO.</span>
                      <span className={`${fonts.accent} text-lg`}>{data.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">DATE</span>
                      <span className={`${fonts.accent} text-lg`}>{data.date}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Client Info & Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
                <div className="col-span-1 md:col-span-5">
                  <h6 className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-4 border-l-2 border-current pl-3">Bill To</h6>
                  <h3 className={`text-2xl font-bold mb-2 ${fonts.header}`}>{data.clientName || 'Client Name'}</h3>
                  <div className={`text-sm opacity-70 ${fonts.accent} leading-relaxed`}>
                    {data.clientAddress}<br />
                    {data.clientEmail}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-7 flex flex-col justify-end items-end">
                  <div className="w-full md:w-auto md:min-w-[300px] bg-current/5 p-5">
                    <h6 className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Total Amount Due</h6>
                    <div className="text-right">
                      <span className={`${totalSizeClass} font-bold tracking-tight ${fonts.title} block leading-none whitespace-nowrap`}>{formattedTotal}</span>
                    </div>
                    <div className={`text-right text-xs ${fonts.accent} opacity-60 mt-2`}>Due by {data.dueDate}</div>

                    {/* Futuristic Payment Widget Placement - Inside the box */}
                    {data.paymentLink && (
                      <div className="mt-3 pt-3 border-t border-current/10 flex justify-end text-sm">
                        <PaymentWidget />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full text-left border-collapse text-current" style={{ color: 'inherit' }}>
                  <thead>
                    <tr className="border-b border-current opacity-100">
                      <th className="py-4 text-[10px] uppercase tracking-[0.15em] opacity-50 font-normal text-current w-1/2" style={{ color: 'inherit' }}>Description</th>
                      <th className="py-4 text-[10px] uppercase tracking-[0.15em] opacity-50 font-normal text-center text-current" style={{ color: 'inherit' }}>QTY</th>
                      <th className="py-4 text-[10px] uppercase tracking-[0.15em] opacity-50 font-normal text-right text-current" style={{ color: 'inherit' }}>Price</th>
                      <th className="py-4 text-[10px] uppercase tracking-[0.15em] opacity-50 font-normal text-right text-current" style={{ color: 'inherit' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody className={`${fonts.accent} text-sm`}>
                    {data.items.map((item) => (
                      <tr key={item.id} className="border-b border-current/10">
                        <td className={`py-3 pr-4 font-bold text-base opacity-90 text-current ${fonts.body}`}>{item.description || 'Item Description'}</td>
                        <td className="py-3 px-2 text-center opacity-70 text-current">{item.quantity}</td>
                        <td className="py-3 px-2 text-right opacity-70 text-current">{formatCurrency(item.price)}</td>
                        <td className="py-3 pl-4 text-right font-bold opacity-100 text-current">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Notes */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-6">
                <div className="w-full md:max-w-sm">
                  {data.notes && (
                    <div className="relative">
                      <h6 className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3">Notes</h6>
                      <p className={`text-xs ${fonts.accent} opacity-60 leading-relaxed p-4 bg-current/5`}>{data.notes}</p>
                    </div>
                  )}
                </div>
                <div className={`w-full md:w-1/2 ml-auto ${fonts.accent} text-sm`}>
                  <div className="flex justify-between py-2 opacity-70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 opacity-70 border-b border-current/20 mb-2">
                    <span>Tax ({data.taxRate}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg font-bold">
                    <span>Grand Total</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Marketing Banner - Corner to Corner */}
            <MarketingBanner className="mt-auto w-full rounded-none py-4" />
          </div>
        </div>
      </>
    );
  }

  // --- LUXURY TEMPLATE (Original) ---
  if (template === 'luxury') {
    const formattedTotal = formatCurrency(total);
    const totalLen = formattedTotal.length;
    const title = (data as any).title ?? 'INVOICE';
    // Dynamically scale font size to keep on one line
    const totalSizeClass = totalLen > 16
      ? 'text-2xl md:text-3xl'
      : totalLen > 11
        ? 'text-3xl md:text-4xl lg:text-5xl'
        : 'text-4xl md:text-5xl lg:text-6xl';

    return (
      <>
        <div className={wrapperClasses}>
          {showControls && actionButtons}
          <div id="invoice-content" className={`${innerClasses} ${fonts.body}`} style={invoiceStyle}>
            {/* Safe Blur Background */}
            <div
              className="
              absolute
              top-[-200px]
              right-[-200px]
              w-[600px]
              h-[600px]
              rounded-full
              bg-current
              opacity-[0.15]
              blur-[200px]
              pointer-events-none
              z-0
            "
            />

            <div className="p-12 md:p-16 flex-grow flex flex-col relative z-10">
              <div className="flex flex-col min-h-0 flex-shrink overflow-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 flex-shrink-0">
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {data.logoUrl && (
                      <img
                        src={data.logoUrl}
                        alt="Logo"
                        className="h-20 w-auto object-contain self-start"
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <h1
                      ref={luxuryTitleRef}
                      className={`text-[4rem] md:text-[6rem] leading-none font-serif font-bold tracking-tight text-right opacity-90 ${fonts.title}`}
                      style={{
                        flexShrink: 0,
                        maxHeight: "140px",
                        overflow: "hidden"
                      }}
                    >
                      {title || "---"}
                    </h1>
                    <div
                      className="
                    text-sm
                    md:text-base
                    opacity-70
                    flex-shrink-0
                    overflow-hidden
                    leading-tight
                    mt-1
                  "
                    >
                      Invoice #{data.invoiceNumber}
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-12 gap-8 mb-16">
                  <div className="col-span-12 md:col-span-5 lg:col-span-5 space-y-8 md:pr-8">
                    <div className="group">
                      <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 ${fonts.accent}`}>Issued Date</h6>
                      <p className={`text-xl ${fonts.header}`}>{data.date}</p>
                    </div>
                    <div className="group">
                      <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 ${fonts.accent}`}>Due Date</h6>
                      <p className={`text-xl ${fonts.header}`}>{data.dueDate}</p>
                    </div>
                    <div className="pt-8 border-t border-current/10 group">
                      <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-3 ${fonts.accent}`}>From</h6>
                      {/* Business Name — 4px smaller than Bill To business name */}
                      <div
                        className="
                      font-semibold
                      text-base
                      opacity-85
                      mb-1
                      leading-tight
                      whitespace-normal
                      break-words
                      overflow-visible
                    "
                      >
                        {((data as any)?.from?.businessName) || data.senderName}
                      </div>
                      <div className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap font-light">{data.senderAddress}</div>
                      <p
                        className="text-sm text-current/60 mt-2"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          fontSize: 'clamp(10px, 1.2vw, 14px)',
                        }}
                      >
                        {data.senderEmail}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-7 lg:col-span-7 md:pl-4">
                    <div className="mb-2 flex items-center gap-2 opacity-40">
                      <h6 className={`text-[10px] uppercase tracking-widest ${fonts.accent}`}>Billed To</h6>
                      <div className="h-px flex-grow bg-current"></div>
                    </div>
                    <h2 className={`text-4xl md:text-5xl mb-6 leading-tight ${fonts.header}`}>{data.clientName || 'Client Name'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-base opacity-70 leading-relaxed whitespace-pre-wrap max-w-xs">
                        {data.clientAddress}
                        <p
                          className="text-sm text-current/60 mt-2"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'visible',
                            fontSize: 'clamp(10px, 1.2vw, 14px)',
                          }}
                        >
                          {data.clientEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <table className="w-full text-left border-collapse text-current" style={{ color: 'inherit' }}>
                    <thead>
                      <tr>
                        <th className={`py-4 text-[10px] uppercase tracking-widest opacity-40 font-normal border-b border-current/20 w-1/2 text-current ${fonts.accent}`} style={{ color: 'inherit' }}>Description</th>
                        <th className={`py-4 text-[10px] uppercase tracking-widest opacity-40 font-normal border-b border-current/20 text-center text-current ${fonts.accent}`} style={{ color: 'inherit' }}>Qty</th>
                        <th className={`py-4 text-[10px] uppercase tracking-widest opacity-40 font-normal border-b border-current/20 text-right text-current ${fonts.accent}`} style={{ color: 'inherit' }}>Price</th>
                        <th className={`py-4 text-[10px] uppercase tracking-widest opacity-40 font-normal border-b border-current/20 text-right text-current ${fonts.accent}`} style={{ color: 'inherit' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <tr key={item.id} className="group transition-colors hover:bg-current/5">
                          <td className="py-6 pr-4 border-b border-current/5 align-top">
                            <span className={`text-lg md:text-xl block mb-1 text-current ${fonts.header}`}>{item.description || 'Item'}</span>
                          </td>
                          <td className={`py-6 px-2 border-b border-current/5 text-center align-top text-sm opacity-60 text-current ${fonts.accent}`}>{item.quantity}</td>
                          <td className={`py-6 px-2 border-b border-current/5 text-right align-top text-sm opacity-60 text-current ${fonts.accent}`}>{formatCurrency(item.price)}</td>
                          <td className={`py-6 pl-4 border-b border-current/5 text-right align-top font-medium text-lg break-all text-current ${fonts.header}`}>{formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-12 print:break-inside-avoid">
                  <div className="w-full md:max-w-md flex flex-col gap-8">
                    {data.notes && (
                      <div className="relative pl-6 border-l-2 border-current/20">
                        <h6 className={`text-[10px] uppercase tracking-widest opacity-40 mb-2 absolute -top-5 left-0 ${fonts.accent}`}>Notes</h6>
                        <p className={`text-sm opacity-70 italic leading-relaxed text-lg ${fonts.header}`}>"{data.notes}"</p>
                      </div>
                    )}

                    {/* Luxury Payment Widget Placement - Bottom Left area */}
                    <div className="mt-4">
                      <PaymentWidget />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 ml-auto">
                    <div className="flex justify-between py-2 border-b border-current/10 opacity-60">
                      <span className={`text-xs uppercase tracking-widest ${fonts.accent}`}>Subtotal</span>
                      <span className={`${fonts.accent} text-right break-all`}>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-current/10 opacity-60 mb-6">
                      <span className={`text-xs uppercase tracking-widest ${fonts.accent}`}>Tax ({data.taxRate}%)</span>
                      <span className={`${fonts.accent} text-right break-all`}>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 pt-2">
                      <span className={`text-xl italic opacity-80 ${fonts.header}`}>Total Due</span>
                      <span className={`${totalSizeClass} tracking-tighter whitespace-nowrap text-right leading-none ${fonts.title}`}>{formattedTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Full width banner placed outside padded container */}
            <MarketingBanner className="mt-auto w-full rounded-none" />
          </div>
        </div>
      </>
    );
  }

  // --- PROFESSIONAL TEMPLATE ---
  if (template === 'professional') {
    return (
      <>
        <div className={wrapperClasses}>
          {showControls && actionButtons}
          <div id="invoice-content" className={`${innerClasses} ${fonts.body}`} style={invoiceStyle}>

            {/* Professional Header Bar */}
            <div className="w-full h-4 bg-current opacity-80"></div>

            <div className="p-12 flex-grow flex flex-col relative z-10">
              <header className="flex flex-col md:flex-row justify-between items-start mb-16">
                <div className="flex flex-col gap-6">
                  {data.logoUrl && (
                    <img src={data.logoUrl} alt="Brand Logo" className="h-20 w-auto object-contain self-start" />
                  )}
                  {/* Ensure no placeholder space if logo missing, just text content */}
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${fonts.header}`}>{data.senderName || 'Sender Name'}</h2>
                    <p className="text-sm opacity-70 whitespace-pre-wrap leading-relaxed max-w-xs">{data.senderAddress}</p>
                    <p className="text-sm opacity-70 mt-1">{data.senderEmail}</p>
                  </div>
                </div>

                <div className="text-right mt-8 md:mt-0">
                  <h1 className={`text-5xl font-light tracking-tight mb-6 opacity-90 ${fonts.title}`}>INVOICE</h1>
                  <div className="space-y-2">
                    <div className="flex justify-between md:justify-end gap-8 border-b border-current/10 pb-1">
                      <span className="text-xs uppercase font-semibold opacity-50">Invoice #</span>
                      <span className={`${fonts.accent} font-medium`}>{data.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8 border-b border-current/10 pb-1">
                      <span className="text-xs uppercase font-semibold opacity-50">Date Issued</span>
                      <span className={`${fonts.accent} font-medium`}>{data.date}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8 border-b border-current/10 pb-1">
                      <span className="text-xs uppercase font-semibold opacity-50">Due Date</span>
                      <span className={`${fonts.accent} font-medium`}>{data.dueDate}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Client Section - Structured */}
              <div className="bg-current/5 p-8 rounded-lg mb-12">
                <h6 className="text-xs uppercase font-bold opacity-50 mb-4 tracking-wider">Bill To</h6>
                <h2 className={`text-3xl font-bold mb-4 ${fonts.header}`}>{data.clientName || 'Client Name'}</h2>
                <div className="flex flex-col md:flex-row gap-12">
                  <p className="text-sm opacity-70 whitespace-pre-wrap flex-1 max-w-md">{data.clientAddress}</p>
                  <p className="text-sm opacity-70">{data.clientEmail}</p>
                </div>
              </div>

              {/* Items Table - Clean & Banded */}
              <div className="mb-12">
                <table className="w-full text-left border-collapse text-current" style={{ color: 'inherit' }}>
                  <thead>
                    <tr className="bg-current/5 border-b border-current/20">
                      <th className="py-3 px-4 text-xs uppercase font-semibold tracking-wider w-1/2 rounded-l opacity-90 text-current" style={{ color: 'inherit' }}>Description</th>
                      <th className="py-3 px-4 text-xs uppercase font-semibold tracking-wider text-center opacity-90 text-current" style={{ color: 'inherit' }}>Qty</th>
                      <th className="py-3 px-4 text-xs uppercase font-semibold tracking-wider text-right opacity-90 text-current" style={{ color: 'inherit' }}>Price</th>
                      <th className="py-3 px-4 text-xs uppercase font-semibold tracking-wider text-right rounded-r opacity-90 text-current" style={{ color: 'inherit' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {data.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-transparent' : 'bg-current/5'}>
                        <td className="py-4 px-4 font-medium text-current">{item.description || 'Item'}</td>
                        <td className="py-4 px-4 text-center opacity-70 text-current">{item.quantity}</td>
                        <td className="py-4 px-4 text-right opacity-70 text-current">{formatCurrency(item.price)}</td>
                        <td className="py-4 px-4 text-right font-bold break-all text-current">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between mb-16 print:break-inside-avoid">
                <div className="w-full md:w-1/2 pr-8 mb-8 md:mb-0">
                  {data.notes && (
                    <div>
                      <h6 className="text-xs uppercase font-bold opacity-50 mb-2">Notes / Terms</h6>
                      <p className="text-sm opacity-70 italic">{data.notes}</p>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2 ml-auto">
                  <div className="flex justify-between py-3 border-b border-current/10">
                    <span className="font-medium opacity-60">Subtotal</span>
                    <span className="font-medium break-all">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-current/10 mb-4">
                    <span className="font-medium opacity-60">Tax ({data.taxRate}%)</span>
                    <span className="font-medium break-all">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center bg-current/10 p-4 rounded gap-4">
                    <span className="text-lg font-bold whitespace-nowrap">Total</span>
                    <span className="text-2xl font-bold break-all text-right">{formatCurrency(total)}</span>
                  </div>

                  {/* Professional Payment Widget Placement - Under Totals */}
                  <div className="mt-6 flex justify-end">
                    <PaymentWidget />
                  </div>
                </div>
              </div>
              <div className="flex-grow"></div>

              <MarketingBanner />
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- CLASSIC TEMPLATE ---
  if (template === 'classic') {
    return (
      <>
        <div className={wrapperClasses}>
          {showControls && actionButtons}
          <div id="invoice-content" className={`${innerClasses} ${fonts.body} p-8`} style={invoiceStyle}>

            {/* Removed heavy border, keeping padding */}
            <div className="w-full h-full p-8 md:p-12 flex flex-col relative z-10">

              {/* Classic Header Centered */}
              <header className="text-center mb-16">
                {data.logoUrl && (
                  <div className="mb-6 flex justify-center">
                    <img src={data.logoUrl} alt="Brand Logo" className="h-24 w-auto object-contain" />
                  </div>
                )}
                <h2 className={`text-3xl font-bold mb-2 ${fonts.title}`}>{data.senderName || 'Sender Name'}</h2>
                <p className="text-sm opacity-70 mb-1">{data.senderAddress}</p>
                <p className="text-sm opacity-70">{data.senderEmail}</p>
              </header>

              <div className="border-t border-b border-current/20 py-8 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-center md:text-left">
                    <h6 className="text-xs uppercase tracking-widest opacity-50 mb-1">Bill To</h6>
                    <h3 className={`text-xl font-bold mb-2 ${fonts.header}`}>{data.clientName || 'Client Name'}</h3>
                    <p className="text-sm opacity-70 whitespace-pre-wrap">{data.clientAddress}</p>
                    <p className="text-sm opacity-70 mt-2">{data.clientEmail}</p>
                  </div>

                  <div className="flex flex-col items-center md:items-end">
                    <h1 className={`text-4xl tracking-widest mb-4 opacity-80 ${fonts.title}`}>INVOICE</h1>
                    <table className="text-right text-sm text-current" style={{ color: 'inherit' }}>
                      <tbody>
                        <tr>
                          <td className="pr-4 opacity-60 pb-1">Invoice No:</td>
                          <td className="font-medium pb-1">{data.invoiceNumber}</td>
                        </tr>
                        <tr>
                          <td className="pr-4 opacity-60 pb-1">Date:</td>
                          <td className="font-medium pb-1">{data.date}</td>
                        </tr>
                        <tr>
                          <td className="pr-4 opacity-60">Due Date:</td>
                          <td className="font-medium">{data.dueDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Items Table - Traditional */}
              <div className="mb-12">
                <table className="w-full text-left border-collapse text-current" style={{ color: 'inherit' }}>
                  <thead>
                    <tr className="border-b-2 border-current/80">
                      <th className={`py-3 text-sm font-bold w-1/2 text-current ${fonts.header}`} style={{ color: 'inherit' }}>Description</th>
                      <th className={`py-3 text-sm font-bold text-center text-current ${fonts.header}`} style={{ color: 'inherit' }}>Quantity</th>
                      <th className={`py-3 text-sm font-bold text-right text-current ${fonts.header}`} style={{ color: 'inherit' }}>Unit Price</th>
                      <th className={`py-3 text-sm font-bold text-right text-current ${fonts.header}`} style={{ color: 'inherit' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id} className="border-b border-current/10">
                        <td className="py-4 text-current">{item.description || 'Item'}</td>
                        <td className="py-4 text-center opacity-80 text-current">{item.quantity}</td>
                        <td className="py-4 text-right opacity-80 text-current">{formatCurrency(item.price)}</td>
                        <td className="py-4 text-right font-medium break-all text-current">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between mb-16 print:break-inside-avoid gap-12">
                <div className="w-full md:max-w-xs order-2 md:order-1">
                  {data.notes && (
                    <div className="bg-current/5 p-4 text-center">
                      <h6 className={`text-xs font-bold opacity-50 mb-2 uppercase ${fonts.header}`}>Notes</h6>
                      <p className="text-sm italic opacity-80">{data.notes}</p>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 order-1 md:order-2">
                  <div className="flex justify-between py-2">
                    <span className="opacity-60">Subtotal</span>
                    <span className="font-medium break-all text-right pl-4">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-current/10">
                    <span className="opacity-60">Tax ({data.taxRate}%)</span>
                    <span className="font-medium break-all text-right pl-4">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className={`font-bold text-lg ${fonts.header}`}>Total</span>
                    <span className={`font-bold text-lg break-all text-right pl-4 ${fonts.header}`}>{formatCurrency(total)}</span>
                  </div>

                  {/* Classic Payment Widget Placement - Under Totals */}
                  <div className="mt-6 flex justify-end">
                    <PaymentWidget />
                  </div>
                </div>
              </div>

              <div className="flex-grow"></div>
              <MarketingBanner />

              {/* Footer Centered */}
              <footer className={`mt-8 pt-8 border-t border-current/20 text-center text-xs opacity-50 ${fonts.header}`}>
                <p>Thank you for your business.</p>
              </footer>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};
