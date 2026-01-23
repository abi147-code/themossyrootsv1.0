'use client';

import React from 'react';
import { Reveal } from './ui/Reveal';
import { motion, useScroll, useTransform } from 'framer-motion';

const Story: React.FC = () => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative py-40 min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
            <motion.div 
                className="w-full h-[120%] absolute -top-[10%]"
                style={{ y }}
            >
             <img 
                src="/demo-assets/jaleo/couple-hands.png" 
                alt="Spanish culinary texture" 
                className="w-full h-full object-cover grayscale-[30%] brightness-[0.3]"
             />
            </motion.div>
        </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center px-6">
        <Reveal>
          <div className="w-[1px] h-12 bg-jaleo-gold mb-8 shadow-[0_0_10px_rgba(191,161,95,0.5)]"></div>
        </Reveal>

        <Reveal delay={0.2} width="100%">
          <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight text-balance font-light drop-shadow-lg">
            Ici, l’huile d’olive coule comme une promesse. <br/>
            <span className="italic text-white/60 text-3xl md:text-4xl mt-4 block">Celle d’une générosité du Sud.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.4} width="100%">
          <p className="mt-12 font-sans font-light text-white/80 leading-loose text-sm md:text-base tracking-wide max-w-xl mx-auto drop-shadow-md">
            Chez Jaleo, nous ne servons pas simplement des tapas. Nous partageons l'héritage de nos grands-mères catalanes. 
            Une cuisine de famille, faite de temps, de patience et de produits choisis avec le cœur.
          </p>
        </Reveal>
        
      </div>
    </section>
  );
};

export default Story;
