'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';

const Hero: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const backgrounds = useMemo(
    () => [
      '/demo-assets/jaleo/dish-food2.png',
      '/demo-assets/jaleo/dish-tart.png',
      '/demo-assets/jaleo/hero-lobby.png',
    ],
    []
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((prev) => (prev + 1) % backgrounds.length), 5000);
    return () => clearInterval(id);
  }, [backgrounds.length]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background with slow crossfade */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={backgrounds[index]}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1, filter: 'blur(6px)' }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          >
            <div
              className="w-full h-full bg-cover bg-center grayscale-[30%] contrast-[1.1]"
              style={{ backgroundImage: `url("${backgrounds[index]}")` }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Luxury Overlay System */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 md:pt-20"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-jaleo-gold font-sans text-xs md:text-sm tracking-[0.4em] uppercase mb-6"
        >
          Gastrobar • Nantes
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="font-serif text-7xl md:text-9xl text-white tracking-widest mb-8 drop-shadow-2xl font-light"
          >
            JALEO
          </motion.h1>

        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 60 }}
          transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
          className="w-[1px] bg-jaleo-gold mb-8 opacity-70"
        />

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="font-serif italic text-2xl md:text-4xl text-white/90 font-extralight tracking-wide max-w-xl leading-relaxed"
        >
          “La Catalogne qui chante <br/> dans l’assiette”
        </motion.p>

        {/* Minimalist Scroll Cue */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 2.8 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <motion.div 
             animate={{ height: [0, 80, 0], y: [0, 20, 40], opacity: [0, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="w-[1px] bg-gradient-to-b from-white/0 via-jaleo-gold to-white/0" 
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
