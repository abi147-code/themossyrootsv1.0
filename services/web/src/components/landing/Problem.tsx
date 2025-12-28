"use client";

import { motion } from "framer-motion";
import { Frown, X, XCircle } from "lucide-react";
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
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-ink mb-8">
            The problem with <br />
            <span className="text-ink-sec opacity-60">traditional invoices</span>
          </h2>

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
