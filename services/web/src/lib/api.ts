const DEFAULT_API_BASE_URL = 'http://localhost:4000';

const normalizeBaseUrl = (url: string): string => url.replace(/\/$/, '');

const ensureLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

const isAbsoluteUrl = (path: string): boolean => /^https?:\/\//i.test(path);

const resolveBaseUrl = (): string => {
  const envBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envBase) {
    return normalizeBaseUrl(envBase);
  }

  if (typeof window !== 'undefined') {
    const windowBase = (window as { NEXT_PUBLIC_API_URL?: unknown }).NEXT_PUBLIC_API_URL;
    if (typeof windowBase === 'string' && windowBase.trim()) {
      return normalizeBaseUrl(windowBase.trim());
    }
  }

  return normalizeBaseUrl(DEFAULT_API_BASE_URL);
};

let cachedBaseUrl: string | undefined;

export const getApiBaseUrl = (): string => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = resolveBaseUrl();
  }
  return cachedBaseUrl;
};

export const buildApiUrl = (path: string): string => {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  return `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;
};

export const apiFetch = (path: string, init?: RequestInit) => fetch(buildApiUrl(path), init);

export const resolveAssetUrl = (path?: string | null): string | null => {
  if (!path) {
    return null;
  }
  return buildApiUrl(path);
};
