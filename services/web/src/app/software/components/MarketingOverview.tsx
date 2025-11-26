'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface MarketingOverviewProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function MarketingOverview({ title, description, children }: MarketingOverviewProps) {
  const router = useRouter();
  const { token, loading } = useAuth();
  const learnMoreHref =
    process.env.NEXT_PUBLIC_PROMO_AI_MARKETING_URL ?? 'http://localhost:5173/';
  console.log('LEARN MORE URL:', learnMoreHref);

  const getUseToolTarget = () => {
    if (loading) return null;
    return token ? '/dashboard/invoice-generator' : '/login?redirect=/dashboard/invoice-generator';
  };

  const navigateWithFade = (target: string) => {
    if (typeof document !== 'undefined') {
      const wrapper = document.getElementById('page-transition-wrapper');
      if (wrapper) {
        wrapper.classList.add('page-fade-out');
        setTimeout(() => router.push(target), 300);
        return;
      }
    }
    router.push(target);
  };

  const handleUseTool = () => {
    const target = getUseToolTarget();
    if (!target) return;
    navigateWithFade(target);
  };

  const handleLearnMore = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateWithFade(learnMoreHref);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12">
      <div className="group relative flex w-full flex-col items-start overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 text-left shadow-xl shadow-black/30 backdrop-blur-lg transition hover:border-white/20 hover:bg-white/15">
        <div className="relative z-10 space-y-4">
          <h1 className="text-balance font-heading text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-white/80">{description}</p>
          <p className="text-base text-white/70">
            Built for marketers who want every invoice to carry a story, strengthen trust, and nudge customers toward the next step.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={learnMoreHref} onClick={handleLearnMore} className="btn-secondary inline-flex items-center justify-center">
              Learn More
            </Link>
            <button
              type="button"
              onClick={handleUseTool}
              className="btn-primary inline-flex items-center justify-center"
              disabled={loading}
            >
              Use Tool
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 transition group-hover:opacity-100" />
      </div>

      {children ? <div className="space-y-16">{children}</div> : null}
    </div>
  );
}
