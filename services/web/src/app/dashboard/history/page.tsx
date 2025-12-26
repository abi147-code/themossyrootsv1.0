'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

type InvoiceHistoryEntry = {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  recipient: string;
  totalAmount: string;
  billedAmount?: string | number | null;
  billedCurrency?: string | null;
  originalCurrency?: string | null;
  status: string;
  sentAt: string;
  subject?: string | null;
  summary?: unknown;
};

type HistoryResponse = {
  invoices: InvoiceHistoryEntry[];
};

const formatCurrency = (
  value: string | number | null | undefined,
  currency: string | null | undefined = 'USD',
) => {
  const numeric = Number(value);
  const code = (currency || 'USD').toString().trim().toUpperCase() || 'USD';
  const safeNumber = Number.isFinite(numeric) ? numeric : 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(safeNumber);
  } catch (_err) {
    return `${code} ${safeNumber.toFixed(2)}`;
  }
};

const formatDateTime = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString();
};

const formatSubject = (value?: string | null) => {
  if (typeof value !== 'string') {
    return '--';
  }
  const trimmed = value.trim();
  return trimmed || '--';
};

const getTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getInvoiceNumberFromSummary = (summary: unknown): string | null => {
  if (!isObjectRecord(summary)) {
    return null;
  }
  return getTrimmedString(summary.invoiceNumber);
};

const getInvoiceCurrency = (invoice: InvoiceHistoryEntry): string => {
  const summaryCurrency =
    isObjectRecord(invoice.summary) && 'currency' in invoice.summary
      ? getTrimmedString((invoice.summary as Record<string, unknown>).currency)
      : null;
  const originalCurrency = getTrimmedString(invoice.originalCurrency);
  const resolved = summaryCurrency || originalCurrency || 'USD';
  return resolved.toUpperCase();
};

const getInvoiceAmountDisplay = (invoice: InvoiceHistoryEntry) => {
  const currencyCode = getInvoiceCurrency(invoice);
  const summaryAmount =
    isObjectRecord(invoice.summary) && 'totalAmount' in invoice.summary
      ? (invoice.summary as Record<string, unknown>).totalAmount
      : null;
  const amountValue = summaryAmount ?? invoice.totalAmount ?? '0.00';
  return {
    currencyCode,
    amountValue,
    formatted: formatCurrency(amountValue, currencyCode),
  };
};

export default function HistoryPage() {
  const { token, loading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceHistoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceHistoryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | string>('ALL');
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [showAdvancedMetadata, setShowAdvancedMetadata] = useState(false);

  useEffect(() => {
    if (!token || loading) return;

    const controller = new AbortController();
    const loadHistory = async () => {
      try {
        setFetching(true);
        setError(null);
        const response = await apiFetch('/api/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load history.');
        }

        const payload = (await response.json()) as HistoryResponse;
        setInvoices(Array.isArray(payload.invoices) ? payload.invoices : []);
        setSelectedInvoice(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch history', err);
        setError('Unable to load history. Please try again later.');
      } finally {
        if (!controller.signal.aborted) {
          setFetching(false);
        }
      }
    };

    loadHistory();

    return () => controller.abort();
  }, [token, loading]);

  const detailSummaryText = useMemo(() => {
    if (!selectedInvoice) return null;
    const summary = selectedInvoice.summary;
    if (summary === null || summary === undefined) {
      return null;
    }
    if (typeof summary === 'string') {
      const trimmed = summary.trim();
      return trimmed || null;
    }
    if (isObjectRecord(summary)) {
      try {
        return JSON.stringify(summary, null, 2);
      } catch (_err) {
        return 'Unable to display summary details.';
      }
    }
    try {
      return JSON.stringify(summary, null, 2);
    } catch (_err) {
      return String(summary);
    }
  }, [selectedInvoice]);

  const statusOptions = useMemo(() => {
    const values = new Set<string>();
    invoices.forEach((invoice) => {
      const status = (invoice.status || 'sent').toString().trim();
      if (status) {
        values.add(status);
      }
    });
    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [invoices]);

  const currencyOptions = useMemo(() => {
    const values = new Set<string>();
    invoices.forEach((invoice) => {
      values.add(getInvoiceCurrency(invoice));
    });
    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasQuery = query.length > 0;
    const hasStatusFilter = statusFilter !== 'ALL';
    const hasCurrencyFilter = currencyFilter !== 'ALL';
    const normalizedStatusFilter = statusFilter.toLowerCase();
    const hasDateFilter = dateRange !== 'ALL';
    const now = Date.now();
    const cutoff =
      dateRange === 'LAST_7_DAYS'
        ? now - 7 * 24 * 60 * 60 * 1000
        : dateRange === 'LAST_30_DAYS'
          ? now - 30 * 24 * 60 * 60 * 1000
          : null;
    const minValue = typeof minAmount === 'number' && Number.isFinite(minAmount) ? minAmount : null;
    const maxValue = typeof maxAmount === 'number' && Number.isFinite(maxAmount) ? maxAmount : null;

    return invoices.filter((invoice) => {
      if (hasQuery) {
        const invoiceNumber = getInvoiceNumberFromSummary(invoice.summary) ?? '';
        const fields = [
          invoice.customerName,
          invoice.customerEmail,
          invoice.recipient,
          invoice.subject,
          invoiceNumber,
        ];
        const matches = fields.some((value) =>
          (value ?? '').toString().toLowerCase().includes(query),
        );
        if (!matches) {
          return false;
        }
      }

      if (hasStatusFilter) {
        const statusValue = (invoice.status || 'sent').toString().toLowerCase();
        if (statusValue !== normalizedStatusFilter) {
          return false;
        }
      }

      if (hasDateFilter) {
        const sentAt = Date.parse(invoice.sentAt);
        if (Number.isNaN(sentAt)) {
          return false;
        }
        if (cutoff !== null && sentAt < cutoff) {
          return false;
        }
      }

      if (hasCurrencyFilter) {
        const currencyValue = getInvoiceCurrency(invoice);
        if (currencyValue !== currencyFilter) {
          return false;
        }
      }

      if (minValue !== null || maxValue !== null) {
        const amount = Number(invoice.totalAmount);
        if (!Number.isFinite(amount)) {
          return false;
        }
        if (minValue !== null && amount < minValue) {
          return false;
        }
        if (maxValue !== null && amount > maxValue) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, searchQuery, statusFilter, dateRange, currencyFilter, minAmount, maxAmount]);

  const hasInvoices = useMemo(() => filteredInvoices.length > 0, [filteredInvoices]);
  const hasBaseInvoices = useMemo(() => invoices.length > 0, [invoices]);
  const selectedInvoiceNumber = useMemo(
    () => getInvoiceNumberFromSummary(selectedInvoice?.summary),
    [selectedInvoice],
  );
  const summaryRecord = useMemo(
    () =>
      selectedInvoice && isObjectRecord(selectedInvoice.summary)
        ? (selectedInvoice.summary as Record<string, unknown>)
        : null,
    [selectedInvoice],
  );
  const bannerRecord = useMemo(
    () =>
      summaryRecord && isObjectRecord(summaryRecord.banner)
        ? (summaryRecord.banner as Record<string, unknown>)
        : null,
    [summaryRecord],
  );
  const amountDisplay = selectedInvoice ? getInvoiceAmountDisplay(selectedInvoice).formatted : null;
  const senderName = getTrimmedString(summaryRecord?.senderName);
  const senderEmail = getTrimmedString(summaryRecord?.senderEmail);
  const senderDisplay =
    senderName && senderEmail ? `${senderName} (${senderEmail})` : senderName || senderEmail;
  const campaignEnabled = bannerRecord?.enabled === true;
  const campaignMessage =
    getTrimmedString(bannerRecord?.bannerCopyText) ?? getTrimmedString(bannerRecord?.text);
  const campaignCta = getTrimmedString(bannerRecord?.ctaText);
  const detailItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];
    if (selectedInvoiceNumber) {
      items.push({ label: 'Invoice number', value: selectedInvoiceNumber });
    }
    if (amountDisplay) {
      items.push({ label: 'Amount', value: amountDisplay });
    }
    if (senderDisplay) {
      items.push({ label: 'Sender', value: senderDisplay });
    }
    if (campaignEnabled) {
      items.push({ label: 'Campaign', value: 'Enabled' });
    }
    if (campaignMessage) {
      items.push({ label: 'Campaign message', value: campaignMessage });
    }
    if (campaignCta) {
      items.push({ label: 'Call to action', value: campaignCta });
    }
    return items;
  }, [
    amountDisplay,
    campaignCta,
    campaignEnabled,
    campaignMessage,
    senderDisplay,
    selectedInvoiceNumber,
  ]);

  const closeDetails = () => {
    setSelectedInvoice(null);
    setShowAdvancedMetadata(false);
  };
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateRange('ALL');
    setCurrencyFilter('ALL');
    setMinAmount(undefined);
    setMaxAmount(undefined);
  };

  if (loading || !token) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-200"
      >
        &larr; Back to Dashboard
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">History</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Activity log</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Review the invoices you&apos;ve dispatched. Entries are captured the moment a notice leaves the platform so
          you always have a paper trail.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg shadow-slate-900/40">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Search and filters</p>
              <p className="mt-2 text-sm text-slate-300">
                Find invoices by customer, recipient, or subject and narrow by status, date, or amount.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-700/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search invoices"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
              >
                <option value="ALL">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Date range</label>
              <select
                value={dateRange}
                onChange={(event) =>
                  setDateRange(event.target.value as 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS')
                }
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
              >
                <option value="ALL">All time</option>
                <option value="LAST_7_DAYS">Last 7 days</option>
                <option value="LAST_30_DAYS">Last 30 days</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Currency</label>
              <select
                value={currencyFilter}
                onChange={(event) => setCurrencyFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
              >
                <option value="ALL">All currencies</option>
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Amount</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={typeof minAmount === 'number' && Number.isFinite(minAmount) ? minAmount : ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      setMinAmount(undefined);
                      return;
                    }
                    const numeric = Number(value);
                    setMinAmount(Number.isFinite(numeric) ? numeric : undefined);
                  }}
                  placeholder="Min"
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
                />
                <input
                  type="number"
                  value={typeof maxAmount === 'number' && Number.isFinite(maxAmount) ? maxAmount : ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      setMaxAmount(undefined);
                      return;
                    }
                    const numeric = Number(value);
                    setMaxAmount(Number.isFinite(numeric) ? numeric : undefined);
                  }}
                  placeholder="Max"
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Invoices sent</h3>
            <p className="text-sm text-slate-300">Customer, amount, delivery status, and when it went out.</p>
          </div>
          {fetching ? (
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Loading…</span>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          {hasInvoices ? (
            <table className="min-w-full divide-y divide-slate-800/60 text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-3 pr-4 text-left">Customer</th>
                  <th className="py-3 pr-4 text-left">Subject</th>
                  <th className="py-3 pr-4 text-left">Amount</th>
                  <th className="py-3 pr-4 text-left">Status</th>
                  <th className="py-3 pr-4 text-left">Sent</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredInvoices.map((invoice) => {
                  const contact =
                    invoice.customerEmail && invoice.customerEmail !== invoice.recipient
                      ? `${invoice.customerEmail} · ${invoice.recipient}`
                      : invoice.recipient;
                  const subject = formatSubject(invoice.subject);
                  const invoiceNumber = getInvoiceNumberFromSummary(invoice.summary);
                  return (
                    <tr key={invoice.id} className="text-slate-200">
                      <td className="py-3 pr-4 align-top">
                        <p className="font-semibold text-white">{invoice.customerName}</p>
                        <p className="text-xs text-slate-400">{contact}</p>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        <p>{subject}</p>
                        {invoiceNumber ? (
                          <p className="mt-1 text-xs text-slate-500">Invoice #{invoiceNumber}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 align-top">{getInvoiceAmountDisplay(invoice).formatted}</td>
                      <td className="py-3 pr-4 align-top capitalize">{invoice.status || 'sent'}</td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        {formatDateTime(invoice.sentAt)}
                      </td>
                      <td className="py-3 pl-4 text-right align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(invoice)}
                          className="rounded-lg border border-slate-700/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-sky-400 hover:text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">
              {fetching
                ? 'Loading your invoice history…'
                : hasBaseInvoices
                  ? 'No invoices match your current search or filters.'
                  : 'No invoices sent yet. Generate and send one to populate your log.'}
            </p>
          )}
        </div>
      </section>

      {selectedInvoice ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8"
          onClick={closeDetails}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/70"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Invoice details</p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {formatSubject(selectedInvoice.subject)}
                </h3>
                <p className="text-sm text-slate-300">Sent {formatDateTime(selectedInvoice.sentAt)}</p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Customer</p>
                <p className="mt-2 text-sm font-semibold text-white">{selectedInvoice.customerName}</p>
                <p className="text-xs text-slate-400">{selectedInvoice.customerEmail || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Recipient</p>
                <p className="mt-2 text-sm text-slate-200">{selectedInvoice.recipient}</p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Amount</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {getInvoiceAmountDisplay(selectedInvoice).formatted}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-2 text-sm capitalize text-slate-200">{selectedInvoice.status || 'sent'}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Invoice details</p>
              {detailItems.length > 0 ? (
                <dl className="mt-3 space-y-2 text-sm text-slate-200">
                  {detailItems.map((item) => (
                    <div key={item.label} className="flex flex-wrap gap-2">
                      <dt className="text-slate-400">{item.label}:</dt>
                      <dd className="font-semibold text-white">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedMetadata((prev) => !prev)}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-200"
                  aria-expanded={showAdvancedMetadata}
                >
                  <span aria-hidden="true">{showAdvancedMetadata ? '▼' : '▶'}</span>
                  <span>Advanced metadata</span>
                </button>
                <p className="mt-2 text-xs text-slate-500">Technical details for advanced users</p>
                {showAdvancedMetadata && detailSummaryText ? (
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800/60 bg-slate-950/70 p-3 text-xs text-slate-200">
                    {detailSummaryText}
                  </pre>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
