import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/locale';

type PageParams = {
  params: Promise<{
    locale?: string;
  }>;
};

export default async function LegacyInvoiceRedirectPage({ params }: PageParams) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  redirect(`/${locale}/software/invoice-generator`);
}
