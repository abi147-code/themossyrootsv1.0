"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, TrendingUp } from "lucide-react";

export default function Impact() {
  return (
    <section className="bg-sand border-t border-slate-200 relative overflow-hidden py-24 md:py-32">
      <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-white/50 via-white/20 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="space-y-10 order-2 lg:order-1 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl md:text-6xl font-bold text-ink mb-8">The business impact</h2>
              <div className="space-y-6 text-lg md:text-xl text-ink-sec leading-relaxed font-light">
                <p>Most businesses treat invoices as admin. Successful businesses treat them as assets.</p>
                <p>By switching to a conversion-focused invoice, you change the relationship from transactional to relational.</p>
              </div>
            </motion.div>

            <ul className="space-y-4">
              {["Increase recurring revenue", "Reduce late payments", "Upsell existing clients effortlessly", "Professionalize your brand instantly", "Turn admin time into marketing time"].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/60 shadow-sm hover:bg-white hover:shadow-md hover:border-moss/20 transition-all duration-300 group cursor-default"
                >
                  <div className="p-2 bg-moss/10 rounded-full group-hover:bg-moss group-hover:text-white transition-colors duration-300 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-moss group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-ink font-medium text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="p-8 bg-gradient-to-br from-moss to-moss-hover rounded-2xl shadow-xl text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
                <TrendingUp size={120} />
              </div>
              <p className="text-xl md:text-2xl font-medium italic relative z-10 leading-relaxed">
                &ldquo;Every invoice does more than request money — it builds momentum.&rdquo;
              </p>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 relative lg:-mr-24 xl:-mr-32">
            <motion.div
              animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gold/20 rounded-full blur-[80px] z-0 mix-blend-multiply"
            />
            <motion.div
              animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-moss/10 rounded-full blur-[80px] z-0 mix-blend-multiply"
            />

            <motion.div
              initial={{ opacity: 0, x: 100, rotate: -2 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-500 group"
            >
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                alt="Business team analyzing results"
                className="w-full h-auto object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-8 left-8 right-8 p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-semibold text-ink-sec mb-1 uppercase tracking-wider">Net Revenue</p>
                    <h4 className="text-3xl md:text-5xl font-bold text-ink">$124,500</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-moss font-bold bg-moss/10 px-3 py-1 rounded-full text-sm mb-1">
                      <TrendingUp size={16} />
                      <span>+18.4%</span>
                    </div>
                    <span className="text-xs text-ink-sec">vs last month</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="absolute -top-10 -left-10 z-20 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 hidden lg:block"
            >
              <ArrowUpRight className="w-10 h-10 text-moss" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
