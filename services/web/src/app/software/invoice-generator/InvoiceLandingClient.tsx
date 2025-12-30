'use client';

import dynamic from 'next/dynamic';
import '@/styles/invoice-landing.css';

const InvoiceLandingApp = dynamic(() => import('@/components/invoice-landing/App'), { ssr: false });

export default function InvoiceLandingClient() {
  return <InvoiceLandingApp />;
}
