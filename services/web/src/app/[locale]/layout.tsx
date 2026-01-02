import { PropsWithChildren } from 'react';
import GlobalNavWrapper from '../global-nav-wrapper';
import GlobalFooterWrapper from '../global-footer-wrapper';
import { Providers } from '../providers';
import { getDictionary } from '@/i18n/get-dictionary';
import { resolveLocale } from '@/lib/locale';
import LocaleLangSetter from '@/components/LocaleLangSetter';

type LayoutProps = PropsWithChildren<{
  params: {
    locale?: string;
  };
}>;

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);

  return (
    <Providers locale={locale} dictionary={dictionary}>
      <LocaleLangSetter locale={locale} />
      <GlobalNavWrapper />
      {children}
      <GlobalFooterWrapper />
    </Providers>
  );
}
