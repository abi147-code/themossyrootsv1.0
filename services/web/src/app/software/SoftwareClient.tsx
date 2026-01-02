'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Background3D } from '@/app/(marketing)/serene/Background3D';
import MarketingOverview from './components/MarketingOverview';
import './software.css';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
};

type SoftwareClientProps = {
  fontClassName?: string;
};

export default function SoftwareClient({ fontClassName = '' }: SoftwareClientProps) {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    <div className={`software-serene-root ${fontClassName}`}>
      {mounted ? (
        <Suspense fallback={<div className="fixed inset-0 bg-[#050807]" />}>
          <Background3D scroll={scrollProgress} />
        </Suspense>
      ) : (
        <div className="fixed inset-0 bg-[#050807]" aria-hidden />
      )}

      <div className="software-noise-overlay" aria-hidden />

      <header className="software-hero">
        <div className="software-hero-bg" aria-hidden />
        <motion.div {...fadeIn} className="software-hero-content">
          <h1 className="software-h1">TMR Software</h1>
          <p className="software-lede">Turn your routine into an opportunity.</p>
        </motion.div>
      </header>

      <main className="software-main">
        <motion.section {...fadeIn} className="software-section-plain">
          <MarketingOverview
            title="Marketing Invoice Generator"
            description="Built for marketers who want every invoice to carry a story, strengthen trust, and nudge customers toward the next step."
          >
          </MarketingOverview>
        </motion.section>

        <motion.section {...fadeIn} className="software-section-plain">
          <div className="software-body software-body-center">
            <p className="software-kicker">Why it matters</p>
            <h2 className="software-h2">Turn routine billing into a branded moment.</h2>
          </div>
        </motion.section>
      </main>

      <motion.section {...fadeIn} className="software-cta software-glass">
        <div className="software-cta-overlay" aria-hidden />
        <div className="software-cta-content">
          <p className="software-kicker">Ready to rethink invoicing?</p>
          <p className="software-body software-body-center">
            Join The Mossy Roots and turn your next billing cycle into a branded moment your customers will remember.
          </p>
          <div className="software-cta-row software-cta-row-center">
            <Link href="/signup" className="software-btn-primary">
              Start Building Invoices
            </Link>
            <Link href="/software/invoice-generator" className="software-btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
