'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SereneNav from '@/components/SereneNav';
import { stripLocaleFromPathname, swapLocaleInPath, prefixPathWithLocale } from '@/lib/locale-shared';
import { useDictionary, useLocale } from '@/context/LocaleContext';

const HIDE_NAV_PREFIXES = ['/dashboard', '/software/invoice-generator'];
const AUTH_PREFIXES = ['/login', '/signup'];

export default function GlobalNavWrapper() {
  const pathname = usePathname();
  const { pathname: strippedPath } = stripLocaleFromPathname(pathname);
  const isDemo = strippedPath.startsWith('/demo');
  const isAuth = AUTH_PREFIXES.some((prefix) => strippedPath.startsWith(prefix));
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => strippedPath.startsWith(prefix));

  if (isAuth || hideNav) return null;
  if (isDemo) return <DemoNavFloating />;
  return <SereneNav />;
}

function DemoNavFloating() {
  const dictionary = useDictionary();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nextLocale = locale === 'en' ? 'fr' : 'en';
  const isDemoHost =
    typeof window !== 'undefined' && window.location.hostname === 'demo.themossyroots.com';
  const mainSiteBase = 'https://themossyroots.com';
  const toMainSite = (path: string) => (isDemoHost ? `${mainSiteBase}${path}` : path);

  const navLinks = useMemo(
    () => [
      { label: dictionary.nav.about, href: toMainSite(prefixPathWithLocale(locale, '/about')) },
      { label: dictionary.nav.portfolio, href: toMainSite(prefixPathWithLocale(locale, '/portfolio')) },
      { label: dictionary.nav.software, href: toMainSite(prefixPathWithLocale(locale, '/software')) },
      { label: dictionary.nav.demo, href: prefixPathWithLocale(locale, '/demo') },
    ],
    [dictionary.nav, locale, toMainSite]
  );

  const pathWithSearch = (targetPath: string) => {
    const query = searchParams.toString();
    return query ? `${targetPath}?${query}` : targetPath;
  };

  const handleToggleLocale = () => {
    const target = swapLocaleInPath(pathname, nextLocale);
    router.push(pathWithSearch(target));
  };

  return (
    <div className="serene-nav-wrapper">
      <div className="demo-nav-floating">
        <button
          type="button"
          className="demo-nav-toggle"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
          <span className={`demo-nav-chevron ${open ? 'open' : ''}`} aria-hidden />
        </button>
        {open && (
          <div className="demo-nav-dropdown">
            <div className="demo-nav-links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="demo-nav-actions">
              <button
                type="button"
                onClick={() => {
                  handleToggleLocale();
                  setOpen(false);
                }}
              >
                {dictionary.nav.languageToggle}: {dictionary.nav.locales[nextLocale]}
              </button>
              <Link
                href={toMainSite(prefixPathWithLocale(locale, '/login'))}
                onClick={() => setOpen(false)}
              >
                {dictionary.nav.login}
              </Link>
            </div>
            <button type="button" className="demo-nav-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
