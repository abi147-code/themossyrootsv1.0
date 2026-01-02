'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Philosophy: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section id="about" className="py-32 md:py-48 px-6 flex justify-center items-center">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-[760px] text-center space-y-14"
      >
        <motion.p variants={item} className="text-2xl md:text-4xl font-serif leading-relaxed text-white font-light">
          Built for those who believe marketing should feel alive.
        </motion.p>

        <motion.p variants={item} className="text-lg md:text-xl leading-relaxed text-slate-400 font-light tracking-wide">
          The Mossy Roots helps brands stay rooted in their purpose while growing their reach with intention.
        </motion.p>

        <motion.p variants={item} className="text-lg md:text-xl leading-relaxed text-slate-400 font-light tracking-wide">
          We automate the heavy lifting so you can focus on storytelling, connection, and the kind of visibility that lasts.
        </motion.p>

        <motion.div variants={item} className="pt-16">
          <div className="w-16 h-[1px] bg-emerald-900 mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
};
