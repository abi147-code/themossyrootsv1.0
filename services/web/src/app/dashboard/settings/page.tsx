'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const sections = [
  {
    title: 'Account',
    description: 'Update your profile details and avatar.',
    href: '/dashboard/settings/account',
    available: true,
  },
  {
    title: 'Organization',
    description: 'Manage company-level preferences and members.',
    href: '/dashboard/settings/organization',
    available: false,
  },
  {
    title: 'Brand',
    description: 'Configure visual identity and outbound assets.',
    href: '/dashboard/settings/brand',
    available: false,
  },
];

export default function SettingsHomePage() {
  const { token, loading } = useAuth();

  if (loading || !token) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-8 text-slate-900">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:text-emerald-500"
      >
        &larr; Back to Dashboard
      </Link>

      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/80">Settings</p>
        <h1 className="text-3xl font-semibold text-slate-900">Workspace settings</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Configure your personal profile today, and keep an eye out for upcoming organization and brand controls as we
          expand the CRM.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const content = (
            <>
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{section.title}</span>
                <p className="text-sm text-slate-600">{section.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 transition group-hover:text-emerald-600">
                {section.available ? 'Open' : 'Coming soon'}
              </span>
            </>
          );

          if (section.available) {
            return (
              <Link
                key={section.title}
                href={section.href}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-emerald-100 transition hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200"
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={section.title}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner shadow-emerald-50"
            >
              {content}
            </div>
          );
        })}
      </section>
    </div>
  );
}
