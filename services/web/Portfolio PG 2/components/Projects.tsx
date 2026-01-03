import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useDictionary } from '@/context/LocaleContext';

const Projects: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.1);
  const {
    portfolio: { projects },
  } = useDictionary();

  return (
    <section id="projects" className="py-20 md:py-36 px-4 sm:px-6 relative z-20">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div
          className={`text-center mb-16 md:mb-24 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="font-sans-body text-[10px] uppercase tracking-[0.4em] text-purple-300/60 block mb-4 animate-pulse">
            {projects.title}
          </span>
          <h2 className="font-serif-display text-5xl md:text-6xl text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {projects.subtitle}
          </h2>
        </div>

        <div className="relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-white/5 opacity-20" />
          <div className="relative space-y-6 md:space-y-8">
            {projects.narrative.map((para, index) => (
              <p
                key={para}
                className="text-base md:text-lg text-gray-200/90 font-sans-body leading-relaxed max-w-4xl mx-auto transition-all duration-700 text-left md:text-justify"
                style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  opacity: isVisible ? 1 : 0,
                  filter: isVisible ? 'blur(0px)' : 'blur(6px)',
                  transitionDelay: `${index * 90}ms`,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
