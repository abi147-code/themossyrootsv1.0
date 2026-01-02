'use client';

import { Suspense, useEffect, useState } from 'react';
import { Background3D } from './Background3D';
import { Hero } from './Hero';
import { Philosophy } from './Philosophy';
import { Founder } from './Founder';
import { Software } from './Software';
import { Footer } from './Footer';
import './serene.css';

type SereneLandingClientProps = {
  fontClassName?: string;
};

export default function SereneLandingClient({ fontClassName = '' }: SereneLandingClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`serene-root relative min-h-screen selection:bg-emerald-500/20 selection:text-white bg-[#050807] ${fontClassName}`}
    >
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] backface-hidden"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        aria-hidden
      />

      {mounted ? (
        <Suspense fallback={<div className="fixed inset-0 bg-[#050807]" />}>
          <Background3D scroll={scrollProgress} />
        </Suspense>
      ) : (
        <div className="fixed inset-0 bg-[#050807]" aria-hidden />
      )}

      <main className="relative z-10">
        <Hero />
        <Philosophy />
        <Founder />
        <Software />
        <Footer />
      </main>
    </div>
  );
}
