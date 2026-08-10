import { createClient, SupabaseClient } from '@supabase/supabase-js';

// This is a SERVER-ONLY client — it uses the service role key (full read/write,
// bypasses Row Level Security) and must never be imported into frontend code
// or shipped to the browser bundle. server.ts is the only caller.

let client: SupabaseClient | null | undefined = undefined;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('your-supabase') || value === 'MY_GEMINI_API_KEY';
}

/**
 * Returns a singleton Supabase client, or null if SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY are missing or still set to the .env.example
 * placeholder values. Callers should treat `null` as "run in-memory only".
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (looksLikePlaceholder(url) || looksLikePlaceholder(serviceKey)) {
    console.warn(
      '[Supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — ' +
      'falling back to in-memory storage. Articles will NOT persist across restarts. ' +
      'Set both in your .env to enable persistence.'
    );
    client = null;
    return client;
  }

  try {
    client = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    console.log('[Supabase] Connected — articles & pipeline items will persist.');
  } catch (err) {
    console.error('[Supabase] Failed to initialize client, falling back to in-memory storage:', err);
    client = null;
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
