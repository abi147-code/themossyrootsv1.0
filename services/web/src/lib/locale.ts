import {
  normalizePathname,
  prefixPathWithLocale,
  stripLocaleFromPathname,
  swapLocaleInPath,
  supportedLocaleList,
} from './locale-shared';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

export const resolveLocale = (value?: string | null): Locale => (isLocale(value) ? value : defaultLocale);

export const buildAlternateLinks = (pathname: string, currentLocale: Locale) => {
  const normalized = normalizePathname(pathname);
  const canonicalPath = prefixPathWithLocale(currentLocale, normalized === '/' ? '' : normalized);
  const languages = supportedLocaleList.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${siteUrl}${prefixPathWithLocale(locale, normalized === '/' ? '' : normalized)}`;
    return acc;
  }, {});

  return {
    canonical: `${siteUrl}${canonicalPath}`,
    languages,
  };
};

const siteUrl = 'https://www.themossyroots.com';

export {
  supportedLocaleList,
  normalizePathname,
  prefixPathWithLocale,
  stripLocaleFromPathname,
  swapLocaleInPath,
  defaultLocale,
  isLocale,
};
export type { Locale };
