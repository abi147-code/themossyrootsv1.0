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

export const metadata: Metadata = {
  title: 'TMR CRM',
  description: 'The Mossy Roots CRM for modern agencies',
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
