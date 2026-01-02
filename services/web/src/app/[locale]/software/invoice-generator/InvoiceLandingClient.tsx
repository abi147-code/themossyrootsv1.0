'use client';

import dynamic from 'next/dynamic';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import '@/styles/invoice-landing.css';

const InvoiceLandingApp = dynamic<{ copy: Dictionary['invoice']; locale: Locale }>(
  () => import('@/components/invoice-landing/App'),
  { ssr: false },
);

export default function InvoiceLandingClient() {
  const dictionary = useDictionary();
  const locale = useLocale();

  return <InvoiceLandingApp copy={dictionary.invoice} locale={locale} />;
}
