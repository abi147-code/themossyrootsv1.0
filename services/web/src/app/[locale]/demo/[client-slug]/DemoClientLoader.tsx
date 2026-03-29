'use client';

import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { DemoPayload } from '@/lib/demo-config';
import { prefixPathWithLocale } from '@/lib/locale-shared';

type DemoClientLoaderProps = {
  slug: string;
  locale: string;
  brandName: string;
  payload: DemoPayload;
};

const DemoExperience = dynamicImport(() => import('./DemoExperience'), { ssr: false });
const JaleoExperience = dynamicImport(() => import('./jaleo/DemoExperience'), { ssr: false });
const MolossExperience = dynamicImport(() => import('./moloss/DemoExperience'), { ssr: false });

export default function DemoClientLoader({ slug, brandName, payload, locale }: DemoClientLoaderProps) {
  const exitHref = prefixPathWithLocale(locale, '/demo');

  if (slug === 'jaleo') {
    return (
      <div className="relative">
        <Link
          href={exitHref}
          className="fixed top-4 right-4 z-[2147483647] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg backdrop-blur hover:bg-white"
        >
          Exit demo
        </Link>
        <JaleoExperience clientSlug={slug} />
      </div>
    );
  }
  if (slug === 'moloss') {
    return (
      <div className="relative">
        <Link
          href={exitHref}
          className="fixed bottom-6 right-6 z-[2147483647] rounded-full bg-black/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-black md:bottom-8 md:right-8"
        >
          Exit demo
        </Link>
        <MolossExperience locale={locale} clientSlug={slug} />
      </div>
    );
  }

  return (
    <div className="relative">
      <Link
        href={exitHref}
        className="fixed top-4 right-4 z-[2147483647] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg backdrop-blur hover:bg-white"
      >
        Exit demo
      </Link>
      <DemoExperience clientSlug={slug} brandName={brandName} payload={payload} />
    </div>
  );
}
