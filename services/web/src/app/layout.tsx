import type { Metadata } from 'next';
import { Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import GlobalNavWrapper from './global-nav-wrapper';
import GlobalFooterWrapper from './global-footer-wrapper';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const metadataBase = new URL('https://www.themossyroots.com');
const defaultOgImage = 'https://www.themossyroots.com/og/invoice-generator.png';
const defaultDescription =
  'Turn invoices into a marketing channel. Add CTAs, track clicks, and upsell directly from branded invoices to drive revenue and loyalty for modern teams.';

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'Invoices That Convert | Invoice Marketing Generator',
    template: '%s | TMR CRM',
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    url: metadataBase,
    siteName: 'Invoice Marketing Generator by TMR CRM',
    title: 'Invoice Marketing Generator',
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Invoice marketing generator preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Marketing Generator by TMR CRM',
    description: defaultDescription,
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${geistMono.variable} bg-[#0B0F14] text-[#F5F7F9] antialiased`}>
        <Providers>
          <GlobalNavWrapper />
          {children}
          <GlobalFooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
