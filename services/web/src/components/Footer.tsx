'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600">&copy; {year} The Mossy Roots - All Rights Reserved.</p>
        <div className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="https://www.linkedin.com/in/abishek147ae/" target="_blank" rel="noreferrer" className="transition hover:text-[#1f7a4d]">
            LinkedIn
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="https://github.com/abi147-code" target="_blank" rel="noreferrer" className="transition hover:text-[#1f7a4d]">
            GitHub
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="https://unsplash.com/@abi147ae" target="_blank" rel="noreferrer" className="transition hover:text-[#1f7a4d]">
            Unsplash
          </Link>
        </div>
      </div>
    </footer>
  );
}
