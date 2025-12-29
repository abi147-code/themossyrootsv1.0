"use client";

import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import Button from "./Button";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-porcelain text-ink"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 lg:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(31, 122, 77, 0.08),
                transparent 80%
              )
            `,
          }}
        />
      </div>

      <motion.div style={{ y: y1, opacity }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-moss/5 rounded-full blur-[120px] mix-blend-multiply" />
      <motion.div style={{ y: y2, opacity }} className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] mix-blend-multiply" />

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-ink mb-6 leading-tight">
            Invoices that <br className="hidden md:block" />
            <span className="relative inline-block whitespace-nowrap">
              <span className="absolute -inset-2 bg-gradient-to-r from-moss-light to-gold-soft blur-2xl opacity-40 animate-pulse"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-moss via-gold to-moss animate-gradient-x bg-[length:200%_auto]">
                convert.
              </span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-ink-sec max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Turn every invoice into a revenue-generating touchpoint — with built-in marketing, smart CTAs, and click tracking.
        </motion.p>

        <div className="mt-16 mb-12 relative flex flex-col items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-moss/10 via-gold/10 to-moss/10 blur-[60px] rounded-full pointer-events-none" />

          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-medium text-ink-sec leading-snug flex flex-col md:block items-center justify-center gap-2">
              <span className="opacity-70">Traditional invoices ask for payment</span>
              <span className="hidden md:inline mx-3 opacity-40">—</span>
              <span className="font-black text-ink drop-shadow-sm md:inline-block">
                This one <span className="text-transparent bg-clip-text bg-gradient-to-r from-moss to-gold">drives action.</span>
              </span>
            </h2>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-ink-sec max-w-2xl mx-auto mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <strong className="text-moss font-bold">Invoices that convert</strong> let you embed marketing directly inside your invoice.
          </motion.p>
        </div>

        <motion.p
          className="text-sm font-semibold tracking-wide text-moss uppercase pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Built for freelancers, agencies, and modern businesses that want more from every invoice.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button href="/dashboard/invoice-generator" size="lg" className="w-full sm:w-auto !text-white">
            Early access to the editor
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-porcelain to-transparent pointer-events-none z-10"></div>
    </section>
  );
}
