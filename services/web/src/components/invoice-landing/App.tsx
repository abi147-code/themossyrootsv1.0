'use client';

import React, { useEffect } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
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
  useEffect(() => {
    document.body.classList.add('invoice-landing-page');
    return () => {
      document.body.classList.remove('invoice-landing-page');
    };
  }, []);

  return (
    <div className="invoice-landing-root min-h-screen w-full flex flex-col relative overflow-x-hidden bg-slate-900 selection:bg-yellow-500 selection:text-slate-900">
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
        <div className="min-h-[85vh] flex items-center justify-center py-12">
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
