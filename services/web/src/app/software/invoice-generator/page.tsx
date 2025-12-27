import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invoices that convert | Marketing Invoice Generator',
  description:
    'Turn every invoice into a revenue-generating touchpoint with built-in marketing, smart CTAs, and click tracking.',
  alternates: {
    canonical: 'https://themossyroots.com/software/invoice-generator',
  },
  openGraph: {
    title: 'Invoices that convert | Marketing Invoice Generator',
    description:
      'Embed marketing directly inside your invoices\u2014banners, CTAs, tracking\u2014without plugins or landing pages.',
    url: 'https://themossyroots.com/software/invoice-generator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoices that convert',
    description:
      'Turn every invoice into a revenue-generating touchpoint with built-in marketing, smart CTAs, and click tracking.',
  },
};

const ctaHref = '/dashboard/invoice-generator';

export default function InvoiceGeneratorMarketingPage() {
  return (
    <div className="bg-[#f7f9fc] text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-6 py-16 sm:py-20">
        {/* Hero */}
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">Invoices that convert.</h1>
            <p className="text-lg text-slate-700">
              Turn every invoice into a revenue-generating touchpoint \u2014 with built-in marketing, smart CTAs, and click tracking.
            </p>
            <div className="space-y-1 text-base text-slate-700">
              <p>Traditional invoices ask for payment.</p>
              <p className="font-semibold text-slate-900">This one drives action.</p>
            </div>
            <p className="text-base text-slate-700">
              <strong>Invoices that convert</strong> let you embed marketing directly inside your invoice \u2014 from banners and CTAs to upsells \u2014 and
              track what happens when recipients click.
            </p>
            <p className="text-base font-semibold text-slate-900">
              <strong>Built for freelancers, agencies, and modern businesses that want more from every invoice.</strong>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={ctaHref} className="btn-primary inline-flex items-center justify-center px-5 py-3 text-base">
              Open Editor
            </Link>
            <Link href={ctaHref} className="btn-secondary inline-flex items-center justify-center px-5 py-3 text-base">
              Start free trial
            </Link>
          </div>
        </section>

        {/* Problem */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">The problem with traditional invoices</h2>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>They get opened, paid, and forgotten \u2014 zero engagement beyond the transaction.</li>
            <li>They carry bland, generic layouts that undercut your brand value.</li>
            <li>They have no place for offers, education, or next steps.</li>
            <li>They give you no insight into whether anyone clicks or cares.</li>
          </ul>
          <p className="text-base font-semibold text-slate-900">They don\u2019t sell. They don\u2019t inform. They don\u2019t convert.</p>
          <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 px-4 py-3 text-base italic text-slate-800">
            “Invoices should work like landing pages.”
          </blockquote>
        </section>

        {/* Differentiator */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">What makes this different (and world-first)</h2>
          <p className="text-base text-slate-700">
            This is the first invoice system designed to embed marketing, CTAs, and tracking inside the invoice itself \u2014 without pixels,
            plugins, or external landing pages.
          </p>
          <p className="text-base text-slate-700">
            Instead of sending a static PDF and hoping for the best, you send a dynamic, branded experience that nudges the next action while
            keeping billing crystal clear.
          </p>
          <p className="text-base text-slate-700">Your invoice becomes:</p>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>A branded micro-landing page for your business.</li>
            <li>A built-in upsell and referral engine.</li>
            <li>A trackable CTA surface without extra tooling.</li>
          </ul>
        </section>

        {/* Features */}
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">What you can do</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">{'\u{1F3A8} Design & branding'}</h3>
              <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>Choose templates, typography, and brand colors.</li>
                <li>Add logos, hero banners, and background images.</li>
                <li>Keep totals and terms crystal clear while looking premium.</li>
              </ul>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">{'\u{1F4E9} Payments & sending'}</h3>
              <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>Send email + PDF together so both carry your brand.</li>
                <li>Keep payment details visible without clutter.</li>
                <li>Deliver instantly from your dashboard.</li>
              </ul>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">{'\u{1F4CA} Tracking & history'}</h3>
              <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>Track CTA clicks directly from the invoice.</li>
                <li>Save every send in your dashboard history.</li>
                <li>Know which offers get engagement.</li>
              </ul>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">{'\u{1F30D} Global & smart'}</h3>
              <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>Support for multiple currencies and tax settings.</li>
                <li>Reusable campaigns to keep offers consistent.</li>
                <li>Responsive layouts that look great on any device.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* AI Assistant */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">Built-in AI marketing assistant</h2>
          <p className="text-base text-slate-700">Need a banner or CTA but don’t know what to say?</p>
          <p className="text-base text-slate-700">Input:</p>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>Your offer (e.g., retainer, add-on, referral ask)</li>
            <li>Your audience and tone</li>
          </ul>
          <p className="text-base text-slate-700">Output:</p>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>Banner copy that fits your brand voice</li>
            <li>CTA text and target URL suggestions</li>
            <li>Optional background image guidance</li>
          </ul>
          <p className="text-base text-slate-700">
            It’s like a <strong>silent salesperson</strong> that writes the upsell for you.
          </p>
        </section>

        {/* Business Impact */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">The business impact</h2>
          <p className="text-base text-slate-700">Invoices become a predictable surface for driving the next action.</p>
          <p className="text-base text-slate-700">Your customers see what to do next, not just what to pay.</p>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>Increase repeat bookings without extra campaigns.</li>
            <li>Promote retainers or add-ons right where attention is highest.</li>
            <li>Encourage referrals with trackable CTAs.</li>
            <li>Keep brand perception strong at the moment of payment.</li>
            <li>Learn which offers resonate by watching clicks.</li>
          </ul>
          <p className="text-base font-semibold text-slate-900">Every invoice does more than request money \u2014 it builds momentum.</p>
        </section>

        {/* Target Users */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">Who this is for</h2>
          <ul className="space-y-2 text-base text-slate-700">
            <li>
              <strong>Freelancers</strong> — Keep clients coming back with smart upsells.
            </li>
            <li>
              <strong>Agencies</strong> — Show premium value and move clients into retainers.
            </li>
            <li>
              <strong>Studios</strong> — Pair design polish with clear next steps.
            </li>
            <li>
              <strong>Consultants</strong> — Educate and guide while billing.
            </li>
            <li>
              <strong>SaaS & product teams</strong> — Add trackable CTAs without building a new page.
            </li>
          </ul>
          <p className="text-base font-semibold text-slate-900">If you send invoices, this works for you.</p>
        </section>

        {/* Trust & Privacy */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-3xl font-semibold">Built for trust and privacy</h2>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>No tracking pixels required \u2014 click tracking is native to the invoice flow.</li>
            <li>Clear separation of billing details and marketing content.</li>
            <li>Secure delivery with email + PDF together.</li>
            <li>Runs without third-party landing pages or plugins.</li>
          </ul>
          <p className="text-base text-slate-700">Your customers see exactly what you’re offering — with zero hidden tracking.</p>
        </section>

        {/* Final CTA */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f2f6fb] to-[#e8f3ff] p-8 text-center shadow-xl shadow-slate-200/70">
          <h2 className="text-3xl font-semibold">Every invoice is a marketing opportunity.</h2>
          <p className="text-base text-slate-700">Send invoices that sell, not just bill.</p>
          <p className="text-base text-slate-700">Show clients the next step the moment they\u2019re most attentive.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href={ctaHref} className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base">
              Open Editor
            </Link>
            <Link href={ctaHref} className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-base">
              Start free / Early access
            </Link>
          </div>
          <p className="text-sm italic text-slate-600">No credit card required</p>
        </section>

        {/* Next.js Readiness Note */}
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">{'\u2705'} Ready for Next.js</h3>
          <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
            <li>App Router friendly with metadata for SEO.</li>
            <li>Public route \u2014 no auth checks required.</li>
            <li>CTAs link to /dashboard/invoice-generator; dashboard guard handles login.</li>
            <li>No dependency on the Vite tool or rewrites.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
