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

export default function HistoryPage() {
  const { token, loading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceHistoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  <th className="py-3 pr-4 text-left">Amount</th>
                  <th className="py-3 pr-4 text-left">Status</th>
                  <th className="py-3 pl-4 text-right">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {invoices.map((invoice) => {
                  const contact =
                    invoice.customerEmail && invoice.customerEmail !== invoice.recipient
                      ? `${invoice.customerEmail} · ${invoice.recipient}`
                      : invoice.recipient;
                  return (
                    <tr key={invoice.id} className="text-slate-200">
                      <td className="py-3 pr-4 align-top">
                        <p className="font-semibold text-white">{invoice.customerName}</p>
                        <p className="text-xs text-slate-400">{contact}</p>
                      </td>
                      <td className="py-3 pr-4 align-top">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-3 pr-4 align-top capitalize">{invoice.status || 'sent'}</td>
                      <td className="py-3 pl-4 text-right align-top text-slate-300">
                        {formatDateTime(invoice.sentAt)}
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
    </div>
  );
}
