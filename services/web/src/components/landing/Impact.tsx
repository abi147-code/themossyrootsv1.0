"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Impact() {
  const invoices = [
    { src: "/invoice landing page/Freelance.jpg", alt: "Freelance invoice preview" },
    { src: "/invoice landing page/tem.jpg", alt: "TEM invoice preview" },
    { src: "/invoice landing page/ZOHO.jpg", alt: "Zoho invoice preview" },
  ];

  const [focused, setFocused] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(null);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocused(prev => {
          if (prev === null) return 0;
          return (prev + 1) % invoices.length;
        });
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocused(prev => {
          if (prev === null) return invoices.length - 1;
          return (prev - 1 + invoices.length) % invoices.length;
        });
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [invoices.length]);

  useEffect(() => {
    if (focused === null) return;
    const handleClickAway = (e: MouseEvent) => {
      if (stackRef.current && !stackRef.current.contains(e.target as Node)) {
        setFocused(null);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [focused]);

  const stackConfig = [
    { top: "lg:top-0", rotation: "lg:-rotate-7", z: "lg:z-30" },
    { top: "lg:top-28", rotation: "lg:rotate-3", z: "lg:z-20" },
    { top: "lg:top-56", rotation: "lg:-rotate-3", z: "lg:z-10" },
  ];

  return (
    <section className="bg-sand border-t border-slate-200 relative overflow-hidden py-24 md:py-32">
      <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-white/50 via-white/20 to-transparent pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        {focused !== null && <div className="pointer-events-none fixed inset-0 bg-ink/60 backdrop-blur-sm z-20" />}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="space-y-10 max-w-3xl">
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
              className="p-8 rounded-2xl shadow-xl text-ink relative overflow-hidden group border border-white/30 bg-white/15 backdrop-blur-lg"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-30%] bg-gradient-to-r from-moss/30 via-gold/25 to-ink/20 blur-3xl opacity-70"
                animate={{ x: ["-10%", "10%", "-10%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <p className="text-xl md:text-2xl font-medium italic relative z-10 leading-relaxed text-ink">
                &ldquo;Every invoice does more than request money — it builds momentum.&rdquo;
              </p>
            </motion.div>
          </div>

          <div
            className="order-2 lg:order-2 relative lg:h-[760px]"
            ref={stackRef}
            onTouchStart={e => {
              const t = e.touches[0];
              touchStartRef.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={e => {
              if (!touchStartRef.current) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - touchStartRef.current.x;
              const dy = t.clientY - touchStartRef.current.y;
              touchStartRef.current = null;
              if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
              setFocused(prev => {
                if (dx < 0) {
                  if (prev === null) return 0;
                  return (prev + 1) % invoices.length;
                } else {
                  if (prev === null) return invoices.length - 1;
                  return (prev - 1 + invoices.length) % invoices.length;
                }
              });
            }}
          >
            <div className="flex flex-col gap-6 lg:block lg:h-full">
              {invoices.map((image, idx) => {
                const isFocused = focused === idx;
                const isHovered = hovered === idx;
                const slot = ((idx - (focused ?? 0)) + invoices.length) % invoices.length;
                const stack = stackConfig[slot] ?? stackConfig[stackConfig.length - 1];
                const isDisabled = focused !== null && !isFocused;
                const baseClasses = [
                  "relative w-full",
                  "rounded-2xl overflow-hidden",
                  "transition-transform transition-opacity ease-out",
                  isFocused ? "duration-500" : "duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-sand",
                  "bg-transparent",
                  "lg:absolute lg:left-1/2 lg:-translate-x-1/2",
                  stack.top,
                  stack.z,
                  isFocused ? "z-50" : "",
                  isDisabled ? "cursor-not-allowed" : "cursor-pointer",
                ]
                  .filter(Boolean)
                  .join(" ");

                const rotationClass = isFocused ? "lg:rotate-0" : stack.rotation;
                const focusTransform = isFocused ? "scale-105 lg:scale-110 -translate-y-4 lg:-translate-y-6" : "";
                const hoverTransform = !isFocused && !isDisabled ? "hover:-translate-y-2 hover:scale-[1.03] lg:hover:scale-[1.05]" : "";
                const liftTransform = !isFocused && !isDisabled && isHovered ? "-translate-y-2 scale-[1.03] lg:scale-[1.05] lg:rotate-0" : "";
                const stackedScale = !isFocused ? "lg:scale-[0.96]" : "";
                const nonFocusedState = isDisabled ? "opacity-50" : "opacity-100";

                return (
                  <button
                    key={image.src}
                    type="button"
                    className={`${baseClasses} ${rotationClass} ${stackedScale} ${nonFocusedState} ${focusTransform} ${hoverTransform} ${liftTransform}`}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    style={{ touchAction: "pan-y" }}
                  onMouseEnter={() => {
                    if (focused !== null) return;
                    setHovered(idx);
                  }}
                  onMouseLeave={() => {
                      if (focused !== null) return;
                      setHovered(null);
                    }}
                    onClick={() => {
                      if (isDisabled) return;
                      setFocused(isFocused ? null : idx);
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={`w-full ${isFocused ? "lg:w-[520px]" : "lg:w-[480px]"} h-full object-contain rounded-2xl`}
                      loading="lazy"
                      style={{ cursor: isFocused ? "zoom-out" : isDisabled ? "default" : "inherit" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
