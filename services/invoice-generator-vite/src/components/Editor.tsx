
import React, { useState, useRef, useEffect } from 'react';
import { InvoiceData, MarketingBannerData, InvoiceItem } from '../types';
import { generateMarketingSlogans } from '../services/geminiService';
import { Plus, Trash2, Wand2, Loader2, Image as ImageIcon, X, Layout, CreditCard, QrCode, Move } from 'lucide-react';

interface EditorProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  marketingData: MarketingBannerData;
  setMarketingData: React.Dispatch<React.SetStateAction<MarketingBannerData>>;
  registerAnchor?: (key: string, el: HTMLElement | null) => void;
  activeTabOverride?: 'details' | 'items' | 'marketing';
}

export const Editor: React.FC<EditorProps> = ({
  invoiceData,
  setInvoiceData,
  marketingData,
  setMarketingData,
  registerAnchor,
  activeTabOverride,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'marketing'>('details');
  const [showBannerGuide, setShowBannerGuide] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [thumbnailOrientation, setThumbnailOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const styleRef = useRef<HTMLDivElement | null>(null);
  const colorsRef = useRef<HTMLDivElement | null>(null);
  const senderRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const taxNotesRef = useRef<HTMLDivElement | null>(null);
  const marketingRef = useRef<HTMLDivElement | null>(null);

  // Drag state for banner image repositioning
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => {
      const next = { ...prev, [field]: value };
      return next;
    });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleGenerateSlogans = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const results = await generateMarketingSlogans(businessType, prompt);
      setSuggestions(results);
    } catch (e) {
      alert('Failed to generate suggestions. Check your API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMarketingData(prev => ({
          ...prev,
          bannerUrl: reader.result as string,
          bannerImageOpacity: prev.bannerImageOpacity ?? 0.2,
          imagePosition: { x: 50, y: 50 },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setMarketingData(prev => ({ ...prev, bannerUrl: undefined, imagePosition: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    handleChange('logoUrl', undefined);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const resetImagePosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarketingData(prev => ({ ...prev, imagePosition: { x: 50, y: 50 } }));
  };

  useEffect(() => {
    if (activeTabOverride && activeTabOverride !== activeTab) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride, activeTab]);

  useEffect(() => {
    registerAnchor?.('style', styleRef.current);
    registerAnchor?.('colors', colorsRef.current);
    registerAnchor?.('sender', senderRef.current);
    registerAnchor?.('client', clientRef.current);
    registerAnchor?.('items', itemsRef.current);
    registerAnchor?.('taxNotes', taxNotesRef.current);
    registerAnchor?.('marketing', marketingRef.current);
  }, [registerAnchor, activeTab, marketingData.enabled]);

  useEffect(() => {
    if (!marketingData.bannerUrl) {
      setThumbnailOrientation('landscape');
      return;
    }
    let mounted = true;
    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      const next = img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape';
      setThumbnailOrientation(next);
    };
    img.src = marketingData.bannerUrl;
    return () => {
      mounted = false;
    };
  }, [marketingData.bannerUrl]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!marketingData.bannerUrl) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    startPos.current = marketingData.imagePosition || { x: 50, y: 50 };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const sensitivity = 0.2; // 1px move = 0.2% change
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Moving mouse RIGHT means we want to see the LEFT side of image (moving view window left), 
    // or standard drag behavior: dragging image RIGHT reveals LEFT side. 
    // CSS background-position: 0% is left, 100% is right.
    // Decreasing percentage moves image right (shows left side).
    // So +dx should decrease %.
    
    let newX = startPos.current.x + (dx * sensitivity);
    let newY = startPos.current.y + (dy * sensitivity);

    // Clamp between 0 and 100
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setMarketingData(prev => ({
      ...prev,
      imagePosition: { x: newX, y: newY }
    }));
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Reusable input styles
  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-colors placeholder:text-slate-400";
  const labelClass = "text-xs font-medium text-slate-600 mb-1 block uppercase tracking-wider";
  const sectionClass = "bg-white p-4 rounded-lg border border-slate-200 space-y-4 shadow-sm";
  // Updated option class for better visibility
  const optionClass = "bg-white text-slate-900";

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[80vh] transition-colors duration-300">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        {['details', 'items', 'marketing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-emerald-50'
            }`}
          >
            {tab === 'marketing' && <span className="mr-1">•</span>}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-grow scrollbar-hide">
        {activeTab === 'details' && (
            <div className="space-y-6">
             {/* Style Settings Section */}
             <div className={sectionClass} ref={styleRef}>
                <div className="flex items-center gap-2 text-gold-400 font-medium text-sm">
                   <Layout size={16} />
                   <span>Visual Style</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className={labelClass}>Template</label>
                      <select
                        value={invoiceData.invoiceTemplateKey || 'luxury'}
                        onChange={(e) => handleChange('invoiceTemplateKey', e.target.value)}
                        className={inputClass}
                      >
                        <option value="luxury" className={optionClass}>Luxury</option>
                        <option value="professional" className={optionClass}>Professional</option>
                        <option value="classic" className={optionClass}>Classic</option>
                      </select>
                   </div>
                   <div>
                      <label className={labelClass}>Typography</label>
                      <select
                        value={invoiceData.invoiceTypographyKey || 'editorial'}
                        onChange={(e) => handleChange('invoiceTypographyKey', e.target.value)}
                        className={inputClass}
                      >
                        <option value="editorial" className={optionClass}>Editorial</option>
                        <option value="clean" className={optionClass}>Clean</option>
                        {/* Removed Modern option */}
                        <option value="professional" className={optionClass}>Professional</option>
                        <option value="elegant" className={optionClass}>Elegant</option>
                        <option value="classic" className={optionClass}>Classic</option>
                        <option value="tech" className={optionClass}>Tech</option>
                      </select>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200" ref={colorsRef}>
                  <div>
                    <label className={labelClass}>Page Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invoiceData.invoicePageColor || '#ffffff'}
                        onChange={(e) => handleChange('invoicePageColor', e.target.value)}
                        className="color-input"
                      />
                       <span className="text-xs text-slate-500 font-mono">{invoiceData.invoicePageColor || '#ffffff'}</span>
                    </div>
                 </div>
                 <div>
                    <label className={labelClass}>Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={invoiceData.invoiceTextColor || '#1e293b'}
                        onChange={(e) => handleChange('invoiceTextColor', e.target.value)}
                        className="color-input"
                      />
                      <span className="text-xs text-slate-500 font-mono">{invoiceData.invoiceTextColor || '#1e293b'}</span>
                    </div>
                 </div>
               </div>
             </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Invoice #</label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Issued Date</label>
                  <input
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-4" ref={senderRef}>
              <h3 className="text-sm font-semibold text-slate-900">Sender Info</h3>
              
              <div className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                 {invoiceData.logoUrl ? (
                    <div className="relative group shrink-0">
                       <img src={invoiceData.logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded bg-white p-1" />
                       <button 
                          onClick={clearLogo}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <X size={10} />
                       </button>
                    </div>
                 ) : (
                    <button
                       onClick={() => logoInputRef.current?.click()}
                       className="h-12 w-12 shrink-0 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-500 hover:text-moss-400 hover:border-moss-500 transition-colors bg-slate-100"
                       title="Upload Logo"
                    >
                       <ImageIcon size={16} />
                    </button>
                 )}
                 <div className="flex-1">
                    <label className={labelClass}>Brand Logo</label>
                    <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="text-xs text-moss-400 font-medium hover:text-moss-300"
                    >
                        {invoiceData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </button>
                 </div>
                 <input 
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                 />
              </div>

              <input
                placeholder="Your Business Name"
                value={invoiceData.senderName}
                onChange={(e) => handleChange('senderName', e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Your Email"
                value={invoiceData.senderEmail}
                onChange={(e) => handleChange('senderEmail', e.target.value)}
                className={inputClass}
              />
              <textarea
                placeholder="Your Address"
                value={invoiceData.senderAddress}
                onChange={(e) => handleChange('senderAddress', e.target.value)}
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-4" ref={clientRef}>
              <h3 className="text-sm font-semibold text-slate-900">Client Info</h3>
              <input
                placeholder="Client Name"
                value={invoiceData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Client Email"
                value={invoiceData.clientEmail}
                onChange={(e) => handleChange('clientEmail', e.target.value)}
                className={inputClass}
              />
              <textarea
                placeholder="Client Address"
                value={invoiceData.clientAddress}
                onChange={(e) => handleChange('clientAddress', e.target.value)}
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <hr className="border-slate-200" />

            {/* Payment Integration Section */}
            <div className={sectionClass}>
               <div className="flex items-center gap-2 text-gold-400 font-medium text-sm">
                  <CreditCard size={16} />
                  <span>Payment Integration</span>
               </div>
               <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Payment Link</label>
                    <input
                      placeholder="https://stripe.com/pay/..."
                      value={invoiceData.paymentLink || ''}
                      onChange={(e) => handleChange('paymentLink', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  
                  {invoiceData.paymentLink && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {invoiceData.invoiceTemplateKey !== 'luxury' && (
                           <button 
                             onClick={() => handleChange('paymentMethod', 'qr')}
                             className={`flex items-center justify-center gap-2 py-2 px-2 rounded border text-xs transition-all ${invoiceData.paymentMethod !== 'button' ? 'bg-moss-600 border-moss-500 text-white' : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                           >
                             <QrCode size={14} />
                             QR Code
                           </button>
                        )}
                         <button 
                           onClick={() => handleChange('paymentMethod', 'button')}
                           className={`flex items-center justify-center gap-2 py-2 px-2 rounded border text-xs transition-all ${invoiceData.paymentMethod === 'button' ? 'bg-moss-600 border-moss-500 text-white' : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                         >
                           <CreditCard size={14} />
                           Pay Button
                         </button>
                      </div>

                      {invoiceData.paymentMethod === 'button' && (
                         <div>
                           <label className={labelClass}>Button Label</label>
                           <input
                             placeholder="Pay Now"
                             value={invoiceData.paymentButtonText || ''}
                             onChange={(e) => handleChange('paymentButtonText', e.target.value)}
                             className={inputClass}
                           />
                         </div>
                      )}
                    </>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4" ref={itemsRef}>
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Line Items</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Currency:</span>
                  <select 
                     value={invoiceData.currency} 
                     onChange={e => handleChange('currency', e.target.value)}
                     className="h-8 px-2 py-1 border border-slate-200 rounded text-sm bg-slate-100 text-slate-900 outline-none focus:ring-2 focus:ring-moss-500 cursor-pointer"
                  >
                    <option value="USD" className={optionClass}>USD ($)</option>
                    <option value="EUR" className={optionClass}>EUR (€)</option>
                    <option value="INR" className={optionClass}>INR (INR)</option>
                    <option value="GBP" className={optionClass}>GBP (£)</option>
                  </select>
                </div>
             </div>
            
            {invoiceData.items.map((item) => (
              <div key={item.id} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg group border border-transparent border-b-white/5">
                <div className="flex-grow space-y-2">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                        className={`${inputClass} text-right`}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full py-3 border border-dashed border-slate-200 rounded-lg text-slate-600 hover:border-moss-500 hover:text-moss-400 hover:bg-emerald-50 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
            >
              <Plus size={16} />
              Add Item
            </button>

             <div className="pt-4 border-t border-slate-200" ref={taxNotesRef}>
                <label className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tax Rate (%)</span>
                    <input 
                        type="number" 
                        value={invoiceData.taxRate}
                        onChange={e => handleChange('taxRate', Number(e.target.value))}
                        className="w-20 text-right px-2 py-1 border border-slate-200 rounded bg-slate-100 text-slate-900 outline-none"
                    />
                </label>
             </div>
             
             <div className="pt-4">
                <label className={labelClass}>Notes</label>
                <textarea 
                    value={invoiceData.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    className={`${inputClass} h-20`}
                    placeholder="Payment terms, thank you notes, etc."
                />
            </div>
          </div>
        )}

      {activeTab === 'marketing' && (
          <div className="space-y-6" ref={marketingRef}>
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={marketingData.enabled}
                  onChange={(e) => setMarketingData((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors border ${marketingData.enabled ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow ${marketingData.enabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-medium text-slate-900">Enable Banner</div>
            </label>
            </div>

            <div className={`${marketingData.enabled ? '' : 'opacity-60 pointer-events-none'} transition-opacity`}>
              {showBannerGuide ? (
                <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">How to craft a marketing banner</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12px] text-slate-700">
                        <li>Describe your business + goal, then click “Generate Ideas”.</li>
                        <li>Pick a style, set background/text colors.</li>
                        <li>Upload a banner image (drag to reposition).</li>
                        <li>Adjust CTA text/colors, then preview + download/print/email.</li>
                      </ol>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBannerGuide(false)}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-700 transition hover:bg-emerald-100 whitespace-nowrap"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBannerGuide(true)}
                  className="text-[11px] font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-600"
                >
                  Show how to use the marketing banner
                </button>
              )}

              <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-lg border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-amber-500/20">
                   <Wand2 size={64} />
                </div>
                <div className="relative z-10">
                      <div className="flex items-center gap-2 text-gold-400 mb-3 font-semibold text-sm">
                        <Wand2 size={16} />
                        <span>AI Content Generator</span>
                      </div>
                      
                      <div className="space-y-3">
                        <input 
                            placeholder="Business Type (e.g. Bakery)" 
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className={inputClass}
                        />
                        <textarea
                          placeholder="Goal? (e.g., Summer Sale 20% off)"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className={`${inputClass} h-16 resize-none`}
                        />
                        <button
                          onClick={handleGenerateSlogans}
                          disabled={isGenerating || !prompt}
                          className="w-full py-2 bg-moss-600 text-white rounded-md text-sm font-medium hover:bg-moss-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg"
                          title="Generate headline ideas for your banner based on your goal"
                        >
                          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Generate Ideas'}
                        </button>
                        <p className="text-[11px] text-slate-600">
                          Tip: use a short goal (e.g., “Book a consult this week”) for focused suggestions.
                        </p>
                      </div>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 relative z-10">
                      <p className="text-xs font-bold text-moss-400 uppercase">Suggestions</p>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setMarketingData((prev) => ({ ...prev, bannerCopyText: s }))}
                          className="w-full text-left text-xs p-2 bg-slate-200 hover:bg-moss-900/80 rounded border border-slate-200 text-slate-900 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Banner Copy</label>
                    <textarea
                      value={marketingData.bannerCopyText || ''}
                      onChange={(e) => setMarketingData((prev) => ({ ...prev, bannerCopyText: e.target.value }))}
                      className={`${inputClass} h-20`}
                    />
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Copy Opacity</span>
                        <span>{Math.round((marketingData.bannerCopyOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={marketingData.bannerCopyOpacity ?? 1}
                        onChange={(e) =>
                          setMarketingData((prev) => ({
                            ...prev,
                            bannerCopyOpacity: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-moss-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                     <label className="text-xs font-bold uppercase text-gold-400 mb-3 block">Call To Action</label>
                     <div className="grid grid-cols-1 gap-3">
                         <input 
                            placeholder="Button Text" 
                            value={marketingData.ctaText || ''}
                            onChange={e => setMarketingData(prev => ({...prev, ctaText: e.target.value}))}
                            className={inputClass}
                         />
                         <input 
                            placeholder="URL (https://...)" 
                            value={marketingData.ctaTargetUrl || ''}
                            onChange={e => setMarketingData(prev => ({...prev, ctaTargetUrl: e.target.value}))}
                            className={inputClass}
                         />
                         <div className="grid grid-cols-2 gap-4 mt-2">
                             <div>
                                <label className={labelClass}>Btn Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={marketingData.ctaBackgroundColor || '#ffffff'}
                                        onChange={(e) => setMarketingData((prev) => ({ ...prev, ctaBackgroundColor: e.target.value }))}
                                        className="color-input"
                                    />
                                    <span className="text-xs text-slate-500 font-mono">{marketingData.ctaBackgroundColor || '#ffffff'}</span>
                                </div>
                             </div>
                              <div>
                                <label className={labelClass}>Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={marketingData.ctaTextColor || '#000000'}
                                        onChange={(e) => setMarketingData((prev) => ({ ...prev, ctaTextColor: e.target.value }))}
                                        className="color-input"
                                    />
                                     <span className="text-xs text-slate-500 font-mono">{marketingData.ctaTextColor || '#000000'}</span>
                                </div>
                             </div>
                         </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <label className={labelClass}>Background Style</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                       {(['solid', 'gradient', 'bordered'] as const).map((s) => (
                           <button
                              key={s}
                              onClick={() => setMarketingData(prev => ({ ...prev, style: s }))}
                              className={`text-xs py-2 px-1 capitalize rounded border transition-colors ${marketingData.style === s ? 'border-moss-500 bg-moss-500/20 text-moss-400 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                           >
                            {s}
                           </button>
                       ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={marketingData.bannerBackgroundColor || '#e8f4ec'}
                            onChange={(e) => setMarketingData((prev) => ({ ...prev, bannerBackgroundColor: e.target.value }))}
                            className="color-input"
                          />
                          <span className="text-xs text-slate-500 font-mono">{marketingData.bannerBackgroundColor || '#e8f4ec'}</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Text Color</label>
                         <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={marketingData.bannerCopyTextColor || marketingData.bannerTextColor || '#0f172a'}
                            onChange={(e) => {
                              const next = e.target.value;
                              setMarketingData((prev) => ({
                                ...prev,
                                bannerTextColor: next,
                                bannerCopyTextColor: next,
                              }));
                            }}
                            className="color-input"
                          />
                          <span className="text-xs text-slate-500 font-mono">{marketingData.bannerCopyTextColor || marketingData.bannerTextColor || '#0f172a'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <label className={labelClass}>Custom Image</label>
                    {!marketingData.bannerUrl ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-moss-500 hover:text-moss-400 hover:bg-emerald-50 transition-all gap-2 bg-slate-100"
                        title="Add a banner image to your marketing block"
                      >
                        <ImageIcon size={20} />
                        <span className="text-xs">Upload Banner Image</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div 
                          ref={imageContainerRef}
                          className="relative h-24 w-full rounded-lg overflow-hidden border border-slate-200 group bg-slate-200 cursor-move select-none"
                          onMouseDown={onMouseDown}
                          onMouseMove={onMouseMove}
                          onMouseUp={onMouseUp}
                          onMouseLeave={onMouseUp}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${marketingData.bannerUrl})`,
                                backgroundSize: thumbnailOrientation === 'portrait' ? 'contain' : 'cover',
                                backgroundPosition: `${marketingData.imagePosition?.x ?? 50}% ${marketingData.imagePosition?.y ?? 50}%`,
                                opacity: 0.8
                            }}
                          />
                          
                          {/* Reposition Hint Overlay (keeps image visible) */}
                          {!isDragging && (
                             <div className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-slate-900/70 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 shadow-sm">
                                    <Move size={10} />
                                    Drag to Reposition
                                </div>
                             </div>
                          )}

                          <div className="absolute top-2 right-2 flex gap-2">
                             <button 
                                onClick={resetImagePosition}
                                className="p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-10"
                                title="Reset Position"
                             >
                                <Move size={14} />
                             </button>
                             <button 
                                onClick={clearImage}
                                className="p-1 bg-black/60 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-10"
                                title="Remove image"
                             >
                                <X size={14} />
                             </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Opacity</span>
                            <span>{Math.round((marketingData.bannerImageOpacity ?? 0.2) * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            value={marketingData.bannerImageOpacity ?? 0.2}
                            onChange={(e) => setMarketingData(prev => ({ ...prev, bannerImageOpacity: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-moss-500"
                          />
                        </div>
                        <p className="text-[11px] text-slate-600">Tip: drag the image to reposition; lower opacity for subtle overlays.</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
