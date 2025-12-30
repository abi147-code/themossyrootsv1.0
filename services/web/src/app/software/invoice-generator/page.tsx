import type { Metadata } from 'next';
import InvoiceLandingClient from './InvoiceLandingClient';
export const metadata: Metadata = {
  title: 'Invoices That Convert | Smart Invoice Generator',
  description: 'Turn invoices into interactive marketing experiences with smart CTAs, analytics, and conversion-first design.',
  openGraph: {
    title: 'Invoices That Convert',
    description: 'Stop sending static PDFs. Start sending invoices that drive action.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoices That Convert | Smart Invoice Generator',
    description: 'Turn invoices into interactive marketing experiences with smart CTAs, analytics, and conversion-first design.',
  },
};

export default function InvoiceGeneratorLandingPage() {
  return <InvoiceLandingClient />;
}
