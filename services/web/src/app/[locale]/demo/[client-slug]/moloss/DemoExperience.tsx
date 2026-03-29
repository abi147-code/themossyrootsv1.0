'use client';

import { useEffect, useRef } from 'react';
import './moloss.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import { LanguageProvider } from './lib/i18n';
import { getDeviceType, pushDemoEvent } from '@/lib/demo-events';

const scrollThresholds = [25, 50, 75] as const;

type MolossDemoProps = {
  clientSlug: string;
  locale: string;
  view?: 'home' | 'blog';
};

export default function MolossDemo({ clientSlug, locale, view = 'home' }: MolossDemoProps) {
  const firedThresholds = useRef(new Set<number>());
  const initialLanguage = locale?.startsWith('fr') ? 'fr' : 'en';
  const basePath = `/${locale}/demo/${clientSlug}`;
  const blogPath = `${basePath}/blog`;

  useEffect(() => {
    pushDemoEvent('demo_page_view', {
      client_slug: clientSlug,
      device_type: getDeviceType(),
    });
  }, [clientSlug]);

  useEffect(() => {
    document.body.classList.add('moloss-body');
    firedThresholds.current = new Set();
    const handleScroll = () => {
      const depth =
        Math.min(
          100,
          Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100)
        ) || 0;

      scrollThresholds.forEach((threshold) => {
        if (depth >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          pushDemoEvent('demo_engagement', { client_slug: clientSlug, scroll_depth: threshold });
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.body.classList.remove('moloss-body');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [clientSlug]);

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="moloss-root min-h-screen flex flex-col bg-moloss-white text-moloss-black font-sans selection:bg-moloss-ice selection:text-moloss-dark-green">
        <Navbar basePath={basePath} blogPath={blogPath} />
        <main className="flex-grow bg-moloss-white">
          {view === 'home' ? <Home /> : <Blog />}
        </main>
        <Footer basePath={basePath} blogPath={blogPath} />
      </div>
    </LanguageProvider>
  );
}
