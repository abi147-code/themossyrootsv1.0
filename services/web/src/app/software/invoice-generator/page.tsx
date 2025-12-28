import type { Metadata } from "next";
import AiAssistant from "@/components/landing/AiAssistant";
import Differentiator from "@/components/landing/Differentiator";
import Features from "@/components/landing/Features";
import FinalCta from "@/components/landing/FinalCta";
import Hero from "@/components/landing/Hero";
import Impact from "@/components/landing/Impact";
import Problem from "@/components/landing/Problem";
import TargetUsers from "@/components/landing/TargetUsers";
import Trust from "@/components/landing/Trust";

export const metadata: Metadata = {
  title: "Invoices that convert | Marketing Invoice Generator",
  description: "Turn every invoice into a revenue-generating touchpoint with built-in marketing, smart CTAs, and click tracking.",
  alternates: {
    canonical: "https://themossyroots.com/software/invoice-generator",
  },
  openGraph: {
    title: "Invoices that convert | Marketing Invoice Generator",
    description: "Embed marketing directly inside your invoices-banners, CTAs, tracking-without plugins or landing pages.",
    url: "https://themossyroots.com/software/invoice-generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoices that convert",
    description: "Turn every invoice into a revenue-generating touchpoint with built-in marketing, smart CTAs, and click tracking.",
  },
};

export default function InvoiceGeneratorLandingPage() {
  return (
    <main className="bg-porcelain min-h-screen text-ink selection:bg-moss selection:text-white">
      <Hero />
      <Problem />
      <Differentiator />
      <Features />
      <AiAssistant />
      <Impact />
      <TargetUsers />
      <Trust />
      <FinalCta />

      <footer className="bg-porcelain py-8 border-t border-slate-200 text-center text-ink-sec text-sm">
        <p>&copy; {new Date().getFullYear()} Invoices That Convert. All rights reserved.</p>
      </footer>
    </main>
  );
}
