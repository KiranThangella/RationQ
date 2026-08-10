const envMeta = typeof import.meta !== 'undefined' ? (import.meta as any)?.env || {} : {};

// Get environment variable if configured
const rawApiUrl = (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || envMeta.VITE_API_BASE_URL || '';

export function getBackendBaseUrl(): string {
  if (rawApiUrl) {
    return rawApiUrl.replace(/\/$/, '');
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running locally or on Cloud Run dev container, relative /api paths work
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.run.app')
    ) {
      return '';
    }
    // Default production backend on Render when hosted on Cloudflare Pages, Vercel, Netlify, custom domain, etc.
    return 'https://rationq-hs7w.onrender.com';
  }

  return 'https://rationq-hs7w.onrender.com';
}

export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getBackendBaseUrl();
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}
