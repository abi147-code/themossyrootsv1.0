'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '@/context/LocaleContext';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

type ProvidersProps = {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
};

export function Providers({ children, locale, dictionary }: ProvidersProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      {children}
    </LocaleProvider>
  );
}
