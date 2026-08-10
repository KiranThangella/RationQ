import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, NewsPipelineItem } from '../types.js';
import { INITIAL_ARTICLES, INITIAL_PIPELINE_ITEMS } from '../data/mockDatabase.js';
import { createSlug } from './slugUtils.js';
import { getApiUrl, safeFetchJson } from './apiConfig.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env || {} : {};
    const url = process.env.SUPABASE_URL || metaEnv.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY || metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_KEY;

    if (url && key && url !== 'https://your-supabase-project.supabase.co') {
      try {
        supabaseClient = createClient(url, key, {
          auth: { persistSession: false },
        });
        console.log('✅ Supabase client initialized with URL:', url);
      } catch (err) {
        console.warn('⚠️ Failed to initialize Supabase client:', err);
      }
    }
  }
  return supabaseClient;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseAdminClient) {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env || {} : {};
    const url = process.env.SUPABASE_URL || metaEnv.VITE_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      metaEnv.VITE_SUPABASE_ANON_KEY ||
      metaEnv.VITE_SUPABASE_KEY;

    if (url && serviceKey && url !== 'https://your-supabase-project.supabase.co') {
      try {
        supabaseAdminClient = createClient(url, serviceKey, {
          auth: { persistSession: false },
        });
        console.log('✅ Supabase Admin (Service Role) client initialized');
      } catch (err) {
        console.warn('⚠️ Failed to initialize Supabase admin client:', err);
      }
    }
  }
  return supabaseAdminClient || getSupabaseClient();
}

// Convert DB row or JSONB to Article interface
function mapRowToArticle(row: any): Article {
  let parsedData = row.data;
  if (typeof parsedData === 'string') {
    try {
      parsedData = JSON.parse(parsedData);
    } catch (e) {
      parsedData = null;
    }
  }

  const rowSlug = (parsedData && parsedData.slug) || row.slug;
  const safeTitle = row.title || (parsedData && parsedData.title);
  const safeSlug = rowSlug && rowSlug.trim().length >= 3 
    ? rowSlug 
    : createSlug(safeTitle, row.id);

  if (parsedData && typeof parsedData === 'object') {
    return { ...parsedData, id: row.id || parsedData.id, slug: safeSlug, status: row.status || parsedData.status || 'published' };
  }
  return {
    id: row.id,
    slug: safeSlug,
    schemeId: row.scheme_id || row.slug || row.id,
    title: row.title,
    titleTelugu: row.title_telugu,
    shortSummary: row.short_summary,
    shortSummaryTelugu: row.short_summary_telugu,
    whatHappened: row.what_happened,
    whatHappenedTelugu: row.what_happened_telugu,
    whatIsScheme: row.what_is_scheme,
    whatIsSchemeTelugu: row.what_is_scheme_telugu,
    detailedGuideText: row.detailed_guide_text,
    detailedGuideTextTelugu: row.detailed_guide_text_telugu,
    benefits: row.benefits || [],
    whoCanApply: row.who_can_apply || [],
    whoCannotApply: row.who_cannot_apply || [],
    documents: row.documents || [],
    steps: row.steps || [],
    faqs: row.faqs || [],
    importantWarnings: row.important_warnings || [],
    source: row.source || {},
    deadline: row.deadline || null,
    statusCheckGuide: row.status_check_guide || '',
    officialWebsite: row.official_website || '',
    generatedImage: row.generated_image || '',
    publishedAt: row.published_at || new Date().toISOString(),
    lastVerifiedAt: row.last_verified_at || new Date().toISOString(),
    readTimeMinutes: row.read_time_minutes || 4,
    category: row.category || 'Government Schemes',
    state: row.state || 'Central Government',
    isCentral: row.is_central ?? true,
    isNew: row.is_new ?? false,
    isUpdated: row.is_updated ?? false,
    status: row.status || 'published',
  };
}

// Convert Article to Supabase row format
function mapArticleToRow(article: Article) {
  return {
    id: article.id,
    slug: article.slug,
    scheme_id: article.schemeId,
    title: article.title,
    title_telugu: article.titleTelugu,
    short_summary: article.shortSummary,
    short_summary_telugu: article.shortSummaryTelugu,
    what_happened: article.whatHappened,
    what_happened_telugu: article.whatHappenedTelugu,
    what_is_scheme: article.whatIsScheme,
    what_is_scheme_telugu: article.whatIsSchemeTelugu,
    detailed_guide_text: article.detailedGuideText,
    detailed_guide_text_telugu: article.detailedGuideTextTelugu,
    benefits: article.benefits || [],
    who_can_apply: article.whoCanApply || [],
    who_cannot_apply: article.whoCannotApply || [],
    documents: article.documents || [],
    steps: article.steps || [],
    faqs: article.faqs || [],
    important_warnings: article.importantWarnings || [],
    source: article.source || {},
    deadline: article.deadline,
    status_check_guide: article.statusCheckGuide,
    official_website: article.officialWebsite,
    generated_image: article.generatedImage,
    published_at: article.publishedAt,
    last_verified_at: article.lastVerifiedAt,
    read_time_minutes: article.readTimeMinutes,
    category: article.category,
    state: article.state,
    is_central: article.isCentral,
    is_new: article.isNew,
    is_updated: article.isUpdated,
    status: article.status,
    data: article,
  };
}

// In-Memory store as immediate fallback
let memoryArticles: Article[] = [...INITIAL_ARTICLES];
let memoryPipeline: NewsPipelineItem[] = [...INITIAL_PIPELINE_ITEMS];
let supabaseArticlesTableMissing = false;
let supabasePipelineTableMissing = false;

/**
 * Diagnostic utility to verify Supabase connection, test table availability,
 * and provide actionable log guidance.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  articlesTableExists: boolean;
  newsPipelineTableExists: boolean;
  details: string;
}> {
  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (!client) {
    console.warn('❌ [Supabase Diagnostic] Client not initialized. Check SUPABASE_URL and API keys.');
    return {
      connected: false,
      articlesTableExists: false,
      newsPipelineTableExists: false,
      details: 'Supabase URL or API keys are missing or unconfigured in environment.',
    };
  }

  console.log('🔍 [Supabase Diagnostic] Testing connection and schema state...');
  let articlesTableExists = false;
  let newsPipelineTableExists = false;

  try {
    // 1. Test articles table
    const { data: articlesData, error: articlesError } = await client
      .from('articles')
      .select('id')
      .limit(1);

    if (articlesError) {
      if (
        articlesError.code === 'PGRST204' ||
        articlesError.code === '42P01' ||
        articlesError.message?.includes('schema cache') ||
        articlesError.message?.includes('not find the table') ||
        articlesError.message?.includes('relation "public.articles" does not exist')
      ) {
        supabaseArticlesTableMissing = true;
        console.warn('⚠️ [Supabase Diagnostic] "articles" table missing or not found in schema cache.');
        console.info('💡 Tip: Run the SQL statements in supabase_schema.sql inside your Supabase SQL Editor.');
      } else {
        console.warn('⚠️ [Supabase Diagnostic] "articles" query error:', articlesError.message, articlesError);
      }
    } else {
      articlesTableExists = true;
      supabaseArticlesTableMissing = false;
      console.log(`✅ [Supabase Diagnostic] "articles" table verified! (${articlesData?.length ?? 0} sample rows)`);
    }

    // 2. Test news_pipeline table
    const { data: pipelineData, error: pipelineError } = await client
      .from('news_pipeline')
      .select('id')
      .limit(1);

    if (pipelineError) {
      if (
        pipelineError.code === 'PGRST204' ||
        pipelineError.code === '42P01' ||
        pipelineError.message?.includes('schema cache') ||
        pipelineError.message?.includes('not find the table') ||
        pipelineError.message?.includes('relation "public.news_pipeline" does not exist')
      ) {
        supabasePipelineTableMissing = true;
        console.warn('⚠️ [Supabase Diagnostic] "news_pipeline" table missing or not found in schema cache.');
      } else {
        console.warn('⚠️ [Supabase Diagnostic] "news_pipeline" query error:', pipelineError.message);
      }
    } else {
      newsPipelineTableExists = true;
      supabasePipelineTableMissing = false;
      console.log('✅ [Supabase Diagnostic] "news_pipeline" table verified!');
    }

    const connected = articlesTableExists || newsPipelineTableExists;
    const details = connected
      ? 'Supabase connection established and database tables are accessible.'
      : 'Connected to Supabase project, but database tables are missing. Please execute supabase_schema.sql in Supabase SQL Editor.';

    return { connected, articlesTableExists, newsPipelineTableExists, details };
  } catch (err: any) {
    console.error('❌ [Supabase Diagnostic] Unexpected connection exception:', err?.message || err);
    return {
      connected: false,
      articlesTableExists: false,
      newsPipelineTableExists: false,
      details: err?.message || 'Unexpected connection error',
    };
  }
}

// Automatically execute diagnostic check once on module load in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testSupabaseConnection().catch(() => {});
  }, 1000);
}

export function deduplicateArticles(articles: Article[]): Article[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Article[] = [];

  for (const a of articles) {
    if (!a) continue;
    const id = (a.id || '').trim();
    const slug = (a.slug || '').trim().toLowerCase();
    const title = (a.title || '').trim().toLowerCase();

    if (id && seenIds.has(id)) continue;
    if (slug && seenSlugs.has(slug)) continue;
    if (title && seenTitles.has(title)) continue;

    if (id) seenIds.add(id);
    if (slug) seenSlugs.add(slug);
    if (title) seenTitles.add(title);

    result.push(a);
  }

  return result;
}

export async function fetchAllArticlesFromStore(): Promise<Article[]> {
  const map = new Map<string, Article>();

  // 1. Load initial static articles
  for (const a of INITIAL_ARTICLES) map.set(a.id, a);

  // 2. Load memory store articles
  for (const a of memoryArticles) map.set(a.id, a);

  // 3. Load browser localStorage articles
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rationq_articles_store') || localStorage.getItem('rationq_articles_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const a of parsed) {
            if (a && a.id) {
              const existing = map.get(a.id);
              if (!existing) {
                map.set(a.id, a);
              } else {
                const existingTime = new Date(existing.lastVerifiedAt || existing.publishedAt || 0).getTime();
                const newTime = new Date(a.lastVerifiedAt || a.publishedAt || 0).getTime();
                if (newTime >= existingTime) {
                  map.set(a.id, a);
                }
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  // 4. Fetch from remote Supabase table if available
  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (client && !supabaseArticlesTableMissing) {
    try {
      const { data, error } = await client.from('articles').select('*').order('published_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('not find the table')) {
          supabaseArticlesTableMissing = true;
          console.warn('ℹ️ Supabase articles table not found in schema cache. Using memory/local store.');
        } else {
          console.warn('Supabase fetch query notice:', error.message);
        }
      } else if (data && data.length > 0) {
        const dbArticles = data.map(mapRowToArticle);
        for (const a of dbArticles) {
          const existing = map.get(a.id);
          if (!existing) {
            map.set(a.id, a);
          } else {
            const existingTime = new Date(existing.lastVerifiedAt || existing.publishedAt || 0).getTime();
            const dbTime = new Date(a.lastVerifiedAt || a.publishedAt || 0).getTime();
            // Preserve published / expanded local article if local is newer than DB record
            if (dbTime >= existingTime) {
              map.set(a.id, a);
            }
          }
        }
      } else if (data && data.length === 0) {
        // Seed initial articles into Supabase automatically
        console.log('🌱 Seeding initial articles into Supabase table...');
        for (const art of INITIAL_ARTICLES) {
          await client.from('articles').upsert(mapArticleToRow(art));
        }
      }
    } catch (err: any) {
      console.warn('Supabase fetch query error:', err?.message || err);
    }
  }

  const rawList = Array.from(map.values());
  const result = deduplicateArticles(rawList);
  result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  memoryArticles = result;

  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(result);
      localStorage.setItem('rationq_articles_store', serialized);
      localStorage.setItem('rationq_articles_cache', serialized);
    } catch (e) {}
  }

  return result;
}

export async function saveArticleToStore(article: Article): Promise<Article> {
  // Ensure valid ID and slug for storage
  if (!article.id) {
    article.id = article.slug || `art-${Date.now()}`;
  }
  if (!article.slug) {
    article.slug = createSlug(article.title || 'scheme', article.id);
  }
  if (!article.publishedAt) {
    article.publishedAt = new Date().toISOString();
  }
  article.lastVerifiedAt = new Date().toISOString();

  // Save to memory
  const idx = memoryArticles.findIndex(a => a.id === article.id || a.slug === article.slug);
  if (idx > -1) {
    memoryArticles[idx] = article;
  } else {
    memoryArticles.unshift(article);
  }

  // Save to browser localStorage so edits persist across reloads
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(memoryArticles);
      localStorage.setItem('rationq_articles_store', serialized);
      localStorage.setItem('rationq_articles_cache', serialized);
      window.dispatchEvent(new CustomEvent('rationq_articles_updated', { detail: article }));
    } catch (e) {}
  }

  console.log(`✅ [Article Store] Successfully saved article: "${article.title}" (ID: ${article.id}, Status: ${article.status})`);

  // Sync to Backend Server API if running fullstack
  if (typeof fetch !== 'undefined') {
    try {
      await fetch(getApiUrl('/api/admin/articles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
    } catch (err) {
      // Backend request notice
    }
  }

  // Sync directly to remote Supabase table using Service Role Admin Client
  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (client && !supabaseArticlesTableMissing) {
    try {
      const row = mapArticleToRow(article);
      const { error: upsertError } = await client.from('articles').upsert(row, { onConflict: 'id' });
      if (upsertError) {
        if (upsertError.code === 'PGRST204' || upsertError.message?.includes('schema cache') || upsertError.message?.includes('not find the table')) {
          supabaseArticlesTableMissing = true;
          console.warn('ℹ️ Supabase articles table not found in schema cache. Saved to memory/localStorage store.');
        } else if (upsertError.message?.includes('data') || upsertError.code === '42703') {
          // Retry without 'data' column if table does not have a data column
          const { data: _d, ...rowWithoutData } = row;
          const { error: retryErr } = await client.from('articles').upsert(rowWithoutData, { onConflict: 'id' });
          if (!retryErr) {
            console.log(`✅ Article "${article.title}" successfully saved to remote Supabase table (relational)!`);
          } else {
            console.warn('⚠️ Supabase upsert retry notice:', retryErr.message);
          }
        } else {
          console.warn('⚠️ Supabase upsert notice, trying update query:', upsertError.message);
          const { error: updateError } = await client.from('articles').update(row).eq('id', article.id);
          if (updateError) {
            console.warn('⚠️ Supabase update error:', updateError.message);
          } else {
            console.log(`✅ Article "${article.title}" successfully updated on remote Supabase table!`);
          }
        }
      } else {
        console.log(`✅ Article "${article.title}" successfully upserted to remote Supabase table!`);
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase article save notice:', err?.message || err);
    }
  }

  return article;
}

export const updateArticle = saveArticleToStore;
export const updateArticleInSupabase = saveArticleToStore;

export async function deleteArticleFromStore(id: string): Promise<boolean> {
  const targetId = id.trim();
  memoryArticles = memoryArticles.filter(a => a.id !== targetId && a.slug !== targetId);

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rationq_articles_store') || localStorage.getItem('rationq_articles_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updated = parsed.filter((a: any) => a.id !== targetId && a.slug !== targetId);
          const serialized = JSON.stringify(updated);
          localStorage.setItem('rationq_articles_store', serialized);
          localStorage.setItem('rationq_articles_cache', serialized);
        }
      }
    } catch (e) {}
  }

  try {
    await safeFetchJson(`/api/admin/articles/${encodeURIComponent(targetId)}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (client && !supabaseArticlesTableMissing) {
    try {
      await client.from('articles').delete().eq('id', targetId);
      await client.from('articles').delete().eq('slug', targetId);
      console.log(`🗑️ Article "${targetId}" deleted from Supabase table.`);
    } catch (err: any) {
      console.warn('Supabase delete notice:', err?.message || err);
    }
  }
  return true;
}

export async function fetchPipelineFromStore(): Promise<NewsPipelineItem[]> {
  const client = getSupabaseClient();
  if (client && !supabasePipelineTableMissing) {
    try {
      const { data, error } = await client.from('news_pipeline').select('*');
      if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('not find the table') || error.message?.includes('Failed to fetch')) {
          supabasePipelineTableMissing = true;
          console.warn('ℹ️ Supabase news_pipeline table not found/unavailable. Using memory store.');
        }
      } else if (data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          sourceUrl: r.source_url,
          sourceTitle: r.source_title,
          sourceDomain: r.source_domain,
          fetchedAt: r.fetched_at,
          textSnippet: r.text_snippet,
          relevanceStatus: r.relevance_status,
          extractedDepartment: r.extracted_department,
          confidenceScore: r.confidence_score ?? 0.95,
        }));
      }
    } catch (err: any) {
      supabasePipelineTableMissing = true;
      console.warn('Supabase pipeline fetch notice:', err?.message || err);
    }
  }
  return memoryPipeline;
}

export async function savePipelineItemToStore(item: NewsPipelineItem): Promise<NewsPipelineItem> {
  const idx = memoryPipeline.findIndex(p => p.id === item.id);
  if (idx > -1) {
    memoryPipeline[idx] = item;
  } else {
    memoryPipeline.unshift(item);
  }

  const client = getSupabaseClient();
  if (client && !supabasePipelineTableMissing) {
    try {
      const { error } = await client.from('news_pipeline').upsert({
        id: item.id,
        source_url: item.sourceUrl,
        source_title: item.sourceTitle,
        source_domain: item.sourceDomain,
        fetched_at: item.fetchedAt,
        text_snippet: item.textSnippet,
        relevance_status: item.relevanceStatus,
        extracted_department: item.extractedDepartment,
      });
      if (error && (error.code === 'PGRST204' || error.message?.includes('Failed to fetch'))) {
        supabasePipelineTableMissing = true;
      }
    } catch (err) {
      supabasePipelineTableMissing = true;
      console.warn('Supabase pipeline save notice:', err);
    }
  }
  return item;
}

export async function deletePipelineItemFromStore(id: string): Promise<boolean> {
  memoryPipeline = memoryPipeline.filter(p => p.id !== id);

  const client = getSupabaseClient();
  if (client && !supabasePipelineTableMissing) {
    try {
      await client.from('news_pipeline').delete().eq('id', id);
    } catch (err) {
      supabasePipelineTableMissing = true;
      console.warn('Supabase pipeline delete notice:', err);
    }
  }
  return true;
}
