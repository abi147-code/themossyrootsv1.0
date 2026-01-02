import React from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { CardStack } from './CardStack';

type BusinessImpactCopy = Dictionary['invoice']['businessImpact'];

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

export const BusinessImpactSection: React.FC<{ copy: BusinessImpactCopy }> = ({ copy }) => {
  return (
    <section className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-slate-900/50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Left Column: Animation */}
        <div className="relative order-2 md:order-1">
          <CardStack images={copy.stackImages} interval={3500} />

          <div className="text-center mt-8 md:mt-12 opacity-60">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">{copy.livePreviewLabel}</p>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="relative order-1 md:order-2">
          <h2 className="text-amber-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4">{copy.kicker}</h2>

          <h3 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
            {copy.titleLead} <br />
            <span className="text-slate-500">{copy.titleMuted}</span>
          </h3>

          <p className="text-slate-400 text-lg leading-relaxed mb-10">{copy.body}</p>

          <div className="space-y-4 mb-10">
            {copy.points.map((point) => (
              <ImpactPoint key={point} text={point} />
            ))}
          </div>

          {/* Blockquote */}
          <div className="relative border-l-4 border-purple-500/30 pl-6 py-2">
            <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-normal">{copy.quote}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
