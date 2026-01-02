import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import AboutClient from './AboutClient';
import { buildAlternateLinks, resolveLocale } from '@/lib/locale';
import { getDictionary } from '@/i18n/get-dictionary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--about-font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--about-font-playfair',
  display: 'swap',
});

export async function generateMetadata({ params }: { params: { locale?: string } }): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);
  const meta = dictionary.about.meta;
  const alternates = buildAlternateLinks('/about', locale);

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
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function AboutPage() {
  return <AboutClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
