import React from 'react';

interface AudienceCardProps {
  label: string;
  title: string;
  description: string;
  image: string;
}

const AudienceCard: React.FC<AudienceCardProps> = ({ label, title, description, image }) => {
  return (
    <div className="group relative w-full h-[450px] rounded-sm overflow-hidden cursor-pointer border border-slate-800 bg-slate-900 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-50 group-hover:opacity-40"
        />

        {/* Gradient Overlay - Static */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/10 opacity-80" />

        {/* Hover Overlay - Color Tint */}
        <div className="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
      </div>

      {/* Decorative Corner Borders */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10 group-hover:border-amber-500/50 transition-colors duration-500 z-10 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/10 group-hover:border-amber-500/50 transition-colors duration-500 z-10 rounded-bl-sm" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
        {/* Animated Label */}
        <div className="overflow-hidden mb-3">
          <span className="inline-block px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold tracking-[0.2em] uppercase text-[0.6rem] transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
            {label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-serif text-white mb-2 group-hover:text-amber-50 transition-colors duration-300">{title}</h3>

        {/* Description - Accordion Reveal Effect */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <div className="pt-4 border-t border-white/10 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-y-4 group-hover:translate-y-0">
              <p className="text-slate-300 text-lg font-light leading-relaxed">{description}</p>
            </div>
          </div>
        </div>

        {/* Initial State Hint (Visible when not hovered) */}
        <div className="absolute bottom-8 right-8 transition-opacity duration-300 group-hover:opacity-0">
          <svg className="w-6 h-6 text-slate-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const WhoThisIsForSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 md:py-32 px-6 bg-slate-900 border-t border-slate-800/50">
      {/* Background noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-amber-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Target Audience
            </h2>
            <h3 className="text-4xl md:text-6xl font-serif text-white leading-tight">Who this is for</h3>
          </div>
          <p className="text-slate-400 text-lg md:text-xl font-light md:text-right max-w-sm">
            If you send invoices, <br />
            <span className="text-white font-medium border-b border-amber-500/30 pb-0.5">this works for you.</span>
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <AudienceCard
            label="Freelancers"
            title="Freelancers"
            description="Who need to upsell their next project automatically."
            image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop"
          />
          <AudienceCard
            label="Agencies"
            title="Agencies"
            description="Who want to showcase their portfolio with every bill."
            image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop"
          />
          <AudienceCard
            label="Enterprises"
            title="Modern Businesses"
            description="Who value brand consistency and customer experience."
            image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"
          />
        </div>
      </div>
    </section>
  );
};
