'use client';

import type { InvoiceLayout } from '../hooks/useInvoiceBuilder';

export function downloadLayoutAsJson(layout: InvoiceLayout, filename = 'invoice-layout.json') {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('[InvoiceBuilder] Failed to trigger JSON download:', error);
  }
}
