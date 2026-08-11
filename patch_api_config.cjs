const fs = require('fs');
const content = `const envMeta = typeof import.meta !== 'undefined' ? (import.meta as any)?.env || {} : {};

// Get environment variable if configured
const rawApiUrl = (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || envMeta.VITE_API_BASE_URL || '';

export function getBackendBaseUrl(): string {
  if (rawApiUrl) {
    return rawApiUrl.replace(/\\/$/, '');
  }
  return '';
}

export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : \`/\${path}\`;
  const baseUrl = getBackendBaseUrl();
  return baseUrl ? \`\${baseUrl}\${cleanPath}\` : cleanPath;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function safeFetchJson<T = any>(
  pathOrUrl: string,
  options?: RequestInit,
  retries = 3,
  backoffMs = 1000
): Promise<T | null> {
  const url = getApiUrl(pathOrUrl);
  let lastError: any = null;

  for (let i = 0; i < retries; i++) {
    try {
      const fetchOptions: RequestInit = {
        mode: 'cors',
        ...options,
      };
      
      const res = await fetch(url, fetchOptions);
      
      if (!res.ok) {
        console.warn(\`[API Warning] \${res.status} \${res.statusText} for \${url}\`);
        
        // If it's a 5xx error or 429, we might want to retry. Otherwise, break.
        if (res.status >= 500 || res.status === 429) {
          throw new Error(\`Server error \${res.status}\`);
        }
        return null;
      }
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      
      const text = await res.text();
      console.warn(\`[API Warning] Non-JSON response received from \${url}:\`, text.slice(0, 100));
      return null;
    } catch (err: any) {
      lastError = err;
      const isNetworkOrCorsError = err.name === 'TypeError' && err.message.includes('fetch');
      console.warn(\`[API Retry \${i + 1}/\${retries}] Request failed for \${url}:\`, err.message);
      
      if (i < retries - 1) {
        // Wait before retrying (exponential backoff)
        await delay(backoffMs * Math.pow(2, i));
      }
    }
  }

  console.error(\`[API Error] All \${retries} retries failed for \${url}:\`, lastError);
  return null;
}
`;
fs.writeFileSync('src/lib/apiConfig.ts', content);
