import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import SoftwareClient from './SoftwareClient';

export const metadata: Metadata = {
  title: 'Marketing Invoice Generator – The Mossy Roots',
  description:
    'Transform every invoice into a subtle marketing touchpoint with the TMR Marketing Invoice Generator. Blend billing, storytelling, and analytics in one flow.',
  alternates: {
    canonical: 'https://themossyroots.com/software',
  },
  openGraph: {
    title: 'Marketing Invoice Generator',
    description:
      'The Marketing Invoice Generator turns everyday billing into a branded, trackable communication channel.',
    url: 'https://themossyroots.com/software',
    siteName: 'The Mossy Roots',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Invoice Generator',
    description:
      'Turn invoices into marketing. Personalize PDFs, add banners, embed CTAs, and track engagement with The Mossy Roots.',
  },
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--software-font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--software-font-playfair',
  display: 'swap',
});

export default function SoftwarePage() {
  return <SoftwareClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
