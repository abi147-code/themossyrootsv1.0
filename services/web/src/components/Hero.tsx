'use client';

import Link from 'next/link';
import DotGrid from './DotGrid';
import VisibilityMount from './VisibilityMount';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f6f9fc] to-[#eef3fb]">
      <div className="absolute inset-0">
        <VisibilityMount
          className="pointer-events-none absolute inset-0"
          rootMargin="0px 0px -20% 0px"
          threshold={0.15}
        >
          <DotGrid
            className="pointer-events-none absolute inset-0"
            dotSize={14}
            gap={28}
            baseColor="#d9e6f3"
            activeColor="#1f7a4d"
            proximity={180}
            speedTrigger={140}
            shockRadius={260}
            shockStrength={6}
            resistance={620}
            returnDuration={1.8}
          />
        </VisibilityMount>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white/90" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-24 pt-32 md:items-start md:px-10">
        <div className="w-full max-w-3xl text-center md:text-left">
          <h1 className="mt-6 text-balance font-heading text-slate-900">
            <span className="block text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 sm:text-base">
              Welcome to the
            </span>
            <span className="mt-2 block text-5xl font-bold text-slate-900 sm:text-6xl md:text-7xl">
              The Mossy Roots
            </span>
            <span className="mt-3 block text-base text-slate-700 sm:text-lg">
              Where marketing grows smarter
            </span>
          </h1>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/about" className="btn-primary justify-center sm:justify-start">
              About Us
            </Link>
            <Link href="/software" className="btn-secondary justify-center sm:justify-start">
              Explore Software
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
