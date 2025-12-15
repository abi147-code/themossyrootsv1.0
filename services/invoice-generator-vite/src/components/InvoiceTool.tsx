
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Editor } from './Editor';
import { InvoiceData, MarketingBannerData } from '../types';
import { ArrowLeft } from 'lucide-react';

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
  invoiceTemplateKey: 'luxury',
  invoiceTypographyKey: 'editorial',
  invoicePageColor: '#ffffff',
  invoiceTextColor: '#1e293b',
};

const INITIAL_MARKETING: MarketingBannerData = {
  enabled: true,
  bannerCopyText: 'Get 20% off your next project if you book before end of month!',
  bannerBackgroundColor: '#e8f4ec', // Light moss tint for bright theme
  bannerTextColor: '#0f172a',
  bannerCopyTextColor: '#0f172a',
  bannerCopyOpacity: 1,
  style: 'gradient',
  bannerImageOpacity: 0.2,
  ctaText: 'Book Now',
  ctaTargetUrl: 'https://acme.com/book',
  ctaBackgroundColor: '#1f7a4d', // Moss default
  ctaTextColor: '#ffffff' // Ink default
};

interface InvoiceToolProps {
    onBack: () => void;
    showHeader?: boolean;
}

export const InvoiceTool: React.FC<InvoiceToolProps> = ({ onBack, showHeader = true }) => {
  const CAMPAIGN_STORAGE_KEY = 'tmr-selectedCampaignId';
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(INITIAL_INVOICE);
  const [marketingData, setMarketingData] = useState<MarketingBannerData>(INITIAL_MARKETING);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [campaigns, setCampaigns] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeTabOverride, setActiveTabOverride] = useState<'details' | 'items' | 'marketing' | undefined>();
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const anchorsRef = useRef<Record<string, HTMLElement | null>>({});

  const persistSelectedCampaignId = useCallback(
    (id: string | null) => {
      setSelectedCampaignId(id);
      if (typeof window === 'undefined') return;
      if (id) {
        window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
      }
    },
    [CAMPAIGN_STORAGE_KEY]
  );

  const steps = useMemo(
    () => [
      { id: 'style', title: 'Visual Style', body: 'Choose your template and typography to set the tone.', tab: 'details' as const },
      { id: 'colors', title: 'Page & Text Colors', body: 'Adjust your page and text colors to match your brand.', tab: 'details' as const },
      { id: 'sender', title: 'Sender & Logo', body: 'Add your brand logo and sender details.', tab: 'details' as const },
      { id: 'client', title: 'Client Info', body: 'Fill in the client name, email, and address.', tab: 'details' as const },
      { id: 'items', title: 'Line Items', body: 'List your services/products and amounts.', tab: 'items' as const },
      { id: 'taxNotes', title: 'Taxes & Notes', body: 'Set tax rate and add notes or payment terms.', tab: 'items' as const },
      { id: 'marketing', title: 'Marketing Banner', body: 'Generate banner copy and add a hero image.', tab: 'marketing' as const },
      { id: 'actions', title: 'Export / Send', body: 'Download PDF, print, or email the invoice.', tab: undefined },
    ],
    []
  );

  const registerAnchor = (key: string, el: HTMLElement | null) => {
    anchorsRef.current[key] = el;
    if (showTour && steps[tourStep]?.id === key) {
      requestAnimationFrame(() => updateHighlight());
    }
  };

  const updateHighlight = (options?: { scroll?: boolean }) => {
    const current = steps[tourStep];
    if (!current) return;
    const el = anchorsRef.current[current.id];
    if (!el) {
      setHighlightRect(null);
      return;
    }
    if (options?.scroll) {
      // Scroll once to center the target; no smooth scrolling to avoid lag
      el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    }
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const pad = 12;
      const viewportH = typeof window !== 'undefined' ? window.innerHeight : rect.height;
      const viewportW = typeof window !== 'undefined' ? window.innerWidth : rect.width;
      const height = Math.min(rect.height + pad * 2, viewportH - 80);
      const width = Math.min(rect.width + pad * 2, viewportW - 40);
      const top = Math.max(0, rect.top + window.scrollY - pad);
      const left = Math.max(0, rect.left + window.scrollX - pad);
      setHighlightRect({
        top,
        left,
        width,
        height,
      });
    };
    requestAnimationFrame(measure);
  };

  useEffect(() => {
    if (showTour) {
      const step = steps[tourStep];
      setActiveTabOverride(step.tab);
      requestAnimationFrame(() => updateHighlight({ scroll: true }));
    } else {
      setActiveTabOverride(undefined);
      setHighlightRect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTour, tourStep, steps]);

  useEffect(() => {
    const handleResize = () => {
      if (showTour) updateHighlight();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [showTour]);

  useEffect(() => {
    const hasSeen = typeof window !== 'undefined' ? localStorage.getItem('tmr-invoice-tour') : 'seen';
    if (!hasSeen || hasSeen !== 'seen') {
      setShowTour(true);
    }
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    setTourStep(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tmr-invoice-tour', 'seen');
    }
  };

  const nextStep = () => {
    if (tourStep >= steps.length - 1) {
      dismissTour();
    } else {
      setTourStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setTourStep((s) => Math.max(0, s - 1));
  };

  const apiBase = (
    import.meta.env.VITE_PUBLIC_API_URL || // prefer explicit public API (typically :4000)
    import.meta.env.VITE_TMR_API_URL || // fallback to legacy var
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/+$/, '');

  const [bridgedToken, setBridgedToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [awaitingAuth, setAwaitingAuth] = useState(true);

  const resolveAuthHeaders = () => {
    const token = bridgedToken || '';
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyBridgedToken = (token?: string | null) => {
      const incomingToken =
        (token ??
          window.localStorage.getItem('tmr-token') ??
          window.sessionStorage.getItem('tmr-token') ??
          '').trim();
      if (!incomingToken) return;

      setBridgedToken(incomingToken);
      console.log('[TokenBridge] token accepted, bridgedToken set');
      setAuthReady(true);
      console.log('[TokenBridge] authReady set true');
      setAwaitingAuth(false);
    };

    applyBridgedToken();

    const handler: EventListener = (event) => {
      const incomingToken = (event as CustomEvent<string | null>).detail ?? null;
      applyBridgedToken(incomingToken);
    };

    window.addEventListener('tmr-token-bridged', handler);
    return () => {
      window.removeEventListener('tmr-token-bridged', handler);
    };
  }, []);

  useEffect(() => {
    if (authReady) {
      console.log('[TokenBridge] authReady observed true; awaitingAuth false');
      setAwaitingAuth(false);
    }
  }, [authReady]);

  const notify = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    if (type === 'error') console.error(message);
    if (type === 'error' && typeof window !== 'undefined') window.alert(message);
  };

  const fetchCampaigns = async (options?: { silent?: boolean }) => {
    const token = bridgedToken || '';

    if (!authReady) {
      setAwaitingAuth(true);
      return;
    }

    const auth = resolveAuthHeaders();
    if (!auth) {
      if (!options?.silent) {
        notify('Please log in to load campaigns.', 'error');
      }
      return;
    }

    setCampaignsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
          ...auth,
        },
      });
      if (!response.ok) throw new Error('Failed to load campaigns');
      const data = await response.json();
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    } catch (err) {
      console.error('[Campaigns] Failed to load campaigns', err);
      notify('Failed to load campaigns', 'error');
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) {
      fetchCampaigns({ silent: true }).catch(() => {
        /* errors already handled */
      });
    }
  }, [authReady]);

  const mapCampaignToState = (campaign: any) => {
    const parseImagePosition = (pos: unknown) => {
      if (typeof pos !== 'string') return null;
      const parts = pos.trim().split(/\s+/);
      if (parts.length < 2) return null;
      const [xRaw, yRaw] = parts;
      const parsePart = (val: string) => {
        const num = parseFloat(val.replace('%', ''));
        return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : null;
      };
      const x = parsePart(xRaw);
      const y = parsePart(yRaw);
      if (x === null || y === null) return null;
      return { x, y };
    };

    setInvoiceData((prev) => ({
      ...prev,
      invoicePageColor: campaign.invoicePageColor || '#ffffff',
      invoiceTextColor: campaign.invoiceTextColor || '#1e293b',
      invoiceTypographyKey: campaign.invoiceTypographyKey || prev.invoiceTypographyKey || 'editorial',
      invoiceTemplateKey: campaign.invoiceTemplateKey || prev.invoiceTemplateKey || 'luxury',
      logoUrl: campaign.logoUrl ?? prev.logoUrl,
      senderName: campaign.fromCompanyName || prev.senderName,
      senderEmail: campaign.fromCompanyEmail || prev.senderEmail,
      senderAddress: campaign.fromCompanyAddress || prev.senderAddress,
      fromCompanyName: campaign.fromCompanyName || prev.fromCompanyName,
      fromCompanyEmail: campaign.fromCompanyEmail || prev.fromCompanyEmail,
      fromCompanyAddress: campaign.fromCompanyAddress || prev.fromCompanyAddress,
    }));

      setMarketingData((prev) => ({
        ...prev,
        bannerCopyText: campaign.bannerCopyText ?? prev.bannerCopyText ?? '',
        bannerCopyTextColor:
          campaign.bannerCopyTextColor ??
        campaign.bannerTextColor ??
        prev.bannerCopyTextColor ??
        prev.bannerTextColor,
      bannerCopyOpacity: campaign.bannerCopyOpacity ?? prev.bannerCopyOpacity ?? 1,
      bannerBackgroundColor: campaign.bannerBackgroundColor ?? prev.bannerBackgroundColor ?? '#e8f4ec',
      bannerTextColor: campaign.bannerTextColor ?? prev.bannerTextColor ?? '#0f172a',
      bannerImageOpacity: campaign.bannerImageOpacity ?? prev.bannerImageOpacity ?? 0.2,
      bannerUrl: campaign.bannerUrl ?? prev.bannerUrl,
      ctaText: campaign.ctaText ?? prev.ctaText,
      ctaTargetUrl: campaign.ctaTargetUrl ?? prev.ctaTargetUrl,
      ctaBackgroundColor: campaign.ctaBackgroundColor ?? prev.ctaBackgroundColor,
      ctaTextColor: campaign.ctaTextColor ?? prev.ctaTextColor,
      imagePosition: (() => {
        const parsed = parseImagePosition(campaign.bannerImagePosition);
        return parsed ?? campaign.imagePosition ?? prev.imagePosition;
      })(),
    }));
  };

  const loadCampaignById = async (id: number) => {
    const token = bridgedToken || '';

    if (!authReady) {
      setAwaitingAuth(true);
      notify('Waiting for authentication to load campaigns...', 'info');
      return;
    }

    const auth = resolveAuthHeaders();
    if (!auth) {
      notify('Please log in to load campaigns.', 'error');
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/campaigns/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...auth,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch campaign');
      const data = await response.json();
      if (data?.campaign) {
        mapCampaignToState(data.campaign);
        persistSelectedCampaignId(String(id));
        notify(
          `Campaign "${data.campaign.name || id}" loaded (branding + marketing settings applied).`,
          'success'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Campaigns] Failed to load campaign', err);
      notify('Failed to load campaign', 'error');
      return false;
    }
  };

  const handleSaveCampaign = async (options?: { forceCreate?: boolean }) => {
    if (!authReady) {
      setAwaitingAuth(true);
      notify('Waiting for authentication to save campaigns...', 'info');
      return;
    }

    const auth = resolveAuthHeaders();
    if (!auth) {
      notify('Please log in to save campaigns.', 'error');
      return;
    }
    const token = bridgedToken || '';
    const name = window.prompt('Campaign name', invoiceData.invoiceNumber || 'New Campaign');
    if (!name || !name.trim()) {
      notify('Campaign name is required', 'error');
      return;
    }
    const description = window.prompt('Campaign description (optional)', '');
    const bannerImagePosition = marketingData.imagePosition
      ? `${marketingData.imagePosition.x}% ${marketingData.imagePosition.y}%`
      : null;

    const payload = {
      name: name.trim(),
      description: description?.trim() || null,
      invoicePageColor: invoiceData.invoicePageColor || null,
      invoiceTextColor: invoiceData.invoiceTextColor || null,
      invoiceTypographyKey: invoiceData.invoiceTypographyKey || null,
      invoiceTemplateKey: invoiceData.invoiceTemplateKey || null,
      logoUrl: invoiceData.logoUrl || null,
      bannerUrl: marketingData.bannerUrl || null,
      bannerCopyText: marketingData.bannerCopyText || null,
      bannerCopyTextColor:
        marketingData.bannerCopyTextColor || marketingData.bannerTextColor || null,
      bannerCopyOpacity:
        typeof marketingData.bannerCopyOpacity === 'number' ? marketingData.bannerCopyOpacity : null,
      bannerBackgroundColor: marketingData.bannerBackgroundColor || null,
      bannerTextColor: marketingData.bannerTextColor || null,
      bannerImageOpacity:
        typeof marketingData.bannerImageOpacity === 'number' ? marketingData.bannerImageOpacity : null,
      bannerImagePosition,
      imagePosition: marketingData.imagePosition || null,
      ctaText: marketingData.ctaText || null,
      ctaTargetUrl: marketingData.ctaTargetUrl || null,
      ctaBackgroundColor: marketingData.ctaBackgroundColor || null,
      ctaTextColor: marketingData.ctaTextColor || null,
      fromCompanyName: invoiceData.fromCompanyName || invoiceData.senderName || null,
      fromCompanyAddress: invoiceData.fromCompanyAddress || invoiceData.senderAddress || null,
      fromCompanyEmail: invoiceData.fromCompanyEmail || invoiceData.senderEmail || null,
      status: 'draft',
    };

    setIsSavingCampaign(true);
    try {
    const isUpdating = !!selectedCampaignId && !options?.forceCreate;
    const targetUrl = isUpdating
      ? `${apiBase}/api/campaigns/${selectedCampaignId}`
      : `${apiBase}/api/campaigns`;
    const response = await fetch(targetUrl, {
      method: isUpdating ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to save campaign');
    const data = await response.json().catch(() => ({}));
    const savedId = data?.campaign?.id ?? (isUpdating ? selectedCampaignId : null);
    if (savedId) {
      persistSelectedCampaignId(String(savedId));
    }
    await fetchCampaigns();
    notify(isUpdating ? 'Campaign updated successfully' : 'Campaign created successfully', 'success');
    } catch (err) {
      console.error('Failed to save campaign', err);
      notify('Failed to save campaign', 'error');
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleCreateNewCampaign = async () => {
    persistSelectedCampaignId(null);
    await handleSaveCampaign({ forceCreate: true });
  };

  useEffect(() => {
    if (!authReady || selectedCampaignId) return;
    if (typeof window === 'undefined') return;
    const storedId = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!storedId) return;
    console.info('[InvoiceTool] Rehydrating selectedCampaignId from storage:', storedId);
    loadCampaignById(Number(storedId)).then((ok) => {
      if (!ok && typeof window !== 'undefined') {
        window.localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
        persistSelectedCampaignId(null);
      }
    });
  }, [authReady, selectedCampaignId, CAMPAIGN_STORAGE_KEY]);

  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const effectiveCampaignsLoading = campaignsLoading || awaitingAuth;

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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTourStep(0);
                setShowTour(true);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('tmr-invoice-tour', 'seen');
                }
              }}
              className="px-3 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide hover:bg-emerald-100 transition-colors"
            >
              Show Tour
            </button>
          </div>
        </header>
      )}

      <main className="flex-grow p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTourStep(0);
              setShowTour(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem('tmr-invoice-tour', 'seen');
              }
            }}
            className="no-print absolute -top-2 right-0 z-10 px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-emerald-700 text-xs font-semibold shadow-sm hover:bg-emerald-50 transition-colors"
          >
            Show tour
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Column */}
            <div className="lg:col-span-4 xl:col-span-3 no-print h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
              <Editor 
                invoiceData={invoiceData} 
                setInvoiceData={setInvoiceData}
                marketingData={marketingData}
                setMarketingData={setMarketingData}
                registerAnchor={registerAnchor}
                activeTabOverride={activeTabOverride}
              />
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-8 xl:col-span-9 flex justify-center overflow-auto pb-20">
              <InvoicePreview 
                data={invoiceData} 
                banner={marketingData} 
                registerAnchor={registerAnchor}
                onSaveCampaign={handleSaveCampaign}
                onCreateNewCampaign={handleCreateNewCampaign}
                onOpenCampaigns={fetchCampaigns}
                onLoadCampaign={loadCampaignById}
                campaigns={campaigns}
                campaignsLoading={effectiveCampaignsLoading}
                selectedCampaignId={selectedCampaignId}
                setSelectedCampaignId={persistSelectedCampaignId}
                isSavingCampaign={isSavingCampaign}
              />
            </div>
          </div>
        </div>
      </main>

      {showTour && (
        <div className="fixed inset-0 z-[2000] pointer-events-none">
          <div className="absolute inset-0 pointer-events-auto" onClick={dismissTour} />
          {highlightRect && (
            <div
              className="absolute rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] pointer-events-none transition-all duration-150 bg-transparent"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            />
          )}
          <div
            className="absolute z-[2100] max-w-sm pointer-events-auto"
            style={{
              // Clamp within viewport to keep text visible even if the highlight is near the edges
              top: Math.max(
                scrollY + 16,
                Math.min(
                  (highlightRect ? highlightRect.top + highlightRect.height + 16 : scrollY + 120),
                  scrollY + Math.max(80, viewportHeight - 200)
                )
              ),
              left: Math.max(
                scrollX + 16,
                Math.min(
                  highlightRect
                    ? Math.min(
                        scrollX + (viewportWidth ? viewportWidth - 320 : highlightRect.left),
                        Math.max(highlightRect.left, scrollX + 16)
                      )
                    : scrollX + 24,
                  scrollX + Math.max(24, viewportWidth - 340)
                )
              ),
            }}
          >
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-100/40 p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-700 mb-2">
                Step {tourStep + 1} of {steps.length}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">{steps[tourStep]?.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{steps[tourStep]?.body}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={dismissTour}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Skip
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={tourStep === 0}
                    className="px-3 py-2 text-xs rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 text-xs rounded-full bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-500"
                  >
                    {tourStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Manual verification checklist:
// - Open the invoice tool via the dashboard iframe, ensure a valid login token is present (console logs should show hasToken: true).
// - Watch devtools network/logs: fetchCampaigns should hit `${apiBase}/api/campaigns` with 200 status and populate the dropdown.
// - Select a campaign: expect success toast confirming branding/marketing applied and see those visual changes in the preview.
