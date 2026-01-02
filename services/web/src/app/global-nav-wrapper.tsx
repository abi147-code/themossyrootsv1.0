'use client';

import { usePathname } from 'next/navigation';
import SereneNav from '@/components/SereneNav';

const HIDE_NAV_PREFIXES = ['/dashboard', '/software/invoice-generator'];

export default function GlobalNavWrapper() {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideNav) return null;
  return <SereneNav />;
}
