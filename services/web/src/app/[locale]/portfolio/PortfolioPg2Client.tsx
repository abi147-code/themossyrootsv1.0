"use client";

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import App from '../../../../Portfolio PG 2/App';

const USE_TAILWIND_CDN = false;

const inlineStyles = `
        /* Font import fallback to guarantee Italiana + Manrope even if <link> is blocked/slow */
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Manrope:wght@200;300;400;500;600&display=swap');

        :root {
            --bg-deep: #000000;
            --text-primary: #F2F2F2;
            --text-secondary: #888888;
        }
        
        body {
            background-color: var(--bg-deep);
            color: var(--text-primary);
            font-family: 'Manrope', sans-serif;
            margin: 0;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            cursor: auto;
        }

        body.custom-cursor-active {
            cursor: none;
        }

        .font-serif-display { font-family: 'Italiana', serif; }
        .font-sans-body { font-family: 'Manrope', sans-serif; }
        
        html { scroll-behavior: smooth; }
        
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: var(--bg-deep); }
        ::-webkit-scrollbar-thumb { background: #333; }

        .reveal-text {
            animation: reveal 1.5s cubic-bezier(0.2, 1, 0.3, 1) forwards;
            opacity: 0;
            filter: blur(10px);
            transform: translateY(20px);
        }

        @keyframes reveal {
            from { opacity: 0; filter: blur(10px); transform: translateY(40px); }
            to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        /* Scroll Reveal Animation Classes */
        .reveal-on-scroll {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }
        
        .reveal-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Enhanced Animations */
        @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-12deg); }
            100% { transform: translateX(150%) skewX(-12deg); }
        }

        @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
        }
        
        @keyframes infinite-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
        }
        
        .animate-infinite-scroll {
            animation: infinite-scroll 40s linear infinite;
        }

        /* Optimized Aurora Background - Magical Pastels */
        .aurora-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            background: #000000;
            overflow: hidden;
        }

        .aurora-orb {
            position: absolute;
            width: 70vw;
            height: 70vw;
            border-radius: 50%;
            opacity: 0; /* hide colored haze for true black backdrop */
            transform: translate3d(0,0,0);
            will-change: transform;
            animation: float 20s infinite alternate ease-in-out;
            background: transparent;
        }
        
        .aurora-orb.rose { 
            background: transparent;
        }
        .aurora-orb.teal { 
            background: transparent;
        }
        
        .delay-0 { animation-delay: 0s; }
        .delay-2000 { animation-delay: -5s; }
        .delay-4000 { animation-delay: -10s; }

        @keyframes float {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(30px, -20px, 0) scale(1.05); }
            100% { transform: translate3d(-20px, 40px, 0) scale(0.95); }
        }

        /* Custom Cursor */
        #cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            /* IMPORTANT: Removed transform from here to let JS handle it exclusively to avoid conflicts, or use JS to append */
            /* Actually, setting transform here sets the initial state. JS will override. */
            transform: translate3d(-50%, -50%, 0); 
            mix-blend-mode: exclusion;
            transition: width 0.3s, height 0.3s, background-color 0.3s;
            will-change: transform;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        
        body:hover #cursor { opacity: 1; }
        
        .hover-active #cursor {
            background-color: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(2px);
            /* Scale is handled via class toggle, but position via JS */
            width: 48px;
            height: 48px;
        }

        @media (max-width: 640px) {
            #cursor {
                display: none;
            }
            body.custom-cursor-active {
                cursor: auto;
            }
        }
    `;

const PORTFOLIO_ROOT_ID = 'portfolio-pg2-root';

export default function PortfolioPg2Client() {
  const cursorRafRef = useRef<number | null>(null);
  const listenersRef = useRef<
    {
      el: Element;
      enter: () => void;
      leave: () => void;
    }[]
  >([]);
  const initRef = useRef(false);

  useEffect(() => {
    // Ensure font/preconnect links are present in head
    const head = document.head;
    if (head) {
      if (!document.getElementById('pg2-preconnect-gfonts')) {
        const preconnect1 = document.createElement('link');
        preconnect1.id = 'pg2-preconnect-gfonts';
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        head.appendChild(preconnect1);
      }
      if (!document.getElementById('pg2-preconnect-gstatic')) {
        const preconnect2 = document.createElement('link');
        preconnect2.id = 'pg2-preconnect-gstatic';
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = '';
        head.appendChild(preconnect2);
      }
      if (!document.getElementById('pg2-fonts')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'pg2-fonts';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Italiana&family=Manrope:wght@200;300;400;500;600&display=swap';
        head.appendChild(fontLink);
      }
      if (USE_TAILWIND_CDN && !document.getElementById('portfolio-pg2-tailwind')) {
        const script = document.createElement('script');
        script.id = 'portfolio-pg2-tailwind';
        script.src = 'https://cdn.tailwindcss.com';
        script.async = false;
        head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const cursor = document.getElementById('cursor');
    if (!cursor) return undefined;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      const dt = 1.0 - Math.pow(1.0 - 0.15, 2);
      cursorX += (mouseX - cursorX) * dt;
      cursorY += (mouseY - cursorY) * dt;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      cursorRafRef.current = requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    cursorRafRef.current = requestAnimationFrame(animateCursor);
    document.body.classList.add('custom-cursor-active');

    const interactiveElements = Array.from(document.querySelectorAll('a, button, .interactive'));
    interactiveElements.forEach((el) => {
      const enter = () => document.body.classList.add('hover-active');
      const leave = () => document.body.classList.remove('hover-active');
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      listenersRef.current.push({ el, enter, leave });
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current);
      listenersRef.current.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
      listenersRef.current = [];
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      {USE_TAILWIND_CDN && (
        <Script id="portfolio-pg2-tailwind" src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      )}
      <div id="cursor" />
      <div id={PORTFOLIO_ROOT_ID} className="relative z-10">
        <App />
      </div>
    </>
  );
}
