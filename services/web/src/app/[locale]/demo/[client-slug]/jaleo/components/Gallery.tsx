'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Gallery: React.FC = () => {
  const images = [
    "/demo-assets/jaleo/gallery-outside.png",
    "/demo-assets/jaleo/gallery-wallpaper.png",
    "/demo-assets/jaleo/gallery-table.png",
  ];

  return (
    <section className="py-0 bg-jaleo-black">
      <div className="flex flex-col md:flex-row h-[100vh] md:h-[60vh] w-full">
        {images.map((src, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="relative flex-1 h-full overflow-hidden group border-b md:border-b-0 md:border-r border-white/10 last:border-none"
          >
            <motion.div 
                className="w-full h-full bg-cover bg-center transition-transform duration-[3000ms] ease-out group-hover:scale-105 grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0"
                style={{ backgroundImage: `url(${src})` }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
