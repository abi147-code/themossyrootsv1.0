'use client';

import { usePathname } from 'next/navigation';
import SereneNav from '@/components/SereneNav';
import { stripLocaleFromPathname } from '@/lib/locale-shared';

const HIDE_NAV_PREFIXES = ['/dashboard', '/software/invoice-generator', '/demo'];
const AUTH_PREFIXES = ['/login', '/signup'];

export default function GlobalNavWrapper() {
  const pathname = usePathname();
  const { pathname: strippedPath } = stripLocaleFromPathname(pathname);
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => strippedPath.startsWith(prefix));
  const isAuth = AUTH_PREFIXES.some((prefix) => strippedPath.startsWith(prefix));

  if (hideNav || isAuth) return null;
  return <SereneNav />;
}
