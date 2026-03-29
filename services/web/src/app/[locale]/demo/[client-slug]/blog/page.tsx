import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MolossExperience from '../moloss/DemoExperience';
import LockedView from '../LockedView';
import { getDemoConfig } from '@/lib/demo-config';
import { prefixPathWithLocale } from '@/lib/locale-shared';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

type DemoBlogPageParams = {
  params: {
    locale?: string;
    'client-slug': string;
  };
};

export default function DemoBlogPage({ params }: DemoBlogPageParams) {
  const slug = params['client-slug'];
  const locale = params.locale ?? 'en';
  const demoConfig = getDemoConfig(slug);
  const exitHref = prefixPathWithLocale(locale, '/demo');

  if (!demoConfig || slug !== 'moloss') {
    return notFound();
  }

  const cookieName = `demo_access_granted_${slug}`;
  const cookieStore = cookies();
  const isUnlocked = cookieStore.get(cookieName)?.value === slug;

  return (
    <main className="min-h-screen bg-black text-white">
      {isUnlocked ? (
        <div className="relative">
          <Link
            href={exitHref}
            className="fixed bottom-6 right-6 z-[2147483647] rounded-full bg-black/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-black md:bottom-8 md:right-8"
          >
            Exit demo
          </Link>
          <MolossExperience locale={locale} clientSlug={slug} view="blog" />
        </div>
      ) : (
        <LockedView clientSlug={slug} brandName={demoConfig.displayName} />
      )}
    </main>
  );
}
