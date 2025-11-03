import type { Metadata } from 'next';
import Link from 'next/link';
import DotGrid from '@/components/DotGrid';

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
    <div className="relative min-h-screen">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-24 pb-16 md:pt-32">
        <div className="absolute inset-0">
          <DotGrid
            className="pointer-events-none absolute inset-0"
            dotSize={12}
            gap={26}
            baseColor="#0A1B13"
            activeColor="#E2B714"
            proximity={160}
            speedTrigger={120}
            shockRadius={240}
            shockStrength={5.5}
            resistance={540}
            returnDuration={1.6}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F14]/30 via-[#0B0F14]/60 to-[#0B0F14]/90" />
        </div>
        <div className="relative z-10 w-full max-w-4xl text-center md:text-left">
          <h1 className="text-balance font-heading text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Where marketing grows smarter.
          </h1>
          <p className="mt-4 text-lg text-white/80 md:max-w-2xl">
            Mossy Roots helps businesses cut through the noise with automation that feels personal and marketing that feels alive.
          </p>
        </div>
      </section>

      <main className="relative z-10 flex flex-col gap-16 px-6 pb-24 md:gap-20">
        <section className="mx-auto w-full max-w-5xl text-center">
          <article className="space-y-6 px-4 py-10 md:px-8">
            <h2 className="text-3xl font-semibold text-white">Our Story</h2>
            <div className="space-y-4 text-base text-white/75">
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
            <h2 className="text-3xl font-semibold text-white">Our Mission</h2>
            <div className="space-y-4 text-base text-white/75">
              <p>To make smart marketing accessible and authentic for every business.</p>
              <p>We use AI and automation to turn everyday routines into intelligent systems that scale creativity and growth.</p>
              <p>We're building a smarter way to market &mdash; one that's data-driven, beautifully designed, and deeply human.</p>
            </div>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <article className="glass-panel px-8 py-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">What We Do</p>
              <h2 className="text-3xl font-semibold text-white">Our Ecosystem</h2>
              <p className="text-base text-white/75">
                We design tools that transform everyday brand moments into marketing that works for you &mdash; quietly, intelligently, and consistently.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {ecosystemTools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition hover:border-white/20 hover:bg-white/10"
                >
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                  <p className="mt-3 text-sm text-white/75">{tool.description}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl">
          <article className="glass-panel space-y-6 px-8 py-10">
            <h2 className="text-3xl font-semibold text-white">Our Philosophy</h2>
            <blockquote className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
              <p className="text-lg font-medium text-white">"Rooted in strategy. Grown through creativity."</p>
            </blockquote>
            <p className="text-base text-white/75">
              We believe the best marketing feels like nature &mdash; adaptive, intelligent, and quietly powerful. Every product we build balances automation with artistry, helping
              your brand grow in a way that feels both smart and sincere.
            </p>
          </article>
        </section>
      </main>

      <section className="relative z-10 mx-6 mb-24 mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A3A2A] via-[#0B0F14] to-[#0B0F14] px-8 py-14 text-center shadow-2xl shadow-black/30 md:mx-auto md:max-w-4xl">
        <div className="absolute inset-0 opacity-60">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(226,183,20,0.25),_transparent_65%)]" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Ready to grow with us?</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[#E2B714]/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#E2B714] transition hover:border-[#E2B714] hover:bg-[#E2B714]/10"
          >
            Explore the Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
