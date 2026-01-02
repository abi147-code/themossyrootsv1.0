'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import './serene-nav.css';

const links = [
  { label: 'About', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Software', href: '/software' },
];

export default function SereneNav() {
  return (
    <div className="serene-nav-wrapper">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto will-change-transform"
        >
          <div
            className="serene-nav-glass px-8 md:px-12 py-4 md:py-5 rounded-full
                     flex items-center space-x-6 md:space-x-12 whitespace-nowrap
                     max-w-[90vw] md:max-w-none backface-hidden"
          >
            <div className="serene-nav-glass-bg" aria-hidden />
            <Link href="/" className="group flex items-center shrink-0">
              <span className="text-[11px] md:text-[13px] font-serif italic text-[#E6EFEA] hover:text-emerald-200 transition-colors tracking-wide drop-shadow-md">
                The Mossy Roots
              </span>
            </Link>

            <div className="w-[1px] h-4 bg-white/20" />

            <div className="flex items-center space-x-6 md:space-x-10">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] hover:text-emerald-200 transition-all hover:scale-105 font-medium drop-shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

          <div className="w-[1px] h-4 bg-white/20" />

            <Link
              href="/login"
              className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#E6EFEA] px-6 py-2 rounded-full bg-white/[0.1] border border-white/20 hover:bg-white/[0.2] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] active:scale-95 drop-shadow-sm"
            >
              Login
            </Link>
          </div>
        </motion.nav>
    </div>
  );
}
