import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type StoryStep = {
  title: string;
  label: string;
  line: string;
};

const narrative: string[] = [
  'Hello,',
  "I began my journey as a mechanical engineer, learning how systems move, connect, and evolve. What fascinated me most wasn't the machines themselves, but the patterns behind them—how a single adjustment could make something work beautifully better.",
  'That same curiosity eventually led me to marketing. I started to see brands as living systems too—ones that could be designed thoughtfully, nurtured with care, and grown naturally.',
  "At Drop, I helped lead a crowdfunding campaign on KissKissBankBank that reached 261% of its goal. What stayed with me wasn't the number—it was watching a small idea come alive through people's belief, stories, and shared energy.",
  'Today, I build marketing ecosystems powered by AI, automation, and design thinking—tools that help creators and small businesses scale without losing their human touch.',
  "My path from engineering to creativity taught me that automation isn't about replacing people—it's about giving them more room to imagine, to create, and to connect.",
  "Beyond the screens, I'm a photographer and designer, drawn to textures, light, and rhythm. The Mossy Roots grew from that instinct—to build something grounded, calm, and alive.",
  "For me, great systems are not just efficient—they're empathetic. They remind us that growth is most beautiful when it still feels human.",
];

const Projects: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section id="projects" className="py-24 md:py-36 px-6 relative z-20">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div
          className={`text-center mb-16 md:mb-24 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="font-sans-body text-[10px] uppercase tracking-[0.4em] text-purple-300/60 block mb-4 animate-pulse">
            The Narrative
          </span>
          <h2 className="font-serif-display text-5xl md:text-6xl text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            From Systems <span className="italic text-purple-200">to Stories</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-lg mx-auto text-sm font-sans-body tracking-wide leading-relaxed">
            A flowing story: how engineering rigor turned into narrative-driven experiences.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-white/5 opacity-20" />
          <div className="relative space-y-6 md:space-y-8">
            {narrative.map((para, index) => (
              <p
                key={index}
                className="text-base md:text-lg text-gray-200/90 font-sans-body leading-relaxed max-w-4xl mx-auto transition-all duration-700"
                style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  opacity: isVisible ? 1 : 0,
                  filter: isVisible ? 'blur(0px)' : 'blur(6px)',
                  textAlign: 'justify',
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
