'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroInvoiceBreak } from './HeroInvoiceBreak';
import { ComparisonSection } from './ComparisonSection';
import { FeaturesSection } from './FeaturesSection';
import { BusinessImpactSection } from './BusinessImpactSection';
import { WhoThisIsForSection } from './WhoThisIsForSection';
import { TrustSection } from './TrustSection';
import { FooterCTASection } from './FooterCTASection';
import { InteractiveBackground } from './InteractiveBackground';

const App: React.FC = () => {
  const router = useRouter();

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

      {/* Navigation */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Premium Brand Text Only */}
        <div className="flex flex-col justify-center cursor-pointer select-none group">
          <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none drop-shadow-md">TMR</span>
          <span className="text-[0.6rem] font-bold text-amber-500 uppercase tracking-[0.25em] leading-tight mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            Smart Invoice Generator
          </span>
        </div>

        {/* CTA Button */}
        <button
          className="hidden md:block px-6 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-white/10 backdrop-blur-md shadow-lg hover:shadow-purple-500/20 hover:border-white/20"
          onClick={() => router.push('/login')}
        >
          Sign In
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        {/* Hero Section */}
        <div className="min-h-[85vh] flex items-center justify-center py-12">
          <HeroInvoiceBreak />
        </div>

        {/* Comparison Section */}
        <ComparisonSection />

        {/* Features Scroll Section */}
        <FeaturesSection />

        {/* Business Impact Section */}
        <BusinessImpactSection />

        {/* Who This Is For Section */}
        <WhoThisIsForSection />

        {/* Trust & Privacy Section */}
        <TrustSection />

        {/* Final CTA Section */}
        <FooterCTASection />
      </main>

      {/* Footer - Minimal */}
      <div className="relative z-10 w-full py-6 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-[0.6rem] uppercase tracking-widest">Ac 2025 TMR Smart Invoice Generator</p>
        </div>
      </div>
    </div>
  );
};

export default App;
