
import React, { useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Editor } from './Editor';
import { InvoiceData, MarketingBannerData } from '../types';
import { FileText, ArrowLeft } from 'lucide-react';

const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  senderName: 'Acme Creative Studio',
  senderEmail: 'hello@acme.com',
  senderAddress: '123 Design Lane\nCreativity City, ST 90210',
  clientName: 'TechCorp Industries',
  clientEmail: 'billing@techcorp.com',
  clientAddress: '456 Innovation Blvd\nTech Valley, CA 94043',
  currency: 'USD',
  taxRate: 10,
  items: [
    { id: '1', description: 'Web Design Consultation', quantity: 2, price: 150 },
    { id: '2', description: 'Homepage Mockup', quantity: 1, price: 800 },
  ],
  notes: 'Please process payment within 14 days. Thank you for your business!',
  template: 'luxury'
};

const INITIAL_MARKETING: MarketingBannerData = {
  enabled: true,
  text: 'Get 20% off your next project if you book before end of month!',
  backgroundColor: '#e8f4ec', // Light moss tint for bright theme
  textColor: '#0f172a',
  style: 'gradient',
  imageOpacity: 0.2,
  ctaText: 'Book Now',
  ctaLink: 'https://acme.com/book',
  ctaBackgroundColor: '#1f7a4d', // Moss default
  ctaTextColor: '#ffffff' // Ink default
};

interface InvoiceToolProps {
    onBack: () => void;
    showHeader?: boolean;
}

export const InvoiceTool: React.FC<InvoiceToolProps> = ({ onBack, showHeader = true }) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(INITIAL_INVOICE);
  const [marketingData, setMarketingData] = useState<MarketingBannerData>(INITIAL_MARKETING);

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col font-sans text-slate-900">
      {/* Top Bar - Hidden when printing */}
      {showHeader && (
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-emerald-50 rounded-full text-slate-600 transition-colors border border-transparent hover:border-emerald-100"
              title="Back to Website"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Invoice Editor</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Editor Mode</p>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Column */}
          <div className="lg:col-span-4 xl:col-span-3 no-print h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
            <Editor 
              invoiceData={invoiceData} 
              setInvoiceData={setInvoiceData}
              marketingData={marketingData}
              setMarketingData={setMarketingData}
            />
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-8 xl:col-span-9 flex justify-center overflow-auto pb-20">
            <InvoicePreview 
              data={invoiceData} 
              banner={marketingData} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
