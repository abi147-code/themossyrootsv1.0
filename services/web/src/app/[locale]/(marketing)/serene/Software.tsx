'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale } from '@/lib/locale-shared';

export const Software: React.FC = () => {
  const {
    home: { software },
  } = useDictionary();
  const locale = useLocale();

  return (
    <section id="software" className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle closest-side, rgba(6, 78, 59, 0.3) 0%, transparent 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center space-y-12 bg-white/[0.03] backdrop-blur-md backdrop-saturate-150 p-12 md:p-24 rounded-[3rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-emerald-500/60 font-medium">{software.kicker}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
            {software.titleLead} <span className="italic">{software.titleEmphasis}</span> {software.titleTrail}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          {software.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-slate-300 text-lg leading-relaxed font-light">
              {paragraph}
            </p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="pt-12"
        >
          <a 
            href={prefixPathWithLocale(locale, '/software')} 
            className="group relative inline-flex items-center px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-emerald-50/90 font-serif text-xl md:text-2xl italic tracking-wide hover:bg-emerald-500/5 transition-all duration-700"
          >
            {software.cta}
            <span className="absolute bottom-4 left-10 right-10 h-[1px] bg-emerald-400/30 transition-all duration-700 group-hover:bg-emerald-400/80 group-hover:left-4 group-hover:right-4" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};
