import React from 'react';
import { CardStack } from './CardStack';

const ImpactPoint = ({ text }: { text: string }) => (
  <div className="flex items-start gap-4 group">
    <div className="mt-1.5 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
      <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-lg text-slate-300 font-light">{text}</span>
  </div>
);

export const BusinessImpactSection: React.FC = () => {
  // Placeholder images - easily replaceable by uploading new assets to public/
  // and changing these paths.
  const stackImages = [
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop', // Finance/Graph
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop', // Analytics
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1000&auto=format&fit=crop', // Money/Success
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop', // Dashboard
  ];

  return (
    <section className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-slate-900/50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Left Column: Animation */}
        <div className="relative order-2 md:order-1">
          {/* Background decoration for the stack */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

          <CardStack images={stackImages} interval={3500} />

          <div className="text-center mt-8 md:mt-12 opacity-60">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="relative order-1 md:order-2">
          <h2 className="text-amber-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4">The Business Impact</h2>

          <h3 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
            Most businesses treat invoices as admin. <br />
            <span className="text-slate-500">Successful businesses treat them as assets.</span>
          </h3>

          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            By switching to a conversion-focused invoice, you change the relationship from transactional to relational. Stop leaving money on the table with dead documents.
          </p>

          <div className="space-y-4 mb-10">
            <ImpactPoint text="Increase recurring revenue" />
            <ImpactPoint text="Reduce late payments" />
            <ImpactPoint text="Upsell existing clients effortlessly" />
            <ImpactPoint text="Professionalize your brand instantly" />
            <ImpactPoint text="Turn admin time into marketing time" />
          </div>

          {/* Blockquote */}
          <div className="relative border-l-4 border-purple-500/30 pl-6 py-2">
            <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-normal">
              &quot;Every invoice does more than request money ƒ?&quot; it builds momentum.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
