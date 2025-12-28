"use client";

import { motion } from "framer-motion";
import Button from "./Button";
import Section from "./Section";

export default function FinalCta() {
  return (
    <Section className="bg-porcelain py-32 md:py-40">
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl p-8 md:p-24 text-center overflow-hidden shadow-2xl group"
        style={{
          background: "linear-gradient(135deg, #022c22 0%, #14532d 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-gold/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
        />

        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-md">
            Every invoice is a <br />
            marketing opportunity.
          </h2>

          <div className="space-y-2 text-xl text-green-50/90 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            <p>Don&apos;t send another dead-end PDF.</p>
            <p>Start sending invoices that convert today.</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
              <Button
                href="/dashboard/invoice-generator"
                size="lg"
                className="w-full sm:w-auto px-10 !bg-white/10 !backdrop-blur-md !border !border-white/40 !text-white hover:!bg-white/20 hover:!scale-105 hover:!border-white/60 transition-all duration-300 !shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                Early access to the editor
              </Button>
            </div>
            <p className="text-sm text-green-100/40 italic font-medium">No credit card required</p>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
