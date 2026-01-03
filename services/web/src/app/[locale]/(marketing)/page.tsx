import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import SereneLandingClient from './serene/SereneLandingClient';
import { buildAlternateLinks, resolveLocale } from '@/lib/locale';
import { getDictionary } from '@/i18n/get-dictionary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--serene-font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--serene-font-playfair',
  display: 'swap',
});

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dictionary = await getDictionary(locale);
  const meta = dictionary.home.meta;
  const alternates = buildAlternateLinks('/', locale);

  const defaultOgImage = 'https://themossyroots.com/static/brand/og-cover.jpg';

  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: alternates.canonical,
      siteName: 'The Mossy Roots',
      locale,
      type: 'website',
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: 'The Mossy Roots serene marketing experience',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [defaultOgImage],
    },
  };
}

export default function SereneHomePage() {
  return <SereneLandingClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
