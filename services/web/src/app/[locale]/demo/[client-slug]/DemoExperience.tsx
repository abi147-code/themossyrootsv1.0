'use client';

import { useEffect, useMemo, useRef } from 'react';
import { DemoPayload } from '@/lib/demo-config';
import { getDeviceType, pushDemoEvent } from '@/lib/demo-events';

type DemoExperienceProps = {
  clientSlug: string;
  brandName: string;
  payload: DemoPayload;
};

const scrollThresholds = [25, 50, 75] as const;

export default function DemoExperience({ clientSlug, brandName, payload }: DemoExperienceProps) {
  const firedThresholds = useRef(new Set<number>());

  useEffect(() => {
    pushDemoEvent('demo_page_view', {
      client_slug: clientSlug,
      device_type: getDeviceType(),
    });
  }, [clientSlug]);

  useEffect(() => {
    firedThresholds.current = new Set();
    const handleScroll = () => {
      const depth =
        Math.min(
          100,
          Math.round(
            ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
          )
        ) || 0;

      scrollThresholds.forEach((threshold) => {
        if (depth >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          pushDemoEvent('demo_engagement', { client_slug: clientSlug, scroll_depth: threshold });
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [clientSlug]);

  const contactButtons = useMemo(
    () =>
      payload.contactIntent.map((contact) => (
        <button
          key={contact.label}
          type="button"
          onClick={() => {
            pushDemoEvent('demo_contact_intent', {
              client_slug: clientSlug,
              channel: contact.channel,
            });
            window.location.href = contact.link;
          }}
          className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
        >
          {contact.label}
        </button>
      )),
    [clientSlug, payload.contactIntent]
  );

  return (
    <div className="min-h-screen bg-[#030304] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-14 px-6 py-16">
        <section className="space-y-6">
          {payload.heroTagline && (
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{payload.heroTagline}</p>
          )}
          <h1 className="text-4xl font-semibold leading-[1.1] md:text-6xl">{payload.heroTitle}</h1>
          <p className="max-w-3xl text-lg text-white/70">{payload.heroSubtitle}</p>
          <div className="flex flex-wrap gap-6">
            {payload.highlightStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-white">{stat.value}</span>
                <span className="text-sm uppercase tracking-[0.3em] text-white/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <p
            className="w-fit rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.3em]"
            style={{ color: payload.accentColor }}
          >
            Private preview
          </p>
        </section>

        <section className="space-y-12">
          {payload.sections.map((section) => (
            <div
              key={section.title}
              className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur"
            >
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="text-lg text-white/70">{section.body}</p>
              {section.bullets && (
                <ul className="space-y-1 pl-4 text-sm text-white/60">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        <footer className="mt-auto rounded-3xl border border-white/20 bg-gradient-to-b from-white/5 to-white/0 p-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">Need to follow up?</p>
            <h3 className="text-3xl font-semibold">Connect with {brandName}</h3>
            <p className="text-white/70">{payload.heroSupport}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">{contactButtons}</div>
        </footer>
      </div>
    </div>
  );
}
