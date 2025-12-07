import type { Metadata } from 'next';
import Image from 'next/image';
import RotatingText from './components/rotatingtext';
import PortfolioHero from './components/PortfolioHero';
import LogoLoop, { type LogoItem } from '@/components/LogoLoop';

const rotatingRoles = [
  'A FULL-STACK MARKETER',
  'AN AUTOMATION SPECIALIST',
  'AN SEO STRATEGIST',
  'A CREATIVE TECHNOLOGIST'
];

export const metadata: Metadata = {
  title: 'Portfolio \u2013 The Mossy Roots',
  description:
    'Discover the creator behind The Mossy Roots and the multidisciplinary journey that blends automation, SEO, and design into living marketing systems.',
  alternates: {
    canonical: 'https://themossyroots.com/portfolio',
  },
  openGraph: {
    title: 'The Mossy Roots Portfolio',
    description:
      'Meet Abishek Elangeswaran, the full-stack marketer and creative technologist crafting intelligent marketing ecosystems.',
    url: 'https://themossyroots.com/portfolio',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Mossy Roots Portfolio',
    description:
      'Meet Abishek Elangeswaran, the full-stack marketer and creative technologist crafting intelligent marketing ecosystems.',
  },
};

export default function PortfolioPage() {
  const logoItems: LogoItem[] = [
    { src: '/logos/typescript.svg', alt: 'TypeScript' },
    { src: '/logos/docker.svg', alt: 'Docker' },
    { src: '/logos/python.svg', alt: 'Python' },
    { src: '/logos/tailwind.svg', alt: 'Tailwind CSS' },
    { src: '/logos/github.svg', alt: 'GitHub' },
    { src: '/logos/hubspot.svg', alt: 'HubSpot' },
    { src: '/logos/google-analytics.svg', alt: 'Google Analytics' },
    { src: '/logos/microsoft-office.svg', alt: 'Microsoft Office' },
    { node: <span className="font-semibold" style={{ color: '#007ACC' }}>VS Code</span> },
    { src: '/logos/procreate.svg', alt: 'Procreate' },
    { src: '/logos/vercel.svg', alt: 'Vercel' },
    { src: '/logos/photoshop.svg', alt: 'Adobe Photoshop' },
    { src: '/logos/davinci-resolve.svg', alt: 'DaVinci Resolve' },
    { src: '/next.svg', alt: 'Next.js' }
  ];

  return (
    <div className="relative min-h-screen">
      <PortfolioHero />

      <main className="relative z-10 px-6 pb-24">
        <div className="mx-auto w-full max-w-5xl pt-16 md:pt-20 text-white">
          <header className="text-center">
            <h1 className="text-balance font-heading text-4xl font-bold sm:text-5xl md:text-6xl">About the Creator</h1>
            <div className="mt-3 flex justify-center">
              <RotatingText
                texts={rotatingRoles}
                splitBy="characters"
                rotationInterval={2800}
                staggerDuration={0.015}
                mainClassName="text-base font-semibold uppercase tracking-[0.35em] text-[#E2B714] sm:text-lg"
                elementLevelClassName="text-[#E2B714]"
              />
            </div>
            <p className="mt-6 text-lg text-white/80">I'm Abishek, based in Nantes, France.</p>
          </header>
          <div className="mt-12 grid grid-cols-1 gap-8 text-base text-white/80 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-start">
            <div className="space-y-6">
              <p>
                I began my journey as a mechanical engineer, learning how systems move, connect, and evolve. Over time, I realized what fascinated me most wasn't the machines themselves,
                but the patterns behind them &mdash; how a single adjustment could make something work beautifully better.
              </p>
              <p>
                That same curiosity eventually led me to marketing. I started to see brands as living systems too &mdash; ones that could be designed thoughtfully, nurtured with care, and grown naturally.
              </p>
              <p>
                At Drop, I helped lead a crowdfunding campaign on KissKissBankBank that reached 261% of its goal. But what stayed with me wasn't the number &mdash; it was watching a small idea come alive
                through people's belief, stories, and shared energy.
              </p>
              <p>
                Today, I build marketing ecosystems powered by AI, automation, and design thinking &mdash; tools that help creators and small businesses scale without losing their human touch.
              </p>
              <p>
                My path from engineering to creativity taught me that automation isn't about replacing people &mdash; it's about giving them more room to imagine, to create, and to connect.
              </p>
              <p>
                Beyond the screens, I'm a photographer and designer, drawn to textures, light, and rhythm. The Mossy Roots grew from that same instinct &mdash; to build something grounded, calm, and alive.
              </p>
              <p>
                For me, great systems are not just efficient &mdash; they're empathetic. They remind us that growth is most beautiful when it still feels human.
              </p>
              <div className="pt-8">
                <LogoLoop
                  logos={logoItems}
                  speed={10}
                  gap={48}
                  logoHeight={64}
                  fadeOut={false}
                  scaleOnHover
                  ariaLabel="Tooling logos"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mx-auto w-full max-w-xs sm:max-w-sm md:mx-0 md:mt-2">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-sm">
                <Image
                  src="/pictures/portfoliopic.jpg"
                  alt="Portrait of Abishek Elangeswaran"
                  width={720}
                  height={900}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 768px) 320px, 70vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
