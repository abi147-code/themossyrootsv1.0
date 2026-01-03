'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { prefixPathWithLocale } from '@/lib/locale-shared';
import { CrackOverlay } from './CrackOverlay';

const CLICK_THRESHOLD = 3;

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string; // Translation X CSS var
  ty: string; // Translation Y CSS var
}

type HeroCopy = Dictionary['invoice']['hero'];
type BasicInvoiceCopy = HeroCopy['baseInvoice'];
type PremiumInvoiceCopy = HeroCopy['premiumInvoice'];

// The "Boring" White Invoice (Top Layer)
const InvoiceContent: React.FC<{ copy: BasicInvoiceCopy }> = ({ copy }) => (
  <div className="w-full h-full bg-white p-[6%] flex flex-col font-inter select-none relative overflow-hidden text-slate-900">
    {/* Header Section */}
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        {/* Logo - Approximate styling of the Shield */}
        <div className="w-10 h-12 md:w-12 md:h-14 bg-yellow-400 relative rounded-b-[2rem] shadow-sm flex items-center justify-center border border-yellow-500 shrink-0">
          <div className="text-[0.25rem] md:text-[0.3rem] font-bold text-center leading-tight text-black tracking-wider transform scale-90">
            AUTOMOBILI
            <br />
            LAMBORGHINI
          </div>
          {/* Gloss effect on logo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/30 rounded-b-[2rem] pointer-events-none" />
        </div>

        <div className="text-[0.5rem] md:text-[0.6rem] leading-relaxed">
          <p className="font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-[0.45rem]">{copy.fromLabel}</p>
          <p className="font-bold text-slate-900 text-xs md:text-sm">{copy.fromName}</p>
          {copy.fromAddress.map((line) => (
            <p key={line} className="text-slate-600">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{copy.invoiceNumber}</p>
        <p className="text-[0.6rem] md:text-xs text-slate-500 font-medium">{copy.invoiceDate}</p>
      </div>
    </div>

    <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6 md:mb-8 tracking-tight font-sans">{copy.invoiceLabel}</h2>

    {/* Grid Info */}
    <div className="grid grid-cols-2 gap-y-4 gap-x-2 md:flex md:justify-between mb-8 text-[0.55rem] md:text-[0.65rem] leading-snug">
      <div className="md:w-1/4">
        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[0.5rem]">{copy.billToLabel}</p>
        <p className="font-bold text-slate-900 text-sm md:text-base mb-0.5">{copy.billToName}</p>
        {copy.billToCompany ? <p className="text-slate-600">{copy.billToCompany}</p> : null}
      </div>
      <div className="md:w-1/4">
        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[0.5rem]">{copy.shipToLabel}</p>
        {copy.shipToLines.map((line) => (
          <p key={line} className="text-slate-600">
            {line}
          </p>
        ))}
      </div>
      <div className="md:w-1/4">
        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[0.5rem]">{copy.paymentLabel}</p>
        <div className="flex justify-between md:block">
          <span className="text-slate-500 mr-1">{copy.dueDateLabel}</span>
          <span className="font-medium text-slate-900">{copy.dueDate}</span>
        </div>
        <div className="flex justify-between md:block">
          <span className="text-slate-500 mr-1">{copy.paymentTermsLabel}</span>
          <span className="font-medium text-slate-900">{copy.paymentTerms}</span>
        </div>
      </div>
      <div className="md:w-auto text-right md:text-left">
        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[0.5rem]">{copy.detailsLabel}</p>
        <div>
          <span className="text-slate-500 mr-1">{copy.poNumberLabel}</span>
          <span className="font-medium text-slate-900">{copy.poNumber}</span>
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="w-full mb-auto">
      <div className="flex border-b-2 border-slate-100 pb-2 mb-3 font-bold text-slate-400 uppercase tracking-wider text-[0.5rem] md:text-[0.6rem]">
        <div className="flex-grow pl-1">{copy.tableHeaders.item}</div>
        <div className="w-[10%] text-right">{copy.tableHeaders.qty}</div>
        <div className="w-[20%] text-right">{copy.tableHeaders.rate}</div>
        <div className="w-[20%] text-right pr-1">{copy.tableHeaders.amount}</div>
      </div>
      {copy.tableRows.map((row) => (
        <div key={row.item} className="flex py-1 border-b border-slate-50 text-[0.6rem] md:text-xs">
          <div className="flex-grow font-bold text-slate-900 pl-1">{row.item}</div>
          <div className="w-[10%] text-right text-slate-600">{row.qty}</div>
          <div className="w-[20%] text-right text-slate-600">{row.rate}</div>
          <div className="w-[20%] text-right font-medium text-slate-900 pr-1">{row.amount}</div>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className="w-full max-w-[200px] self-end space-y-2 text-[0.6rem] md:text-xs mt-4">
      <div className="flex justify-between text-slate-600">
        <span>{copy.totals.subtotalLabel}</span>
        <span>{copy.totals.subtotal}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>{copy.totals.taxLabel}</span>
        <span>{copy.totals.tax}</span>
      </div>
      <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm md:text-base font-bold text-slate-900">
        <span>{copy.totals.totalLabel}</span>
        <span>{copy.totals.total}</span>
      </div>
    </div>

    {/* Decorative watermark/texture */}
    <div
      className="absolute inset-0 bg-slate-50 opacity-10 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
    />
  </div>
);

// The "Premium" Purple/Galaxy Invoice (Bottom Revealed Layer)
const PremiumInvoiceContent: React.FC<{ copy: PremiumInvoiceCopy }> = ({ copy }) => (
  // Layout Logic:
  // pb-[34%] ensures content clears the 18% height footer with ample space.
  // Compact margins (mb-3 instead of mb-6) ensure vertical fit.
  <div className="w-full h-full bg-[#1c0b38] px-[6%] pt-[6%] pb-[34%] flex flex-col font-sans relative overflow-hidden text-[#e2d5f5] select-none">
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#2a1050] to-[#120524] z-0"></div>

    {/* Header */}
    <div className="flex justify-between items-start mb-3 z-10 relative">
      {/* Simple, Beautiful Abstract Logo */}
      <div className="w-10 h-10 md:w-12 md:h-12 relative group">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" /> {/* Orange */}
              <stop offset="100%" stopColor="#D946EF" /> {/* Fuchsia */}
            </linearGradient>
          </defs>
          <path
            d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z"
            stroke="url(#logo-gradient)"
            strokeWidth="6"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="50" cy="50" r="10" fill="url(#logo-gradient)" opacity="0.8" />
        </svg>
      </div>

      <div className="text-right">
        <h2 className="text-3xl md:text-4xl font-serif text-[#d6b4fc] tracking-tight mb-0">{copy.title}</h2>
        <p className="text-[0.5rem] md:text-[0.6rem] opacity-50 uppercase tracking-widest mt-1">{copy.invoiceNumberLabel}</p>
      </div>
    </div>

    {/* Info Grid - Compacted */}
    <div className="flex justify-between mb-3 z-10 relative text-[0.5rem] md:text-[0.6rem] leading-relaxed">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <div>
            <p className="uppercase text-[0.4rem] tracking-widest opacity-40 mb-1">{copy.issuedDateLabel}</p>
            <p className="text-white text-xs md:text-sm font-light">{copy.issuedDate}</p>
          </div>
          <div>
            <p className="uppercase text-[0.4rem] tracking-widest opacity-40 mb-1">{copy.dueDateLabel}</p>
            <p className="text-white text-xs md:text-sm font-light">{copy.dueDate}</p>
            <div className="w-8 h-[1px] bg-white/20 mt-1"></div>
          </div>
        </div>

        <div>
          <p className="uppercase text-[0.4rem] tracking-widest opacity-40 mb-1">{copy.fromLabel}</p>
          <p className="text-white font-medium text-[0.6rem] mb-1">{copy.fromName}</p>
          <p className="opacity-60 text-[0.5rem]">{copy.fromAddress}</p>
        </div>
      </div>

      <div className="w-1/2 pl-6">
        <div className="border-t border-white/10 pt-3">
          <p className="uppercase text-[0.4rem] tracking-widest opacity-40 mb-1">{copy.billedToLabel}</p>
          <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">{copy.billedToName}</h3>
          <div className="space-y-1 opacity-70 text-[0.5rem]">
            {copy.billedToLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Line Items - Compacted */}
    <div className="w-full z-10 relative mb-auto">
      <div className="flex border-b border-white/20 pb-1 mb-2 text-[0.4rem] uppercase tracking-widest opacity-40">
        <div className="w-3/5">{copy.tableHeaders.description}</div>
        <div className="w-1/6 text-center">{copy.tableHeaders.qty}</div>
        <div className="w-1/6 text-right">{copy.tableHeaders.price}</div>
        <div className="w-1/6 text-right">{copy.tableHeaders.total}</div>
      </div>

      <div className="space-y-1 text-[0.5rem] md:text-[0.6rem] text-white/90">
        {copy.tableRows.map((row) => (
          <div key={row.item} className="flex border-b border-white/5 pb-1">
            <div className="w-3/5 truncate pr-2">{row.item}</div>
            <div className="w-1/6 text-center opacity-50">{row.qty}</div>
            <div className="w-1/6 text-right opacity-50">{row.rate}</div>
            <div className="w-1/6 text-right">{row.amount}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Totals Section - Clearly Visible & Separated */}
    <div className="flex justify-between items-end z-20 relative mb-1">
      <div className="w-5/12 border-l-2 border-white/20 pl-2 py-1">
        <p className="italic text-[0.45rem] md:text-[0.5rem] opacity-60 leading-tight">{copy.note}</p>
      </div>

      <div className="w-1/2 flex flex-col items-end">
        <div className="flex justify-between w-full text-[0.5rem] md:text-[0.6rem] mb-0.5">
          <span className="uppercase tracking-widest opacity-40">{copy.totals.subtotalLabel}</span>
          <span className="text-white/80">{copy.totals.subtotal}</span>
        </div>
        <div className="flex justify-between w-full text-[0.5rem] md:text-[0.6rem] border-b border-white/20 pb-1 mb-1">
          <span className="uppercase tracking-widest opacity-40">{copy.totals.taxLabel}</span>
          <span className="text-white/80">{copy.totals.tax}</span>
        </div>
        <div className="text-right">
          <p className="font-serif italic text-[0.5rem] md:text-[0.6rem] opacity-60 mb-0">{copy.totals.totalLabel}</p>
          <p className="font-serif text-2xl md:text-3xl text-white">{copy.totals.total}</p>
        </div>
      </div>
    </div>

    {/* Galaxy Footer Banner */}
    <div className="absolute bottom-0 left-0 w-full h-[18%] overflow-hidden z-20">
      <img
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        alt={copy.footerImageAlt}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a1050] to-transparent"></div>

      <div className="relative w-full h-full flex items-center justify-between px-6">
        <p className="text-white font-serif text-xs md:text-sm w-2/3 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {copy.footerStatement}
        </p>
        <button className="bg-orange-500 hover:bg-orange-400 text-white text-[0.5rem] md:text-[0.6rem] font-bold uppercase tracking-widest py-1.5 px-3 shadow-lg transform hover:scale-105 transition-all rounded-sm">
          {copy.footerCta}
        </button>
      </div>
    </div>
  </div>
);

export const HeroInvoiceBreak: React.FC<{ copy: HeroCopy; locale: Locale }> = ({ copy, locale }) => {
  const [clicks, setClicks] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 3D Tilt Logic
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isBroken || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation values (limit to +/- 5 degrees for subtle realism)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const spawnParticles = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 50 + Math.random() * 100;
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    // Cleanup particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id < Date.now() - 1000));
    }, 1000);
  };

  const registerHit = (clientX: number, clientY: number) => {
    if (isBroken) return;

    const nextClickCount = clicks + 1;
    setClicks(nextClickCount);
    triggerHaptic();
    spawnParticles(clientX, clientY);

    // Trigger Shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);

    if (nextClickCount >= CLICK_THRESHOLD) {
      setTimeout(() => {
        setIsBroken(true);
        if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
        setTilt({ x: 0, y: 0 }); // Reset tilt on break
      }, 300);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBroken) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    registerHit(e.clientX, e.clientY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Mock center coords for keyboard interaction
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        registerHit(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  };

  const reset = () => {
    setClicks(0);
    setIsBroken(false);
    setParticles([]);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12 py-12">
      {/* Left Column: Text Copy */}
      <div className="flex-1 text-center md:text-left z-20">
        <div className={`transition-all duration-700 ${isBroken ? 'opacity-100 transform translate-y-0' : 'opacity-80'}`}>
          <div className="invoice-brand-kicker">The Mossy Roots</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            {isBroken ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse">
                {copy.titleBroken}
              </span>
            ) : (
              <span>{copy.titleInitial}</span>
            )}
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed whitespace-pre-line">
            {isBroken ? copy.descriptionBroken : copy.descriptionInitial}
          </p>

          <div className={`transition-all duration-1000 ${isBroken ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <button
              onClick={() => router.push(prefixPathWithLocale(locale, '/login'))}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-purple-600 px-8 font-medium text-white transition-all duration-300 hover:bg-purple-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <span className="mr-2">{copy.cta}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: The Micro-Game */}
      <div className="flex-1 w-full max-w-[500px] flex flex-col items-center justify-center perspective-container relative">
        {/* Interaction Hint */}
        {!isBroken && (
          <div className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${clicks > 0 ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">{copy.tapHint}</span>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* The "Stage" Container */}
        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label={copy.interactionAria}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onKeyDown={handleKeyDown}
          style={{
            transform: isBroken ? `scale(1.05)` : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isShaking ? 0.98 : 1})`,
            transition: isShaking ? 'transform 0.05s' : 'transform 0.2s ease-out',
            touchAction: 'manipulation',
          }}
          className={`relative w-full aspect-[3/4] rounded-lg shadow-2xl cursor-pointer select-none outline-none ring-offset-4 ring-offset-slate-900 focus:ring-2 focus:ring-purple-600 ${isShaking ? 'animate-shake' : ''}`}
        >
          {/* LAYER 1: The Revealed Content (Bottom) */}
          <div
            className={`absolute inset-0 w-full h-full rounded-lg overflow-hidden bg-slate-800 transition-all duration-700 ${
              isBroken ? 'opacity-100 shadow-[0_0_80px_rgba(147,51,234,0.4)]' : 'opacity-0'
            }`}
          >
            <PremiumInvoiceContent copy={copy.premiumInvoice} />
            {/* Shiny gloss overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-30 animate-shimmer pointer-events-none"
              style={{ display: isBroken ? 'block' : 'none' }}
            ></div>
          </div>

          {/* LAYER 2: The Boring Invoice (Top) - Active before break */}
          {!isBroken && (
            <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden z-20 transition-transform">
              <InvoiceContent copy={copy.baseInvoice} />

              {/* Gloss Reflection Layer (moves with tilt) */}
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent mix-blend-overlay"
                style={{
                  transform: `translateX(${tilt.y * 2}%) translateY(${tilt.x * 2}%)`,
                  opacity: 0.6,
                }}
              />

              {/* Cracks */}
              <CrackOverlay isVisible={clicks >= 1} variant={1} />
              <CrackOverlay isVisible={clicks >= 2} variant={2} />
              <CrackOverlay isVisible={clicks >= 3} variant={3} />

              {/* Flash on click */}
              {isShaking && <div className="absolute inset-0 bg-white/40 animate-pulse pointer-events-none" />}
            </div>
          )}

          {/* LAYER 3: The Shards (Explosion Animation) */}
          {isBroken && (
            <div className="absolute inset-0 z-30 w-full h-full pointer-events-none">
              {/* Top Left */}
              <div className="absolute inset-0 w-full h-full shard-1" style={{ clipPath: 'polygon(0 0, 60% 0, 55% 45%, 0 50%)' }}>
                <InvoiceContent copy={copy.baseInvoice} />
                <CrackOverlay isVisible={true} variant={1} />
              </div>
              {/* Top Right */}
              <div className="absolute inset-0 w-full h-full shard-2" style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 50%, 55% 45%)' }}>
                <InvoiceContent copy={copy.baseInvoice} />
                <CrackOverlay isVisible={true} variant={2} />
              </div>
              {/* Bottom Right */}
              <div className="absolute inset-0 w-full h-full shard-3" style={{ clipPath: 'polygon(100% 50%, 100% 100%, 50% 100%, 55% 45%)' }}>
                <InvoiceContent copy={copy.baseInvoice} />
                <CrackOverlay isVisible={true} variant={3} />
              </div>
              {/* Bottom Left */}
              <div className="absolute inset-0 w-full h-full shard-4" style={{ clipPath: 'polygon(50% 100%, 0 100%, 0 50%, 55% 45%)' }}>
                <InvoiceContent copy={copy.baseInvoice} />
              </div>
            </div>
          )}

          {/* LAYER 4: Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle z-40"
              style={{
                left: p.x,
                top: p.y,
                width: Math.random() * 6 + 4 + 'px',
                height: Math.random() * 6 + 4 + 'px',
                '--tx': p.tx,
                '--ty': p.ty,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {isBroken && (
          <button
            onClick={reset}
            className="absolute -bottom-12 text-slate-400 text-xs hover:text-white underline transition-colors z-50 cursor-pointer uppercase tracking-widest"
          >
            {copy.replay}
          </button>
        )}
      </div>
    </div>
  );
};
