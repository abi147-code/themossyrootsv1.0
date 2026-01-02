'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type ProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export function LocaleProvider({ locale, dictionary, children }: ProviderProps) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocaleContext = () => {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('LocaleProvider is missing from the React tree.');
  }
  return value;
};

export const useDictionary = () => useLocaleContext().dictionary;

export const useLocale = () => useLocaleContext().locale;
