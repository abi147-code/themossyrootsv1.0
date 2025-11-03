import type { Metadata } from 'next';
import { Geist_Mono, Inter, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
      <body className={`${inter.variable} ${sora.variable} ${geistMono.variable} bg-[#0B0F14] text-[#F5F7F9] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
