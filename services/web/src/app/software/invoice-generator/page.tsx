import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invoice Generator | The Mossy Roots',
  description: 'Create branded, marketing-ready invoices and track engagement.',
};

export default function InvoiceGeneratorMarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16 text-slate-900">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Invoice Marketing</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">Invoice Generator</h1>
        <p className="text-base text-slate-700">
          Create branded invoices with embedded marketing banners and CTAs, then track engagement from your dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard/invoice-generator" className="btn-primary inline-flex items-center justify-center px-5 py-3 text-base">
          Open Editor
        </Link>
        <Link href="/signup" className="btn-secondary inline-flex items-center justify-center px-5 py-3 text-base">
          Start free trial
        </Link>
      </div>

      <section className="mt-10 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">What you can do</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Keep invoices on-brand with templates, typography, and colors.</li>
          <li>Add marketing banners and CTAs to drive referrals or upsells.</li>
          <li>Send from the dashboard and keep history tied to your campaigns.</li>
        </ul>
      </section>
    </main>
  );
}
