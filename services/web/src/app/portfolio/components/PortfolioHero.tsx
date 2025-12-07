'use client';

import { useEffect, useRef, useState } from 'react';
import DomeGallery from './dome';

const STORAGE_KEY = 'tmr_dome_hint_seen';

export default function PortfolioHero() {
  const [showHint, setShowHint] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const hasMarkedSeenRef = useRef(false);

  useEffect(() => {
    const seen = (() => {
      try {
        return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    })();

    if (seen) {
      hasMarkedSeenRef.current = true;
      return;
    }

    const node = heroRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShowHint(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      hasMarkedSeenRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasMarkedSeenRef.current) {
          setShowHint(true);
          hasMarkedSeenRef.current = true;
          try {
            window.localStorage.setItem(STORAGE_KEY, '1');
          } catch {
            /* ignore */
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const id = window.setTimeout(() => setShowHint(false), 8000);
    return () => window.clearTimeout(id);
  }, [showHint]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-6 pt-24 pb-16 md:pt-32"
    >
      <div className="absolute inset-0 z-0">
        <DomeGallery />
      </div>
      <div className="relative z-10 h-32 w-full max-w-4xl md:h-40" aria-hidden="true" />
      {showHint ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-6 flex justify-center px-4">
          <div className="flex max-w-lg items-center gap-3 rounded-2xl border border-emerald-200/80 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 shadow-lg shadow-emerald-100/60 backdrop-blur">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              ⓘ
            </span>
            <span className="flex-1 text-left">
              Click and drag to rotate the gallery, then click a photo to view it.
            </span>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
