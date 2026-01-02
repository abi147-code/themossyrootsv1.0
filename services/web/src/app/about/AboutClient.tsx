'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import { Background3D } from '@/app/(marketing)/serene/Background3D';
import './about.css';

const ecosystemTools = [
  {
    name: 'Invoice Marketing Generator',
    description:
      'Turns every invoice into a branded message, blending billing with storytelling to create subtle touchpoints that strengthen trust.',
  },
  {
    name: 'Automated SEO Blog Builder',
    description:
      'Generates optimized blog articles in your brand voice, keeping content fresh, relevant, and visible without lifting a finger.',
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
};

const fadeUpSlight = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
};

type AboutClientProps = {
  fontClassName?: string;
};

export default function AboutClient({ fontClassName = '' }: AboutClientProps) {
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
    <div className={`about-serene-root ${fontClassName}`}>
      {mounted ? (
        <Suspense fallback={<div className="fixed inset-0 bg-[#050807]" />}>
          <Background3D scroll={scrollProgress} />
        </Suspense>
      ) : (
        <div className="fixed inset-0 bg-[#050807]" aria-hidden />
      )}

      <div
        className="about-noise-overlay"
        aria-hidden
      />

      <header className="about-hero">
        <div className="about-hero-bg" aria-hidden />
        <motion.div {...fadeIn} className="about-hero-content">
          <p className="about-kicker">The Mossy Roots</p>
          <h1 className="about-h1">Where marketing grows smarter.</h1>
          <p className="about-lede">
            Mossy Roots helps businesses cut through the noise with automation that feels personal and marketing that feels alive.
          </p>
        </motion.div>
      </header>

      <main className="about-main">
        <motion.section {...fadeUpSlight} className="about-section-plain">
          <h2 className="about-h2">Our Story</h2>
          <div className="about-body about-body-center">
            <p>
              It started with a pattern I couldn’t ignore — talented creators and small businesses doing incredible work, yet spending most of their days repeating
              the same digital routines.
            </p>
            <p>Sending invoices. Posting updates. Managing blogs. Writing emails.</p>
            <p>All the things that keep a business alive... but slowly drain the energy that once made it grow.</p>
            <p>I built The Mossy Roots to change that rhythm.</p>
            <p>
              Inspired by how nature grows quietly yet purposefully, I wanted to create a space where marketing and automation could feel organic — systems that support you
              instead of suffocating your creativity.
            </p>
            <p>
              What started with small experiments — an Invoice Marketing Generator that turned transactions into brand stories, an SEO Blog Writer that kept ideas alive while
              people slept — soon grew into something much bigger.
            </p>
            <p>
              Today, The Mossy Roots designs custom automation systems for creators, startups, and small teams — crafted around their needs, their tools, and their story.
            </p>
            <p>We don’t sell one-size-fits-all templates.</p>
            <p>
              We build living systems that adapt, simplify, and quietly do the work in the background so you can focus on what truly matters: creating, connecting, and growing your vision.
            </p>
            <p>Because like nature, the best growth doesn’t shout, it simply thrives.</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className="about-section about-glass">
          <div className="about-section-header">
            <h2 className="about-h2">Our Mission</h2>
          </div>
          <div className="about-body">
            <p>To make smart marketing accessible and authentic for every business.</p>
            <p>We use AI and automation to turn everyday routines into intelligent systems that scale creativity and growth.</p>
            <p>We&apos;re building a smarter way to market — one that&apos;s data-driven, beautifully designed, and deeply human.</p>
          </div>
        </motion.section>

        <motion.section {...fadeIn} className="about-section-plain about-quote-wrap">
          <blockquote className="about-quote">
            <p className="about-quote-text">"Rooted in strategy. Grown through creativity."</p>
          </blockquote>
          <p className="about-body about-body-center">
            We believe the best marketing feels like nature — adaptive, intelligent, and quietly powerful. Every product we build balances automation with artistry, helping
            your brand grow in a way that feels both smart and sincere.
          </p>
        </motion.section>
      </main>

      <motion.section {...fadeIn} className="about-cta about-glass">
        <div className="about-cta-overlay" aria-hidden />
        <div className="about-cta-content">
          <p className="about-kicker">Ready to grow with us?</p>
          <Link href="/dashboard" className="about-cta-link">
            Explore the Dashboard
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
