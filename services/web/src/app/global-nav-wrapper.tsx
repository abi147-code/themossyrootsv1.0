'use client';

import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

const HIDE_NAV_PREFIXES = ['/dashboard'];

export default function GlobalNavWrapper() {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideNav) return null;
  return <Navbar />;
}
