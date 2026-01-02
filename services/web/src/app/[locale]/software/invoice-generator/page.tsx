import type { Metadata } from 'next';
import Script from 'next/script';
import InvoiceLandingClient from './InvoiceLandingClient';
import { getDictionary } from '@/i18n/get-dictionary';
import { buildAlternateLinks, resolveLocale } from '@/lib/locale';

type PageParams = { params: { locale?: string } };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);
  const meta = dictionary.invoice.meta;
  const alternates = buildAlternateLinks('/software/invoice-generator', locale);
  const ogTitle = meta.ogTitle ?? meta.title;
  const ogDescription = meta.ogDescription ?? meta.description;
  const ogImage = meta.ogImage ?? 'https://www.themossyroots.com/og/invoice-generator.png';

  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      type: 'website',
      url: alternates.canonical,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Invoice marketing generator preview',
        },
      ],
      locale,
      siteName: 'The Mossy Roots',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: meta.description,
      images: [ogImage],
    },
  };
}

export default async function InvoiceGeneratorLandingPage({ params }: PageParams) {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);
  const schema = dictionary.invoice.schema;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: schema.name,
    applicationCategory: schema.category,
    operatingSystem: schema.operatingSystem,
    offers: {
      '@type': 'Offer',
      price: schema.price,
      priceCurrency: schema.currency,
    },
    url: schema.url,
    description: schema.description,
  };

  return (
    <>
      <Script id="software-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <InvoiceLandingClient />
    </>
  );
}
