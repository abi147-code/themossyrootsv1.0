import type { Metadata } from 'next';
import { Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TKWHWL9T');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className={`${manrope.variable} ${geistMono.variable} bg-[#0B0F14] text-[#F5F7F9] antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TKWHWL9T"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
