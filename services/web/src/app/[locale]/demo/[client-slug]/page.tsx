import { cookies } from 'next/headers';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import LockedView from './LockedView';
import DemoClientLoader from './DemoClientLoader';
import { getDemoConfig } from '@/lib/demo-config';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

type DemoPageParams = {
  params: {
    locale?: string;
    'client-slug': string;
  };
};

export async function generateMetadata({ params }: DemoPageParams): Promise<Metadata> {
  const { 'client-slug': slug } = params;
  const demoConfig = getDemoConfig(slug);

  if (!demoConfig) {
    return {
      title: 'Demo not found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${demoConfig.displayName} Demo`,
    description: `Private demo preview for ${demoConfig.displayName}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function DemoPage({ params }: { params: DemoPageParams['params'] }) {
  const slug = params['client-slug'];
  const locale = params.locale ?? 'en';
  const demoConfig = getDemoConfig(slug);

  if (!demoConfig) {
    return notFound();
  }

  const cookieName = `demo_access_granted_${slug}`;
  const cookieStore = cookies();
  const isUnlocked = cookieStore.get(cookieName)?.value === slug;

  return (
    <main className="min-h-screen bg-black text-white">
      {isUnlocked ? (
        <DemoClientLoader
          slug={slug}
          brandName={demoConfig.displayName}
          payload={demoConfig.payload}
          locale={locale}
        />
      ) : (
        <LockedView clientSlug={slug} brandName={demoConfig.displayName} />
      )}
    </main>
  );
}
