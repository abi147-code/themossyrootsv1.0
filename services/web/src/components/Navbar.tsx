'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Software', href: '#software' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6">
      <div className="glass-nav flex w-full max-w-6xl items-center justify-between rounded-full px-6 py-3">
        <Link href="/" className="font-heading text-lg font-semibold text-white transition hover:text-[#E2B714]">
          The Mossy Roots
        </Link>

        <nav className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link relative text-sm font-medium text-white/80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="nav-link relative text-sm font-medium text-white/80"
          >
            Login
          </Link>
        </nav>

        <div className="hidden md:flex">
          <Link href="/software" className="btn-pill">
            Explore Software
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={toggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white md:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={clsx(
          'absolute inset-x-4 top-[72px] origin-top rounded-3xl border border-white/10 bg-[#0B0F14]/95 px-6 py-6 shadow-xl shadow-black/30 backdrop-blur-xl transition-all md:hidden',
          isOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={close}
              className="text-base font-medium text-white/90 transition hover:text-[#E2B714]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={close}
            className="text-base font-medium text-white/90 transition hover:text-[#E2B714]"
          >
            Login
          </Link>
          <Link
            href="/software"
            onClick={close}
            className="btn-primary mt-2 w-full justify-center"
          >
            Explore Software
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
