const envMeta = typeof import.meta !== 'undefined' ? (import.meta as any)?.env || {} : {};
export const API_BASE_URL = (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || envMeta.VITE_API_BASE_URL || '';

export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, '')}${cleanPath}`;
  }
  return cleanPath;
}
