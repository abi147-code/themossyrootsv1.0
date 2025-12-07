import type { Metadata } from 'next';
import Link from 'next/link';
import DotGrid from '@/components/DotGrid';
import VisibilityMount from '@/components/VisibilityMount';

export const metadata: Metadata = {
  title: 'About The Mossy Roots \u2013 Where marketing grows smarter',
  description:
    'Discover the story, mission, and ecosystem behind The Mossy Roots \u2013 automation that feels personal and marketing that feels alive.',
  alternates: {
    canonical: 'https://themossyroots.com/about',
  },
  openGraph: {
    title: 'About The Mossy Roots',
    description:
      'Explore how The Mossy Roots blends automation with artistry to deliver marketing that grows smarter.',
    url: 'https://themossyroots.com/about',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About The Mossy Roots',
    description:
      'Explore how The Mossy Roots blends automation with artistry to deliver marketing that grows smarter.',
  },
};

const ecosystemTools = [
  {
    name: 'Invoice Marketing Generator',
    description:
      'Turns every invoice into a branded message, blending billing with storytelling to create subtle touchpoints that strengthen trust.',
  },
  {
    name: 'Automated SEO Blog Builder',
    description:
      'Generates optimized blog articles in your brand voice, keeping content fresh, relevant, and visible without lifting a finger.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#f7f9fc]">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-24 pb-16 md:pt-32">
        <div className="absolute inset-0">
          <VisibilityMount className="pointer-events-none absolute inset-0" rootMargin="0px 0px -20% 0px" threshold={0.1}>
            <DotGrid
              className="pointer-events-none absolute inset-0"
              dotSize={12}
              gap={26}
              baseColor="#e3ebf5"
              activeColor="#1f7a4d"
              proximity={160}
              speedTrigger={120}
              shockRadius={240}
              shockStrength={5.5}
              resistance={540}
              returnDuration={1.6}
            />
          </VisibilityMount>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/75 to-white/90" />
        </div>
        <div className="relative z-10 w-full max-w-4xl text-center md:text-left">
          <h1 className="text-balance font-heading text-4xl font-bold text-slate-900 sm:text-5xl md:text-6xl">
            Where marketing grows smarter.
          </h1>
          <p className="mt-4 text-lg text-slate-700 md:max-w-2xl">
            Mossy Roots helps businesses cut through the noise with automation that feels personal and marketing that feels alive.
          </p>
        </div>
      </section>

      <main className="relative z-10 flex flex-col gap-16 px-6 pb-24 md:gap-20">
        <section className="mx-auto w-full max-w-5xl text-center">
          <article className="space-y-6 px-4 py-10 md:px-8">
            <h2 className="text-3xl font-semibold text-slate-900">Our Story</h2>
            <div className="space-y-4 text-base text-slate-700">
              <p>
                It started with a pattern I couldn&rsquo;t ignore &mdash; talented creators and small businesses doing incredible work, yet spending most of their days repeating
                the same digital routines.
              </p>
              <p>Sending invoices. Posting updates. Managing blogs. Writing emails.</p>
              <p>All the things that keep a business alive... but slowly drain the energy that once made it grow.</p>
              <p>I built The Mossy Roots to change that rhythm.</p>
              <p>
                Inspired by how nature grows quietly yet purposefully, I wanted to create a space where marketing and automation could feel organic &mdash; systems that support you
                instead of suffocating your creativity.
              </p>
              <p>
                What started with small experiments &mdash; an Invoice Marketing Generator that turned transactions into brand stories, an SEO Blog Writer that kept ideas alive while
                people slept &mdash; soon grew into something much bigger.
              </p>
              <p>
                Today, The Mossy Roots designs custom automation systems for creators, startups, and small teams &mdash; crafted around their needs, their tools, and their story.
              </p>
              <p>We don&rsquo;t sell one-size-fits-all templates.</p>
              <p>
                We build living systems that adapt, simplify, and quietly do the work in the background so you can focus on what truly matters: creating, connecting, and growing your vision.
              </p>
              <p>Because like nature, the best growth doesn&rsquo;t shout, it simply thrives.</p>
            </div>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <article className="glass-panel space-y-6 px-8 py-10">
            <h2 className="text-3xl font-semibold text-slate-900">Our Mission</h2>
            <div className="space-y-4 text-base text-slate-700">
              <p>To make smart marketing accessible and authentic for every business.</p>
              <p>We use AI and automation to turn everyday routines into intelligent systems that scale creativity and growth.</p>
              <p>We're building a smarter way to market &mdash; one that's data-driven, beautifully designed, and deeply human.</p>
            </div>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <article className="glass-panel px-8 py-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">What We Do</p>
              <h2 className="text-3xl font-semibold text-slate-900">Our Ecosystem</h2>
              <p className="text-base text-slate-700">
                We design tools that transform everyday brand moments into marketing that works for you &mdash; quietly, intelligently, and consistently.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {ecosystemTools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{tool.name}</h3>
                  <p className="mt-3 text-sm text-slate-700">{tool.description}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <article className="glass-panel space-y-6 px-8 py-10">
            <h2 className="text-3xl font-semibold text-slate-900">Our Philosophy</h2>
            <blockquote className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-700">
              <p className="text-lg font-medium text-slate-900">"Rooted in strategy. Grown through creativity."</p>
            </blockquote>
            <p className="text-base text-slate-700">
              We believe the best marketing feels like nature &mdash; adaptive, intelligent, and quietly powerful. Every product we build balances automation with artistry, helping
              your brand grow in a way that feels both smart and sincere.
            </p>
          </article>
        </section>
      </main>

      <section className="relative z-10 mx-6 mb-24 mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f2f6fb] to-[#eef3fb] px-8 py-14 text-center shadow-2xl shadow-slate-200/70 md:mx-auto md:max-w-4xl">
        <div className="absolute inset-0 opacity-70">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(31,122,77,0.16),_transparent_60%)]" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">Ready to grow with us?</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[#1f7a4d]/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#1f7a4d] transition hover:border-[#1f7a4d] hover:bg-[#1f7a4d]/10"
          >
            Explore the Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
