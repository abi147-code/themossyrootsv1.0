import type { Metadata } from 'next';
import Script from 'next/script';
import InvoiceLandingClient from './InvoiceLandingClient';

const canonicalUrl = 'https://www.themossyroots.com/software/invoice-generator';
const ogImage = 'https://www.themossyroots.com/og/invoice-generator.png';
const pageUrl = canonicalUrl;
const description =
  'Turn invoices into a marketing channel. Add CTAs, track clicks, and upsell directly from branded invoices to drive revenue and loyalty for modern teams.';

export const metadata: Metadata = {
  title: 'Invoices That Convert | Invoice Marketing Generator',
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: 'Invoices That Convert - Turn Every Invoice Into Revenue',
    description: 'Invoice marketing with embedded CTAs, branded layouts, and click tracking to grow revenue from every send.',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Invoice marketing generator preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Marketing Generator by TMR CRM',
    description,
    images: [ogImage],
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Invoice Marketing Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  url: pageUrl,
  description,
};

export default function InvoiceGeneratorLandingPage() {
  return (
    <>
      <Script id="software-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <InvoiceLandingClient />
    </>
  );
}
