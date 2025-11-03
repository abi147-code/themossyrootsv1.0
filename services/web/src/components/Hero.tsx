'use client';

import Link from 'next/link';
import DotGrid from './DotGrid';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <DotGrid
          className="pointer-events-none absolute inset-0"
          dotSize={14}
          gap={28}
          baseColor="#10241B"
          activeColor="#E2B714"
          proximity={180}
          speedTrigger={140}
          shockRadius={260}
          shockStrength={6}
          resistance={620}
          returnDuration={1.8}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0F14]/20 via-[#0B0F14]/45 to-[#0B0F14]/80" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-24 pt-32 md:items-start md:px-10">
        <div className="w-full max-w-3xl text-center md:text-left">
          <h1 className="mt-6 text-balance font-heading text-white">
            <span className="block text-sm font-semibold uppercase tracking-[0.35em] text-white/70 sm:text-base">
              Welcome to the
            </span>
            <span className="mt-2 block text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              The Mossy Roots
            </span>
            <span className="mt-3 block text-base text-white/80 sm:text-lg">
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
