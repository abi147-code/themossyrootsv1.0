
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Editor } from './Editor';
import { InvoiceData, MarketingBannerData } from '../types';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [campaigns, setCampaigns] = useState<{ id: number; name: string; description?: string; apiBase?: string | null }[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeTabOverride, setActiveTabOverride] = useState<'details' | 'items' | 'marketing' | undefined>();
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [campaignNameInput, setCampaignNameInput] = useState('');
  const [campaignDescriptionInput, setCampaignDescriptionInput] = useState('');
  const [campaignFormError, setCampaignFormError] = useState<string | null>(null);
  const [pendingCampaignOptions, setPendingCampaignOptions] = useState<{ forceCreate?: boolean } | null>(null);
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
      {
        id: 'campaignSelect',
        title: 'Use a Saved Campaign',
        body: 'Select an existing campaign to instantly apply its branding, banner, and marketing settings to your invoice.',
        tab: undefined,
      },
      {
        id: 'campaignSave',
        title: 'Save as a Campaign',
        body: 'Save your current invoice design and marketing setup as a reusable campaign for future invoices.',
        tab: undefined,
      },
      {
        id: 'campaignCreate',
        title: 'Create a New Campaign',
        body: 'Start a fresh campaign to experiment with new branding or promotional ideas without affecting existing ones.',
        tab: undefined,
      },
      {
        id: 'campaignReset',
        title: 'Reset to Campaign Defaults',
        body: "Revert the invoice back to the selected campaign's saved settings if you've made temporary changes.",
        tab: undefined,
      },
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

  // STRICT: apiBase must be explicitly defined in environment
  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/^["']|["']$/g, '').replace(/\/+$/, '').trim()
    : (() => {
      throw new Error('VITE_API_BASE_URL must be defined');
    })();

  // Helper to safely read and sanitize token
  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem('tmr-token');
    if (!raw) return null;
    return raw.trim().replace(/^["']|["']$/g, '');
  };

  const [bridgedToken, setBridgedToken] = useState<string | null>(getSafeToken);

  const [authReady, setAuthReady] = useState(() => {
    // If token exists in storage on mount, we are ready
    return !!getSafeToken();
  });

  const [awaitingAuth, setAwaitingAuth] = useState(!authReady);

  const resolveAuthHeaders = () => {
    const token = bridgedToken || '';
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyBridgedToken = (token: string | null) => {
      // STRICT: Only accept non-empty tokens
      if (!token) return;

      setBridgedToken(token);
      console.log('[TokenBridge] token accepted, bridgedToken set');
      setAuthReady(true);
      console.log('[TokenBridge] authReady set true');
      setAwaitingAuth(false);
    };

    // Note: We don't need to poll storage here because initial state handles mount,
    // and the event listener handles updates.

    const handler: EventListener = (event) => {
      const detail = (event as CustomEvent).detail;
      const incomingToken = detail?.token ?? detail ?? null;
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
    if (type === 'error') {
      console.error(message);
      toast.error(message);
      return;
    }
    if (type === 'success') {
      toast.success(message);
      return;
    }
    toast(message);
  };

  const openCampaignDialog = useCallback(
    (options?: { forceCreate?: boolean }) => {
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

      setPendingCampaignOptions(options || null);
      setCampaignNameInput(invoiceData.invoiceNumber || 'New Campaign');
      setCampaignDescriptionInput('');
      setCampaignFormError(null);
      setShowCampaignDialog(true);
    },
    [authReady, invoiceData.invoiceNumber, notify, resolveAuthHeaders]
  );

  const authedFetch = async (url: string, options: RequestInit = {}) => {
    if (!authReady) {
      throw new Error('Authentication not ready');
    }
    const token = bridgedToken;
    if (!token) {
      throw new Error('No auth token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
  };

  const fetchCampaigns = async (options?: { silent?: boolean }) => {
    // STRICT: Fail fast if not ready
    if (!authReady) {
      if (!options?.silent) {
        notify('Waiting for authentication...', 'info');
      }
      return;
    }

    setCampaignsLoading(true);
    try {
      const response = await authedFetch(`${apiBase}/api/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
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

    try {
      const response = await authedFetch(`${apiBase}/api/campaigns/${id}`, {
        headers: {
          'Content-Type': 'application/json',
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

  const confirmCampaignSave = useCallback(async () => {
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

    const assertApiBaseUrl = (currentApiBase: string) => {
      try {
        const base = new URL(currentApiBase);
        if (base.protocol !== 'https:' && base.protocol !== 'http:') {
          throw new Error('Unsupported apiBase protocol');
        }
      } catch {
        throw new Error(`Invalid apiBase URL: ${currentApiBase}`);
      }
    };

    const assertInternalApiUrl = (url: string, currentApiBase: string) => {
      try {
        const u = new URL(url);
        const base = new URL(currentApiBase);

        if (u.host !== base.host) {
          throw new Error(`Cross-environment URL detected: ${url}`);
        }

        return url;
      } catch {
        throw new Error(`Invalid or cross-env URL: ${url}`);
      }
    };

    const assertExternalCtaUrl = (url: string) => {
      try {
        const u = new URL(url);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          throw new Error('Unsupported CTA URL protocol');
        }
      } catch {
        throw new Error(`Invalid CTA URL: ${url}`);
      }
    };

    const assertImageUrl = (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return;
      try {
        const u = new URL(trimmed);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          throw new Error('Unsupported image URL protocol');
        }
      } catch {
        throw new Error(`Invalid image URL: ${url}`);
      }
    };

    try {
      const name = (campaignNameInput || '').trim();
      if (!name) {
        setCampaignFormError('Campaign name is required');
        notify('Campaign name is required', 'error');
        return;
      }

      const description = (campaignDescriptionInput || '').trim();
      const options = pendingCampaignOptions || {};
      const bannerImagePosition = marketingData.imagePosition
        ? `${marketingData.imagePosition.x}% ${marketingData.imagePosition.y}%`
        : null;

      // Sanitize fields before payload construction
      assertApiBaseUrl(apiBase);
      if (invoiceData.logoUrl) assertImageUrl(invoiceData.logoUrl);
      if (marketingData.bannerUrl) assertImageUrl(marketingData.bannerUrl);
      if (marketingData.ctaTargetUrl) assertExternalCtaUrl(marketingData.ctaTargetUrl);

      const payload = {
        name,
        description: description || null,
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
        apiBase,
        status: 'draft',
      };

      setIsSavingCampaign(true);

      const isUpdating = !!selectedCampaignId && !options.forceCreate;
      const targetUrl = isUpdating
        ? `${apiBase}/api/campaigns/${selectedCampaignId}`
        : `${apiBase}/api/campaigns`;

      const response = await authedFetch(targetUrl, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      setShowCampaignDialog(false);
      setPendingCampaignOptions(null);
      setCampaignFormError(null);
    } catch (err: any) {
      console.error('Failed to save campaign', err);
      // UX Safety: Alert user immediately on validation failure
      if (err.message && (err.message.includes('URL') || err.message.includes('Cross-environment'))) {
        alert(err.message);
      } else {
        notify('Failed to save campaign', 'error');
      }
    } finally {
      setIsSavingCampaign(false);
    }
  }, [
    apiBase,
    authReady,
    campaignDescriptionInput,
    campaignNameInput,
    invoiceData.fromCompanyAddress,
    invoiceData.fromCompanyEmail,
    invoiceData.fromCompanyName,
    invoiceData.invoicePageColor,
    invoiceData.invoiceTemplateKey,
    invoiceData.invoiceTextColor,
    invoiceData.invoiceTypographyKey,
    invoiceData.logoUrl,
    invoiceData.senderAddress,
    invoiceData.senderEmail,
    invoiceData.senderName,
    marketingData.bannerBackgroundColor,
    marketingData.bannerCopyOpacity,
    marketingData.bannerCopyText,
    marketingData.bannerCopyTextColor,
    marketingData.bannerImageOpacity,
    marketingData.bannerUrl,
    marketingData.bannerTextColor,
    marketingData.ctaBackgroundColor,
    marketingData.ctaTargetUrl,
    marketingData.ctaText,
    marketingData.ctaTextColor,
    marketingData.imagePosition,
    notify,
    pendingCampaignOptions,
    persistSelectedCampaignId,
    resolveAuthHeaders,
    selectedCampaignId,
    fetchCampaigns,
    setAwaitingAuth,
  ]);

  const handleSaveCampaign = async (options?: { forceCreate?: boolean }) => {
    openCampaignDialog(options);
  };

  const handleCreateNewCampaign = async () => {
    persistSelectedCampaignId(null);
    await handleSaveCampaign({ forceCreate: true });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!showCampaignDialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowCampaignDialog(false);
        setCampaignFormError(null);
        return;
      }
      if (event.key === 'Enter') {
        const target = event.target as HTMLElement | null;
        const isInput =
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('role') === 'textbox');
        if (isInput) {
          event.preventDefault();
          confirmCampaignSave();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmCampaignSave, showCampaignDialog]);

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
                showTour={showTour}
                tourStepId={steps[tourStep]?.id}
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

      {showCampaignDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowCampaignDialog(false);
              setPendingCampaignOptions(null);
              setCampaignFormError(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-700">Campaign</p>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">
                  {pendingCampaignOptions?.forceCreate || !selectedCampaignId ? 'Create campaign' : 'Save campaign'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCampaignDialog(false);
                  setPendingCampaignOptions(null);
                  setCampaignFormError(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Esc
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                confirmCampaignSave();
              }}
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Campaign name</label>
                <input
                  type="text"
                  value={campaignNameInput}
                  onChange={(e) => {
                    setCampaignNameInput(e.target.value);
                    if (campaignFormError) setCampaignFormError(null);
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${campaignFormError ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-emerald-200'
                    }`}
                  placeholder="e.g., Spring Promo"
                  autoFocus
                />
                {campaignFormError && (
                  <p className="text-xs text-red-600">{campaignFormError}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description (optional)</label>
                <textarea
                  value={campaignDescriptionInput}
                  onChange={(e) => setCampaignDescriptionInput(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                  placeholder="Notes about this campaign"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCampaignDialog(false);
                    setPendingCampaignOptions(null);
                    setCampaignFormError(null);
                  }}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-800"
                  disabled={isSavingCampaign}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCampaign}
                  className={`px-4 py-2 rounded-md text-sm font-semibold shadow ${isSavingCampaign
                    ? 'bg-emerald-200 text-emerald-800 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                >
                  {isSavingCampaign ? 'Saving...' : 'Save campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
