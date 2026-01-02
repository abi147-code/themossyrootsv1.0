export const supportedLocales = ['en', 'fr'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

export const isLocale = (value: string | null | undefined): value is Locale => {
  if (!value) return false;
  return (supportedLocales as readonly string[]).includes(value);
};
