'use client';

import Link from 'next/link';
import { useDictionary } from '@/context/LocaleContext';

export default function Footer() {
  const dictionary = useDictionary();
  const year = new Date().getFullYear();
  const socials = dictionary.footer.socials;
  const note = dictionary.footer.note.replace('{year}', `${year}`);
  const socialLinks: Record<string, string> = {
    Instagram: 'https://www.instagram.com/the.mossyroots/',
    LinkedIn: 'https://www.linkedin.com/in/abishek147ae/',
    Unsplash: 'https://unsplash.com/@abi147ae',
    Github: 'https://github.com/abi147-code',
    Contact: 'mailto:abishek147ae@gmail.com',
    X: 'https://x.com/TheMossyRoots',
    Twitter: 'https://x.com/TheMossyRoots',
  };

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: note }} />
        <div className="flex items-center gap-4 text-sm text-slate-700">
          {socials.map((label, index) => (
            <span key={label} className="flex items-center gap-4">
              <Link
                href={socialLinks[label] ?? '#'}
                target={socialLinks[label] ? '_blank' : undefined}
                rel={socialLinks[label] ? 'noreferrer' : undefined}
                className="transition hover:text-[#1f7a4d]"
              >
                {label}
              </Link>
              {index < socials.length - 1 ? <span className="text-slate-300">|</span> : null}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
