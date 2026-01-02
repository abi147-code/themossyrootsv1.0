'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white/[0.02] backdrop-blur-xl border-t border-white/5" />

      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-10 relative z-10">
        <div className="text-3xl font-serif text-[#E6EFEA] tracking-tight">
          The Mossy Roots
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-xs uppercase tracking-[0.3em] text-[#A7C4B5]/60">
          <a href="https://www.linkedin.com/in/abishek147ae/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6EFEA] transition-colors border-b border-transparent hover:border-emerald-500/30 pb-1">LinkedIn</a>
          <a href="https://unsplash.com/@abi147ae" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6EFEA] transition-colors border-b border-transparent hover:border-emerald-500/30 pb-1">Unsplash</a>
          <a href="https://github.com/abi147-code" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6EFEA] transition-colors border-b border-transparent hover:border-emerald-500/30 pb-1">Github</a>
          <a href="mailto:hello@themossyroots.com" className="hover:text-[#E6EFEA] transition-colors border-b border-transparent hover:border-emerald-500/30 pb-1">Contact</a>
        </div>

        <div className="w-12 h-[1px] bg-white/10" />

        <div className="text-[10px] uppercase tracking-[0.2em] text-[#A7C4B5]/20 font-light text-center">
          &copy; {new Date().getFullYear()} TMR Studio. Developed with intent.<br/>
          Building marketing systems that feel like nature.
        </div>
      </div>
    </footer>
  );
};
