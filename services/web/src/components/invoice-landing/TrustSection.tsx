import React from 'react';

const TrustItem = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => {
  return (
    <div className="group relative p-8 rounded-sm border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-all duration-500 overflow-hidden hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-emerald-900/10 group-hover:to-transparent transition-all duration-700"></div>

      {/* Tech decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-700 group-hover:border-emerald-500/50 transition-colors duration-500"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-700 group-hover:border-emerald-500/50 transition-colors duration-500"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-14 h-14 rounded-sm bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-500">
          <div className="text-slate-500 group-hover:text-emerald-400 transition-colors duration-500 transform group-hover:scale-110">{icon}</div>
        </div>

        <div>
          <h4 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors duration-300">{title}</h4>

          <p className="text-slate-400 text-sm leading-relaxed font-light group-hover:text-slate-300 transition-colors duration-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const TrustSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 px-6 border-t border-slate-800/50 bg-slate-950 overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Green Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-emerald-500">Security First</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Built for trust and privacy</h2>
        </div>

        {/* Grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          <TrustItem
            title="Secure by Design"
            description="Industry standard encryption for all data. AES-256 bit encryption ensures your financial records are unreadable to anyone but you."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          <TrustItem
            title="GDPR Compliant"
            description="Your data rights and privacy fully respected. We strictly adhere to EU regulations regarding data processing and storage."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          />
          <TrustItem
            title="Private"
            description="We do not sell your data. Ever. Your client list, pricing strategies, and revenue data are strictly yours."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            }
          />
          <TrustItem
            title="Reliable"
            description="99.9% Uptime SLA for enterprise reliability. Our global edge network ensures your invoices load instantly, anywhere."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2H5zm0 0a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
            }
          />
        </div>

        {/* Footer Statement */}
        <div className="mt-20 pt-12 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <p className="text-xl md:text-2xl font-serif italic text-slate-300 max-w-3xl mx-auto leading-relaxed opacity-80 hover:opacity-100 transition-opacity duration-500">
            &quot;We believe in transparency. Your financial data is yours alone.&quot;
          </p>
        </div>
      </div>
    </section>
  );
};
