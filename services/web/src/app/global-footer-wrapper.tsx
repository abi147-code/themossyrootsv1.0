'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

const HIDE_FOOTER_PREFIXES = ['/dashboard'];

export default function GlobalFooterWrapper() {
  const pathname = usePathname();
  const hideFooter = HIDE_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hideFooter) return null;
  return <Footer />;
}
