"use client";

import { useRef } from "react";
import { BarChart3, Globe, Mail, Palette } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

type FeatureItem = {
  icon: React.ElementType;
  title: string;
  items: string[];
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

const featuresData: FeatureItem[] = [
  {
    icon: Palette,
    title: "Design & branding",
    items: ["Match your site's fonts, colors, and layout", "Add logos, banners, and backgrounds safely", "Keep totals and line items crystal clear"],
    colorClass: "bg-moss-light text-moss group-hover:bg-moss group-hover:text-white",
    bgClass: "bg-moss/5",
    borderClass: "hover:border-moss/30",
  },
  {
    icon: Mail,
    title: "Payments & sending",
    items: ["Send branded email + PDF together", "Put payment CTAs front and center", "Deliver from your dashboard, instantly"],
    colorClass: "bg-gold-light text-gold group-hover:bg-gold group-hover:text-white",
    bgClass: "bg-gold/5",
    borderClass: "hover:border-gold/30",
  },
  {
    icon: BarChart3,
    title: "Tracking & history",
    items: ["See which CTAs get clicked", "Save every send in the history section", "Spot what offers perform best"],
    colorClass: "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white",
    bgClass: "bg-blue-50",
    borderClass: "hover:border-blue-400/30",
  },
  {
    icon: Globe,
    title: "Global & smart",
    items: ["Multi-currency and tax-ready", "Reuse campaigns across invoices", "Responsive on any device"],
    colorClass: "bg-moss-light text-moss group-hover:bg-moss group-hover:text-white",
    bgClass: "bg-moss/5",
    borderClass: "hover:border-moss/30",
  },
];

function FeatureCard({ icon: Icon, title, items, colorClass, bgClass, borderClass }: FeatureItem) {
  return (
    <div className={`group bg-white p-6 md:p-8 rounded-3xl border border-slate-200 ${borderClass} transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg h-full`}>
      <div className={`absolute inset-0 ${bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${colorClass}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-ink">{title}</h3>
      </div>
      <ul className="space-y-3 text-ink-sec pl-2 relative z-10 text-sm md:text-base">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full mt-2 group-hover:scale-150 transition-transform bg-current opacity-60 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const gridY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  const card1Opacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const card1Y = useTransform(scrollYProgress, [0.1, 0.25], [40, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.25, 0.4], [40, 0]);
  const card3Opacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.4, 0.55], [40, 0]);
  const card4Opacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const card4Y = useTransform(scrollYProgress, [0.55, 0.7], [40, 0]);

  const cards = [
    { y: card1Y, opacity: card1Opacity },
    { y: card2Y, opacity: card2Opacity },
    { y: card3Y, opacity: card3Opacity },
    { y: card4Y, opacity: card4Opacity },
  ];

  return (
    <>
      <div ref={containerRef} className="hidden lg:block relative h-[300vh] bg-porcelain">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ y: titleY, scale: titleScale }}
            className="text-center z-20 mb-8 absolute top-[15vh]"
          >
            <h2 className="text-6xl font-bold text-ink mb-6">What you can do</h2>
            <p className="text-2xl text-ink-sec max-w-2xl mx-auto font-light">Powering your business with every invoice sent.</p>
          </motion.div>

          <motion.div style={{ y: gridY }} className="grid grid-cols-2 gap-6 w-full max-w-5xl relative z-10 mt-[20vh]">
            {featuresData.map((feature, index) => (
              <motion.div key={index} style={{ y: cards[index].y, opacity: cards[index].opacity }} className="h-full">
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-ink-sec/50 flex flex-col items-center gap-2">
            <span className="text-sm uppercase tracking-widest">Scroll to explore</span>
            <div className="w-1 h-8 rounded-full bg-slate-200 overflow-hidden">
              <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-full h-1/2 bg-moss" />
            </div>
          </motion.div>
        </div>
      </div>

      <section className="lg:hidden py-24 px-4 bg-porcelain border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ink mb-4">What you can do</h2>
          <p className="text-lg text-ink-sec">Everything you need to turn billing into business growth.</p>
        </div>
        <div className="space-y-6 max-w-md mx-auto">
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
