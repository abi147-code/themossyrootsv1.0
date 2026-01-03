import type { Metadata } from 'next';
import PortfolioPg2Client from './PortfolioPg2Client';
import Script from 'next/script';
import './pg2-tailwind.css';
import { buildAlternateLinks, resolveLocale } from '@/lib/locale';
import { getDictionary } from '@/i18n/get-dictionary';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Abishek Elangeswaran',
  jobTitle: 'Digital Architect',
  url: 'https://themossyroots.com/portfolio',
  image: 'https://themossyroots.com/pictures/portfoliopic.jpg',
  description: 'Full-Stack Marketer & Digital Architect based in Nantes, France, blending physics, design, and automation.',
  sameAs: [
    'https://themossyroots.com',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'The Mossy Roots',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dictionary = await getDictionary(locale);
  const meta = dictionary.portfolio.meta;
  const alternates = buildAlternateLinks('/portfolio', locale);

  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      url: alternates.canonical,
      siteName: 'The Mossy Roots',
      locale,
      type: 'profile',
      images: [
        {
          url: 'https://themossyroots.com/pictures/portfoliopic.jpg',
          width: 720,
          height: 900,
          alt: 'Portrait of Abishek Elangeswaran',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.ogDescription,
      images: ['https://themossyroots.com/pictures/portfoliopic.jpg'],
    },
  };
}

export default function PortfolioPage() {
  return (
    <>
      <Script
        id="portfolio-pg2-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioPg2Client />
    </>
  );
}
