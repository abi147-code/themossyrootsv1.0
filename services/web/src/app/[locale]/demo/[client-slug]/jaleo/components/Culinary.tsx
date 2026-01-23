'use client';

import React from 'react';
import { Reveal } from './ui/Reveal';
import { motion } from 'framer-motion';

const Culinary: React.FC = () => {
  const columns = [
    ['/demo-assets/jaleo/gallery-table.png', '/demo-assets/jaleo/menu-dessert.png'],
    ['/demo-assets/jaleo/bar.png', '/demo-assets/jaleo/couple-hands.png'],
    ['/demo-assets/jaleo/dish-food2.png', '/demo-assets/jaleo/dish-tart.png'],
    ['/demo-assets/jaleo/gallery-wallpaper.png', '/demo-assets/jaleo/outside seating area.png'],
  ];

  return (
    <section className="py-40 bg-jaleo-stone px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal className="mb-16 text-center">
          <span className="text-jaleo-black/40 font-serif italic text-xl">L'Expérience</span>
          <h2 className="font-serif text-6xl text-jaleo-black mt-4 font-light">La Table</h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {columns.map((stack, stackIndex) => (
            <motion.div
              key={stackIndex}
              className="flex flex-col gap-4"
              animate={{ y: stackIndex % 2 === 0 ? ['0%', '-10%', '0%'] : ['0%', '10%', '0%'] }}
              transition={{ duration: 22 + stackIndex * 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {stack.map((src, idx) => (
                <motion.div
                  key={src + idx}
                  className="overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                  initial={false}
                  animate={{ opacity: 1 }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Culinary;
