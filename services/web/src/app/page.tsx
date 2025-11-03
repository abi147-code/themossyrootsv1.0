import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The Mossy Roots',
  url: 'https://themossyroots.com/',
  logo: 'https://themossyroots.com/static/brand/mossyroots-mark.png',
  description: 'Grow your business roots deeper with invoice marketing, CRM, and automated storytelling.',
  sameAs: [
    'https://github.com/abi147-code',
    'https://www.linkedin.com/company/the-mossy-roots',
  ],
};

const seoTitle = 'Welcome to The Mossy Roots \u2013 Invoice Marketing & CRM';
const seoDescription = 'Grow your business roots deeper with premium invoice marketing, CRM, and email automation.';

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  alternates: {
    canonical: 'https://themossyroots.com/',
  },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: 'https://themossyroots.com/',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://themossyroots.com/static/brand/og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'The Mossy Roots CRM preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
  },
};

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="relative flex flex-col gap-24 pt-24 md:pt-32">
        <Hero />

        <section id="about" className="relative z-10 px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
            <article className="glass-panel py-12">
              <div className="section-grid section-grid--two items-start">
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-white">Built for those who believe marketing should feel alive.</h2>
                  <p className="text-base text-white/75 md:text-lg md:whitespace-nowrap">
                    The Mossy Roots helps brands stay rooted in their purpose while growing their reach with intention.
                  </p>
                  <p className="text-base text-white/70 md:text-lg md:whitespace-nowrap">
                    We automate the heavy lifting so you can focus on storytelling, connection, and the kind of visibility that lasts.
                  </p>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/about" className="btn-secondary justify-center sm:justify-start">
                  Learn More
                </Link>
              </div>
            </article>

            <article id="portfolio" className="glass-panel py-12">
              <div className="space-y-6 text-white">
                <h2 className="text-3xl font-semibold">The Mossy Roots is powered by the work of Abishek Elangeswaran.</h2>
                <p className="max-w-3xl text-base text-white/80">
                  A full-stack marketer, automation specialist, and creative technologist, Abishek blends logic, creativity, and intent across every build &mdash; from
                  AI-driven marketing systems to SEO-optimized websites and design-led storytelling.
                </p>
                <p className="max-w-3xl text-base text-white/75">
                  Explore the portfolio to see how strategy, automation, and design come together to build growth that feels effortless.
                </p>
                <Link href="/portfolio" className="btn-secondary w-fit">
                  View Portfolio
                </Link>
              </div>
            </article>

            <article id="software" className="glass-panel min-h-[40vh]">
              <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Our Software</span>
                <h2 className="text-3xl font-semibold md:text-4xl">Smart tools. Subtle impact. Real connection.</h2>
                <div className="space-y-4 text-base text-white/75 md:text-lg">
                  <p>Your business runs on small moments &mdash; sending an invoice, following up, sharing an update.</p>
                  <p>What if each of those moments worked a little harder for you?</p>
                  <p>At TMR, we build software that turns everyday actions into growth engines, blending design, automation, and marketing insight.</p>
                </div>
                <Link href="/software" className="btn-primary">
                  Explore Our Software
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-white/10 bg-[#0B0F14]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/60">&copy; {year} The Mossy Roots - All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <a
              href="https://www.linkedin.com/company/the-mossy-roots"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[#E2B714]"
            >
              LinkedIn
            </a>
            <span className="text-white/30">|</span>
            <a
              href="https://github.com/abi147-code"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[#E2B714]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
