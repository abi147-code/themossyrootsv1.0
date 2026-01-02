'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Software: React.FC = () => {
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
          <span className="text-xs uppercase tracking-[0.4em] text-emerald-500/60 font-medium">OUR SOFTWARE</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
            Smart tools. <span className="italic">Subtle impact.</span> Real connection.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            Your business runs on small moments — sending an invoice, following up, sharing an update.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            What if each of those moments worked a little harder for you?
          </p>
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            At TMR, we build software that turns everyday actions into growth engines, blending design, automation, and marketing insight.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="pt-12"
        >
          <a 
            href="/software" 
            className="group relative inline-flex items-center px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-emerald-50/90 font-serif text-xl md:text-2xl italic tracking-wide hover:bg-emerald-500/5 transition-all duration-700"
          >
            Explore Our Software
            <span className="absolute bottom-4 left-10 right-10 h-[1px] bg-emerald-400/30 transition-all duration-700 group-hover:bg-emerald-400/80 group-hover:left-4 group-hover:right-4" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};
