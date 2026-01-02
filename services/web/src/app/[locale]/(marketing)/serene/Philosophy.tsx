'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDictionary } from '@/context/LocaleContext';

export const Philosophy: React.FC = () => {
  const {
    home: { philosophy },
  } = useDictionary();

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
          {philosophy.headline}
        </motion.p>

        {philosophy.paragraphs.map((paragraph) => (
          <motion.p key={paragraph} variants={item} className="text-lg md:text-xl leading-relaxed text-slate-400 font-light tracking-wide">
            {paragraph}
          </motion.p>
        ))}

        <motion.div variants={item} className="pt-16">
          <div className="w-16 h-[1px] bg-emerald-900 mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
};
