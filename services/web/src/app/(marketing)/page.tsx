import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import SereneLandingClient from './serene/SereneLandingClient';

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

const seoTitle = 'The Mossy Roots | Serene Marketing';
const seoDescription =
  'A high-end, calm, and organic landing experience for The Mossy Roots with immersive 3D ambience and smooth Framer Motion.';

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  alternates: { canonical: '/' },
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
        alt: 'The Mossy Roots serene marketing experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
  },
};

export default function SereneHomePage() {
  return (
    <SereneLandingClient fontClassName={`${inter.variable} ${playfair.variable}`} />
  );
}
