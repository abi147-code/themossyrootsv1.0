import type { Metadata } from 'next';
import Link from 'next/link';
import DotGrid from '@/components/DotGrid';
import MarketingOverview from './components/MarketingOverview';

const features = [
  'Add all your usual invoice details &mdash; items, prices, taxes &mdash; in a clean, professional layout.',
  'Include a marketing banner with a background image of your choice.',
  'Embed a trackable CTA (Call-to-Action) to drive engagement.',
  'Send it as a branded email and PDF attachment so both carry your message consistently.',
];

const steps = [
  {
    title: 'Create your invoice as usual',
    description: 'Add customer details, line items, and totals without disrupting your current workflow.',
  },
  {
    title: 'Design your banner',
    description: 'Upload a background image, choose brand-aligned colors, and set type that feels like you.',
  },
  {
    title: 'Add your CTA',
    description: 'Link directly to an offer, event, loyalty program, or any destination that deepens the relationship.',
  },
  {
    title: 'Send and track',
    description: 'Deliver a branded email and attached PDF, then follow performance inside our analytics dashboard.',
  },
];

const impactPoints = [
  'Turn ordinary billing into personalized marketing moments.',
  'Upsell without sounding pushy by weaving subtle reminders into routine touchpoints.',
  'Increase loyalty by making customers feel remembered even after the purchase is complete.',
  'Drive engagement at zero extra advertising cost.',
];

export const metadata: Metadata = {
  title: 'Marketing Invoice Generator \u2013 The Mossy Roots',
  description:
    'Transform every invoice into a subtle marketing touchpoint with the TMR Marketing Invoice Generator. Blend billing, storytelling, and analytics in one flow.',
  alternates: {
    canonical: 'https://themossyroots.com/software',
  },
  openGraph: {
    title: 'Marketing Invoice Generator',
    description:
      'The Marketing Invoice Generator turns everyday billing into a branded, trackable communication channel.',
    url: 'https://themossyroots.com/software',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Invoice Generator',
    description:
      'Turn invoices into marketing. Personalize PDFs, add banners, embed CTAs, and track engagement with The Mossy Roots.',
  },
};

export default function SoftwarePage() {
  return (
    <div id="page-transition-wrapper" className="relative min-h-screen">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-24 pb-16 md:pt-32">
        <div className="absolute inset-0">
          <DotGrid
            className="pointer-events-none absolute inset-0"
            dotSize={14}
            gap={28}
            baseColor="#0F1C14"
            activeColor="#E2B714"
            proximity={160}
            speedTrigger={110}
            shockRadius={240}
            shockStrength={5}
            resistance={540}
            returnDuration={1.6}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(226,183,20,0.18),_transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F14]/25 via-[#0B0F14]/50 to-[#0B0F14]/85" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl text-center md:text-left">
          <span className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">TMR Software</span>
          <p className="mt-3 text-base text-white/75 sm:text-lg">Turn your routine into an opportunity.</p>
        </div>
      </section>

      <main className="relative z-10 px-6 pb-24">
        <div className="mt-16 md:mt-20">
          <MarketingOverview
            title="Marketing Invoice Generator"
            description="The bridge between billing and brand. Turn every invoice into a living conversation that keeps customers engaged long after the payment clears."
          />
        </div>
      </main>

      <section className="relative z-10 mx-6 mb-24 mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A3A2A] via-[#0B0F14] to-[#0B0F14] px-8 py-14 text-center shadow-2xl shadow-black/30 md:mx-auto md:max-w-4xl">
        <div className="absolute inset-0 opacity-60">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(226,183,20,0.25),_transparent_65%)]" />
        </div>
        <div className="relative z-10 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Ready to rethink invoicing?</p>
          <p className="text-base text-white/75">
            Join The Mossy Roots and turn your next billing cycle into a branded moment your customers will remember.
          </p>
          <Link href="/signup" className="btn-primary inline-flex items-center justify-center">
            Start Building Invoices
          </Link>
        </div>
      </section>
    </div>
  );
}
