'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import { Background3D } from '@/app/[locale]/(marketing)/serene/Background3D';
import { useDictionary } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import './about.css';

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
  const { about, locale } = useDictionary();
  const { user } = useAuth();
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
          <p className="about-kicker">{about.hero.kicker}</p>
          <h1 className="about-h1">{about.hero.title}</h1>
          <p className="about-lede">{about.hero.subtitle}</p>
        </motion.div>
      </header>

      <main className="about-main">
        <motion.section {...fadeUpSlight} className="about-section-plain">
          <h2 className="about-h2">{about.story.title}</h2>
          <div className="about-body about-body-center">
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className="about-section about-glass">
          <div className="about-section-header">
            <h2 className="about-h2">{about.mission.title}</h2>
          </div>
          <div className="about-body">
            {about.mission.points.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeIn} className="about-section-plain about-quote-wrap">
          <blockquote className="about-quote">
            <p className="about-quote-text">{about.quote.headline}</p>
          </blockquote>
          <p className="about-body about-body-center">
            {about.quote.body}
          </p>
        </motion.section>
      </main>

      <motion.section {...fadeIn} className="about-cta about-glass">
        <div className="about-cta-overlay" aria-hidden />
        <div className="about-cta-content">
          <p className="about-kicker">{about.cta.kicker}</p>
          <Link href={user ? '/dashboard' : `/${locale}/login`} className="about-cta-link">
            {about.cta.link}
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
