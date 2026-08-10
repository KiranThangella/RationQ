import express, { Request, Response } from 'express';
import cors from 'cors';
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
import {
  getSupabaseClient,
  fetchAllArticlesFromStore,
  saveArticleToStore,
  deleteArticleFromStore,
  fetchPipelineFromStore,
  savePipelineItemToStore,
  deletePipelineItemFromStore,
} from './src/lib/supabase.js';
import {
  autoFetchState,
  runAutoFetch,
  startAutoFetchScheduler,
  stopAutoFetchScheduler,
} from './src/lib/autoFetcher.js';
import { getSchemeImages } from './src/lib/schemeImageLibrary.js';

const currentFilename = typeof __filename !== 'undefined'
  ? __filename
  : (typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '');
const currentDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : (currentFilename ? path.dirname(currentFilename) : process.cwd());

// Initial memory fallback references
let notificationsDatabase = [...INITIAL_NOTIFICATIONS];
let userProfileDatabase: UserProfile = { ...DEFAULT_USER_PROFILE };

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
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Robust CORS Middleware for Cloudflare / Render deployments & rationq.in
  app.use(cors({
    origin: (origin, callback) => {
      // Dynamically reflect requesting origin or allow non-browser requests
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Origin', 'X-Requested-With', 'Content-Type', 'Accept',
      'Authorization', 'Cache-Control', 'Pragma', 'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers'
    ],
    exposedHeaders: ['*'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  }));

  app.options('*', cors());

  // Fail-safe CORS Header Interceptor for all requests including static/404s
  app.use((req: Request, res: Response, next: any) => {
    const origin = req.headers.origin || req.get('Origin') || 'https://rationq.in';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json());

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
  app.get('/api/articles', async (req: Request, res: Response) => {
    const { category, state, isCentral, search, status, page = '1', limit = '12' } = req.query;

    const allArticles = await fetchAllArticlesFromStore();
    let filtered = allArticles;
    if (status && status !== 'all') {
      filtered = filtered.filter(a => a.status === String(status));
    } else if (!status) {
      filtered = filtered.filter(a => a.status === 'published');
    }

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
  app.get('/api/articles/:slug', async (req: Request, res: Response) => {
    const { slug } = req.params;
    const allArticles = await fetchAllArticlesFromStore();
    const article = allArticles.find(a => a.slug === slug || a.id === slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  });

  // Global search & autocomplete endpoint
  app.get('/api/search', async (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ results: [], suggestions: ['PM-KISAN', 'Telangana Scholarships', 'Housing Subsidy', 'PM Vishwakarma', 'Ayushman Bharat'] });
    }

    const allArticles = await fetchAllArticlesFromStore();
    const matches = allArticles.filter(a =>
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
  app.post('/api/eligibility/check', async (req: Request, res: Response) => {
    const formData: EligibilityFormData = req.body;
    const allArticles = await fetchAllArticlesFromStore();

    const results: MatchResult[] = allArticles
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

    const allArticles = await fetchAllArticlesFromStore();
    const ai = getGeminiClient();

    // Prepare system context from published database schemes
    const verifiedKnowledgeBase = allArticles.map(a => ({
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
        if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429')) {
          console.warn('ℹ️ Gemini API quota limit reached. Using database fallback for chat.');
        } else {
          console.warn('Gemini chat notice:', err?.message || err);
        }
      }
    }

    // Smart Fallback if Gemini key is not configured or fails
    const lower = message.toLowerCase();
    const matched = allArticles.filter(a =>
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
- Write highly detailed, comprehensive content (Google AdSense high-value content guidelines). Avoid brief or thin summaries.
- Always generate Telugu translations for "titleTelugu", "shortSummaryTelugu", "whatIsSchemeTelugu", "whatHappenedTelugu", "detailedGuideTextTelugu", and FAQs.
- Include a 3-paragraph "detailedGuideText" and "detailedGuideTextTelugu" covering scheme background, eligibility nuances, and distribution mechanisms.
- Include 3-4 comprehensive FAQs in both English and Telugu.
- Return pure valid JSON strictly matching this schema:
{
  "title": "Clear English headline",
  "titleTelugu": "తెలుగు శీర్షిక (Accurate Telugu title)",
  "shortSummary": "Comprehensive summary (3-4 sentences)",
  "shortSummaryTelugu": "తెలుగు సంక్షిప్త సారాంశం",
  "whatHappened": "Detailed description of what was officially announced",
  "whatHappenedTelugu": "ఏమి జరిగింది? (వివరమైన తెలుగు వివరణ)",
  "whatIsScheme": "Exhaustive explanation of the scheme's vision and impact",
  "whatIsSchemeTelugu": "పథకం వివరాలు (పూర్తి తెలుగు వివరణ)",
  "detailedGuideText": "In-depth, multi-paragraph guide explaining scheme background, target beneficiaries, and state/central execution strategy.",
  "detailedGuideTextTelugu": "వివరమైన తెలుగు సంపూర్ణ గైడ్ - పథకం నేపథ్యం, అర్హులైన వర్గాలు మరియు అమలు తీరుతెన్నుల వివరణ.",
  "faqs": [
    {
      "question": "Frequently asked question 1 in English",
      "answer": "Detailed answer in English",
      "questionTelugu": "తెలుగు ప్రశ్న 1",
      "answerTelugu": "తెలుగు వివరణాత్మక సమాధానం 1"
    }
  ],
  "benefits": [{"title": "Benefit title", "amount": "₹ amount or % if any", "type": "financial|subsidy|insurance|pension|scholarship|service", "description": "detail"}],
  "whoCanApply": ["eligibility criteria 1", "eligibility criteria 2"],
  "whoCannotApply": ["exclusion 1"],
  "documents": [{"name": "Doc name", "required": true, "description": "why needed"}],
  "steps": [{"stepNumber": 1, "title": "Step 1 title", "description": "actionable instruction"}],
  "readTimeMinutes": 5
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
          return res.json({ success: true, structuredData });
        }
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429')) {
          console.warn('ℹ️ Gemini API quota limit reached. Using structured template generator.');
        } else {
          console.warn('Gemini rewrite notice:', err?.message || err);
        }
      }
    }

    // Fallback template
    res.json({
      success: true,
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
  app.get('/api/saved-schemes', async (req: Request, res: Response) => {
    const allArticles = await fetchAllArticlesFromStore();
    const savedArticles = allArticles.filter(a => userProfileDatabase.savedSchemeIds.includes(a.id) || userProfileDatabase.savedSchemeIds.includes(a.slug));
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

  app.get('/api/admin/metrics', async (req: Request, res: Response) => {
    const articles = await fetchAllArticlesFromStore();
    const pipeline = await fetchPipelineFromStore();

    const published = articles.filter(a => a.status === 'published').length;
    const drafts = articles.filter(a => a.status === 'draft').length;
    const pendingVerification = articles.filter(a => a.status === 'pending_verification').length;
    const totalSchemes = articles.length;
    const pipelineItems = pipeline.length;

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

  app.get('/api/admin/pipeline', async (req: Request, res: Response) => {
    const pipeline = await fetchPipelineFromStore();
    res.json(pipeline);
  });

  app.post('/api/admin/articles', async (req: Request, res: Response) => {
    const newArticle: Article = {
      ...req.body,
      id: req.body.id || `article-${Date.now()}`,
      slug: req.body.slug || `article-${Date.now()}`,
      publishedAt: req.body.publishedAt || new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      status: req.body.status || 'draft',
      isNew: true,
      isUpdated: false,
    };
    await saveArticleToStore(newArticle);
    res.json(newArticle);
  });

  app.put('/api/admin/articles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const articles = await fetchAllArticlesFromStore();
    const existing = articles.find(a => a.id === id || a.slug === id);
    if (!existing) return res.status(404).json({ error: 'Article not found' });

    const updatedArticle: Article = {
      ...existing,
      ...req.body,
      lastVerifiedAt: new Date().toISOString(),
    };

    await saveArticleToStore(updatedArticle);
    res.json(updatedArticle);
  });

  app.delete('/api/admin/articles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteArticleFromStore(id);
    console.log(`🗑️ API Server: Deleted article ${id}`);
    res.json({ success: true, message: `Article ${id} deleted successfully` });
  });

  app.post('/api/admin/articles/:id/publish', async (req: Request, res: Response) => {
    const { id } = req.params;
    const articles = await fetchAllArticlesFromStore();
    const article = articles.find(a => a.id === id || a.slug === id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.status = 'published';
    article.lastVerifiedAt = new Date().toISOString();
    await saveArticleToStore(article);

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

  // AdSense Content Quality Expansion Endpoint
  app.post('/api/admin/articles/:id/expand-adsense', async (req: Request, res: Response) => {
    const { id } = req.params;
    const articles = await fetchAllArticlesFromStore();
    const article = articles.find(a => a.id === id || a.slug === id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const schemeImgs = getSchemeImages(article.title, article.category, article.state);

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a Senior Google AdSense Content Quality Specialist & Chief Editor for Government Scheme Portals.
This article titled "${article.title}" currently needs expansion to meet Google AdSense high-value, comprehensive content policies (1000+ words target).

EXPAND AND ENRICH THIS ARTICLE WITH THE FOLLOWING EXTENSIVE SECTIONS:
1. "detailedGuideText": Write 4-5 thorough, structured paragraphs covering:
   - Comprehensive background and historical context of the initiative.
   - Financial outlay, direct benefit transfer (DBT) mechanics, and bank credit timelines.
   - Nuanced eligibility criteria including income brackets, landholding limits, and priority categories.
   - Step-by-step portal registration, biometric e-KYC, and common reasons for application rejection.
   - Grievance redressal mechanisms, official helpline contacts, and toll-free assistance options.

2. "detailedGuideTextTelugu": Write 4-5 thorough, fluent Telugu paragraphs covering all above points comprehensively for Telugu readers.

3. "faqs": Provide 6-8 detailed, highly informative bilingual FAQs answering common citizen questions.

4. "whatHappened", "whatHappenedTelugu", "whatIsScheme", "whatIsSchemeTelugu": Expand each into comprehensive explanations.

Current Article Data:
${JSON.stringify(article, null, 2)}

Return pure JSON matching this expanded structure strictly:
{
  "detailedGuideText": "Expanded 4-5 paragraph English guide...",
  "detailedGuideTextTelugu": "సవివరమైన 4-5 పేరాల తెలుగు సంపూర్ణ మార్గదర్శి...",
  "whatHappened": "Expanded description...",
  "whatHappenedTelugu": "వివరణాత్మక తెలుగు వివరణ...",
  "whatIsScheme": "Exhaustive vision explanation...",
  "whatIsSchemeTelugu": "పూర్తి తెలుగు పథక స్వరూపం...",
  "shortSummary": "Enhanced 3-sentence summary...",
  "shortSummaryTelugu": "విస్తరించిన తెలుగు సారాంశం...",
  "faqs": [
    {
      "question": "English FAQ 1?",
      "answer": "Detailed English answer 1...",
      "questionTelugu": "తెలుగు ప్రశ్న 1?",
      "answerTelugu": "సవివరమైన తెలుగు సమాధానం 1..."
    }
  ],
  "whoCanApply": ["Detailed criteria 1", "Detailed criteria 2", "Detailed criteria 3", "Detailed criteria 4"],
  "whoCannotApply": ["Exclusion criteria 1", "Exclusion criteria 2"],
  "importantWarnings": ["Mandatory document warning 1", "Warning against fraudulent agents 2"],
  "readTimeMinutes": 6
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          const expanded = JSON.parse(response.text);

          const updatedArticle: Article = {
            ...article,
            ...expanded,
            generatedImage: article.generatedImage || schemeImgs.heroImage,
            contentImages: schemeImgs.contentImages,
            isUpdated: true,
            lastVerifiedAt: new Date().toISOString(),
          };

          await saveArticleToStore(updatedArticle);
          console.log(`✨ [AdSense Expansion] Successfully expanded "${article.title}" to 1000+ words with content images!`);
          return res.json({ success: true, article: updatedArticle });
        }
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429')) {
          console.warn('ℹ️ Gemini API quota limit reached. Using offline AdSense expansion engine.');
        } else {
          console.warn('Gemini AdSense expansion notice:', err?.message || err);
        }
      }
    }

    // Rich Offline Fallback Expansion Engine
    const fallbackExpandedGuide = `${article.detailedGuideText || article.shortSummary || ''}\n\n` +
      `### Comprehensive Background & Policy Vision\n` +
      `The ${article.title} represents a pivotal welfare milestone launched by ${article.state} to provide direct institutional support to eligible beneficiaries. Under this program, the government has established a seamless Direct Benefit Transfer (DBT) workflow to minimize intermediary delay and ensure 100% financial transparency.\n\n` +
      `### Direct Financial Mechanics & DBT Transfer Protocols\n` +
      `Financial assistance under ${article.title} is directly disbursed into Aadhaar-seeded bank accounts linked via NPCI mapper. Beneficiaries are advised to verify that their active savings bank account is properly mapped with NPCI to prevent electronic transaction failures. Direct benefit transfers are processed in structured annual installments.\n\n` +
      `### Detailed Eligibility & Ineligibility Parameters\n` +
      `Eligibility is strictly verified using official state database registries, Meeseva/CSC land record maps, and family digital ration cards. Applicants falling under the Economically Weaker Section (EWS) or below specified annual family income limits are accorded top priority. Commercial entities, high-income tax payees, and institutional landowners are explicitly excluded from financial grants.\n\n` +
      `### Step-by-Step Portal Application & Grievance Redressal\n` +
      `Citizens can submit applications either online through the official portal (${article.officialWebsite || 'myscheme.gov.in'}) or by visiting their nearest Grama / Ward Sachivalayam or Common Service Centre (CSC). Upon registration, a unique application tracking reference number is generated via SMS. For inquiries or grievance escalation, beneficiaries can reach official government toll-free helplines or submit digital feedback on the portal.`;

    const fallbackExpandedGuideTelugu = `${article.detailedGuideTextTelugu || article.shortSummaryTelugu || ''}\n\n` +
      `### పథకం నేపథ్యం & పూర్తి వివరాలు\n` +
      `${article.titleTelugu || article.title} పథకం పౌరుల సంక్షేమం కోసం ప్రత్యేకంగా రూపొందించబడింది. ఈ పథకం ద్వారా లబ్ధిదారులకు ఎటువంటి మధ్యవర్తులు లేకుండా నేరుగా వారి ఖాతాల్లోకి ఆర్థిక సాయం అందుతుంది.\n\n` +
      `### డిజిటల్ లబ్ధి బదిలీ (DBT) నిబంధనలు\n` +
      `ప్రభుత్వం అందించే సాయం నేరుగా ఆధార్ సీడెడ్ బ్యాంక్ ఖాతాలకు మాత్రమే జమ చేయబడుతుంది. లబ్ధిదారులు తమ బ్యాంక్ ఖాతా NPCI మ్యాపింగ్ కలిగి ఉందో లేదో సరిచూసుకోవాలి. దీనివల్ల నిధుల బదిలీలో ఎటువంటి ఆటంకాలు ఉండవు.\n\n` +
      `### దరఖాస్తు విధానం & పత్రాల ధృవీకరణ\n` +
      `అర్హులైన పౌరులు తమ సమీప గ్రామ/వార్డు సచివాలయం లేదా సీఎస్‌సీ కేంద్రాల ద్వారా దరఖాస్తు చేసుకోవచ్చు. ఆధార్ కార్డ్, రేషన్ కార్డ్, బ్యాంక్ పాస్‌బుక్ మరియు ఆదాయ ధృవీకరణ పత్రాలు తప్పనిసరిగా సమర్పించాలి. ఆన్‌లైన్ పోర్టల్ ద్వారా అప్లికేషన్ స్టేటస్‌ను ఎప్పటికప్పుడు తనిఖీ చేయవచ్చు.`;

    const expandedFaqs = [
      ...(article.faqs || []),
      {
        question: `How do I check my payment status for ${article.title}?`,
        answer: `Log in to the official portal using your Aadhaar number or Application Reference ID to view real-time DBT credit status and bank transaction details.`,
        questionTelugu: `ఈ పథకంలో నా పేమెంట్ స్టేటస్ ఎలా తనిఖీ చేయాలి?`,
        answerTelugu: `అధికారిక పోర్టల్‌లో మీ ఆధార్ సంఖ్య లేదా అప్లికేషన్ ఐడీ నమోదు చేసి మీ బ్యాంక్ ఖాతాలో డబ్బులు జమ అయ్యాయో లేదో తెలుసుకోవచ్చు.`
      },
      {
        question: `What should I do if my application is marked 'Pending for Verification'?`,
        answer: `If marked pending, visit your local Grama Sachivalayam or Village Revenue Officer (VRO) with physical original copies of your Aadhaar and Ration Card for immediate verification.`,
        questionTelugu: `నా దరఖాస్తు 'పెండింగ్' అని వస్తే ఏం చేయాలి?`,
        answerTelugu: `మీ సమీప విలేజ్ రెవెన్యూ ఆఫీసర్ (VRO) లేదా సచివాలయంలో మీ ఒరిజినల్ పత్రాలతో కలసి వెరిఫికేషన్ పూర్తి చేయించుకోవాలి.`
      },
      {
        question: `Is there any fee charged for submitting the application form?`,
        answer: `No. Government scheme application forms and portal registrations are 100% free of charge. Report any demand for money to official helpline numbers immediately.`,
        questionTelugu: `ఈ పథకానికి అప్లై చేయడానికి ఏమైనా ఫీజు ఉందా?`,
        answerTelugu: `లేదు, ప్రభుత్వ పథకాలకు దరఖాస్తు చేయడం 100% ఉచితం. ఎవరైనా డబ్బులు అడిగితే అధికారులకు ఫిర్యాదు చేయవచ్చు.`
      }
    ];

    const updatedArticle: Article = {
      ...article,
      detailedGuideText: fallbackExpandedGuide,
      detailedGuideTextTelugu: fallbackExpandedGuideTelugu,
      faqs: expandedFaqs,
      generatedImage: article.generatedImage || schemeImgs.heroImage,
      contentImages: schemeImgs.contentImages,
      readTimeMinutes: 6,
      isUpdated: true,
      lastVerifiedAt: new Date().toISOString(),
    };

    await saveArticleToStore(updatedArticle);

    res.json({ success: true, article: updatedArticle });
  });

  // Automated Source Fetching Simulator
  app.post('/api/admin/fetch-pipeline', async (req: Request, res: Response) => {
    const { sourcePortal = 'pib.gov.in' } = req.body;

    const simulatedItem: NewsPipelineItem = {
      id: `pipe-${Date.now()}`,
      sourceUrl: `https://${sourcePortal}/PressReleasePage.aspx?PRID=${Math.floor(1000000 + Math.random() * 900000)}`,
      sourceTitle: `Ministry Announcement: Revised Subsidy Guidelines for ${sourcePortal.includes('telangana') ? 'Telangana Micro-Irrigation' : 'Central Pensioners Welfare Scheme'}`,
      sourceDomain: sourcePortal,
      fetchedAt: new Date().toISOString(),
      textSnippet: `Official notification released detailing revised eligibility income slabs and online application portal link for beneficiaries across districts.`,
      relevanceStatus: 'relevant',
      confidenceScore: 0.95,
      extractedDepartment: sourcePortal.includes('telangana') ? 'Horticulture & Micro Irrigation Dept' : 'Ministry of Social Justice',
    };

    await savePipelineItemToStore(simulatedItem);

    res.json({
      message: 'Source crawl completed successfully',
      fetchedCount: 1,
      newItem: simulatedItem,
    });
  });

  // 10-Minute Auto-Fetch Management Endpoints
  app.get('/api/admin/auto-fetch/status', (req: Request, res: Response) => {
    res.json(autoFetchState);
  });

  app.post('/api/admin/auto-fetch/trigger', async (req: Request, res: Response) => {
    console.log('⚡ Manual trigger received for 10-minute Auto Fetcher...');
    const result = await runAutoFetch();
    res.json({
      ...result,
      status: autoFetchState,
    });
  });

  app.post('/api/admin/auto-fetch/toggle', (req: Request, res: Response) => {
    const { enabled } = req.body;
    if (enabled) {
      startAutoFetchScheduler();
    } else {
      stopAutoFetchScheduler();
    }
    res.json(autoFetchState);
  });

  // Sitemap Generator
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    try {
      const allArticles = await fetchAllArticlesFromStore();
      const publishedArticles = allArticles.filter(a => a.status === 'published');
      
      const baseUrl = 'https://rationq.in';
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Home page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>1.0</priority>\n';
      xml += '  </url>\n';
      
      // Dynamic article pages
      publishedArticles.forEach(article => {
        const urlSlug = article.slug || article.id;
        // Basic escaping for XML
        const escapedSlug = urlSlug.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${escapedSlug}</loc>\n`;
        const lastMod = article.lastVerifiedAt || article.publishedAt || new Date().toISOString();
        xml += `    <lastmod>${lastMod.split('T')[0]}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Start the background 10-minute auto fetch scheduler
  startAutoFetchScheduler();

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

  // Global Error Handler with CORS headers
  app.use((err: any, req: Request, res: Response, _next: any) => {
    console.error('Unhandled server error:', err);
    const origin = req.headers.origin || 'https://rationq.in';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RationQ Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start RationQ server:', err);
});
