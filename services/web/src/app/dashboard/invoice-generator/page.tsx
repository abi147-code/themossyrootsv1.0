'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const iframeSrc =
  process.env.NEXT_PUBLIC_INVOICE_GENERATOR_URL ?? 'http://localhost:5173';

export default function InvoiceGeneratorPage() {
  const { token } = useAuth();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const iframeOrigin = useMemo(() => {
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return null;
    }
  }, [iframeSrc]);

  const postTokenToIframe = useCallback(() => {
    const currentIframe = iframeRef.current;
    const contentWindow = currentIframe?.contentWindow ?? null;

    console.log('[DEBUG][Dashboard] Posting token to iframe from origin:', window.location.origin);
    console.log('[DEBUG][Dashboard] Token being sent:', token);
    console.log('[DEBUG][Dashboard] iframeRef.current:', currentIframe);
    console.log('[DEBUG][Dashboard] iframe contentWindow is', contentWindow ? 'defined' : 'null');

    if (!currentIframe || !token || !iframeOrigin) return;
    try {
      const targetWindow = currentIframe.contentWindow;
      console.log('[InvoiceGenerator] Posting token to iframe', {
        hasContentWindow: !!targetWindow,
        iframeOrigin,
        tokenPresent: !!token,
      });
      currentIframe.contentWindow?.postMessage(
        { type: 'TMR_TOKEN_BRIDGE', token },
        '*' // permissive for dev to allow localhost origin mismatches
      );
    } catch (err) {
      console.error('Failed to post auth token to invoice iframe', err);
    }
  }, [iframeOrigin, token]);

  const scheduleToastClear = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setStatusMessage(null), 3000);
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!iframeOrigin || event.origin !== iframeOrigin) return;
      const data = event.data;
      if (!data || data.type !== 'tmr:vite-invoice:sent' || !data.payload) return;

      if (!token) {
        setStatusMessage({ type: 'error', message: 'Missing auth token; history not saved.' });
        scheduleToastClear();
        return;
      }

      try {
        const response = await apiFetch('/api/vite-invoice/save-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data.payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          setStatusMessage({ type: 'error', message: errorText || 'Failed to save invoice history.' });
          scheduleToastClear();
          return;
        }

        setStatusMessage({ type: 'success', message: 'Invoice saved to dashboard history.' });
        scheduleToastClear();
      } catch (err) {
        console.error('Failed to persist invoice history from Vite tool', err);
        setStatusMessage({ type: 'error', message: 'Failed to save invoice history.' });
        scheduleToastClear();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [iframeOrigin, token]);

  useEffect(() => {
    postTokenToIframe();
  }, [postTokenToIframe]);

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'TMR_TOKEN_BRIDGE_READY') return;
      if (iframeOrigin && event.origin !== iframeOrigin) return;

      console.log('[DEBUG][Dashboard] Received READY from iframe. Origin:', event.origin);
      if (!token) {
        console.log('[DEBUG][Dashboard] No token available when READY received');
        return;
      }
      postTokenToIframe();
    };

    window.addEventListener('message', handleReady);
    return () => window.removeEventListener('message', handleReady);
  }, [iframeOrigin, postTokenToIframe, token]);

  const handleIframeLoad = () => {
    postTokenToIframe();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Exit Tool
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Invoice Generator"
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write"
          onLoad={handleIframeLoad}
        />
      </div>
      {statusMessage ? (
        <div
          className="fixed bottom-4 right-4 rounded-lg px-4 py-3 text-sm shadow-lg"
          style={{ background: statusMessage.type === 'success' ? '#0f172a' : '#7f1d1d', color: '#fff' }}
        >
          {statusMessage.message}
        </div>
      ) : null}
    </div>
  );
}
