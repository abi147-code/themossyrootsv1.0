"use client";

import Button from "./Button";
import Section from "./Section";
import DotGrid from "../DotGrid";

export default function FinalCta() {
  return (
    <Section className="bg-porcelain py-32 md:py-40">
      <style>
        {`
          @keyframes cta-glow-strong {
            0%, 100% { text-shadow: 0 0 12px rgba(31,122,77,0.28), 0 0 24px rgba(31,122,77,0.2), 0 0 36px rgba(31,122,77,0.18); }
            50% { text-shadow: 0 0 18px rgba(31,122,77,0.34), 0 0 32px rgba(31,122,77,0.26), 0 0 46px rgba(31,122,77,0.22); }
          }
          @keyframes cta-glow-soft {
            0%, 100% { text-shadow: 0 0 8px rgba(31,122,77,0.24), 0 0 16px rgba(31,122,77,0.16); }
            50% { text-shadow: 0 0 12px rgba(31,122,77,0.28), 0 0 22px rgba(31,122,77,0.2); }
          }
          .cta-glow-strong { animation: cta-glow-strong 3.5s ease-in-out infinite; }
          .cta-glow-soft { animation: cta-glow-soft 4s ease-in-out infinite; }
        `}
      </style>
      <div className="relative rounded-3xl p-8 md:p-24 text-center overflow-hidden shadow-2xl bg-white/80 backdrop-blur-2xl border border-white/40">
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light" aria-hidden="true">
          <DotGrid
            dotSize={10}
            gap={30}
            baseColor="#1f7a4d"
            activeColor="#d9a441"
            proximity={140}
            className="w-full h-full"
            style={{ filter: "saturate(1.1) brightness(1.08)" }}
          />
        </div>

        <div className="relative z-10">
          <h2
            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight drop-shadow-lg cta-glow-strong"
            style={{ color: "#f8f9fb" }}
          >
            Every invoice is a <br />
            marketing opportunity.
          </h2>

          <div
            className="space-y-2 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow cta-glow-soft"
            style={{ color: "#0f172a" }}
          >
            <p>Don&apos;t send another dead-end PDF.</p>
            <p>Start sending invoices that convert today.</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
              <Button
                href="/dashboard/invoice-generator"
                size="lg"
                className="w-full sm:w-auto px-10 !bg-moss !text-white hover:!bg-moss-hover hover:!scale-105 transition-all duration-300"
              >
                Early access to the editor
              </Button>
            </div>
            <p className="text-sm italic font-medium drop-shadow-sm" style={{ color: "#0f172a" }}>
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
