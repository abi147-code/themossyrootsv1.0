import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDictionary } from '@/context/LocaleContext';

const About: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.2);
  const {
    portfolio: { about },
  } = useDictionary();

  const getRevealState = (delay: number) => ({
    className: `transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-[4px]'
    }`,
    style: { transitionDelay: `${delay}ms` },
  });

  const kickerReveal = getRevealState(0);
  const headingReveal = getRevealState(150);
  const paragraphReveal = getRevealState(300);

  return (
    <section
      id="about"
      className="py-20 md:py-40 px-4 sm:px-6 md:px-24 relative border-b border-white/5 bg-transparent"
    >
        <style>{`
          @keyframes inevitable-glow {
            0%, 100% {
              text-shadow: 0 0 10px rgba(167, 139, 250, 0.4), 0 0 24px rgba(255, 255, 255, 0.22);
            }
            50% {
              text-shadow: 0 0 18px rgba(255, 255, 255, 0.55), 0 0 32px rgba(129, 140, 248, 0.45);
            }
          }
          .inevitable-glow {
            background: linear-gradient(120deg, #c4b5fd 0%, #ffffff 45%, #a5f3fc 90%);
            -webkit-background-clip: text;
            color: transparent;
            display: inline-block;
            padding: 0.08em 0.35em;
            border-radius: 999px;
            animation: inevitable-glow 2.6s ease-in-out infinite;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.15));
          }
        `}</style>
        <div 
            ref={ref}
            className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start"
        >
            <div className="lg:col-span-3 lg:pt-2">
                <div {...kickerReveal}>
                    <span className="relative lg:sticky top-0 lg:top-32 font-sans-body text-xs uppercase tracking-[0.3em] text-gray-400 block backdrop-blur-md rounded-full px-4 py-2 bg-white/5 w-fit border border-white/5 hover:bg-white/10 transition-colors cursor-crosshair">
                        (001) <br className="hidden lg:block"/> {about.kicker}
                    </span>
                </div>
            </div>

            <div className="lg:col-span-9 p-6 md:p-12 rounded-3xl bg-black/20 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-visible group">
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out] pointer-events-none"></div>

                <h2
                  {...headingReveal}
                  className={`font-serif-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.1] text-gray-200 mb-10 md:mb-16 ${headingReveal.className}`}
                >
                   {about.titleLead} <span className="inevitable-glow italic">{about.titleGlow}</span><br/>
                   {about.titleSecondLine}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 font-sans-body text-sm md:text-base leading-relaxed text-gray-300 text-left">
                  {about.body.map((paragraph) => (
                    <p key={paragraph} {...paragraphReveal} className={paragraphReveal.className}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <dl className="mt-12 md:mt-20 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-white/10 pt-10 md:pt-12">
                  {about.metrics.map((stat, i) => {
                    const metricReveal = getRevealState(550 + i * 100);
                    return (
                      <div
                        key={stat.label}
                        {...metricReveal}
                        className={`group/stat cursor-default ${metricReveal.className}`}
                      >
                        <dt className="block font-sans-body text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-hover/stat:text-teal-200 transition-colors duration-300">
                          {stat.label}
                        </dt>
                        <dd className="font-serif-display text-3xl text-gray-200 tabular-nums group-hover/stat:text-white group-hover/stat:scale-110 group-hover/stat:translate-x-2 block transition-all duration-300 origin-left">
                          {stat.value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
            </div>

        </div>
    </section>
  );
};

export default About;
