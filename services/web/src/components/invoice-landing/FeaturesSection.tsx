import React, { useEffect, useRef, useState } from 'react';

// Hook to detect when element enters viewport
const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, options);

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [options]);

  return [containerRef, isVisible] as const;
};

const FeatureCard = ({
  number,
  title,
  description,
  listItems,
}: {
  number: string;
  title: string;
  description?: string;
  listItems?: string[];
}) => {
  const [ref, isVisible] = useElementOnScreen({
    threshold: 0.3, // Trigger when 30% visible
    rootMargin: '0px 0px -10% 0px',
  });

  return (
    <div
      ref={ref}
      className={`min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center py-12 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-16 blur-sm'
      }`}
    >
      <div className="relative pl-6 md:pl-0 border-l-2 md:border-l-0 border-slate-800 md:border-none backdrop-blur-[2px] rounded-xl p-4 md:p-0">
        <span
          className={`text-amber-500 font-mono text-xs tracking-[0.2em] uppercase mb-4 block transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          {number}
        </span>

        <h3 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight drop-shadow-md">{title}</h3>

        {description && <p className="text-lg text-slate-300 max-w-md leading-relaxed font-light drop-shadow-sm">{description}</p>}

        {listItems && (
          <ul className="mt-8 space-y-4">
            {listItems.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-4 text-lg text-slate-200 transition-all duration-700"
                style={{
                  transitionDelay: `${i * 150 + 500}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                }}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 px-6 overflow-hidden bg-transparent">
      {/* Scroll timeline line for desktop */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent hidden md:block" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24">
        {/* Sticky Header Column */}
        <div className="relative z-10">
          <div className="md:sticky md:top-32 md:min-h-[50vh] flex flex-col justify-center mb-16 md:mb-0">
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-[1.1] drop-shadow-lg">
              What makes <br />
              <span className="text-slate-500 italic">this different</span>
            </h2>
            <p className="text-sm md:text-base text-amber-500 font-bold tracking-[0.2em] uppercase mt-6 pl-1 flex items-center gap-3">
              <span className="w-8 h-px bg-amber-500/50"></span>
              (and world-first)
            </p>
          </div>
        </div>

        {/* Scrolling Features Column */}
        <div className="flex flex-col gap-0 md:pl-24 z-10 pb-24">
          <FeatureCard number="01" title="First Invoice System" description="The first invoice system designed primarily for conversion, not just collection." />
          <FeatureCard number="02" title="Inside the Invoice" description="Marketing capabilities embedded inside the invoice itself." />
          <FeatureCard number="03" title="No Plugins Needed" description="Works without pixels, plugins, or external landing pages." />
          <FeatureCard number="04" title="Your invoice transforms into:" listItems={['A Professional Portfolio', 'A Dynamic Upsell Page', 'A Secure Client Portal']} />
        </div>
      </div>

      {/* Ambient background glow for section */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
