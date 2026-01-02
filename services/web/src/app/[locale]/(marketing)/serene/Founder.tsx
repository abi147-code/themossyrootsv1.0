'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useDictionary, useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale } from '@/lib/locale-shared';

export const Founder: React.FC = () => {
  const {
    home: { founder },
  } = useDictionary();
  const locale = useLocale();

  return (
    <section id="portfolio" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="space-y-8 lg:bg-white/[0.02] lg:backdrop-blur-sm lg:p-12 lg:rounded-3xl lg:border lg:border-white/5 lg:shadow-2xl"
        >
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-medium opacity-70">{founder.kicker}</h2>
            <p className="text-3xl md:text-4xl font-serif text-white leading-snug">
              {founder.title}
            </p>
          </div>

          {founder.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-slate-400 text-lg leading-relaxed font-light">
              {paragraph}
            </p>
          ))}

          <div className="pt-6">
            <a 
              href={prefixPathWithLocale(locale, '/portfolio')} 
              className="inline-block px-12 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-emerald-50/90 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 tracking-[0.2em] text-xs font-light uppercase shadow-xl"
            >
              {founder.cta}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative aspect-[4/5] bg-neutral-900 overflow-hidden rounded-3xl border border-white/5"
        >
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <Image
              src="/pictures/st michel.JPG"
              alt="Atmospheric forest growth"
              fill
              className="object-cover grayscale"
              priority={false}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f0d] via-transparent to-emerald-950/20" />
          <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 mb-1">{founder.tile.label}</div>
            <div className="text-sm font-serif italic text-white/90">{founder.tile.body}</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0f0d] to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};
