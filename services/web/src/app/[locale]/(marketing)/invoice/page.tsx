import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/locale';

type PageParams = {
  params: {
    locale?: string;
  };
};

export default function LegacyInvoiceRedirectPage({ params }: PageParams) {
  const locale = resolveLocale(params.locale);
  redirect(`/${locale}/software/invoice-generator`);
}
