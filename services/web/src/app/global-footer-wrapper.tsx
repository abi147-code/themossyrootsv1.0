'use client';

import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';
import { stripLocaleFromPathname } from '@/lib/locale-shared';

const HIDE_FOOTER_PREFIXES = ['/dashboard', '/portfolio', '/software/invoice-generator', '/demo'];

export default function GlobalFooterWrapper() {
  const pathname = usePathname();
  const { pathname: strippedPath } = stripLocaleFromPathname(pathname);
  const hideFooter = HIDE_FOOTER_PREFIXES.some((prefix) => strippedPath.startsWith(prefix));
  if (hideFooter) return null;
  return <Footer />;
}
