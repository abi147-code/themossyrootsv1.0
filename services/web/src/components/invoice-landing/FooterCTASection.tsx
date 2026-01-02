import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { prefixPathWithLocale } from '@/lib/locale-shared';

type FooterCtaCopy = Dictionary['invoice']['footerCta'];

export const FooterCTASection: React.FC<{ copy: FooterCtaCopy; locale: Locale }> = ({ copy, locale }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full min-h-[70vh] flex flex-col items-center justify-center py-24 px-6 overflow-hidden perspective-container">
      {/* Background Gradients connecting from previous section */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-purple-900/20 pointer-events-none" />

      {/* 3D Grid Floor Effect */}
      <div
        className="absolute bottom-0 left-[-50%] right-[-50%] h-[100vh] opacity-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(transparent 0%, rgba(139, 92, 246, 0.3) 100%), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(100px) translateZ(-100px)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, black, transparent)',
        }}
      >
        {/* Animated movement for grid */}
        <div className="absolute inset-0 animate-[grid-move_20s_linear_infinite]" style={{ backgroundImage: 'inherit', backgroundSize: 'inherit' }} />
      </div>

      {/* Floating Abstract Shapes */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] animate-pulse"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: '1s', transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Animated Headline */}
        <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
          {copy.headingLine1} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 font-italic">{copy.headingHighlight}</span>
        </h2>

        <p className="text-xl md:text-2xl text-slate-300 font-light mb-12 max-w-2xl mx-auto opacity-80">
          {copy.bodyLine1} <br />
          <span className="text-white font-medium">{copy.bodyHighlight}</span>
        </p>

        {/* Massive CTA */}
        <div className="group relative inline-block cursor-pointer">
          {/* Glow behind button */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-200 animate-pulse"></div>

          <button
            className="relative px-12 py-5 bg-slate-900 rounded-lg leading-none flex items-center gap-4 transition-transform duration-200 transform group-hover:-translate-y-1 group-hover:scale-105 border border-purple-500/50"
            onClick={() => router.push(prefixPathWithLocale(locale, '/login'))}
          >
            <span className="flex flex-col items-start text-left">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">{copy.ctaBadge}</span>
              <span className="text-2xl font-bold text-white tracking-tight">{copy.ctaTitle}</span>
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-500 font-medium tracking-wide">{copy.subnote}</p>
      </div>
    </section>
  );
};
