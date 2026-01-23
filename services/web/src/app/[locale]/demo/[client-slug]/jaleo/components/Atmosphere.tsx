'use client';

import React from 'react';
import { Reveal, StaggerText, Parallax } from './ui/Reveal';

const Atmosphere: React.FC = () => {
  return (
    <section className="relative py-32 md:py-48 bg-jaleo-stone px-6 md:px-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32 items-center">
        
        {/* Text Side - Minimalist Luxury */}
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <Reveal>
             <span className="block text-jaleo-gold font-sans text-[10px] tracking-[0.3em] uppercase mb-6">L'Atmosphere</span>
          </Reveal>
          
          <StaggerText 
            text="Bois, lumière, silence feutré." 
            className="font-serif text-5xl md:text-7xl text-jaleo-black leading-[1.1] mb-8 font-light"
          />
          
          <Reveal delay={0.5} type="fade">
            <p className="font-sans font-light text-sm md:text-base text-jaleo-black/60 leading-loose max-w-md tracking-wide text-justify">
              Un lieu pour prendre le temps. Loin du tumulte, chaque détail a été pensé pour suspendre le cours des heures. Une ode à la lenteur et à l'élégance brute.
            </p>
          </Reveal>

          <Reveal delay={0.8} className="mt-12">
            <div className="w-16 h-[1px] bg-jaleo-black"></div>
          </Reveal>
        </div>

        {/* Image Side - Architectural */}
        <div className="order-1 md:order-2 relative group">
          <Parallax offset={40}>
            <Reveal type="blur" duration={1.5}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src="/demo-assets/jaleo/bar.png" 
                  alt="Interior warmth" 
                  className="object-cover w-full h-full grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3000ms] ease-out"
                />
              </div>
            </Reveal>
          </Parallax>
          
          {/* Decorative Offset Border */}
          <div className="absolute top-8 right-8 w-full h-full border border-jaleo-black/10 -z-10 hidden md:block" />
        </div>
      </div>
    </section>
  );
};

export default Atmosphere;
