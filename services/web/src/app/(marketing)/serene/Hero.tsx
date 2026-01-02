'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SereneNav from '@/components/SereneNav';

export const Hero: React.FC = () => {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl relative z-10"
      >
        <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tight text-white mb-6 drop-shadow-sm relative">
          The Mossy Roots
        </h1>
        <p className="text-lg md:text-2xl font-serif italic text-emerald-100/70 tracking-wide mb-8 px-4">
          Where smart marketing takes root.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          className="inline-block px-6 py-2 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-emerald-400/70 shadow-inner"
        >
          Calm systems. Intentional growth.
        </motion.div>
      </motion.div>

      <SereneNav />
    </section>
  );
};
