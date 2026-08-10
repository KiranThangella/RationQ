// In local dev, frontend + backend run on the same Express server, so
// VITE_API_BASE_URL is unset and requests stay same-origin ('/api/...').
//
// In a split deployment (frontend on Cloudflare Pages, backend on Render),
// set VITE_API_BASE_URL to the backend's public URL, e.g.
//   VITE_API_BASE_URL=https://rationq-api.onrender.com
// at build time (Cloudflare Pages -> Settings -> Environment variables).
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
