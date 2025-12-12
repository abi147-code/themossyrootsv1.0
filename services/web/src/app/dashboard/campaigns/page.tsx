'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, resolveAssetUrl } from '@/lib/api';

type Campaign = {
  id: number;
  userId?: number | null;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  ctaText?: string | null;
  ctaTargetUrl?: string | null;
  bannerBackgroundColor?: string | null;
  bannerTextColor?: string | null;
  bannerImageOpacity?: number | null;
  bannerCopyText?: string | null;
  bannerCopyTextColor?: string | null;
  bannerCopyOpacity?: number | null;
  bannerImagePosition?: string | null;
  ctaBackgroundColor?: string | null;
  ctaTextColor?: string | null;
  invoicePageColor?: string | null;
  invoiceTextColor?: string | null;
  typographyKey?: string | null;
  invoiceTemplateKey?: string | null;
  invoiceTypographyKey?: string | null;
  pageBackgroundColor?: string | null;
  pageColor?: string | null;
  colorPrimary?: string | null;
  colorAccent?: string | null;
  fromCompanyName?: string | null;
  fromCompanyAddress?: string | null;
  fromCompanyEmail?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

type CampaignAnalytics = {
  clicksTotal: number;
  clicksByDay: { date: string | null; count: number }[];
  invoicesUsed: number;
  ctr: number;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getCampaignName = (campaign: Campaign) => {
  const trimmed = campaign.name?.trim();
  if (trimmed) return trimmed;
  return `Campaign #${campaign.id}`;
};

const formatNullable = (value?: string | number | null) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && !value.trim()) return '-';
  return String(value);
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return value.toLocaleString();
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

const ColorSwatch = ({ label, value }: { label: string; value?: string | null }) => {
  const display = formatNullable(value);
  const isValid = typeof value === 'string' && value.trim();
  return (
    <div className="flex items-center justify-between text-xs text-slate-300">
      <span className="font-semibold text-slate-200">{label}</span>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 rounded-full border border-slate-800 bg-slate-900">
          {isValid ? (
            <span
              className="block h-full w-full rounded-full"
              style={{ background: value as string }}
              aria-label={`${label} swatch`}
            />
          ) : null}
        </span>
        <span className="truncate max-w-[160px]" title={display}>
          {display}
        </span>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="text-xs flex flex-col gap-1">
    <p className="uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="text-slate-200 leading-snug" title={formatNullable(value)}>
      {formatNullable(value)}
    </p>
  </div>
);

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-left">
    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</span>
    <span className="text-lg font-semibold text-white">{value}</span>
  </div>
);

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={`h-4 w-4 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);

export default function CampaignsPage() {
  const { token, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [analytics, setAnalytics] = useState<Record<number, CampaignAnalytics>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const decodeUserId = (jwt?: string | null) => {
    try {
      if (!jwt) return null;
      const payload = JSON.parse(atob(jwt.split('.')[1] || ''));
      return payload?.userId ?? null;
    } catch (_e) {
      return null;
    }
  };

  const loadAnalytics = useCallback(
    async (campaignList: Campaign[]) => {
      if (!token || campaignList.length === 0) {
        setAnalytics({});
        return;
      }

      setAnalyticsLoading(true);
      try {
        const results = await Promise.all(
          campaignList.map(async (campaign) => {
            try {
              const response = await apiFetch(`/api/campaigns/${campaign.id}/analytics`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to load analytics');
              }

              const payload = (await response.json()) as CampaignAnalytics;
              return [campaign.id, payload] as const;
            } catch (err) {
              console.error('[Campaigns] Failed to load analytics for campaign', campaign.id, err);
              return [campaign.id, null] as const;
            }
          })
        );

        const nextAnalytics: Record<number, CampaignAnalytics> = {};
        results.forEach(([id, data]) => {
          if (data) nextAnalytics[id] = data;
        });
        setAnalytics(nextAnalytics);
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token || loading) return;

    const controller = new AbortController();
    const loadCampaigns = async () => {
      setFetching(true);
      setError(null);
      try {
        const response = await apiFetch('/api/campaigns', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load campaigns.');
        }

        const payload = (await response.json()) as unknown;
        const campaignsPayload =
          payload && typeof payload === 'object' && Array.isArray((payload as any).campaigns)
            ? (payload as any).campaigns
            : Array.isArray(payload)
              ? payload
              : [];

        setCampaigns(campaignsPayload as Campaign[]);
        void loadAnalytics(campaignsPayload as Campaign[]);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('[Campaigns] Failed to load from /api/campaigns', err);
        setError('Unable to load campaigns right now. Please try again.');
        setCampaigns([]);
      } finally {
        if (!controller.signal.aborted) {
          setFetching(false);
        }
      }
    };

    void loadCampaigns();

    return () => controller.abort();
  }, [token, loading, loadAnalytics]);

  const hasCampaigns = useMemo(() => campaigns.length > 0, [campaigns]);

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
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Campaigns</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Marketing runs</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Every campaign generated from the Marketing Invoice Tool appears here with live usage and click metrics.
          Banners, names, and timestamps are ready to review alongside performance signals.
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
            <h3 className="text-lg font-semibold text-white">Invoice tool campaigns</h3>
            <p className="text-sm text-slate-300">
              Pulled directly from the Marketing Invoice Tool feed with click + invoice usage insights.
            </p>
          </div>
          {fetching ? (
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Loading...</span>
          ) : null}
        </div>

        {hasCampaigns ? (
          <div className="mt-6 flex flex-col gap-6">
            {campaigns.map((campaign) => {
              const name = getCampaignName(campaign);
              const bannerUrl = resolveAssetUrl(campaign.bannerUrl || undefined);
              const logoUrl = resolveAssetUrl(campaign.logoUrl || undefined);
              const isExpanded = expanded[campaign.id] === true;
              const toggleExpanded = () =>
                setExpanded((prev) => ({ ...prev, [campaign.id]: !isExpanded }));
              const bannerCopyPreview =
                (campaign.bannerCopyText || '').trim() || 'No banner copy';
              const metric = analytics[campaign.id];
              const clicksTotal = metric?.clicksTotal ?? 0;
              const invoicesUsed = metric?.invoicesUsed ?? 0;
              const ctr = metric ? formatPercent(metric.ctr) : '0%';

              return (
                <div
                  key={campaign.id}
                  className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5 shadow-lg shadow-slate-900/30 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70">
                        {logoUrl ? (
                          <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">No logo</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Campaign</p>
                        <h4 className="text-lg font-semibold text-white truncate">{name}</h4>
                        <p className="text-xs text-slate-400 truncate">
                          ID {campaign.id}
                          {campaign.userId ? ` · User ${campaign.userId}` : ''}
                        </p>
                        <p className="mt-2 text-sm text-slate-200 line-clamp-2" title={bannerCopyPreview}>
                          {bannerCopyPreview}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="flex items-center gap-2 shrink-0 rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-slate-600"
                    >
                      {isExpanded ? 'Hide details' : 'More details'}
                      <Chevron open={isExpanded} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatPill label="Clicks" value={formatNumber(clicksTotal)} />
                    <StatPill label="Invoices Used" value={formatNumber(invoicesUsed)} />
                    <StatPill label="CTR" value={ctr} />
                    {analyticsLoading && !metric ? (
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Loading metrics...
                      </span>
                    ) : null}
                  </div>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isExpanded ? 2400 : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    aria-hidden={!isExpanded}
                  >
                    <div className="mt-2 space-y-6 rounded-xl border border-slate-800/70 bg-slate-950/50 p-4">
                      {/* Branding */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-400">Branding</p>
                          <span className="h-px w-full ml-3 bg-slate-800"></span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <ColorSwatch label="Invoice Page" value={campaign.invoicePageColor} />
                          <ColorSwatch label="Invoice Text" value={campaign.invoiceTextColor} />
                          <Field label="Typography Key" value={campaign.invoiceTypographyKey} />
                          <Field label="Template Key" value={campaign.invoiceTemplateKey || campaign.typographyKey} />
                        </div>
                      </div>

                      {/* Banner */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-400">Banner</p>
                          <span className="h-px w-full ml-3 bg-slate-800"></span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Banner Preview</p>
                            <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
                              {bannerUrl ? (
                                <img src={bannerUrl} alt={`${name} banner`} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">No banner</span>
                              )}
                            </div>
                          </div>
                          <Field label="Banner Copy" value={campaign.bannerCopyText} />
                          <ColorSwatch label="Banner Copy Color" value={campaign.bannerCopyTextColor} />
                          <Field label="Banner Copy Opacity" value={campaign.bannerCopyOpacity?.toString()} />
                          <ColorSwatch label="Banner Background" value={campaign.bannerBackgroundColor} />
                          <ColorSwatch label="Banner Text Color" value={campaign.bannerTextColor} />
                          <Field label="Banner Image Opacity" value={campaign.bannerImageOpacity?.toString()} />
                          <Field label="Banner Image Position" value={campaign.bannerImagePosition} />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-400">CTA Settings</p>
                          <span className="h-px w-full ml-3 bg-slate-800"></span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field label="CTA Text" value={campaign.ctaText} />
                          <Field label="CTA Target URL" value={campaign.ctaTargetUrl} />
                          <ColorSwatch label="CTA Background" value={campaign.ctaBackgroundColor} />
                          <ColorSwatch label="CTA Text Color" value={campaign.ctaTextColor} />
                        </div>
                      </div>

                      {/* Company & Metadata */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-400">Company & Metadata</p>
                          <span className="h-px w-full ml-3 bg-slate-800"></span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field label="From Name" value={campaign.fromCompanyName} />
                          <Field label="From Email" value={campaign.fromCompanyEmail} />
                          <Field label="From Address" value={campaign.fromCompanyAddress} />
                          <Field label="Status" value={campaign.status} />
                          <Field label="Description" value={campaign.description} />
                          <Field label="User ID" value={campaign.userId?.toString()} />
                          <Field label="Created At" value={formatDate(campaign.createdAt)} />
                          <Field label="Updated At" value={campaign.updatedAt ? formatDate(campaign.updatedAt) : '-'} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800/70 bg-slate-950/40 px-6 py-12 text-center">
            {fetching ? (
              <>
                <p className="text-lg font-semibold text-white">Loading campaigns...</p>
                <p className="max-w-xl text-sm text-slate-400">
                  Pulling the latest campaigns from the Marketing Invoice Tool.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-white">No campaigns found.</p>
                <p className="max-w-xl text-sm text-slate-400">
                  Generate your first campaign from the Invoice Tool.
                </p>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
