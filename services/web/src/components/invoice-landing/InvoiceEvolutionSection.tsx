import React from 'react';

const bulletsLeft = [
  'Static, boring layout',
  'Hard to pay (manual entry)',
  'Zero brand personality',
  'Ends the customer journey',
];

const bulletsRight = [
  'Dynamic, interactive UI',
  '1-Click Payment embedded',
  'Upsell & Marketing cards',
  'Real-time analytics & tracking',
  'Campaign creation and Management',
];

export const InvoiceEvolutionSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="text-center max-w-3xl space-y-4">
          <h2 className="text-amber-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase">Evolution of the Invoice</h2>
          <h3 className="text-3xl md:text-5xl font-serif text-white leading-tight">
            Stop Sending <span className="text-slate-500 line-through decoration-slate-700 decoration-2 decoration-slice">Dead Documents</span>
          </h3>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            90% of invoices are opened. Only 1% drive action. See the difference between a receipt and a revenue engine.
          </p>
        </div>

        <div className="w-full grid gap-8 md:grid-cols-[1fr_auto_1fr] items-center">
          <ComparisonBox
            title="Standard PDF"
            subtitle='The "Safe" Choice'
            image="/invoice landing page/normal-invoice.jpg"
            bullets={bulletsLeft}
            statusLabel="Your Typical PDF"
          />

          <ArrowIndicator />

          <ComparisonBox
            title="Smart Invoice"
            subtitle="The Revenue Choice"
            image="/invoice landing page/tem.jpg"
            bullets={bulletsRight}
            statusLabel="Upgraded PDF"
            highlight
          />
        </div>
      </div>
    </section>
  );
};

const ComparisonBox = ({
  title,
  subtitle,
  image,
  bullets,
  statusLabel,
  highlight,
}: {
  title: string;
  subtitle: string;
  image: string;
  bullets: string[];
  statusLabel: string;
  highlight?: boolean;
}) => {
  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl overflow-hidden p-6 md:p-8 border ${
        highlight ? 'border-purple-500/50' : 'border-slate-800/70'
      } bg-slate-900/30 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
          <h4 className="text-2xl md:text-3xl font-serif text-white">{title}</h4>
        </div>
        <span
          className={`text-[0.6rem] uppercase tracking-[0.25em] font-semibold px-2 py-1 rounded ${
            highlight ? 'text-purple-300 border border-purple-500/40' : 'text-slate-500 border border-slate-700'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="w-full aspect-[4/5] md:aspect-[5/6] rounded-xl overflow-hidden bg-slate-950/40">
        <img src={image} alt={title} loading="lazy" className="w-full h-full object-contain" />
      </div>

      <ul className="space-y-3">
        {bullets.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-200 text-sm">
            <span className={`mt-[6px] h-2 w-2 rounded-full ${highlight ? 'bg-purple-400' : 'bg-slate-500'}`}></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ArrowIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
      <div className="hidden md:flex flex-col items-center gap-3">
        <ArrowIcon direction="right" />
        <span className="text-xs uppercase tracking-[0.3em]">VS</span>
      </div>
      <div className="md:hidden flex flex-col items-center gap-3">
        <ArrowIcon direction="down" />
        <span className="text-xs uppercase tracking-[0.3em]">VS</span>
      </div>
    </div>
  );
};

const ArrowIcon = ({ direction }: { direction: 'right' | 'down' }) => {
  const rotation = direction === 'right' ? 'rotate-0' : 'rotate-90';
  return (
    <div className="flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/40 p-3">
      <svg
        className={`w-6 h-6 text-slate-300 ${rotation}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
