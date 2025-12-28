"use client";

import { useRef } from "react";
import { Check, Globe2, Layers, MonitorOff } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  accentColor: string;
  accentBg: string;
  delay: number;
};

function TiltCard({ icon: Icon, title, description, accentColor, accentBg, delay }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const bgX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, type: "spring" }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          backgroundPosition: `${bgX.get()} ${bgY.get()}`,
        }}
        className="relative h-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl transition-shadow duration-300 group overflow-hidden"
      >
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
            accentColor === "text-blue-600" ? "from-blue-500" : accentColor === "text-gold" ? "from-gold" : "from-moss"
          } to-transparent`}
        />

        <motion.div
          style={{ transform: "translateZ(50px)" }}
          className={`w-14 h-14 ${accentBg} rounded-xl flex items-center justify-center ${accentColor} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
        >
          <Icon size={28} />
        </motion.div>

        <motion.h3 style={{ transform: "translateZ(30px)" }} className="text-xl font-bold text-ink mb-3">
          {title}
        </motion.h3>

        <motion.p style={{ transform: "translateZ(20px)" }} className="text-ink-sec leading-relaxed">
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function Differentiator() {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-porcelain">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
          alt="Abstract Earth Background"
          className="w-full h-full object-cover opacity-20 mix-blend-multiply blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-porcelain via-transparent to-porcelain" />
        <div className="absolute inset-0 bg-gradient-to-r from-porcelain via-transparent to-porcelain opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-ink mb-6"
          >
            What makes this different <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-moss to-gold">(and world-first)</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
          <TiltCard
            icon={Globe2}
            title="First Invoice System"
            description={
              <>
                The <strong className="text-blue-600">first invoice system</strong> designed primarily for conversion, not just collection.
              </>
            }
            accentColor="text-blue-600"
            accentBg="bg-blue-50"
            delay={0}
          />
          <TiltCard
            icon={Layers}
            title="Inside the Invoice"
            description={
              <>
                Marketing capabilities embedded <strong className="text-gold">inside the invoice itself</strong>.
              </>
            }
            accentColor="text-gold"
            accentBg="bg-gold-light"
            delay={0.2}
          />
          <TiltCard
            icon={MonitorOff}
            title="No Plugins Needed"
            description={
              <>
                Works <strong className="text-moss">without pixels, plugins, or external landing pages</strong>.
              </>
            }
            accentColor="text-moss"
            accentBg="bg-moss-light"
            delay={0.4}
          />
        </div>

        <div className="mt-20 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-moss via-gold to-moss opacity-50" />

            <div className="text-center mb-8">
              <p className="text-lg text-ink-sec font-medium">Your invoice transforms into:</p>
            </div>

            <div className="grid gap-4 md:gap-6">
              {[
                { label: "A Professional Portfolio", color: "bg-moss" },
                { label: "A Dynamic Upsell Page", color: "bg-gold" },
                { label: "A Secure Client Portal", color: "bg-blue-500" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.15, type: "spring" }}
                  whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white/60 hover:border-slate-300 transition-all cursor-default group"
                >
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-ink">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-moss/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
