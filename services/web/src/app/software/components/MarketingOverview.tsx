'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface MarketingOverviewProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function MarketingOverview({ title, description, children }: MarketingOverviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button
        type="button"
        onClick={toggle}
        className="group relative flex w-full flex-col items-start overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 text-left shadow-xl shadow-black/30 backdrop-blur-lg transition hover:border-white/20 hover:bg-white/15"
        aria-expanded={isOpen}
      >
        <div className="relative z-10 space-y-4">
          <h1 className="text-balance font-heading text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-white/80">
            {description}
          </p>
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#E2B714] transition group-hover:text-[#F1CE5F]">
          {isOpen ? 'Hide Details' : 'Explore Details'}
          <svg
            className={clsx('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 transition group-hover:opacity-100" />
      </button>

      {isOpen && (
        <div className="mt-12 space-y-16">
          {children}
        </div>
      )}
    </div>
  );
}

