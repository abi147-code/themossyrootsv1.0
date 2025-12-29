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
            0%, 100% { text-shadow: 0 0 12px rgba(255,255,255,0.25), 0 0 24px rgba(56,189,248,0.18), 0 0 36px rgba(52,211,153,0.16); }
            50% { text-shadow: 0 0 18px rgba(255,255,255,0.3), 0 0 32px rgba(56,189,248,0.26), 0 0 46px rgba(52,211,153,0.2); }
          }
          @keyframes cta-glow-soft {
            0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.15), 0 0 16px rgba(56,189,248,0.12); }
            50% { text-shadow: 0 0 12px rgba(255,255,255,0.2), 0 0 22px rgba(56,189,248,0.18); }
          }
          .cta-glow-strong { animation: cta-glow-strong 3.5s ease-in-out infinite; }
          .cta-glow-soft { animation: cta-glow-soft 4s ease-in-out infinite; }
        `}
      </style>
      <div className="relative rounded-3xl p-8 md:p-24 text-center overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
          <DotGrid
            dotSize={10}
            gap={30}
            baseColor="#1f2937"
            activeColor="#34d399"
            proximity={140}
            className="w-full h-full"
            style={{ filter: "brightness(1.4)" }}
          />
        </div>

        <div className="relative z-10">
          <h2
            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight drop-shadow-lg cta-glow-strong"
            style={{ color: "#fff" }}
          >
            Every invoice is a <br />
            marketing opportunity.
          </h2>

          <div
            className="space-y-2 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow cta-glow-soft"
            style={{ color: "#fff" }}
          >
            <p>Don&apos;t send another dead-end PDF.</p>
            <p>Start sending invoices that convert today.</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
              <Button
                href="/dashboard/invoice-generator"
                size="lg"
                className="w-full sm:w-auto px-10 !bg-white/15 !text-white hover:!bg-white/25 hover:!scale-105 transition-all duration-300 !border !border-white/30"
              >
                Early access to the editor
              </Button>
            </div>
            <p className="text-sm italic font-medium drop-shadow-sm" style={{ color: "#fff" }}>
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
