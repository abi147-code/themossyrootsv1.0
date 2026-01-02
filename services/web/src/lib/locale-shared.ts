import { defaultLocale, isLocale, supportedLocales, type Locale } from '@/i18n/config';

export const supportedLocaleList = supportedLocales as readonly Locale[];

export const normalizePathname = (pathname: string): string => {
  if (!pathname.startsWith('/')) return `/${pathname}`;
  return pathname;
};

export const stripLocaleFromPathname = (pathname: string): { locale: Locale | null; pathname: string } => {
  const normalized = normalizePathname(pathname);
  const parts = normalized.split('/');
  const maybeLocale = parts[1];
  if (isLocale(maybeLocale)) {
    const remainder = parts.slice(2).join('/');
    return {
      locale: maybeLocale,
      pathname: remainder ? `/${remainder}` : '/',
    };
  }
  return { locale: null, pathname: normalized };
};

export const prefixPathWithLocale = (locale: Locale, pathname: string): string => {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return `/${locale}`;
  return `/${locale}${normalized}`;
};

export const swapLocaleInPath = (pathname: string, nextLocale: Locale): string => {
  const { pathname: stripped } = stripLocaleFromPathname(pathname);
  return prefixPathWithLocale(nextLocale, stripped);
};

export { defaultLocale, isLocale };
export type { Locale };
