"use client";

import { motion } from "framer-motion";
import { Briefcase, Building2, Users } from "lucide-react";
import Section from "./Section";

export default function TargetUsers() {
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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  };

  const targets = [
    {
      title: "Freelancers",
      description: "Who need to upsell their next project automatically.",
      icon: Users,
      image: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?q=80&w=2069&auto=format&fit=crop",
      iconColor: "text-moss",
      bgHover: "hover:border-moss/50",
    },
    {
      title: "Agencies",
      description: "Who want to showcase their portfolio with every bill.",
      icon: Briefcase,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
      iconColor: "text-gold",
      bgHover: "hover:border-gold/50",
    },
    {
      title: "Modern Businesses",
      description: "Who value brand consistency and customer experience.",
      icon: Building2,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
      iconColor: "text-blue-600",
      bgHover: "hover:border-blue-400/50",
    },
  ];

  return (
    <Section className="bg-porcelain">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-ink mb-6">Who this is for</h2>
        <p className="text-xl text-ink-sec">If you send invoices, this works for you.</p>
      </div>

      <motion.div
        className="grid md:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {targets.map((target) => (
          <motion.div
            key={target.title}
            variants={item}
            whileHover={{ y: -10 }}
            className={`bg-white rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl group ${target.bgHover}`}
          >
            <div className="h-56 relative overflow-hidden">
              <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <img src={target.image} alt={target.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-6 right-8 p-4 bg-white rounded-2xl shadow-lg z-20 border border-slate-100 group-hover:scale-110 transition-transform duration-300 delay-100">
                <target.icon size={28} className={target.iconColor} />
              </div>
            </div>

            <div className="pt-10 pb-8 px-8">
              <h3 className="text-2xl font-bold text-ink mb-3 group-hover:translate-x-1 transition-transform">{target.title}</h3>
              <p className="text-ink-sec leading-relaxed font-light">{target.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
