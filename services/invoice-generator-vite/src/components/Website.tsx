import React from 'react';
import { ArrowRight, Sparkles, Zap, Palette, MousePointer, Layout, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceData, MarketingBannerData } from '../types';
import BlurText from './BlurText';

// Mock Data for Header Display - Realistic Business Scenario
const HEADER_DEMO_INVOICE: InvoiceData = {
  invoiceNumber: '0042',
  date: 'Oct 12, 2024',
  dueDate: 'Oct 26, 2024',
  senderName: 'Archipelago Studios',
  senderEmail: 'billing@archipelago.studio',
  senderAddress: '123 Design District, Creative City',
  clientName: 'Horizon Ventures',
  clientEmail: 'accounts@horizon.com',
  clientAddress: '456 Business Rd, Tech Valley',
  currency: 'USD',
  taxRate: 0,
  items: [],
  notes: '',
  template: 'luxury',
  fontSelection: 'editorial',
  // Specific colors requested for the design aesthetic section
  invoiceBackgroundColor: '#f9fbff',
  invoiceTextColor: '#0f172a',
};

// Mock Data for Banner Display
const BANNER_DEMO_DATA: MarketingBannerData = {
  enabled: true,
  text: 'Secure your Q4 dedicated support team. Early booking discount ends soon.',
  backgroundColor: '#e8f4ec',
  textColor: '#0f172a',
  style: 'gradient',
  ctaText: 'Book Priority Support',
  ctaLink: '#',
  ctaBackgroundColor: '#1f7a4d',
  ctaTextColor: '#ffffff',
};

// Empty banner for the header view so it doesn't crash or show anything
const EMPTY_BANNER: MarketingBannerData = {
  enabled: false,
  text: '',
  backgroundColor: '',
  textColor: '',
  style: 'solid'
};

interface WebsiteProps {
  onLaunchTool: () => void;
}

export const Website: React.FC<WebsiteProps> = ({ onLaunchTool }) => {
  const handleOpenEditor = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tmr-token') : null;
    const webBase = import.meta.env.VITE_TMR_WEB_URL || 'http://localhost:3000';
    const target = token
      ? `${webBase}/dashboard/invoice-generator`
      : `${webBase}/login?redirect=/dashboard/invoice-generator`;
    if (typeof document !== 'undefined') {
      const wrapper = document.getElementById('page-transition-wrapper');
      if (wrapper) {
        wrapper.classList.add('page-fade-out');
        setTimeout(() => {
          window.location.href = target;
        }, 300);
        return;
      }
    }
    window.location.href = target;
  };

  return (
    <div id="page-transition-wrapper" className="min-h-screen bg-[#f7f9fc] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold tracking-tight text-slate-900">Invoice Generator</span>
          </div>
           <button 
             onClick={handleOpenEditor}
             className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium text-sm transition-all shadow-sm"
          >
             Open Editor
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero: The Hook */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-6 overflow-hidden">
           <div className="text-center relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-700 border border-emerald-100 text-sm font-medium mb-8 shadow-sm">
                  <Zap size={14} className="text-amber-500" />
                  <span>Smarter billing for modern agencies</span>
              </div>
              
              <div className="flex flex-col items-center mb-8 w-full">
                <BlurText
                  text="Invoices are your"
                  className="text-6xl md:text-8xl font-serif font-medium leading-none tracking-tight text-center justify-center text-slate-900 mb-2"
                  delay={100}
                  startDelay={430}
                  animateBy="words"
                  direction="top"
                />
                <BlurText
                  text="most opened email."
                  className="text-6xl md:text-8xl font-serif font-medium leading-none tracking-tight text-center justify-center text-slate-900"
                  delay={100}
                  startDelay={430}
                  animateBy="words"
                  direction="top"
                />
              </div>

              <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
                 Don't waste that moment. Turn your routine billing into a client retention engine.
              </p>
           </div>
        </section>

        {/* Section 1: The Pain Point & Aesthetic Solution */}
        <section className="py-24 px-6 border-t border-slate-200 bg-white/80">
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-4">Professional Impact</h2>
                 <h3 className="text-4xl md:text-5xl font-serif mb-6">Brand consistency matters.</h3>
                 <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    You wouldn't deliver a masterpiece in a cardboard box. Yet, most professionals end a project by sending an invoice that looks like a utility billcold, generic, and forgettable.
                    <br /><br />
                    That disconnect hurts your brand. Stop letting default templates devalue your hard work. Send a document that commands respect, reinforces your premium status, and makes paying you feel like an investment, not a cost.
                 </p>
                 <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} />
                       <span>Command Respect</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Sparkles size={16} />
                       <span>Validate Your Rates</span>
                    </div>
                 </div>
              </div>
              
              <div className="order-1 lg:order-2 perspective-1000 group w-full">
                 {/* Removed rotation to show full width clearly */}
                 <div className="transform transition-transform duration-700 shadow-xl bg-white rounded-2xl p-6 border border-slate-200">
                    {/* Show header with sensible details */}
                    <InvoicePreview 
                        data={HEADER_DEMO_INVOICE} 
                        banner={EMPTY_BANNER} 
                        showControls={false} 
                        viewMode="header"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Section 2: The Marketing (Banner Only) */}
        <section className="py-24 px-6 border-t border-slate-200 bg-[#f7f9fc]">
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="perspective-1000 group w-full">
                 <div className="transform transition-transform duration-700 group-hover:scale-105">
                     {/* Show ONLY the banner */}
                     <InvoicePreview 
                        data={HEADER_DEMO_INVOICE} 
                        banner={BANNER_DEMO_DATA} 
                        showControls={false} 
                        viewMode="banner" 
                     />
                 </div>
              </div>

              <div>
                 <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-4">Smart Monetization</h2>
                 <h3 className="text-4xl md:text-5xl font-serif mb-6">Stop leaving money on the table.</h3>
                 <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Your invoice footer is prime real estate. Don't let it be a blank space. Transform it into a <strong>personalized marketing banner</strong> that upsells for you while you sleep.
                    <br /><br />
                    Whether it's promoting a new service, asking for a referral, or offering a timely discount for next quarter—if you aren't using this space, you're missing out on revenue from your happiest clients.
                 </p>
                 <div className="p-6 bg-white border border-slate-200 rounded-xl flex gap-4 shadow-sm">
                    <div className="shrink-0 text-amber-500">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">The "Silent Salesperson" Effect</p>
                        <p className="text-sm italic text-slate-600">
                           "Our invoices have a 100% open rate. By adding a simple upsell banner, we increased repeat bookings by 24% without sending a single sales email."
                        </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Section 3: How to Use */}
        <section className="py-24 px-6 bg-gradient-to-b from-white via-[#f2f6fb] to-[#eef4ff] border-t border-slate-200">
           <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Streamline your workflow.</h2>
              <p className="text-slate-600">A simple tool designed for busy professionals.</p>
           </div>

           <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
              <div className="relative p-8 rounded-2xl bg-white border border-slate-200 hover:-translate-y-1 transition-all group shadow-sm">
                 <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-600 text-white flex items-center justify-center font-bold rounded-full text-sm border-4 border-white shadow-sm">1</div>
                 <div className="mb-6 text-amber-500 bg-amber-50 w-12 h-12 flex items-center justify-center rounded-xl">
                    <Palette size={24} />
                 </div>
                 <h3 className="text-xl font-bold mb-3">Style It</h3>
                 <p className="text-sm text-slate-600 leading-relaxed">
                    Upload your logo and select fonts that match your brand guidelines.
                 </p>
              </div>

              <div className="relative p-8 rounded-2xl bg-white border border-slate-200 hover:-translate-y-1 transition-all group shadow-sm">
                 <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-600 text-white flex items-center justify-center font-bold rounded-full text-sm border-4 border-white shadow-sm">2</div>
                 <div className="mb-6 text-blue-500 bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl">
                    <ImageIcon size={24} />
                 </div>
                 <h3 className="text-xl font-bold mb-3">Add Your Offer</h3>
                 <p className="text-sm text-slate-600 leading-relaxed">
                    Create a compelling banner or use our AI assistant to draft the perfect message.
                 </p>
              </div>

              <div className="relative p-8 rounded-2xl bg-white border border-slate-200 hover:-translate-y-1 transition-all group shadow-sm">
                 <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-600 text-white flex items-center justify-center font-bold rounded-full text-sm border-4 border-white shadow-sm">3</div>
                 <div className="mb-6 text-emerald-500 bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl">
                    <MousePointer size={24} />
                 </div>
                 <h3 className="text-xl font-bold mb-3">Export & Send</h3>
                 <p className="text-sm text-slate-600 leading-relaxed">
                    Download a high-quality PDF ready to be sent to your client immediately.
                 </p>
              </div>
           </div>
           
           <div className="text-center mt-16">
              <button 
                onClick={handleOpenEditor}
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-all flex items-center gap-3 shadow-lg shadow-emerald-200 mx-auto hover:scale-105"
              >
                Start Creating Now
                <ArrowRight size={20} />
              </button>
           </div>
        </section>
      </main>
      
      <footer className="py-12 border-t border-slate-200 text-center text-slate-500 text-sm bg-white">
         <p>© {new Date().getFullYear()} Invoice Generator. Built for those who value every detail.</p>
      </footer>
    </div>
  );
};
