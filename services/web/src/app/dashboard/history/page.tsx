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
  status: string;
  sentAt: string;
  subject?: string | null;
  summary?: unknown;
};

type HistoryResponse = {
  invoices: InvoiceHistoryEntry[];
};

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const formatCurrency = (value: string | number | null | undefined) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(numeric);
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

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export default function HistoryPage() {
  const { token, loading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceHistoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceHistoryEntry | null>(null);

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

  const hasInvoices = useMemo(() => invoices.length > 0, [invoices]);
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

  const closeDetails = () => setSelectedInvoice(null);

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
                {invoices.map((invoice) => {
                  const contact =
                    invoice.customerEmail && invoice.customerEmail !== invoice.recipient
                      ? `${invoice.customerEmail} · ${invoice.recipient}`
                      : invoice.recipient;
                  const subject = formatSubject(invoice.subject);
                  return (
                    <tr key={invoice.id} className="text-slate-200">
                      <td className="py-3 pr-4 align-top">
                        <p className="font-semibold text-white">{invoice.customerName}</p>
                        <p className="text-xs text-slate-400">{contact}</p>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">{subject}</td>
                      <td className="py-3 pr-4 align-top">{formatCurrency(invoice.totalAmount)}</td>
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
                  {formatCurrency(selectedInvoice.totalAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-2 text-sm capitalize text-slate-200">{selectedInvoice.status || 'sent'}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Summary</p>
              {detailSummaryText ? (
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800/60 bg-slate-950/70 p-3 text-xs text-slate-200">
                  {detailSummaryText}
                </pre>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No additional summary stored for this invoice.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
