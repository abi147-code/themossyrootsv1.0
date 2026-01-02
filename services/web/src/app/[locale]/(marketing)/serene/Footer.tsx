'use client';

import React from 'react';
import { useDictionary } from '@/context/LocaleContext';

export const Footer: React.FC = () => {
  const dictionary = useDictionary();
  const socials = dictionary.footer.socials;
  const note = dictionary.footer.note.replace('{year}', `${new Date().getFullYear()}`);

  return (
    <footer className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white/[0.02] backdrop-blur-xl border-t border-white/5" />

      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-10 relative z-10">
        <div className="text-3xl font-serif text-[#E6EFEA] tracking-tight">
          {dictionary.footer.brand}
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-xs uppercase tracking-[0.3em] text-[#A7C4B5]/60">
          {socials.map((label) => (
            <a key={label} href="#" className="hover:text-[#E6EFEA] transition-colors border-b border-transparent hover:border-emerald-500/30 pb-1">
              {label}
            </a>
          ))}
        </div>

        <div className="w-12 h-[1px] bg-white/10" />

        <div className="text-[10px] uppercase tracking-[0.2em] text-[#A7C4B5]/20 font-light text-center">
          <span dangerouslySetInnerHTML={{ __html: note }} />
          <br />
          {dictionary.footer.subnote}
        </div>
      </div>
    </footer>
  );
};
