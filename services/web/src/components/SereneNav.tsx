'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale, swapLocaleInPath } from '@/lib/locale-shared';
import './serene-nav.css';

export default function SereneNav() {
  const dictionary = useDictionary();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const nextLocale = locale === 'en' ? 'fr' : 'en';
  const pathWithSearch = (targetPath: string) => {
    const query = searchParams.toString();
    return query ? `${targetPath}?${query}` : targetPath;
  };

  const handleToggleLocale = () => {
    const target = swapLocaleInPath(pathname, nextLocale);
    router.push(pathWithSearch(target));
  };

  const navLinks = [
    { label: dictionary.nav.about, href: prefixPathWithLocale(locale, '/about') },
    { label: dictionary.nav.portfolio, href: prefixPathWithLocale(locale, '/portfolio') },
    { label: dictionary.nav.software, href: prefixPathWithLocale(locale, '/software') },
  ];

  return (
    <div className="serene-nav-wrapper">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto will-change-transform"
        >
          <div
            className="serene-nav-glass px-6 md:px-10 py-4 md:py-5 rounded-full
                     flex items-center space-x-4 md:space-x-8 whitespace-nowrap
                     max-w-[92vw] md:max-w-none backface-hidden"
          >
            <div className="serene-nav-glass-bg" aria-hidden />
            <Link href={prefixPathWithLocale(locale, '/')} className="group flex items-center shrink-0">
              <span className="text-[11px] md:text-[13px] font-serif italic text-[#E6EFEA] hover:text-emerald-200 transition-colors tracking-wide drop-shadow-md">
                {dictionary.nav.brand}
              </span>
            </Link>

            <div className="w-[1px] h-4 bg-white/20" />

            <div className="flex items-center space-x-6 md:space-x-8">
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

            <div className="w-[1px] h-4 bg-white/20" />

            <button
              type="button"
              onClick={handleToggleLocale}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] px-4 py-2 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-95 drop-shadow-sm"
            >
              {dictionary.nav.languageToggle}: {dictionary.nav.locales[nextLocale]}
            </button>

            <div className="w-[1px] h-4 bg-white/20" />

            <Link
              href={prefixPathWithLocale(locale, '/login')}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] px-5 py-2 rounded-full bg-white/[0.1] border border-white/20 hover:bg-white/[0.2] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-95 drop-shadow-sm"
            >
              {dictionary.nav.login}
            </Link>
          </div>
        </motion.nav>
    </div>
  );
}
