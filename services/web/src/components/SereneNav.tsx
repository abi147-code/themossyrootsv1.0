'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale, swapLocaleInPath, stripLocaleFromPathname } from '@/lib/locale-shared';
import './serene-nav.css';

export default function SereneNav() {
  const dictionary = useDictionary();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const nextLocale = locale === 'en' ? 'fr' : 'en';
  const pathWithSearch = (targetPath: string) => {
    const query = searchParams.toString();
    return query ? `${targetPath}?${query}` : targetPath;
  };

  const { pathname: strippedPath } = stripLocaleFromPathname(pathname);
  const isDemoLanding = strippedPath === '/demo';

  useEffect(() => {
    if (!isDemoLanding) {
      setDemoMenuOpen(false);
    }
  }, [isDemoLanding]);

  const handleToggleLocale = () => {
    const target = swapLocaleInPath(pathname, nextLocale);
    router.push(pathWithSearch(target));
  };

  const navLinks = [
    { label: dictionary.nav.about, href: prefixPathWithLocale(locale, '/about') },
    { label: dictionary.nav.portfolio, href: prefixPathWithLocale(locale, '/portfolio') },
    { label: dictionary.nav.software, href: prefixPathWithLocale(locale, '/software') },
    { label: dictionary.nav.demo, href: prefixPathWithLocale(locale, '/demo') },
  ];

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  useEffect(() => {
    closeMobile();
  }, [pathname]);

  const navHiddenDesktop = isDemoLanding;

  if (isDemoLanding) {
    return (
      <div className="serene-nav-wrapper">
        <div className="demo-nav-floating">
          <button
            type="button"
            className="demo-nav-toggle"
            aria-expanded={demoMenuOpen}
            onClick={() => setDemoMenuOpen((prev) => !prev)}
          >
            Menu
            <span className={`demo-nav-chevron ${demoMenuOpen ? 'open' : ''}`} aria-hidden />
          </button>
          {demoMenuOpen && (
            <div className="demo-nav-dropdown">
              <div className="demo-nav-links">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setDemoMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="demo-nav-actions">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleLocale();
                    setDemoMenuOpen(false);
                  }}
                >
                  {dictionary.nav.languageToggle}: {dictionary.nav.locales[nextLocale]}
                </button>
                <Link
                  href={prefixPathWithLocale(locale, '/login')}
                  onClick={() => setDemoMenuOpen(false)}
                >
                  {dictionary.nav.login}
                </Link>
              </div>
              <button
                type="button"
                className="demo-nav-close"
                onClick={() => setDemoMenuOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="serene-nav-wrapper">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="serene-nav pointer-events-auto will-change-transform"
      >
        <div className="serene-nav-glass nav-shell px-5 md:px-10 py-3.5 md:py-5 rounded-full flex items-center w-full md:w-auto whitespace-nowrap max-w-[94vw] md:max-w-none">
          <div className="serene-nav-glass-bg" aria-hidden />
          <div className="nav-shell-inner w-full">
            <Link href={prefixPathWithLocale(locale, '/')} className="group flex items-center shrink-0">
              <span className="text-[11px] md:text-[13px] font-serif italic text-[#E6EFEA] hover:text-emerald-200 transition-colors tracking-wide drop-shadow-md">
                {dictionary.nav.brand}
              </span>
            </Link>

            <div className="hidden h-4 w-px bg-white/20 md:block" />

            <div className="hidden items-center space-x-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] hover:text-emerald-200 transition-all hover:scale-105 font-medium drop-shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden h-4 w-px bg-white/20 md:block" />

            <div className="hidden md:inline-flex">
              <button
                type="button"
                onClick={handleToggleLocale}
                className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] px-4 py-2 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-95 drop-shadow-sm"
              >
                {dictionary.nav.languageToggle}: {dictionary.nav.locales[nextLocale]}
              </button>
            </div>

            <div className="hidden h-4 w-px bg-white/20 md:block" />

            <Link
              href={prefixPathWithLocale(locale, '/login')}
              className="hidden text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] px-5 py-2 rounded-full bg-white/[0.1] border border-white/20 hover:bg-white/[0.2] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-95 drop-shadow-sm md:inline-flex"
            >
              {dictionary.nav.login}
            </Link>

            <button
              type="button"
              onClick={toggleMobile}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur md:hidden"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={`serene-nav-mobile ${mobileOpen ? 'open' : ''} md:hidden`}>
          <div className="serene-nav-mobile-card">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="serene-nav-mobile-link"
              >
                {link.label}
              </Link>
            ))}
            <div className="serene-nav-mobile-divider" aria-hidden />
            <button
              type="button"
              onClick={() => {
                handleToggleLocale();
                closeMobile();
              }}
              className="serene-nav-mobile-link flex items-center justify-between"
            >
              <span>{dictionary.nav.languageToggle}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-emerald-100">
                {dictionary.nav.locales[nextLocale]}
              </span>
            </button>
            <Link
              href={prefixPathWithLocale(locale, '/login')}
              onClick={closeMobile}
              className="serene-nav-mobile-primary"
            >
              {dictionary.nav.login}
            </Link>
            <Link
              href={prefixPathWithLocale(locale, '/software')}
              onClick={closeMobile}
              className="serene-nav-mobile-secondary"
            >
              {dictionary.nav.software}
            </Link>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
