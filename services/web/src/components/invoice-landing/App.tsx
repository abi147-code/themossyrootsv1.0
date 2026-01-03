'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale, swapLocaleInPath } from '@/lib/locale-shared';
import { HeroInvoiceBreak } from './HeroInvoiceBreak';
import { FeaturesSection } from './FeaturesSection';
import { BusinessImpactSection } from './BusinessImpactSection';
import { InvoiceEvolutionSection } from './InvoiceEvolutionSection';
import { WhoThisIsForSection } from './WhoThisIsForSection';
import { TrustSection } from './TrustSection';
import { FooterCTASection } from './FooterCTASection';
import { InteractiveBackground } from './InteractiveBackground';

type InvoiceLandingAppProps = {
  copy: Dictionary['invoice'];
  locale: Locale;
};

const App: React.FC<InvoiceLandingAppProps> = ({ copy, locale }) => {
  const dictionary = useDictionary();
  const activeLocale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const nextLocale = activeLocale === 'en' ? 'fr' : 'en';
  const pathWithSearch = (targetPath: string) => {
    const query = searchParams.toString();
    return query ? `${targetPath}?${query}` : targetPath;
  };

  const handleToggleLocale = () => {
    const target = swapLocaleInPath(pathname, nextLocale);
    router.push(pathWithSearch(target));
  };

  useEffect(() => {
    document.body.classList.add('invoice-landing-page');
    return () => {
      document.body.classList.remove('invoice-landing-page');
    };
  }, []);

  return (
    <div className="invoice-landing-root min-h-screen w-full flex flex-col relative overflow-x-hidden bg-slate-900 selection:bg-yellow-500 selection:text-slate-900">
      {/* Floating Controls (independent, no shared header) */}
      <div className="invoice-menu-wrapper">
        <button
          type="button"
          className="invoice-menu-button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          Menu
          <svg className={`menu-chev ${menuOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {menuOpen && (
          <div className="invoice-menu-dropdown">
            <Link href={prefixPathWithLocale(activeLocale, '/')} onClick={() => setMenuOpen(false)}>The Mossy Roots</Link>
            <Link href={prefixPathWithLocale(activeLocale, '/about')} onClick={() => setMenuOpen(false)}>{dictionary.nav.about}</Link>
            <Link href={prefixPathWithLocale(activeLocale, '/portfolio')} onClick={() => setMenuOpen(false)}>{dictionary.nav.portfolio}</Link>
            <Link href={prefixPathWithLocale(activeLocale, '/software')} onClick={() => setMenuOpen(false)}>{dictionary.nav.software}</Link>
          </div>
        )}
      </div>

      <button
        type="button"
        className="invoice-lang-button"
        onClick={handleToggleLocale}
        aria-label={dictionary.nav.languageToggle}
        title={dictionary.nav.languageToggle}
      >
        <svg className="invoice-lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9" />
        </svg>
        <span className="invoice-lang-code">{nextLocale.toUpperCase()}</span>
      </button>

      <Link
        href={prefixPathWithLocale(activeLocale, '/login')}
        className="invoice-login-button"
      >
        {dictionary.nav.login}
      </Link>

      {/* Decorative background gradients - Fixed to background to cover scroll */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Interactive 3D Background - Sits between gradients and content */}
      <InteractiveBackground />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        {/* Hero Section */}
        <div className="min-h-[85vh] flex items-center justify-center py-12 pt-28 md:pt-40">
          <HeroInvoiceBreak copy={copy.hero} locale={locale} />
        </div>

        {/* Invoice Evolution Section */}
        <InvoiceEvolutionSection copy={copy.evolution} />

        {/* Features Scroll Section */}
        <FeaturesSection copy={copy.features} />

        {/* Business Impact Section */}
        <BusinessImpactSection copy={copy.businessImpact} />

        {/* Who This Is For Section */}
        <WhoThisIsForSection copy={copy.audience} />

        {/* Trust & Privacy Section */}
        <TrustSection copy={copy.trust} />

        {/* Final CTA Section */}
        <FooterCTASection copy={copy.footerCta} locale={locale} />
      </main>

      {/* Footer - Minimal */}
      <div className="relative z-10 w-full py-6 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-[0.6rem] uppercase tracking-widest">{copy.footerNote}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
