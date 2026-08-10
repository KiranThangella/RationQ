import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  CATEGORIES,
  STATES,
  INITIAL_ARTICLES,
  INITIAL_PIPELINE_ITEMS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_USER_PROFILE
} from './src/data/mockDatabase.js';
import { Article, EligibilityFormData, MatchResult, NewsPipelineItem, UserProfile } from './src/types.js';
import { getSupabaseClient } from './src/lib/supabaseServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache — this is what every route reads/filters/maps synchronously.
// If Supabase is configured, loadInitialData() populates this from the DB at
// startup, and every mutation route below write-throughs to Supabase after
// updating the cache, so a restart reloads the same data instead of losing it.
// If Supabase is NOT configured, this behaves exactly like before (mock data only).
let articlesDatabase: Article[] = [...INITIAL_ARTICLES];
let pipelineDatabase: NewsPipelineItem[] = [...INITIAL_PIPELINE_ITEMS];
let notificationsDatabase = [...INITIAL_NOTIFICATIONS];
let userProfileDatabase: UserProfile = { ...DEFAULT_USER_PROFILE };

// --- SUPABASE <-> APP TYPE MAPPING ---
// DB columns are snake_case; app types are camelCase. These converters keep
// that translation in one place instead of scattered through the routes.

function articleToRow(a: Article) {
  return {
    id: a.id,
    slug: a.slug,
    scheme_id: a.schemeId,
    title: a.title,
    short_summary: a.shortSummary,
    what_happened: a.whatHappened,
    what_is_scheme: a.whatIsScheme,
    benefits: a.benefits,
    who_can_apply: a.whoCanApply,
    who_cannot_apply: a.whoCannotApply,
    documents: a.documents,
    steps: a.steps,
    deadline: a.deadline,
    status_check_guide: a.statusCheckGuide,
    official_website: a.officialWebsite,
    important_warnings: a.importantWarnings,
    source: a.source,
    generated_image: a.generatedImage,
    published_at: a.publishedAt,
    last_verified_at: a.lastVerifiedAt,
    read_time_minutes: a.readTimeMinutes,
    category: a.category,
    state: a.state,
    is_central: a.isCentral,
    is_new: a.isNew,
    is_updated: a.isUpdated,
    status: a.status,
    ai_confidence_score: a.aiConfidenceScore ?? null,
    language: a.language ?? 'en',
    title_telugu: a.titleTelugu ?? null,
    short_summary_telugu: a.shortSummaryTelugu ?? null,
    what_is_scheme_telugu: a.whatIsSchemeTelugu ?? null,
    what_happened_telugu: a.whatHappenedTelugu ?? null,
  };
}

function rowToArticle(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    schemeId: r.scheme_id,
    title: r.title,
    shortSummary: r.short_summary,
    whatHappened: r.what_happened,
    whatIsScheme: r.what_is_scheme,
    benefits: r.benefits || [],
    whoCanApply: r.who_can_apply || [],
    whoCannotApply: r.who_cannot_apply || [],
    documents: r.documents || [],
    steps: r.steps || [],
    deadline: r.deadline ?? null,
    statusCheckGuide: r.status_check_guide,
    officialWebsite: r.official_website,
    importantWarnings: r.important_warnings || [],
    source: r.source || {},
    generatedImage: r.generated_image,
    publishedAt: r.published_at,
    lastVerifiedAt: r.last_verified_at,
    readTimeMinutes: r.read_time_minutes,
    category: r.category,
    state: r.state,
    isCentral: r.is_central,
    isNew: r.is_new,
    isUpdated: r.is_updated,
    status: r.status,
    aiConfidenceScore: r.ai_confidence_score ?? undefined,
    language: r.language ?? 'en',
    titleTelugu: r.title_telugu ?? undefined,
    shortSummaryTelugu: r.short_summary_telugu ?? undefined,
    whatIsSchemeTelugu: r.what_is_scheme_telugu ?? undefined,
    whatHappenedTelugu: r.what_happened_telugu ?? undefined,
  };
}

function pipelineToRow(p: NewsPipelineItem) {
  return {
    id: p.id,
    source_url: p.sourceUrl,
    source_title: p.sourceTitle,
    source_domain: p.sourceDomain,
    fetched_at: p.fetchedAt,
    text_snippet: p.textSnippet,
    relevance_status: p.relevanceStatus,
    confidence_score: p.confidenceScore,
    extracted_department: p.extractedDepartment ?? null,
    generated_article_id: p.generatedArticleId ?? null,
  };
}

function rowToPipeline(r: any): NewsPipelineItem {
  return {
    id: r.id,
    sourceUrl: r.source_url,
    sourceTitle: r.source_title,
    sourceDomain: r.source_domain,
    fetchedAt: r.fetched_at,
    textSnippet: r.text_snippet,
    relevanceStatus: r.relevance_status,
    confidenceScore: r.confidence_score,
    extractedDepartment: r.extracted_department ?? undefined,
    generatedArticleId: r.generated_article_id ?? undefined,
  };
}

// --- SUPABASE PERSISTENCE (write-through; no-ops when not configured) ---
// These never throw into the caller — a DB hiccup logs a warning but the
// in-memory cache (already updated by the caller) keeps the request working.

async function persistNewArticle(article: Article): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('articles').upsert(articleToRow(article));
  if (error) console.error('[Supabase] Failed to save article:', error.message);
}

async function persistArticleUpdate(article: Article): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('articles').update(articleToRow(article)).eq('id', article.id);
  if (error) console.error('[Supabase] Failed to update article:', error.message);
}

async function persistNewPipelineItem(item: NewsPipelineItem): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('pipeline_items').upsert(pipelineToRow(item));
  if (error) console.error('[Supabase] Failed to save pipeline item:', error.message);
}

async function persistPipelineItemUpdate(id: string, patch: Partial<NewsPipelineItem>): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const row: Record<string, any> = {};
  if (patch.generatedArticleId !== undefined) row.generated_article_id = patch.generatedArticleId;
  if (patch.relevanceStatus !== undefined) row.relevance_status = patch.relevanceStatus;
  if (patch.confidenceScore !== undefined) row.confidence_score = patch.confidenceScore;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('pipeline_items').update(row).eq('id', id);
  if (error) console.error('[Supabase] Failed to update pipeline item:', error.message);
}

// Loads articles + pipeline items from Supabase into the in-memory cache at
// startup. First run against an empty database seeds it from mockDatabase.ts
// so the app has content immediately. If Supabase isn't configured (or the
// load fails), the existing in-memory mock data from module scope is used as-is.
async function loadInitialData(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('[RationQ] Supabase not configured — running on in-memory mock data (nothing persists across restarts).');
    return;
  }

  try {
    const { data: existingArticles, error: articlesErr } = await supabase.from('articles').select('*');
    if (articlesErr) throw articlesErr;

    if (!existingArticles || existingArticles.length === 0) {
      console.log('[Supabase] "articles" table is empty — seeding it with the built-in demo articles...');
      const { error: seedErr } = await supabase.from('articles').insert(INITIAL_ARTICLES.map(articleToRow));
      if (seedErr) console.error('[Supabase] Seed insert for articles failed:', seedErr.message);
      articlesDatabase = [...INITIAL_ARTICLES];
    } else {
      articlesDatabase = existingArticles.map(rowToArticle).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      console.log(`[Supabase] Loaded ${articlesDatabase.length} article(s) from the database.`);
    }

    const { data: existingPipeline, error: pipelineErr } = await supabase.from('pipeline_items').select('*');
    if (pipelineErr) throw pipelineErr;

    if (!existingPipeline || existingPipeline.length === 0) {
      const { error: seedErr } = await supabase.from('pipeline_items').insert(INITIAL_PIPELINE_ITEMS.map(pipelineToRow));
      if (seedErr) console.error('[Supabase] Seed insert for pipeline_items failed:', seedErr.message);
      pipelineDatabase = [...INITIAL_PIPELINE_ITEMS];
    } else {
      pipelineDatabase = existingPipeline.map(rowToPipeline).sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
      console.log(`[Supabase] Loaded ${pipelineDatabase.length} pipeline item(s) from the database.`);
    }
  } catch (err) {
    console.error('[Supabase] Failed to load initial data — falling back to in-memory mock data for this run:', err);
    articlesDatabase = [...INITIAL_ARTICLES];
    pipelineDatabase = [...INITIAL_PIPELINE_ITEMS];
  }
}

// --- DUPLICATE DETECTION HELPERS ---
// Lowercase, strip punctuation, collapse whitespace, drop common filler words
// so titles that differ only in phrasing/casing still compare as similar.
const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'and', 'or', 'under', 'with', 'new']);

function normalizeTitle(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// Jaccard similarity between the word-sets of two titles (0 = no overlap, 1 = identical)
function titleSimilarity(a: string, b: string): number {
  const setA = new Set(normalizeTitle(a));
  const setB = new Set(normalizeTitle(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(w => { if (setB.has(w)) intersection++; });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

const DUPLICATE_TITLE_THRESHOLD = 0.55;
const DUPLICATE_URL_MATCH = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Checks a candidate title/sourceUrl against the pipeline queue AND published/draft articles.
// Returns the best match found (if any) so callers can explain *why* something was flagged.
function findDuplicate(candidateTitle: string, candidateUrl?: string): { type: 'pipeline' | 'article'; matchTitle: string; score: number } | null {
  let best: { type: 'pipeline' | 'article'; matchTitle: string; score: number } | null = null;

  for (const item of pipelineDatabase) {
    if (candidateUrl && DUPLICATE_URL_MATCH(item.sourceUrl, candidateUrl)) {
      return { type: 'pipeline', matchTitle: item.sourceTitle, score: 1 };
    }
    const score = titleSimilarity(candidateTitle, item.sourceTitle);
    if (score >= DUPLICATE_TITLE_THRESHOLD && (!best || score > best.score)) {
      best = { type: 'pipeline', matchTitle: item.sourceTitle, score };
    }
  }

  for (const article of articlesDatabase) {
    const score = titleSimilarity(candidateTitle, article.title);
    if (score >= DUPLICATE_TITLE_THRESHOLD && (!best || score > best.score)) {
      best = { type: 'article', matchTitle: article.title, score };
    }
  }

  return best;
}

// Lazy initialization of Gemini client
let geminiAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiAiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        geminiAiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize Gemini AI client:', err);
      }
    }
  }
  return geminiAiClient;
}

async function startServer() {
  await loadInitialData();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- CORS ---
  // Needed once the frontend (Cloudflare Pages) and backend (Render) run on
  // different origins. Set CORS_ORIGIN to your exact Pages URL in production
  // (e.g. https://rationq.pages.dev) — '*' is fine for local dev/testing only.
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'RationQ API', timestamp: new Date().toISOString() });
  });

  // Get categories
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(CATEGORIES);
  });

  // Get states
  app.get('/api/states', (req: Request, res: Response) => {
    res.json(STATES);
  });

  // Get articles / schemes list with filtering
  app.get('/api/articles', (req: Request, res: Response) => {
    const { category, state, isCentral, search, status, page = '1', limit = '12' } = req.query;

    let filtered = articlesDatabase.filter(a => a.status === (status || 'published'));

    if (category) {
      const catLower = String(category).toLowerCase();
      filtered = filtered.filter(a => a.category.toLowerCase().includes(catLower));
    }

    if (state) {
      const stateLower = String(state).toLowerCase();
      if (stateLower === 'central') {
        filtered = filtered.filter(a => a.isCentral);
      } else {
        filtered = filtered.filter(a => a.state.toLowerCase().includes(stateLower) || (stateLower !== 'central' && a.isCentral));
      }
    }

    if (isCentral !== undefined) {
      filtered = filtered.filter(a => a.isCentral === (isCentral === 'true'));
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.shortSummary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q) ||
        a.benefits.some(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q))
      );
    }

    // Sort by published date
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      articles: paginated,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum),
    });
  });

  // Get single article by slug
  app.get('/api/articles/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const article = articlesDatabase.find(a => a.slug === slug || a.id === slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  });

  // Global search & autocomplete endpoint
  app.get('/api/search', (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ results: [], suggestions: ['PM-KISAN', 'Telangana Scholarships', 'Housing Subsidy', 'PM Vishwakarma', 'Ayushman Bharat'] });
    }

    const matches = articlesDatabase.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.shortSummary.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.state.toLowerCase().includes(query) ||
      a.benefits.some(b => b.title.toLowerCase().includes(query))
    );

    const suggestionsSet = new Set<string>();
    CATEGORIES.forEach(c => {
      if (c.name.toLowerCase().includes(query)) suggestionsSet.add(c.name);
    });
    STATES.forEach(s => {
      if (s.name.toLowerCase().includes(query)) suggestionsSet.add(`${s.name} Schemes`);
    });
    matches.forEach(m => suggestionsSet.add(m.title));

    res.json({
      results: matches.slice(0, 8),
      suggestions: Array.from(suggestionsSet).slice(0, 5),
    });
  });

  // Structured Eligibility Engine
  app.post('/api/eligibility/check', (req: Request, res: Response) => {
    const formData: EligibilityFormData = req.body;

    const results: MatchResult[] = articlesDatabase
      .filter(article => article.status === 'published')
      .map(article => {
        let score = 50;
        const matchingReasons: string[] = [];
        const disqualificationReasons: string[] = [];
        const missingInfo: string[] = [];

        // State check
        const userStateNorm = formData.state.toLowerCase();
        const articleStateNorm = article.state.toLowerCase();

        if (article.isCentral || articleStateNorm.includes(userStateNorm) || userStateNorm.includes(articleStateNorm)) {
          score += 20;
          matchingReasons.push(article.isCentral ? 'Applicable to all Indian residents (Central Scheme)' : `Matches your state (${formData.state})`);
        } else {
          score -= 40;
          disqualificationReasons.push(`Scheme is specific to ${article.state}, not available in ${formData.state}`);
        }

        // Occupation check
        const occNorm = formData.occupation.toLowerCase();
        const categoryNorm = article.category.toLowerCase();
        if (
          (occNorm.includes('farmer') && categoryNorm.includes('agriculture')) ||
          (occNorm.includes('student') && categoryNorm.includes('education')) ||
          (occNorm.includes('artisan') || occNorm.includes('worker') || occNorm.includes('business')) && categoryNorm.includes('business') ||
          (occNorm.includes('senior') && categoryNorm.includes('senior'))
        ) {
          score += 25;
          matchingReasons.push(`Directly targets your occupation/category (${formData.occupation})`);
        } else if (categoryNorm.includes('health') || categoryNorm.includes('housing') || categoryNorm.includes('women')) {
          score += 10;
          matchingReasons.push(`General citizen welfare scheme applicable across occupations`);
        }

        // Income threshold check
        if (formData.annualIncome > 0) {
          if (formData.annualIncome <= 250000) {
            score += 15;
            matchingReasons.push('Meets Economically Weaker Section (EWS / BPL) income criteria');
          } else if (formData.annualIncome <= 800000 && (article.slug.includes('vidya') || article.slug.includes('housing') || article.slug.includes('mahadbt'))) {
            score += 10;
            matchingReasons.push('Within Middle Income Group (MIG) subvention limit');
          }
        }

        // Gender / Category specific rule check
        if (formData.gender.toLowerCase() === 'female' && article.category.toLowerCase().includes('women')) {
          score += 20;
          matchingReasons.push('Designed specifically for women empowerment');
        }

        const isEligible = score >= 60 && disqualificationReasons.length === 0;

        return {
          article,
          eligible: isEligible,
          matchScore: Math.min(Math.max(score, 10), 100),
          matchingReasons: matchingReasons.length > 0 ? matchingReasons : ['General eligibility subject to official document validation'],
          disqualificationReasons,
          missingInfo: missingInfo.length > 0 ? missingInfo : ['Aadhaar linkage & bank account verification required'],
        };
      });

    // Sort by matchScore descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      eligible: results.filter(r => r.eligible),
      notEligible: results.filter(r => !r.eligible),
      checkedCriteria: formData,
    });
  });

  // AI Assistant Chat (Grounded in Verified Database)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, userState } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    // Prepare system context from published database schemes
    const verifiedKnowledgeBase = articlesDatabase.map(a => ({
      title: a.title,
      schemeId: a.schemeId,
      category: a.category,
      state: a.state,
      benefits: a.benefits.map(b => `${b.title}: ${b.description}`),
      whoCanApply: a.whoCanApply,
      whoCannotApply: a.whoCannotApply,
      documents: a.documents.map(d => d.name),
      officialWebsite: a.officialWebsite,
      slug: a.slug,
    }));

    if (ai) {
      try {
        const prompt = `You are RationQ AI Assistant, an expert, objective Indian Government Scheme Citizen Advisor.
CRITICAL MANDATES:
1. ONLY answer using facts from the Verified Government Knowledge Base provided below.
2. NEVER invent fake schemes, eligibility rules, benefit amounts, or official URLs.
3. If the requested information is not in the knowledge base, politely state: "This specific detail is not present in our verified official source records."
4. Always include direct links/references to matching scheme slugs.
5. Provide simple, clean, bulleted explanations.

User Location: ${userState || 'Not specified'}
User Query: "${message}"

Verified Government Knowledge Base:
${JSON.stringify(verifiedKnowledgeBase, null, 2)}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const replyText = response.text || 'I checked our verified database. Please check the corresponding scheme cards below for exact official details.';
        return res.json({ reply: replyText, verifiedSourcesUsed: verifiedKnowledgeBase.length });
      } catch (err: any) {
        console.error('Gemini chat error:', err);
      }
    }

    // Smart Fallback if Gemini key is not configured or fails
    const lower = message.toLowerCase();
    const matched = articlesDatabase.filter(a =>
      a.title.toLowerCase().includes(lower) ||
      a.category.toLowerCase().includes(lower) ||
      a.state.toLowerCase().includes(lower) ||
      a.shortSummary.toLowerCase().includes(lower)
    );

    let fallbackText = `Based on our verified RationQ database:\n\n`;
    if (matched.length > 0) {
      fallbackText += `We found ${matched.length} verified government scheme(s) relevant to your request:\n`;
      matched.forEach(m => {
        fallbackText += `\n• **${m.title}** (${m.state})\n  - Benefits: ${m.benefits.map(b => b.title).join(', ')}\n  - Official Link: ${m.officialWebsite}\n`;
      });
      fallbackText += `\n*RationQ Disclaimer: Always verify official application forms directly on government portals.*`;
    } else {
      fallbackText += `I searched our database for "${message}". Currently, we have active verified records for PM-KISAN, PM Vishwakarma, PMAY Housing, Rythu Bharosa, Ayushman Bharat, Vidya Lakshmi Loans, and MahaDBT Scholarships.\n\nTry asking about farmer support, student loans, free hospital cards, or housing subsidies!`;
    }

    res.json({ reply: fallbackText, verifiedSourcesUsed: matched.length });
  });

  // AI Content Rewriter for Admin Curation Editor
  app.post('/api/ai/rewrite', async (req: Request, res: Response) => {
    const { rawSourceText, schemeName, stateName, categoryName } = req.body;

    if (!rawSourceText) {
      return res.status(400).json({ error: 'rawSourceText is required' });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are the RationQ Information Structuring Engine.
Take this raw government announcement text and restructure it into simple, verified citizen-facing sections.

RULES:
- Preserve all exact amounts, percentages, deadlines, and dates.
- Do NOT invent missing details. If not specified, write "Not specified in official source".
- Always generate Telugu translations for "titleTelugu", "shortSummaryTelugu", "whatIsSchemeTelugu", and "whatHappenedTelugu".
- Return pure valid JSON strictly matching this schema:
{
  "title": "Clear English headline",
  "titleTelugu": "తెలుగు శీర్షిక (Accurate Telugu title)",
  "shortSummary": "1-2 sentence simple summary",
  "shortSummaryTelugu": "తెలుగు సంక్షిప్త సారాంశం",
  "whatHappened": "What was officially announced",
  "whatHappenedTelugu": "ఏమి జరిగింది? (తెలుగు వివరణ)",
  "whatIsScheme": "Simple explanation of the scheme",
  "whatIsSchemeTelugu": "పథకం వివరాలు (తెలుగు వివరణ)",
  "benefits": [{"title": "Benefit title", "amount": "₹ amount or % if any", "type": "financial|subsidy|insurance|pension|scholarship|service", "description": "detail"}],
  "whoCanApply": ["eligibility criteria 1", "eligibility criteria 2"],
  "whoCannotApply": ["exclusion 1"],
  "documents": [{"name": "Doc name", "required": true, "description": "why needed"}],
  "steps": [{"stepNumber": 1, "title": "Step 1 title", "description": "actionable instruction"}],
  "readTimeMinutes": 3
}

Raw Text:
${rawSourceText}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const structuredData = JSON.parse(response.text);
          const duplicate = findDuplicate(structuredData.title || schemeName || '');
          return res.json({
            success: true,
            structuredData,
            duplicateWarning: duplicate
              ? { message: `This looks similar to an existing ${duplicate.type === 'article' ? 'published article' : 'pipeline item'}: "${duplicate.matchTitle}"`, ...duplicate }
              : null,
          });
        }
      } catch (err) {
        console.error('Gemini rewrite error:', err);
      }
    }

    // Fallback template
    const fallbackTitle = `${schemeName || 'Government Scheme'} Official Announcement Update`;
    const fallbackDuplicate = findDuplicate(fallbackTitle);
    res.json({
      success: true,
      duplicateWarning: fallbackDuplicate
        ? { message: `This looks similar to an existing ${fallbackDuplicate.type === 'article' ? 'published article' : 'pipeline item'}: "${fallbackDuplicate.matchTitle}"`, ...fallbackDuplicate }
        : null,
      structuredData: {
        title: `${schemeName || 'Government Scheme'} Official Announcement Update`,
        titleTelugu: `${schemeName || 'ప్రభుత్వ పథకం'} అధికారిక ప్రకటన & వివరాలు`,
        shortSummary: `Official guidelines published regarding ${schemeName || 'the scheme'} benefits and application steps.`,
        shortSummaryTelugu: `${schemeName || 'ఈ పథకం'} మార్గదర్శకాలు మరియు అర్హతల వివరాలు అధికారికంగా విడుదలయ్యాయి.`,
        whatHappened: rawSourceText.slice(0, 200) + '...',
        whatHappenedTelugu: `${rawSourceText.slice(0, 200)}... (అధికారిక ప్రకటన సారాంశం)`,
        whatIsScheme: `A government initiative providing social and economic support to eligible citizens in ${stateName || 'India'}.`,
        whatIsSchemeTelugu: `అర్హులైన పౌరులకు ఆర్థిక మరియు సామాజిక మద్దతు అందించే ప్రభుత్వ సంక్షేమ పథకం.`,
        benefits: [{ title: 'Direct Assistance', amount: 'As per official norm', type: 'financial', description: 'Beneficiaries receive direct benefit transfer to Aadhaar-linked accounts.' }],
        whoCanApply: ['Domicile citizens fulfilling official criteria', 'Valid Aadhaar and bank account holders'],
        whoCannotApply: ['Non-eligible income tax payers or unverified profiles'],
        documents: [
          { name: 'Aadhaar Card', required: true, description: 'Identity verification' },
          { name: 'Bank Passbook', required: true, description: 'DBT credit linkage' },
        ],
        steps: [
          { stepNumber: 1, title: 'Visit Official Portal', description: 'Access the government portal and select application form.' },
          { stepNumber: 2, title: 'Submit Documents & Verify', description: 'Upload Aadhaar and complete eKYC.' },
        ],
        readTimeMinutes: 3,
      },
    });
  });

  // User saved schemes / bookmarks
  app.get('/api/saved-schemes', (req: Request, res: Response) => {
    const savedArticles = articlesDatabase.filter(a => userProfileDatabase.savedSchemeIds.includes(a.id) || userProfileDatabase.savedSchemeIds.includes(a.slug));
    res.json(savedArticles);
  });

  app.post('/api/saved-schemes/toggle', (req: Request, res: Response) => {
    const { schemeId } = req.body;
    if (!schemeId) return res.status(400).json({ error: 'schemeId required' });

    const index = userProfileDatabase.savedSchemeIds.indexOf(schemeId);
    if (index > -1) {
      userProfileDatabase.savedSchemeIds.splice(index, 1);
    } else {
      userProfileDatabase.savedSchemeIds.push(schemeId);
    }

    res.json({ savedSchemeIds: userProfileDatabase.savedSchemeIds });
  });

  // User Profile
  app.get('/api/profile', (req: Request, res: Response) => {
    res.json(userProfileDatabase);
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    userProfileDatabase = { ...userProfileDatabase, ...req.body };
    res.json(userProfileDatabase);
  });

  // Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(notificationsDatabase);
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const { notificationId } = req.body;
    if (notificationId === 'all') {
      notificationsDatabase.forEach(n => (n.read = true));
    } else {
      const notif = notificationsDatabase.find(n => n.id === notificationId);
      if (notif) notif.read = true;
    }
    res.json(notificationsDatabase);
  });

  // --- ADMIN & PIPELINE ROUTES ---

  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    const published = articlesDatabase.filter(a => a.status === 'published').length;
    const drafts = articlesDatabase.filter(a => a.status === 'draft').length;
    const pendingVerification = articlesDatabase.filter(a => a.status === 'pending_verification').length;
    const totalSchemes = articlesDatabase.length;
    const pipelineItems = pipelineDatabase.length;

    res.json({
      totalSchemes,
      published,
      drafts,
      pendingVerification,
      pipelineItems,
      failedFetches: 0,
      publishedToday: 2,
    });
  });

  app.get('/api/admin/pipeline', (req: Request, res: Response) => {
    res.json(pipelineDatabase);
  });

  app.post('/api/admin/articles', async (req: Request, res: Response) => {
    const title = req.body.title || '';
    const schemeId = req.body.schemeId || req.body.slug;
    const force = req.body.forceCreateDuplicate === true;

    // Hard block: exact same schemeId/slug already published/drafted
    const exactMatch = articlesDatabase.find(a => a.schemeId === schemeId || a.slug === schemeId);
    if (exactMatch && !force) {
      return res.status(409).json({
        error: 'duplicate_article',
        message: `An article with this scheme already exists: "${exactMatch.title}"`,
        existingArticle: { id: exactMatch.id, slug: exactMatch.slug, title: exactMatch.title, status: exactMatch.status },
      });
    }

    // Soft block: title is very similar to an existing article (likely a re-generated duplicate)
    const similar = !exactMatch ? findDuplicate(title) : null;
    if (similar && similar.type === 'article' && !force) {
      return res.status(409).json({
        error: 'possible_duplicate_article',
        message: `This title looks very similar to an existing article: "${similar.matchTitle}". Re-submit with forceCreateDuplicate: true if this is genuinely a different scheme/update.`,
        matchTitle: similar.matchTitle,
        score: similar.score,
      });
    }

    const newArticle: Article = {
      ...req.body,
      id: `article-${Date.now()}`,
      slug: req.body.slug || `article-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      status: req.body.status || 'draft',
      isNew: true,
      isUpdated: false,
    };
    articlesDatabase.unshift(newArticle);
    await persistNewArticle(newArticle);

    // If this article originated from a pipeline item, tag that item so it can't be reused
    if (req.body.sourcePipelineId) {
      const pipelineItem = pipelineDatabase.find(p => p.id === req.body.sourcePipelineId);
      if (pipelineItem) {
        pipelineItem.generatedArticleId = newArticle.id;
        await persistPipelineItemUpdate(pipelineItem.id, { generatedArticleId: newArticle.id });
      }
    }

    res.json(newArticle);
  });

  app.put('/api/admin/articles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const index = articlesDatabase.findIndex(a => a.id === id || a.slug === id);
    if (index === -1) return res.status(404).json({ error: 'Article not found' });

    articlesDatabase[index] = {
      ...articlesDatabase[index],
      ...req.body,
      lastVerifiedAt: new Date().toISOString(),
    };
    await persistArticleUpdate(articlesDatabase[index]);

    res.json(articlesDatabase[index]);
  });

  app.post('/api/admin/articles/:id/publish', async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = articlesDatabase.find(a => a.id === id || a.slug === id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.status = 'published';
    article.lastVerifiedAt = new Date().toISOString();
    await persistArticleUpdate(article);

    // Add notification
    notificationsDatabase.unshift({
      id: `notif-${Date.now()}`,
      title: `New Scheme: ${article.title.slice(0, 40)}...`,
      message: `${article.category} update published for ${article.state}.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      linkUrl: `/schemes/${article.slug}`,
      type: 'scheme_update',
    });

    res.json(article);
  });

  // --- REAL SOURCE CRAWLER (PIB RSS) with SIMULATOR FALLBACK ---
  // Live official RSS feeds to poll for scheme-relevant announcements.
  // Add more verified government RSS/API endpoints here as you confirm them.
  const RSS_SOURCES: { name: string; url: string; domain: string }[] = [
    { name: 'PIB National Press Releases (English)', url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', domain: 'pib.gov.in' },
  ];

  // Keywords used to filter the raw press-release firehose down to actual
  // citizen scheme/benefit announcements (as opposed to ceremonies, visits, etc.)
  const SCHEME_KEYWORDS = [
    'yojana', 'scheme', 'subsidy', 'pension', 'scholarship', 'welfare', 'kisan',
    'awas', 'beneficiary', 'beneficiaries', 'insurance', 'loan', 'dbt', 'ration',
    'pds', 'health card', 'ayushman', 'skill development', 'msme', 'mudra',
    'stipend', 'grant', 'assistance', 'सब्सिडी', 'योजना', 'पेंशन',
  ];

  function decodeXmlEntities(text: string): string {
    return text
      .replace(/<!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#160;/g, ' ')
      .trim();
  }

  function extractRssItems(xml: string): { title: string; link: string }[] {
    const items: { title: string; link: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
      if (titleMatch && linkMatch) {
        items.push({ title: decodeXmlEntities(titleMatch[1]), link: decodeXmlEntities(linkMatch[1]) });
      }
    }
    return items;
  }

  function isSchemeRelevant(title: string): boolean {
    const lower = title.toLowerCase();
    return SCHEME_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
  }

  interface FetchedCandidate {
    sourceUrl: string;
    sourceTitle: string;
    sourceDomain: string;
    textSnippet: string;
  }

  async function fetchLivePipelineCandidates(): Promise<{ candidates: FetchedCandidate[]; errors: string[] }> {
    const candidates: FetchedCandidate[] = [];
    const errors: string[] = [];

    for (const source of RSS_SOURCES) {
      try {
        const resp = await fetch(source.url, { headers: { 'User-Agent': 'RationQ-Bot/1.0 (+https://rationq.example)' } });
        if (!resp.ok) {
          errors.push(`${source.name}: HTTP ${resp.status}`);
          continue;
        }
        const xml = await resp.text();
        const items = extractRssItems(xml).slice(0, 20);
        for (const item of items) {
          if (!isSchemeRelevant(item.title)) continue;
          candidates.push({
            sourceUrl: item.link,
            sourceTitle: item.title,
            sourceDomain: source.domain,
            textSnippet: item.title,
          });
        }
      } catch (err: any) {
        errors.push(`${source.name}: ${err?.message || 'fetch failed'}`);
      }
    }

    return { candidates, errors };
  }

  // Simulator fallback pool — used only when live RSS sources are unreachable
  // (e.g. no internet in a dev sandbox) or returned nothing scheme-relevant,
  // so the admin flow still has something to demo/test against.
  const SIMULATED_HEADLINE_POOL = [
    { title: 'Ministry Announcement: Revised Subsidy Guidelines for Central Pensioners Welfare Scheme', dept: 'Ministry of Social Justice', snippet: 'Official notification released detailing revised eligibility income slabs and online application portal link for beneficiaries across districts.' },
    { title: 'Telangana Cabinet Clears Additional Solar Pump Sets under PM-KUSUM Component B', dept: 'Energy Department, Govt of Telangana', snippet: 'State sanctions additional off-grid solar water pumps for farmers with combined central and state subsidy.' },
    { title: 'Ministry of Health Extends Ayushman Bharat Coverage to Additional Tertiary Hospitals', dept: 'Ministry of Health & Family Welfare', snippet: 'New empanelled hospitals added to the PM-JAY network, expanding cashless treatment access for beneficiaries.' },
    { title: 'MSDE Announces Revised Stipend Slabs for PM Kaushal Vikas Yojana 4.0 Trainees', dept: 'Ministry of Skill Development', snippet: 'Training stipend and certification incentive amounts revised for the current cohort of skill development trainees.' },
    { title: 'Ministry of Rural Development Updates PMAY-Gramin Beneficiary List Verification Process', dept: 'Ministry of Rural Development', snippet: 'Field-level verification procedure updated to speed up release of housing construction installments.' },
  ];

  app.post('/api/admin/fetch-pipeline', async (req: Request, res: Response) => {
    const { sourcePortal = 'pib.gov.in' } = req.body;

    const { candidates, errors } = await fetchLivePipelineCandidates();

    if (candidates.length > 0) {
      // Live path: dedupe each candidate against the queue/articles as we go,
      // so two similar items in the *same* fetch also catch each other.
      const addedItems: NewsPipelineItem[] = [];
      let duplicateCount = 0;

      for (const c of candidates.slice(0, 10)) {
        const duplicate = findDuplicate(c.sourceTitle, c.sourceUrl);
        const newItem: NewsPipelineItem = {
          id: `pipe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sourceUrl: c.sourceUrl,
          sourceTitle: c.sourceTitle,
          sourceDomain: c.sourceDomain,
          fetchedAt: new Date().toISOString(),
          textSnippet: c.textSnippet,
          relevanceStatus: duplicate ? 'duplicate' : 'relevant',
          confidenceScore: duplicate ? Math.max(0.05, 1 - duplicate.score) : 0.85,
        };
        if (duplicate) duplicateCount++;
        pipelineDatabase.unshift(newItem);
        await persistNewPipelineItem(newItem);
        addedItems.push(newItem);
      }

      return res.json({
        source: 'live',
        message: `Fetched ${addedItems.length} scheme-relevant item(s) from live PIB RSS (${duplicateCount} flagged as duplicate).`,
        fetchedCount: addedItems.length,
        newItem: addedItems[0] || null,
        newItems: addedItems,
      });
    }

    // Fallback: live sources unreachable or had nothing scheme-relevant right now.
    const pick = SIMULATED_HEADLINE_POOL[Math.floor(Math.random() * SIMULATED_HEADLINE_POOL.length)];
    const sourceUrl = `https://${sourcePortal}/PressReleasePage.aspx?PRID=${Math.floor(1000000 + Math.random() * 900000)}`;
    const duplicate = findDuplicate(pick.title, sourceUrl);

    const simulatedItem: NewsPipelineItem = {
      id: `pipe-${Date.now()}`,
      sourceUrl,
      sourceTitle: pick.title,
      sourceDomain: sourcePortal,
      fetchedAt: new Date().toISOString(),
      textSnippet: pick.snippet,
      relevanceStatus: duplicate ? 'duplicate' : 'relevant',
      confidenceScore: duplicate ? Math.max(0.05, 1 - duplicate.score) : 0.95,
      extractedDepartment: pick.dept,
    };

    pipelineDatabase.unshift(simulatedItem);
    await persistNewPipelineItem(simulatedItem);

    res.json({
      source: 'simulated',
      message: errors.length
        ? `Live RSS sources unreachable right now (${errors.join('; ')}). Showing a simulated item instead — this is dev-only fallback.`
        : 'No new scheme-relevant items in live sources right now. Showing a simulated item instead — this is dev-only fallback.',
      fetchedCount: 1,
      newItem: simulatedItem,
      newItems: [simulatedItem],
      duplicateOf: duplicate ? { type: duplicate.type, title: duplicate.matchTitle } : null,
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RationQ Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start RationQ server:', err);
});
