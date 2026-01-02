import type { Locale } from './config';

const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  fr: () => import('./dictionaries/fr').then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
}
