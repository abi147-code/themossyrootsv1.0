'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function OrganizationSettingsPlaceholder() {
  const { token, loading } = useAuth();

  if (loading || !token) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-8">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-200"
      >
        &larr; Back to Settings
      </Link>

      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80">Organization</p>
        <h1 className="text-3xl font-semibold text-white">Organization settings</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Controls for team management, billing roles, and shared automation presets are on the roadmap. Check back soon.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-8 text-sm text-slate-300 shadow-lg shadow-slate-900/40">
        We&rsquo;re building the foundation for collaborative settings. In future updates you&rsquo;ll be able to invite
        teammates, define permissions, and manage shared CRM resources from this space.
      </div>
    </div>
  );
}
