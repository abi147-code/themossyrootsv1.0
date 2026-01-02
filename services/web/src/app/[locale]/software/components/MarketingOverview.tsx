'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { prefixPathWithLocale } from '@/lib/locale-shared';

interface MarketingOverviewProps {
  title: string;
  description: string;
  children: React.ReactNode;
  cta: {
    learnMore: string;
    useTool: string;
  };
}

export default function MarketingOverview({ title, description, children, cta }: MarketingOverviewProps) {
  const router = useRouter();
  const { token, loading } = useAuth();
  const locale = useLocale();
  const learnMoreHref = prefixPathWithLocale(locale, '/software/invoice-generator');

  const getUseToolTarget = () => {
    if (loading) return null;
    return token ? '/dashboard/invoice-generator' : prefixPathWithLocale(locale, '/login?redirect=/dashboard/invoice-generator');
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
            {description}
          </p>
          <div className="software-cta-row">
            <Link href={learnMoreHref} onClick={handleLearnMore} className="software-btn-secondary">
              {cta.learnMore}
            </Link>
            <button
              type="button"
              onClick={handleUseTool}
              className="software-btn-primary"
              disabled={loading}
            >
              {cta.useTool}
            </button>
          </div>
        </div>
        <div className="software-overview-glow" aria-hidden />
      </div>

      {children ? <div className="software-overview-body">{children}</div> : null}
    </div>
  );
}
