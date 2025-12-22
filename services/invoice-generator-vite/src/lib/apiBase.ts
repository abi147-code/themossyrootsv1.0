export function getApiBase() {
  // Explicit local override (inlined at build time; absent in production)
  if (import.meta.env.VITE_LOCAL_API_BASE) {
    return import.meta.env.VITE_LOCAL_API_BASE;
  }
  return '';
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
  return 'https://themossyroots.com';
}
