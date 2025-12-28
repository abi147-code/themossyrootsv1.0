"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Frown, X, XCircle } from "lucide-react";
import Section from "./Section";

export default function Problem() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <Section className="bg-sand border-t border-slate-200">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-ink">
          The problem with <br />
          <span className="text-ink-sec opacity-60">traditional invoices</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-sec/70">Traditional</div>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-xl md:shadow-2xl">
                  <img
                    src="/invoice landing page/normal-invoice.jpg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-auto object-contain md:max-h-[80vh]"
                  />
                </div>
              </div>

              <div className="my-4 flex items-center justify-center md:my-0">
                <ArrowRight className="hidden h-12 w-12 text-moss md:block" aria-hidden="true" />
                <ArrowDown className="h-12 w-12 text-moss md:hidden" aria-hidden="true" />
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-sec/70">Invoice created using the TMR invoice tool</div>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-xl md:shadow-2xl">
                  <img
                    src="/invoice landing page/tem.jpg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-auto object-contain md:max-h-[80vh]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="space-y-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="flex items-start gap-4 group cursor-default">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="p-2 bg-red-100 rounded-lg text-red-600 mt-1 transition-colors group-hover:bg-red-600 group-hover:text-white"
              >
                <XCircle size={24} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-red-600 transition-colors">They don&apos;t sell.</h3>
                <p className="text-ink-sec">Static PDFs that end the conversation.</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-start gap-4 group cursor-default">
              <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                className="p-2 bg-red-100 rounded-lg text-red-600 mt-1 transition-colors group-hover:bg-red-600 group-hover:text-white"
              >
                <Frown size={24} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-red-600 transition-colors">They don&apos;t inform.</h3>
                <p className="text-ink-sec">No context, no upsell opportunities.</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-start gap-4 group cursor-default">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="p-2 bg-red-100 rounded-lg text-red-600 mt-1 transition-colors group-hover:bg-red-600 group-hover:text-white"
              >
                <X size={24} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-red-600 transition-colors">They don&apos;t convert.</h3>
                <p className="text-ink-sec">A missed opportunity in every transaction.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-moss/10 to-gold/10 rounded-2xl blur-2xl animate-pulse" />
          <motion.div className="relative bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-lg" whileHover={{ y: -5 }}>
            <blockquote className="text-2xl md:text-3xl font-medium text-ink italic leading-relaxed">
              &ldquo;Invoices should work like landing pages.&rdquo;
            </blockquote>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
