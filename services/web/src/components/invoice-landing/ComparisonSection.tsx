import React from 'react';
import { useRouter } from 'next/navigation';

export const ComparisonSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="relative w-full py-24 md:py-32 px-4 overflow-hidden">
      {/* Background Ambience for this section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Additional blue tint for depth */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-amber-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-3">
            Evolution of the Invoice
          </h2>
          <h3 className="text-3xl md:text-5xl font-serif text-white font-medium">
            Stop Sending <span className="text-slate-500 line-through decoration-slate-600 decoration-2 decoration-slice">Dead Documents</span>
          </h3>
          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            90% of invoices are opened. Only 1% drive action. <br className="hidden md:block" />
            See the difference between a receipt and a revenue engine.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch max-w-5xl mx-auto relative">
          {/* VS Badge (Absolute Center on Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 border border-slate-700 rounded-full items-center justify-center z-20 shadow-xl shadow-black/50">
            <span className="font-bold text-slate-500 text-sm italic font-serif">VS</span>
          </div>

          {/* LEFT: The Old Way */}
          <div className="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all duration-500 flex flex-col overflow-hidden">
            {/* Content Layer */}
            <div className="relative z-20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8 opacity-90 transition-all duration-500">
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center shrink-0 shadow-inner border border-white/5">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-200 drop-shadow-md">Standard PDF</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5 font-medium">The &quot;Safe&quot; Choice</p>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <ListItem negative text="Static, boring layout" />
                <ListItem negative text="Hard to pay (manual entry)" />
                <ListItem negative text="Zero brand personality" />
                <ListItem negative text="Ends the customer journey" />
              </ul>

              <div className="pt-6 border-t border-slate-800 mt-auto">
                <p className="text-xs text-slate-500 text-center font-mono uppercase tracking-widest bg-slate-800/50 py-1 rounded inline-block w-full border border-slate-800">
                  Status: DEPRECATED
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: The New Way */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500 transform hover:-translate-y-1 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl -z-10" />

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Smart Invoice</h4>
                <p className="text-xs text-purple-300 uppercase tracking-wider mt-0.5">The Revenue Choice</p>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              <ListItem positive text="Dynamic, interactive UI" />
              <ListItem positive text="1-Click Payment embedded" />
              <ListItem positive text="Upsell & Marketing cards" />
              <ListItem positive text="Real-time analytics & tracking" />
            </ul>

            {/* CTA within card */}
            <div className="mt-auto pt-8 border-t border-white/5">
                <button
                  className="w-full py-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 group-hover:text-purple-300"
                  onClick={() => router.push('/login')}
                >
                  <span>See Live Example</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ListItem = ({ text, negative, positive }: { text: string; negative?: boolean; positive?: boolean }) => (
  <li className="flex items-start gap-3">
    <div
      className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
        negative ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 'bg-green-500/10 text-green-400 border border-green-500/10'
      }`}
    >
      {negative ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className={`text-sm ${negative ? 'text-slate-400' : 'text-slate-200'} font-medium drop-shadow-sm`}>{text}</span>
  </li>
);
