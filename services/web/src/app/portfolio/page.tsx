import type { Metadata } from 'next';
import PortfolioPg2Client from './PortfolioPg2Client';
import Script from 'next/script';
import './pg2-tailwind.css';

export const metadata: Metadata = {
  title: 'ABISHEK | Digital Architect',
  description: 'A luxury dark-themed portfolio for Abishek, featuring 3D space elements, frosted glass UI, and AI-powered marketing insights.',
  alternates: {
    canonical: 'https://themossyroots.com/portfolio',
  },
  openGraph: {
    title: 'ABISHEK | Digital Architect',
    description: 'Physics-driven luxury portfolio experience for Abishek Elangeswaran.',
    url: 'https://themossyroots.com/portfolio',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
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
    title: 'ABISHEK | Digital Architect',
    description: 'Physics-driven luxury portfolio experience for Abishek Elangeswaran.',
    images: ['https://themossyroots.com/pictures/portfoliopic.jpg'],
  },
};

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
