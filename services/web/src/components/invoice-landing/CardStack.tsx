import React, { useEffect, useState } from 'react';

interface CardStackProps {
  images: string[];
  interval?: number;
}

export const CardStack: React.FC<CardStackProps> = ({ images, interval = 4000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  // Helper to determine the visual position of a card relative to the active index
  const getCardStyle = (index: number) => {
    // Calculate distance from active index in a circular manner
    const total = images.length;
    // We only care about the first 3 cards: Active (0), Next (1), NextNext (2)
    // We need to handle the wrap-around logic

    let position = (index - activeIndex + total) % total;

    // Logic:
    // position 0 = Front
    // position 1 = Middle
    // position 2 = Back
    // position total-1 = The one that just left (transitioning out)

    const isExiting = position === total - 1;

    // Base styles
    const baseTransition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    if (position === 0) {
      // Active Card (Front)
      return {
        zIndex: 30,
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        filter: 'blur(0px)',
        transition: baseTransition,
      };
    } else if (position === 1) {
      // Second Card (Middle)
      return {
        zIndex: 20,
        opacity: 0.7,
        transform: 'translateY(15px) scale(0.95)',
        filter: 'brightness(0.6)',
        transition: baseTransition,
      };
    } else if (position === 2) {
      // Third Card (Back)
      return {
        zIndex: 10,
        opacity: 0.4,
        transform: 'translateY(30px) scale(0.9)',
        filter: 'brightness(0.4)',
        transition: baseTransition,
      };
    } else if (isExiting) {
      // Exiting Card (Moves up and vanishes)
      return {
        zIndex: 40, // Briefly on top while leaving
        opacity: 0,
        transform: 'translateY(-100px) scale(1.05) rotate(-5deg)',
        filter: 'blur(4px)',
        transition: 'all 0.6s ease-in',
      };
    } else {
      // Hidden cards in the stack waiting to appear at position 2
      return {
        zIndex: 0,
        opacity: 0,
        transform: 'translateY(45px) scale(0.85)',
        transition: 'none', // No transition when resetting to bottom
      };
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] md:aspect-square max-w-md mx-auto perspective-1000">
      {/* Container for the cards */}
      <div className="relative w-full h-full">
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800"
            style={getCardStyle(i)}
          >
            <img src={src} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />

            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
        ))}
      </div>

      {/* Decorative shadow at the bottom of the stack */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/50 blur-xl rounded-full z-[-1]"></div>
    </div>
  );
};
