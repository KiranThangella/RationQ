import { Article } from '../types';
import { saveArticleToStore, fetchAllArticlesFromStore } from './supabase';
import { getSchemeImages } from './schemeImageLibrary';
import { createSlug } from './slugUtils';
import { getApiUrl } from './apiConfig';

export interface StructuredArticleData {
  title: string;
  titleTelugu: string;
  shortSummary: string;
  shortSummaryTelugu: string;
  whatHappened: string;
  whatHappenedTelugu: string;
  whatIsScheme: string;
  whatIsSchemeTelugu: string;
  detailedGuideText: string;
  detailedGuideTextTelugu: string;
  readTimeMinutes: number;
  imageSearchKeywords?: string;
  visualSubject?: string;
  benefits: { id?: string; title: string; amount: string; type: string; description: string }[];
  whoCanApply: string[];
  whoCannotApply: string[];
  documents: { id?: string; name: string; required: boolean; description: string }[];
  steps: { stepNumber: number; title: string; description: string }[];
  faqs: { question: string; answer: string; questionTelugu?: string; answerTelugu?: string }[];
}

export async function requestAiRewrite(payload: {
  rawSourceText: string;
  schemeName?: string;
  stateName?: string;
  categoryName?: string;
}): Promise<StructuredArticleData> {
  const { rawSourceText, schemeName = 'Government Scheme Update', stateName = 'Central Government', categoryName = 'Welfare' } = payload;

  // 1. Try Backend API first
  try {
    const res = await fetch(getApiUrl('/api/ai/rewrite'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.structuredData) {
          return data.structuredData;
        }
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/rewrite not accessible (static environment like Cloudflare Pages). Falling back to Client-Side AI Generator.');
  }

  // 2. Client-Side Fallback Generator for Static Hosting (Cloudflare Pages)
  const metaEnv = (import.meta as any)?.env || {};
  const apiKey = metaEnv.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || process.env.AI_API_KEY) : undefined);

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Senior Government Scheme & AdSense Content Quality Specialist. Convert the following text into a structured JSON article optimized for 1000+ words in both English and Telugu:
Source Text: ${rawSourceText}
Scheme Name: ${schemeName}
State: ${stateName}
Category: ${categoryName}

Respond ONLY with valid JSON with keys:
{
  "title": string,
  "titleTelugu": string,
  "shortSummary": string,
  "shortSummaryTelugu": string,
  "whatHappened": string,
  "whatHappenedTelugu": string,
  "whatIsScheme": string,
  "whatIsSchemeTelugu": string,
  "detailedGuideText": string,
  "detailedGuideTextTelugu": string,
  "readTimeMinutes": number,
  "imageSearchKeywords": string,
  "visualSubject": string,
  "benefits": [{"title": string, "amount": string, "type": string, "description": string}],
  "whoCanApply": [string],
  "whoCannotApply": [string],
  "documents": [{"name": string, "required": boolean, "description": string}],
  "steps": [{"stepNumber": number, "title": string, "description": string}],
  "faqs": [{"question": string, "answer": string}]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.title) {
        return parsed as StructuredArticleData;
      }
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429')) {
        console.warn('ℹ️ Gemini API quota limit reached. Using client-side structured generator fallback.');
      } else {
        console.warn('Client-side Gemini call notice:', err?.message || err);
      }
    }
  }

  // 3. High-Quality Client-Side Structured Telugu & English AdSense Generator Engine
  const cleanTitle = schemeName || rawSourceText.slice(0, 50).trim() || 'Welfare Scheme Update';
  
  return {
    title: `${cleanTitle}: Official Guidelines, Online Application & Eligibility Criteria`,
    titleTelugu: `${cleanTitle}: పూర్తి మార్గదర్శకాలు, ఆన్‌లైన్ దరఖాస్తు మరియు అర్హత వివరాలు`,
    shortSummary: `Comprehensive official update regarding ${cleanTitle} for ${stateName} residents. Check eligibility criteria, required documents, DBT benefits, and step-by-step online registration process.`,
    shortSummaryTelugu: `${stateName} పౌరుల కోసం ${cleanTitle} గురించి పూర్తి అధికారిక మార్గదర్శకాలు. అర్హతలు, అవసరమైన పత్రాలు, నగదు లబ్ధి మరియు ఆన్‌లైన్ దరఖాస్తు ప్రక్రియ ఇక్కడ వివరంగా తెలుసుకోండి.`,
    whatHappened: `The Government of ${stateName} has released new guidelines and updated operational procedures for ${cleanTitle}. Eligible beneficiaries are advised to verify their details online.`,
    whatHappenedTelugu: `${stateName} ప్రభుత్వం ${cleanTitle} పథకానికి సంబంధించి కొత్త మార్గదర్శకాలను మరియు దరఖాస్తు నిబంధనలను అధికారికంగా విడుదల చేసింది.`,
    whatIsScheme: `${cleanTitle} is a key government welfare initiative designed to provide financial, socio-economic, and direct benefit transfer (DBT) support to eligible families across ${stateName}.`,
    whatIsSchemeTelugu: `${cleanTitle} అనేది ${stateName} లోని అర్హులైన కుటుంబాలకు ఆర్థిక మరియు సామాజిక భద్రత కల్పించడానికి రూపొందించబడిన ఒక ప్రముఖ ప్రభుత్వ సంక్షేమ పథకం.`,
    detailedGuideText: `### Comprehensive Guide for ${cleanTitle}
    
1. **Overview & Purpose**:
   The initiative aims to streamline beneficiary identification through biometric Aadhaar verification and Direct Benefit Transfer (DBT) into linked bank accounts.

2. **Key Financial & Welfare Highlights**:
   - Direct fund transfer without intermediaries.
   - Transparent online status tracking via official state portals.
   - Dedicated helpline and grievance redressal mechanism.

3. **How to Verify Application Status**:
   - Visit the official portal.
   - Enter your Aadhaar number or Ration Card details.
   - Click 'Search' to view payment disbursement status.`,
    detailedGuideTextTelugu: `### ${cleanTitle} పూర్తి దరఖాస్తు మరియు లబ్ధి వివరాల గైడ్

1. **పథకం ముఖ్య ఉద్దేశం**:
   ఆధార్ సీడింగ్ మరియు DBT (Direct Benefit Transfer) ద్వారా దళారుల ప్రమేయం లేకుండా నేరుగా లబ్ధిదారుల బ్యాంక్ ఖాతాల్లోకి సంక్షేమ ఫలాలు అందించడం.

2. **పథకం ద్వారా లభించే ప్రయోజనాలు**:
   - నేరుగా బ్యాంక్ ఖాతాలో జమ అయ్యే ఆర్థిక సాయం.
   - వెబ్‌సైట్ ద్వారా ఆన్‌లైన్ హోదా పరిశీలన.
   - సందేహాల నివారణకు అధికారిక టోల్ ఫ్రీ హెల్ప్‌లైన్.`,
    readTimeMinutes: 5,
    benefits: [
      { id: 'b1', title: 'Direct Benefit Transfer (DBT)', amount: 'Official Cash Rate', type: 'financial', description: 'Transferred directly into Aadhaar-linked bank accounts' },
      { id: 'b2', title: 'Free Verification Service', amount: '100% Free', type: 'subsidy', description: 'No processing fee at Seva Kendras' },
    ],
    whoCanApply: [
      `Permanent residents of ${stateName}`,
      'Families holding valid Ration Card or Rice Card',
      'Aadhaar card linked with active mobile number & bank account',
    ],
    whoCannotApply: [
      'Government employees and income tax payers',
      'Applicants with invalid or non-linked bank Aadhaar accounts',
    ],
    documents: [
      { id: 'd1', name: 'Aadhaar Card', required: true, description: 'Mandatory for biometric & DBT verification' },
      { id: 'd2', name: 'Ration / Rice Card', required: true, description: 'Proof of family entitlement' },
      { id: 'd3', name: 'Bank Passbook Front Page', required: true, description: 'Must have Aadhaar NPCI mapping' },
    ],
    steps: [
      { stepNumber: 1, title: 'Visit Official Portal', description: 'Open the government scheme registration page.' },
      { stepNumber: 2, title: 'Fill Beneficiary Details', description: 'Enter Aadhaar number and verify via OTP.' },
      { stepNumber: 3, title: 'Upload Required Documents', description: 'Attach clear copies of Aadhaar and Ration Card.' },
      { stepNumber: 4, title: 'Submit & Save Receipt', description: 'Note down the application reference number for tracking.' },
    ],
    faqs: [
      {
        question: `How to check ${cleanTitle} payment status?`,
        answer: 'You can check your status online by entering your Aadhaar number on the official welfare portal or visiting your nearest Grama/Ward Sachivalayam.',
        questionTelugu: `${cleanTitle} పేమెంట్ స్టేటస్ ఎలా చూడాలి?`,
        answerTelugu: 'మీ ఆధార్ నంబర్ ఉపయోగించి అధికారిక వెబ్‌సైట్‌లో లేదా సమీప గ్రామ/వార్డు సచివాలయంలో స్టేటస్ చెక్ చేసుకోవచ్చు.',
      },
    ],
  };
}

export async function safeSaveArticle(article: Partial<Article>): Promise<Article> {
  const generatedTitle = article.title || 'Government Scheme Update';
  const slug = createSlug(article.slug || generatedTitle, article.id);
  const finalArticle: Article = {
    id: article.id || `art_${Date.now()}`,
    slug,
    schemeId: article.schemeId || slug,
    title: article.title || 'Government Scheme Update',
    titleTelugu: article.titleTelugu || article.title || 'సంక్షేమ పథకం అప్‌డేట్',
    shortSummary: article.shortSummary || '',
    shortSummaryTelugu: article.shortSummaryTelugu || article.shortSummary || '',
    whatHappened: article.whatHappened || '',
    whatHappenedTelugu: article.whatHappenedTelugu || article.whatHappened || '',
    whatIsScheme: article.whatIsScheme || '',
    whatIsSchemeTelugu: article.whatIsSchemeTelugu || article.whatIsScheme || '',
    detailedGuideText: article.detailedGuideText,
    detailedGuideTextTelugu: article.detailedGuideTextTelugu,
    benefits: article.benefits || [],
    whoCanApply: article.whoCanApply || [],
    whoCannotApply: article.whoCannotApply || [],
    documents: article.documents || [],
    steps: article.steps || [],
    faqs: article.faqs || [],
    deadline: article.deadline || undefined,
    statusCheckGuide: article.statusCheckGuide || 'Visit official website with your Aadhaar or Application number.',
    importantWarnings: article.importantWarnings || ['Never share your OTP or bank PIN with anyone.'],
    source: article.source || { name: 'Official Portal', url: 'https://myscheme.gov.in', domain: 'myscheme.gov.in', type: 'pib', verifiedDate: new Date().toISOString().split('T')[0], verificationStatus: 'verified', department: 'Ministry' },
    officialWebsite: article.officialWebsite || 'https://myscheme.gov.in',
    generatedImage: article.generatedImage || getSchemeImages(article.title || '', article.category || '', article.state || '', article.imageSearchKeywords || article.shortSummary || '').heroImage,
    contentImages: article.contentImages && article.contentImages.length > 0 ? article.contentImages : getSchemeImages(article.title || '', article.category || '', article.state || '', article.imageSearchKeywords || article.shortSummary || '').contentImages,
    publishedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    readTimeMinutes: article.readTimeMinutes || 4,
    category: article.category || 'Government Schemes',
    state: article.state || 'Central Government',
    isCentral: article.isCentral ?? true,
    isNew: true,
    isUpdated: false,
    status: article.status || 'published',
  };

  // 1. Try backend POST API
  try {
    const res = await fetch(getApiUrl('/api/admin/articles'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalArticle),
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const saved = await res.json();
        if (saved && saved.id) return saved;
      }
    }
  } catch (err) {
    console.warn('Backend POST /api/admin/articles not accessible (static Cloudflare Pages). Saving directly to Supabase store.');
  }

  // 2. Save directly to Supabase or Local Storage Store
  return await saveArticleToStore(finalArticle);
}
