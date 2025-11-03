'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const quickLinks = [
  {
    href: '/dashboard/invoices',
    label: 'Invoice builder',
    description: 'Draft invoices, generate PDFs, and share polished summaries with clients.',
    accent: 'text-sky-200',
  },
  {
    href: '/dashboard/history',
    label: 'Delivery history',
    description: 'Review the invoices you have dispatched and check recent activity logs.',
    accent: 'text-amber-200',
  },
  {
    href: '/dashboard/settings',
    label: 'Account settings',
    description: 'Manage branding defaults, billing preferences, and workspace details.',
    accent: 'text-emerald-200',
  },
];

type UserSummary = {
  totalUsers: number;
  recentUsers: Array<{
    email: string;
    signedUpAt: string;
  }>;
};

export default function DashboardPage() {
  const { token, user, subscription, loading } = useAuth();
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [excelExporting, setExcelExporting] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [csvExporting, setCsvExporting] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  const planStatus = useMemo(() => {
    if (!subscription) {
      return {
        badge: 'Trialing',
        description: 'Start upgrading via Stripe once you are ready.',
      };
    }

    if (subscription.status === 'active') {
      return {
        badge: 'Active',
        description: `On the ${subscription.plan} plan.`,
      };
    }

    return {
      badge: subscription.status,
      description: 'Keep an eye on billing events in Stripe.',
    };
  }, [subscription]);

  useEffect(() => {
    if (!token || !isAdmin) {
      setUserSummary(null);
      setSummaryError(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadSummary = async () => {
      setSummaryError(null);

      try {
        const response = await apiFetch('/api/admin/users/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          let message = 'Failed to load user summary.';
          try {
            const body = await response.json();
            if (body?.message) {
              message = body.message;
            }
          } catch (_error) {
            // Ignore JSON parsing errors for non-JSON responses.
          }
          throw new Error(message);
        }

        const data = (await response.json()) as UserSummary;

        if (!isActive) {
          return;
        }

        setUserSummary(data);
      } catch (error) {
        if (!isActive) {
          return;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load admin user summary', error);
        setUserSummary(null);
        setSummaryError(error instanceof Error ? error.message : 'Failed to load user summary.');
      }
    };

    void loadSummary();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [token, isAdmin]);

  if (loading || !token) {
    return null;
  }

  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : 'N/A';
  const stats = user?.stats ?? {
    customers: 0,
    invoices: 0,
  };
  const showUserSummarySkeleton = isAdmin && userSummary === null && !summaryError;
  const totalUsersText = userSummary ? userSummary.totalUsers.toLocaleString() : '—';
  const recentUsers = userSummary?.recentUsers ?? [];

  const handleExportUsers = useCallback(async (format: 'excel' | 'csv') => {
    if (!token) {
      return;
    }

    const setLoading = format === 'excel' ? setExcelExporting : setCsvExporting;
    const setError = format === 'excel' ? setExcelError : setCsvError;
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        format === 'excel' ? '/api/admin/users/export' : '/api/admin/users/export.csv';

      const response = await apiFetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to export users.';
        try {
          const body = await response.json();
          if (body?.message) {
            message = body.message;
          }
        } catch (_error) {
          // Ignore parsing failures for non-JSON responses.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filenameMatch = response
        .headers
        .get('Content-Disposition')
        ?.match(/filename="([^"]+)"/);
      const defaultFilename = format === 'excel' ? 'tmr-users.xlsx' : 'tmr-users.csv';
      const filename = filenameMatch?.[1] ?? defaultFilename;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export users', error);
      setError(error instanceof Error ? error.message : 'Failed to export users.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col space-y-10">
      <section className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/40 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'builder'}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Your CRM, billing, and marketing automations are orchestrated here. Jump into a tool or review your progress
            before the next sprint.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-6 py-4 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Plan</span>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-sky-400/30 bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-200">
              {planStatus.badge}
            </span>
            <span className="text-slate-200">{planStatus.description}</span>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Trial ends</span>
          <span className="text-slate-100">{trialEndsAt}</span>
          <Link className="text-xs font-semibold text-sky-300 transition hover:text-sky-200" href="https://dashboard.stripe.com/test/subscriptions">
            Manage Stripe subscription &rarr;
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <MetricCard label="Customers" value={stats.customers} />
        <MetricCard label="Invoices" value={stats.invoices} />
      </section>

      {isAdmin ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">👥 Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-white">{showUserSummarySkeleton ? '—' : totalUsersText}</p>
            <p className="mt-4 text-sm text-slate-300">Platform-wide accounts created to date.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleExportUsers('excel')}
                  disabled={excelExporting}
                  className="inline-flex items-center justify-center rounded-xl border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-400"
                >
                  {excelExporting ? 'Preparing XLSX…' : 'Download XLSX'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportUsers('csv')}
                  disabled={csvExporting}
                  className="inline-flex items-center justify-center rounded-xl border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-400"
                >
                  {csvExporting ? 'Preparing CSV…' : 'Download CSV'}
                </button>
              </div>
              <div className="flex flex-col gap-1 text-xs text-rose-300 sm:text-right">
                {excelError ? <span>{excelError}</span> : null}
                {csvError ? <span>{csvError}</span> : null}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">🕓 Recent Signups</p>
            <div className="mt-4">
              {showUserSummarySkeleton ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-12 rounded-xl bg-slate-800/40 animate-pulse" />
                  ))}
                </div>
              ) : summaryError ? (
                <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {summaryError}
                </p>
              ) : recentUsers.length > 0 ? (
                <ul className="space-y-3">
                  {recentUsers.map((entry) => (
                    <li
                      key={`${entry.email}-${entry.signedUpAt}`}
                      className="flex flex-col rounded-xl border border-slate-800/60 bg-slate-900/50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-100">{entry.email}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.signedUpAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No recent signups to display.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/40 transition hover:border-slate-700 hover:shadow-slate-950/60"
          >
            <div className="space-y-4">
              <span className={`text-xs uppercase tracking-[0.4em] ${link.accent}`}>{link.label}</span>
              <p className="text-sm text-slate-300">{link.description}</p>
            </div>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-slate-200 transition group-hover:text-white">
              Open tool &rarr;
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
