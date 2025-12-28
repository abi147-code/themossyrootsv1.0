"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

export default function AiAssistant() {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-porcelain">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract Liquid Light"
          className="w-full h-full object-cover opacity-60 mix-blend-multiply saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-porcelain/90 via-porcelain/40 to-porcelain" />
        <div className="absolute inset-0 bg-gradient-to-r from-porcelain/80 via-transparent to-porcelain/80" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto"
      >
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gold/20 mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles size={32} />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-ink mb-6 tracking-tight">Built-in AI marketing assistant</h2>
          <p className="text-xl md:text-2xl text-ink-sec font-light max-w-2xl">Want to turn a boring invoice into a sales machine?</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-moss/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between relative z-10">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Input</h3>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-xl border border-slate-100 text-ink transition-colors shadow-sm">
                <span className="text-slate-400 mr-2">&gt;</span> Client Name &amp; Industry
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-xl border border-slate-100 text-ink transition-colors shadow-sm">
                <span className="text-slate-400 mr-2">&gt;</span> Project Details
              </motion.div>
            </motion.div>

            <div className="flex flex-col items-center justify-center text-gold relative py-4 md:py-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                whileInView={{ height: 60, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-gold to-gold/20 h-16 absolute top-0 -translate-y-full"
              />

              <div className="relative">
                <div className="absolute inset-0 bg-gold blur-xl opacity-20 animate-pulse" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center bg-white backdrop-blur-md text-gold relative z-10 shadow-lg"
                >
                  <ArrowDown className="md:-rotate-90 w-6 h-6" />
                </motion.div>
              </div>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                whileInView={{ height: 60, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden md:block w-[1px] bg-gradient-to-t from-transparent via-gold to-gold/20 h-16 absolute bottom-0 translate-y-full"
              />
            </div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 justify-end md:justify-start">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <h3 className="text-sm uppercase tracking-widest text-gold-600 font-semibold">AI Output</h3>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-gold-light/50 to-white p-5 rounded-xl border border-gold/20 text-gold-600 cursor-default shadow-[0_4px_20px_rgba(217,164,65,0.08)]"
              >
                <span className="text-gold mr-2">•</span> Personalized Upsell Message
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-gold-light/50 to-white p-5 rounded-xl border border-gold/20 text-gold-600 cursor-default shadow-[0_4px_20px_rgba(217,164,65,0.08)]"
              >
                <span className="text-gold mr-2">•</span> Strategic Call-to-Action
              </motion.div>
            </motion.div>
          </div>

          <div className="mt-16 text-center border-t border-slate-100 pt-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-lg md:text-xl text-ink-sec font-light"
            >
              It acts as your <strong className="text-ink font-medium">silent salesperson</strong>.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
