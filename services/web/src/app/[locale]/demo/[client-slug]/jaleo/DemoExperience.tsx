'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hero from './components/Hero';
import Atmosphere from './components/Atmosphere';
import Story from './components/Story';
import Culinary from './components/Culinary';
import Menu from './components/Menu';
import Reviews from './components/Reviews';
import Gallery from './components/Gallery';
import Location from './components/Location';
import Footer from './components/Footer';
import AmbientSound from './components/AmbientSound';
import './jaleo.css';
import { getDeviceType, pushDemoEvent } from '@/lib/demo-events';

const scrollThresholds = [25, 50, 75] as const;

type JaleoDemoProps = {
  clientSlug: string;
};

const JaleoDemo: React.FC<JaleoDemoProps> = ({ clientSlug }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const firedThresholds = useRef(new Set<number>());

  useEffect(() => {
    pushDemoEvent('demo_page_view', {
      client_slug: clientSlug,
      device_type: getDeviceType(),
    });
  }, [clientSlug]);

  useEffect(() => {
    const handleScroll = () => {
      const depth =
        Math.min(
          100,
          Math.round(
            ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
          )
        ) || 0;

      scrollThresholds.forEach((threshold) => {
        if (depth >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          pushDemoEvent('demo_engagement', {
            client_slug: clientSlug,
            scroll_depth: threshold,
          });
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [clientSlug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className={`bg-jaleo-stone min-h-screen w-full transition-opacity duration-[1500ms] ease-in-out ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Hero />
      <Atmosphere />
      <Story />
      <Culinary />
      <Menu />
      <Reviews />
      <Gallery />
      <Location />
      <Footer />
    </main>
  );
};

export default JaleoDemo;
