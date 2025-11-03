'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type BrandSettings = {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  defaultCTA: string | null;
};

type ToastState =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

const DEFAULT_COLORS = {
  primary: '#0ea5e9',
  secondary: '#1e293b',
  accent: '#f97316',
};

async function fetchBrandSettings(token: string, abortSignal?: AbortSignal): Promise<BrandSettings> {
  const response = await fetch('/api/brand', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: abortSignal,
  });

  const payload = (await response.json().catch(() => ({}))) as BrandSettings & { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to load brand settings.');
  }

  return {
    logoUrl: payload.logoUrl ?? null,
    primaryColor: payload.primaryColor ?? null,
    secondaryColor: payload.secondaryColor ?? null,
    accentColor: payload.accentColor ?? null,
    defaultCTA: payload.defaultCTA ?? null,
  };
}

export default function BrandSettingsPage() {
  const { token, loading } = useAuth();

  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brand, setBrand] = useState<BrandSettings>({
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
    accentColor: null,
    defaultCTA: null,
  });
  const [formState, setFormState] = useState<BrandSettings>({
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
    accentColor: null,
    defaultCTA: null,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoCleared, setLogoCleared] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token || loading) {
      return;
    }

    const abortController = new AbortController();
    setInitializing(true);
    setError(null);

    fetchBrandSettings(token, abortController.signal)
      .then((settings) => {
        setBrand(settings);
        setFormState(settings);
        setLogoCleared(false);
        setLogoPreview((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
        setLogoFile(null);
        if (abortController.signal.aborted) return;
      })
      .catch((err) => {
        if (abortController.signal.aborted) return;
        console.error('[Brand] Fetch failed', err);
        setError(err instanceof Error ? err.message : 'Unable to load brand settings.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setInitializing(false);
        }
      });

    return () => abortController.abort();
  }, [token, loading]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    },
    [logoPreview]
  );

  const displayLogo = logoPreview || (!logoCleared ? formState.logoUrl : null);

  const primaryColor = formState.primaryColor ?? DEFAULT_COLORS.primary;
  const secondaryColor = formState.secondaryColor ?? DEFAULT_COLORS.secondary;
  const accentColor = formState.accentColor ?? DEFAULT_COLORS.accent;
  const defaultCTA = formState.defaultCTA ?? 'Book now';

  const handleColorChange = (key: keyof Pick<BrandSettings, 'primaryColor' | 'secondaryColor' | 'accentColor'>) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({
        ...prev,
        [key]: value,
      }));
    };
  };

  const clearColor = (key: keyof Pick<BrandSettings, 'primaryColor' | 'secondaryColor' | 'accentColor'>) => {
    setFormState((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  const handleCtaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      defaultCTA: value.trim().length ? value : '',
    }));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoCleared(false);
  };

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoFile(null);
    setLogoCleared(true);
    setFormState((prev) => ({ ...prev, logoUrl: null }));
  };

  const uploadLogoIfNeeded = async (): Promise<BrandSettings | null> => {
    if (!logoFile || !token) {
      return null;
    }

    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await fetch('/api/brand/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; brand?: BrandSettings };

    if (!response.ok) {
      throw new Error(payload?.message || 'Failed to upload logo.');
    }

    return payload.brand ?? null;
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let currentBrand = brand;

      if (logoFile) {
        const updatedFromUpload = await uploadLogoIfNeeded();
        if (updatedFromUpload) {
          currentBrand = updatedFromUpload;
          setBrand(updatedFromUpload);
          setFormState((prev) => ({
            ...prev,
            logoUrl: updatedFromUpload.logoUrl,
          }));
        }
      }

      const response = await fetch('/api/brand', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl: logoCleared && !logoFile ? null : (currentBrand.logoUrl ?? null),
          primaryColor: formState.primaryColor ?? null,
          secondaryColor: formState.secondaryColor ?? null,
          accentColor: formState.accentColor ?? null,
          defaultCTA: formState.defaultCTA ?? null,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string; brand?: BrandSettings };

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to save brand settings.');
      }

      const updatedBrand = payload.brand ?? currentBrand;
      setBrand(updatedBrand);
      setFormState(updatedBrand);
      setLogoCleared(false);
      setLogoFile(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(null);
      setToast({ type: 'success', message: payload.message || 'Brand settings updated.' });
    } catch (err) {
      console.error('[Brand] Save failed', err);
      const message = err instanceof Error ? err.message : 'Failed to save brand settings.';
      setError(message);
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormState(brand);
    setLogoCleared(false);
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setError(null);
  };

  const previewData = useMemo(
    () => ({
      logoUrl: displayLogo,
      primaryColor,
      secondaryColor,
      accentColor,
      defaultCTA: defaultCTA || 'Book now',
    }),
    [displayLogo, primaryColor, secondaryColor, accentColor, defaultCTA]
  );

  if (loading || !token) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-8">
      {toast ? (
        <div
          className={`pointer-events-none fixed left-1/2 top-6 z-30 -translate-x-1/2 transform rounded-2xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
              : 'border-rose-400/50 bg-rose-500/20 text-rose-100'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Link
        href="/dashboard/settings"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-200"
      >
        &larr; Back to Settings
      </Link>

      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Brand</p>
        <h1 className="text-3xl font-semibold text-white">Brand settings</h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Upload your logo, define color accents, and set a default CTA. These defaults appear across invoices, email
          campaigns, and other tooling—override them per workflow whenever you need flexibility.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-950/75 p-8 shadow-xl shadow-slate-950/40">
        {initializing ? (
          <p className="text-sm text-slate-400">Loading your brand preferences...</p>
        ) : (
          <form className="space-y-8" onSubmit={handleSave}>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Logo</label>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                      {displayLogo ? (
                        <Image
                          src={displayLogo}
                          alt="Brand logo"
                          width={96}
                          height={96}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">No logo</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 text-xs text-slate-300">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl bg-slate-900/80 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                        >
                          Upload logo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="rounded-xl border border-rose-400/50 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:bg-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                        PNG, JPG, GIF, SVG up to 5MB.
                      </p>
                      {logoFile ? (
                        <span className="text-xs text-slate-400">
                          Selected: <span className="text-slate-200">{logoFile.name}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <ColorInput
                    label="Primary color"
                    value={formState.primaryColor ?? DEFAULT_COLORS.primary}
                    actualValue={formState.primaryColor}
                    onChange={handleColorChange('primaryColor')}
                    onClear={() => clearColor('primaryColor')}
                  />
                  <ColorInput
                    label="Secondary color"
                    value={formState.secondaryColor ?? DEFAULT_COLORS.secondary}
                    actualValue={formState.secondaryColor}
                    onChange={handleColorChange('secondaryColor')}
                    onClear={() => clearColor('secondaryColor')}
                  />
                  <ColorInput
                    label="Accent color"
                    value={formState.accentColor ?? DEFAULT_COLORS.accent}
                    actualValue={formState.accentColor}
                    onChange={handleColorChange('accentColor')}
                    onClear={() => clearColor('accentColor')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" htmlFor="cta">
                    Default call-to-action
                  </label>
                  <textarea
                    id="cta"
                    name="cta"
                    rows={3}
                    placeholder="Book a discovery call"
                    value={formState.defaultCTA ?? ''}
                    onChange={handleCtaChange}
                    className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Appears in invoices and campaigns when a per-item CTA isn&apos;t provided.
                  </p>
                </div>
              </div>

              <BrandPreviewCard {...previewData} />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-700/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:bg-slate-900/80"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {saving ? 'Saving...' : 'Save brand'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ColorInput({
  label,
  value,
  actualValue,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  actualValue: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="h-12 w-20 cursor-pointer rounded-xl border border-slate-700 bg-slate-900 p-1"
        />
        <span className="text-xs uppercase tracking-[0.3em] text-slate-300">{value}</span>
        <button
          type="button"
          onClick={onClear}
          disabled={!actualValue}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-200 disabled:cursor-not-allowed disabled:text-slate-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function BrandPreviewCard({
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  defaultCTA,
}: {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultCTA: string;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/50">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          {logoUrl ? (
            <Image src={logoUrl} alt="Preview logo" width={64} height={64} unoptimized className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Logo</span>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <h3 className="text-lg font-semibold text-white">Invoice &amp; email defaults</h3>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
        <div
          className="rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          style={{ backgroundColor: primaryColor }}
        >
          Primary &mdash; {primaryColor}
        </div>
        <div
          className="mt-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ backgroundColor: secondaryColor, color: '#f8fafc' }}
        >
          Secondary &mdash; {secondaryColor}
        </div>
        <div
          className="mt-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          style={{ backgroundColor: accentColor }}
        >
          Accent &mdash; {accentColor}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Default CTA</p>
        <p className="mt-2 text-sm text-slate-200">{defaultCTA}</p>
      </div>
    </div>
  );
}
