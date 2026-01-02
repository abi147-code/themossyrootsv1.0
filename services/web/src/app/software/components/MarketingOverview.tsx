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
  const learnMoreHref = '/software/invoice-generator';

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
    <div className="software-overview">
      <div className="software-overview-card">
        <div className="relative z-10 space-y-4">
          <h1 className="software-h2">{title}</h1>
          <p className="software-body">
            Built for marketers who want every invoice to carry a story, strengthen trust, and nudge customers toward the next step.
          </p>
          <div className="software-cta-row">
            <Link href={learnMoreHref} onClick={handleLearnMore} className="software-btn-secondary">
              Learn More
            </Link>
            <button
              type="button"
              onClick={handleUseTool}
              className="software-btn-primary"
              disabled={loading}
            >
              Use Tool
            </button>
          </div>
        </div>
        <div className="software-overview-glow" aria-hidden />
      </div>

      {children ? <div className="software-overview-body">{children}</div> : null}
    </div>
  );
}
