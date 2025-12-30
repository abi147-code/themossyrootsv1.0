'use client';

import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

const HIDE_FOOTER_PREFIXES = ['/dashboard', '/software/invoice-generator'];

export default function GlobalFooterWrapper() {
  const pathname = usePathname();
  const hideFooter = HIDE_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hideFooter) return null;
  return <Footer />;
}
