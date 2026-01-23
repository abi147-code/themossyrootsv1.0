'use client';

import React from 'react';
import { Reveal } from './ui/Reveal';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-jaleo-black text-jaleo-stone pt-40 pb-20 px-6 overflow-hidden">
      {/* Subtle Background Image */}
      <div className="absolute inset-0 opacity-45 pointer-events-none">
         <img 
            src="/demo-assets/jaleo/outside seating area.png" 
            alt="Terrasse" 
            className="w-full h-full object-cover"
         />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32 items-end">
          
          {/* Brand & Info */}
          <div className="space-y-16">
            <Reveal>
              <h2 className="font-serif text-8xl md:text-[10rem] leading-[0.8] text-white tracking-tighter opacity-90">
                JALEO
              </h2>
            </Reveal>

            <Reveal delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans font-light tracking-wide text-sm text-white/60">
              <div className="space-y-2">
                <p className="uppercase tracking-widest text-xs text-jaleo-gold mb-4 opacity-100">Adresse</p>
                <p>33 Place Jean Macé</p>
                <p>44100 Nantes, France</p>
              </div>
              <div className="space-y-2">
                <p className="uppercase tracking-widest text-xs text-jaleo-gold mb-4 opacity-100">Contact</p>
                <p>09 88 49 04 95</p>
              </div>
              <div className="space-y-2">
                <p className="uppercase tracking-widest text-xs text-jaleo-gold mb-4 opacity-100">Horaires</p>
                <p>Mardi — Samedi</p>
                <p>18h30 — 01h00</p>
              </div>
            </Reveal>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-start lg:items-end">
             <Reveal delay={0.4}>
                <p className="font-serif text-4xl italic text-white/80 mb-12 max-w-md text-left lg:text-right">
                    “Une table. Un verre. <br/> L'instant présent.”
                </p>
             </Reveal>
             <Reveal delay={0.5}>
                <button className="group relative px-10 py-5 bg-jaleo-stone text-jaleo-black font-sans text-xs tracking-[0.25em] uppercase overflow-hidden">
                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">Réserver une table</span>
                    <div className="absolute inset-0 bg-jaleo-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
             </Reveal>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-white/10 mb-12"></div>

        <div className="flex flex-col md:flex-row justify-between items-center text-white/20 font-sans text-[10px] tracking-widest uppercase">
            <p>© {new Date().getFullYear()} Jaleo.</p>
            <p>
              Designed with{' '}
              <a 
                href="https://themossyroots.com/fr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-jaleo-gold transition-colors duration-300 border-b border-transparent hover:border-jaleo-gold/50"
              >
                The Mossy roots
              </a>
              .
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
