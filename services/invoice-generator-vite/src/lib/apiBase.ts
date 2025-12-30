export function getApiBase() {
  // Prefer explicit base for production; allow local override during dev
  return import.meta.env.VITE_LOCAL_API_BASE || import.meta.env.VITE_API_BASE || '';
}

export function getTrackingBase(): string {
  // DEV: absolute base for local API
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  // PROD / PREVIEW: same-origin is valid
  return '';
}

export function getPublicTrackingBase(): string {
  // Public domain for email tracking links (must be absolute for email clients)
  return import.meta.env.VITE_PUBLIC_TRACKING_BASE || 'https://themossyroots.com';
}
