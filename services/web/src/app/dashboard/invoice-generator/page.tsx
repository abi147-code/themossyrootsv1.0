'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const iframeSrc =
  process.env.NEXT_PUBLIC_INVOICE_GENERATOR_URL ?? 'http://localhost:5173';

export default function InvoiceGeneratorPage() {
  const { token } = useAuth();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const iframeOrigin = useMemo(() => {
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return null;
    }
  }, []);

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
          src={iframeSrc}
          title="Invoice Generator"
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write"
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
