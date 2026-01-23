import { type Metadata } from 'next';
import { resolveLocale } from '@/lib/locale';
import { getDictionary } from '@/i18n/get-dictionary';
import DemoGateway from './DemoGateway';

type DemoLandingPageParams = {
  params: {
    locale?: string;
  };
};

export async function generateMetadata({
  params,
}: DemoLandingPageParams): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.demoPage.metaTitle,
    description: dictionary.demoPage.metaDescription,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DemoLandingPage({
  params,
}: DemoLandingPageParams) {
  const locale = resolveLocale(params.locale);
  const dictionary = await getDictionary(locale);
  const { demoPage } = dictionary;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <p className="text-xs uppercase tracking-[0.6em] text-white/50">{demoPage.label}</p>
        <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">{demoPage.title}</h1>
        <p className="text-lg text-white/70">{demoPage.subtitle}</p>
        <DemoGateway
          locale={locale}
          formLabel={demoPage.formLabel}
          placeholder={demoPage.placeholder}
          submitLabel={demoPage.submitLabel}
        />
        <div className="space-y-1 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
          <p className="uppercase tracking-[0.3em] text-[0.65rem] text-white/50">
            {demoPage.instructionsTitle}
          </p>
          {demoPage.instructions.map((instruction) => (
            <p key={instruction}>{instruction}</p>
          ))}
        </div>
        <p className="max-w-xl text-sm text-white/50">{demoPage.contact}</p>
      </section>
    </main>
  );
}
