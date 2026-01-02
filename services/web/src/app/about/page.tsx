import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About The Mossy Roots – Where marketing grows smarter',
  description:
    'Discover the story, mission, and ecosystem behind The Mossy Roots – automation that feels personal and marketing that feels alive.',
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

export default function AboutPage() {
  return <AboutClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
