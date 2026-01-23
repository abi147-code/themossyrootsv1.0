'use client';

import React, { useEffect, useState } from 'react';
import { MenuItem, MenuSectionProps } from '../types';
import { Reveal } from './ui/Reveal';
import { AnimatePresence, motion } from 'framer-motion';

const MenuSection: React.FC<MenuSectionProps> = ({ title, subtitle, items, layout = 'list' }) => {
  return (
    <div className="mb-24 last:mb-0">
      <Reveal className="w-full flex flex-col items-center lg:items-start mb-12">
        <h3 className="font-serif text-4xl text-jaleo-black italic relative px-8 inline-block">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-jaleo-gold"></span>
          {title}
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-jaleo-gold"></span>
        </h3>
        {subtitle && (
          <p className="mt-4 font-sans text-xs tracking-wider text-jaleo-black/50 uppercase text-center lg:text-left max-w-md">
            {subtitle}
          </p>
        )}
      </Reveal>

      {/* LIST LAYOUT (Standard) */}
      {layout === 'list' && (
        <div className="flex flex-col gap-10 max-w-2xl mx-auto lg:mx-0">
          {items.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.1} width="100%">
              <motion.div 
                className="group flex flex-col items-center lg:items-start text-center lg:text-left cursor-default"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="mb-2 w-full flex flex-col lg:flex-row lg:justify-between lg:items-baseline border-b border-jaleo-black/5 pb-2 border-dashed group-hover:border-jaleo-gold/30 transition-colors">
                  <span className="font-serif text-2xl text-jaleo-black group-hover:text-jaleo-gold transition-colors duration-500 block mb-1">
                    {item.name}
                  </span>
                  <span className="font-sans text-xs tracking-widest text-jaleo-black/40 whitespace-nowrap lg:ml-4">{item.price}</span>
                </div>
                {item.description && (
                  <p className="font-sans font-light text-sm text-jaleo-black/60 leading-relaxed max-w-md pt-2">
                    {item.description}
                  </p>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}

      {/* GRID LAYOUT (Two Columns) */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {items.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.05} width="100%">
              <motion.div 
                className="group flex flex-col items-center lg:items-start text-center lg:text-left h-full cursor-default"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="mb-1 w-full flex justify-between items-baseline border-b border-jaleo-black/5 pb-1 border-dashed group-hover:border-jaleo-gold/30 transition-colors">
                  <span className="font-serif text-xl text-jaleo-black group-hover:text-jaleo-gold transition-colors duration-500">
                    {item.name}
                  </span>
                  <span className="font-sans text-xs tracking-widest text-jaleo-black/40 ml-2">{item.price}</span>
                </div>
                {item.description && (
                  <p className="font-sans font-light text-xs text-jaleo-black/60 leading-relaxed pt-1">
                    {item.description}
                  </p>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}

      {/* CARDS LAYOUT (Boxed) */}
      {layout === 'cards' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <Reveal key={idx} delay={idx * 0.1} width="100%" className="h-full">
              <motion.div 
                className="group h-full flex flex-col items-center justify-center text-center p-6 border border-jaleo-black/5 hover:border-jaleo-gold/30 hover:bg-white transition-all duration-500 bg-jaleo-stone/30 cursor-default"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="font-serif text-lg text-jaleo-black group-hover:text-jaleo-gold transition-colors duration-500 mb-2">
                  {item.name}
                </span>
                <span className="font-sans text-xs tracking-widest text-jaleo-black/40">{item.price}</span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};

const Menu: React.FC = () => {
  const tapas: MenuItem[] = [
    { name: "Olives Picantonas", price: "4 €" },
    { name: "Dés de fromage", description: "Marinés à l’huile d’olive, thym et ail", price: "4.5 €" },
    { name: "Le Fuet", description: "Maison Riera Ordeix de Vic (50 g)", price: "5 €" },
    { name: "La Gilda", description: "Brochette d’anchois, boquerones et olives vertes", price: "4 €" },
    { name: "Planche de charcuterie ibérique et fromages espagnols", price: "24 €" },
    { name: "Planche de Jambon Bellota", price: "22 €" },
    { name: "Pan de coca con Tomate", description: "Con tomate", price: "4 €" },
    { name: "Tortilla", description: "Pomme de terre et oignons confits", price: "7 €" },
    { name: "Las Bravas du Jaleo", description: "Pommes de terre croustillantes, sauce brava, mayo à l’ail fumé, grillons de porc", price: "8 €" },
    { name: "Houmous", description: "De pois chiches", price: "7 €" },
    { name: "Les Bikinis du Jaleo", description: "Mozzarella, tartufata et jambon blanc / Sobrassada, fromage et miel", price: "12 €" },
    { name: "Le Chistopan", description: "Pain brioché, chistorra et oignons confits", price: "4.5 €" },
    { name: "Las Croquetas", description: "Jambon ibérique", price: "2.5 €" },
    { name: "Pimientos del Padrón", description: "Frits", price: "6 €" },
    { name: "Poulpe", description: "À la sobrassada", price: "11 €" },
  ];

  const conserves: MenuItem[] = [
    { name: "Sardines au citron", price: "6.5 €" },
    { name: "Sardines piquantes", price: "6.5 €" },
    { name: "Moules en escabèche", price: "7 €" },
    { name: "Coques de Galice", price: "12.5 €" },
    { name: "Ventrèche de thon", price: "13 €" },
  ];

  const paellas: MenuItem[] = [
    { name: "Paella de Marisco", price: "24 € / pers" },
    { name: "Paella Ibérica", price: "24 € / pers" },
    { name: "Paella Negra", price: "22 € / pers" },
  ];

  const douceurs: MenuItem[] = [
    { name: "Crème catalane", price: "8 €" },
    { name: "Churros", description: "Et ganache au chocolat", price: "8 €" },
    { name: "Flan à la vanille", description: "Sauce caramel & crème montée", price: "8 €" },
    { name: "Tarta de queso", description: "Au citron", price: "8 €" },
    { name: "Dessert du moment", price: "8 €" },
  ];

  return (
    <section className="py-40 bg-jaleo-stone px-6 md:px-24 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* Menu Content */}
        <div className="lg:col-span-7">
            <MenuSection 
                title="Les Tapas du Jaleo" 
                items={tapas} 
                layout="grid" 
            />
            
            <MenuSection 
                title="Les Conserves – EL TATO" 
                items={conserves} 
                layout="cards" 
            />
            
            <MenuSection 
                title="Les Paellas" 
                subtitle="Temps de préparation minimum : 25 minutes. Peut varier selon la demande."
                items={paellas} 
                layout="list"
            />
            
            <MenuSection 
                title="Les Douceurs Sucrées" 
                items={douceurs} 
                layout="list" 
            />
            
            <Reveal className="mt-20 text-center lg:text-left w-full">
                <p className="font-sans text-[10px] tracking-[0.3em] text-jaleo-black/30 uppercase border border-jaleo-black/10 inline-block px-6 py-3 rounded-full hover:bg-jaleo-black hover:text-white transition-all cursor-default">
                    Carte de Saison
                </p>
            </Reveal>
        </div>

        {/* Decorative Side Image - Sticky on Desktop */}
        <MenuGallery />
      </div>
    </section>
  );
};

const MenuGallery: React.FC = () => {
  const images = [
    '/demo-assets/jaleo/steak.png',
    '/demo-assets/jaleo/long crepe port.png',
    '/demo-assets/jaleo/meat por.png',
    '/demo-assets/jaleo/dish-chilli.png',
    '/demo-assets/jaleo/dish-food2.png',
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="hidden lg:block lg:col-span-5 relative h-full">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="Séléction tapas"
          className="sticky top-32 w-full h-[70vh] object-cover rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
          initial={{ opacity: 0, filter: 'blur(10px) scale(1.04)' }}
          animate={{ opacity: 1, filter: 'blur(0px) scale(1)' }}
          exit={{ opacity: 0, filter: 'blur(10px) scale(0.98)' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
};

export default Menu;
