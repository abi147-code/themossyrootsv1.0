"use client";

import { motion } from "framer-motion";
import { EyeOff, Lock, Server, ShieldCheck } from "lucide-react";
import Section from "./Section";

export default function Trust() {
  return (
    <Section className="bg-porcelain border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-ink mb-12 text-center">Built for trust and privacy</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div whileHover={{ x: 5, backgroundColor: "#f1f5f9" }} className="flex gap-4 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-default">
            <ShieldCheck className="w-8 h-8 text-moss shrink-0" />
            <div>
              <h4 className="text-ink font-semibold mb-1">Secure by Design</h4>
              <p className="text-sm text-ink-sec">Industry standard encryption for all data.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ x: 5, backgroundColor: "#f1f5f9" }} className="flex gap-4 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-default">
            <Lock className="w-8 h-8 text-moss shrink-0" />
            <div>
              <h4 className="text-ink font-semibold mb-1">GDPR Compliant</h4>
              <p className="text-sm text-ink-sec">Your data rights and privacy fully respected.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ x: 5, backgroundColor: "#f1f5f9" }} className="flex gap-4 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-default">
            <EyeOff className="w-8 h-8 text-moss shrink-0" />
            <div>
              <h4 className="text-ink font-semibold mb-1">Private</h4>
              <p className="text-sm text-ink-sec">We do not sell your data. Ever.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ x: 5, backgroundColor: "#f1f5f9" }} className="flex gap-4 p-4 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-default">
            <Server className="w-8 h-8 text-moss shrink-0" />
            <div>
              <h4 className="text-ink font-semibold mb-1">Reliable</h4>
              <p className="text-sm text-ink-sec">99.9% Uptime SLA for enterprise reliability.</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-ink-sec text-sm">We believe in transparency. Your financial data is yours alone.</p>
        </div>
      </div>
    </Section>
  );
}
