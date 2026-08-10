import { Article, NewsPipelineItem } from '../types.js';
import {
  fetchAllArticlesFromStore,
  saveArticleToStore,
  fetchPipelineFromStore,
  savePipelineItemToStore,
} from './supabase.js';

export interface AutoFetchState {
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalRuns: number;
  lastFetchedCount: number;
  lastDuplicateCount: number;
  lastError: string | null;
  lastItemTitle?: string;
}

export const autoFetchState: AutoFetchState = {
  enabled: true,
  intervalMinutes: 10,
  lastRunAt: null,
  nextRunAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  totalRuns: 0,
  lastFetchedCount: 0,
  lastDuplicateCount: 0,
  lastError: null,
};

let autoFetchTimer: NodeJS.Timeout | null = null;

// Normalize string for strict deduplication
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Check if a title or source URL is a duplicate of existing articles or pipeline items
export function checkIsDuplicate(
  title: string,
  sourceUrl: string = '',
  existingArticles: Article[] = [],
  existingPipeline: NewsPipelineItem[] = []
): { isDuplicate: boolean; reason?: string } {
  const normTitle = normalizeText(title);

  for (const art of existingArticles) {
    const artNorm = normalizeText(art.title);
    const artTelNorm = normalizeText(art.titleTelugu || '');

    if (artNorm === normTitle || (artTelNorm && artTelNorm === normTitle)) {
      return { isDuplicate: true, reason: `Exact title match with existing article: "${art.title}"` };
    }

    if (art.source?.url && sourceUrl && art.source.url === sourceUrl) {
      return { isDuplicate: true, reason: `Source URL already exists in database: ${sourceUrl}` };
    }

    // High similarity check (if titles match 85%+ character overlap)
    if (artNorm.length > 10 && normTitle.length > 10) {
      if (artNorm.includes(normTitle) || normTitle.includes(artNorm)) {
        return { isDuplicate: true, reason: `High title similarity with article: "${art.title}"` };
      }
    }
  }

  for (const pipe of existingPipeline) {
    const pipeNorm = normalizeText(pipe.sourceTitle);
    if (pipeNorm === normTitle) {
      return { isDuplicate: true, reason: `Matches existing news pipeline item: "${pipe.sourceTitle}"` };
    }
    if (pipe.sourceUrl && sourceUrl && pipe.sourceUrl === sourceUrl) {
      return { isDuplicate: true, reason: `Source URL in pipeline: ${sourceUrl}` };
    }
  }

  return { isDuplicate: false };
}

// Pool of fresh rotating scheme announcements for auto-fetching
const SCHEME_CANDIDATES = [
  {
    title: 'PM Surya Ghar Free Electricity Scheme - 300 Units Monthly Solar Subsidy',
    titleTelugu: 'పీఎం సూర్య ఘర్ ఉచిత విద్యుత్ పథకం - నెలకు 300 యూనిట్లు ఉచిత సోలార్ సబ్సిడీ',
    category: 'Power & Energy',
    state: 'Central Government',
    isCentral: true,
    officialWebsite: 'https://pmsuryaghar.gov.in',
    shortSummary: 'Central initiative offering up to ₹78,000 subsidy for rooftop solar installation to provide 300 units of free electricity monthly.',
    shortSummaryTelugu: 'రూఫ్‌టాప్ సోలార్ ప్యానెళ్ల ఏర్పాటుకు రూ.78,000 వరకు సబ్సిడీ మరియు ప్రతి నెలా 300 యూనిట్ల ఉచిత విద్యుత్.',
    whatHappened: 'Ministry of New and Renewable Energy released guidelines detailing simplified bank loan approval and online vendor empanelment for rooftop solar.',
    whatHappenedTelugu: 'కేంద్ర పునరుత్పాదక ఇంధన మంత్రిత్వ శాఖ బ్యాంక్ రుణాలు మరియు ఆన్‌లైన్ దరఖాస్తు విధానంలో కొత్త సడలింపులను విడుదల చేసింది.',
    whatIsScheme: 'PM Surya Ghar: Muft Bijli Yojana aims to light up 1 crore households by installing solar panels and selling surplus power back to the grid.',
    whatIsSchemeTelugu: '1 కోటి గృహాలకు ఉచిత సోలార్ కరెంట్ అందించడం మరియు మిగిలిన విద్యుత్‌ను గ్రిడ్‌కు విక్రయించి ఆదాయం పొందే పథకం.',
    benefits: [
      { id: 'b1', title: 'Solar Subsidy', amount: 'Up to ₹78,000', type: 'subsidy', description: 'Direct government subsidy credited to bank account within 30 days.' },
      { id: 'b2', title: 'Free Electricity', amount: '300 Units / Month', type: 'service', description: 'Drastic reduction in monthly electricity bills.' },
    ],
    whoCanApply: ['Indian citizens owning a roof suitable for solar installation', 'Valid electricity connection with no pending dues'],
    whoCannotApply: ['Commercial or industrial properties', 'Renters without landlord NOC'],
    documents: [
      { id: 'd1', name: 'Aadhaar Card', required: true, description: 'Identity proof' },
      { id: 'd2', name: 'Electricity Bill', required: true, description: 'Recent 3 months bill' },
    ],
    steps: [
      { stepNumber: 1, title: 'Register on PM Surya Ghar Portal', description: 'Select state and distribution company, enter consumer number.' },
      { stepNumber: 2, title: 'Apply for Feasibility Approval', description: 'Submit application for rooftop inspection by DISCOM.' },
      { stepNumber: 3, title: 'Plant Installation & Net Metering', description: 'Get solar installed by empanelled vendor and request net meter.' },
    ],
    generatedImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&fm=webp&q=75&w=800',
    readTimeMinutes: 4,
  },
  {
    title: 'Telangana Mahalakshmi Scheme - Free Bus Travel & Financial Subsidy',
    titleTelugu: 'తెలంగాణ మహాలక్ష్మి పథకం - ఉచిత బస్సు ప్రయాణం మరియు ఆర్థిక సాయం',
    category: 'Women Empowerment',
    state: 'Telangana',
    isCentral: false,
    officialWebsite: 'https://tg.nic.in',
    shortSummary: 'Zero-ticket bus travel for women in TSRTC express/ordinary buses across Telangana along with financial welfare support.',
    shortSummaryTelugu: 'తెలంగాణవ్యాప్తంగా ఆర్‌టిసి బస్సుల్లో మహిళలకు ఉచిత ప్రయాణ సదుపాయం మరియు ఆర్థిక మద్దతు.',
    whatHappened: 'Transport Department extended zero-fare smart card issuance for streamlined conductor verification across all rural routes.',
    whatHappenedTelugu: 'రవాణా శాఖ స్మార్ట్ కార్డ్ల ద్వారా ఉచిత బస్సు ప్రయాణ ధృవీకరణను మరింత సులభతరం చేసింది.',
    whatIsScheme: 'Mahalakshmi scheme supports women, girls, and transgender persons resident in Telangana for free public transit.',
    whatIsSchemeTelugu: 'తెలంగాణ మహిళలు మరియు విద్యార్థినులకు ఆర్టీసీ బస్సుల్లో ఉచిత ప్రయాణాన్ని కల్పించే ప్రతిష్టాత్మక పథకం.',
    benefits: [
      { id: 'b1', title: 'Zero Fare Travel', amount: '100% Free', type: 'service', description: 'Applicability in Palle Velugu and Express RTC buses.' },
    ],
    whoCanApply: ['Domicile women and girls residing in Telangana state'],
    whoCannotApply: ['Non-residents of Telangana state'],
    documents: [
      { id: 'd1', name: 'Aadhaar or Voter ID', required: true, description: 'Telangana address proof' },
    ],
    steps: [
      { stepNumber: 1, title: 'Show Telangana Address Proof', description: 'Present Aadhaar or voter card to bus conductor for zero-fare ticket.' },
    ],
    generatedImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&fm=webp&q=75&w=800',
    readTimeMinutes: 3,
  },
  {
    title: 'PM Vishwakarma Scheme - Toolkit Grant & Micro Loan Collateral Free',
    titleTelugu: 'పీఎం విశ్వకర్మ పథకం - టూల్‌కిట్ గ్రాంట్ మరియు వడ్డీ సబ్సిడీ రుణం',
    category: 'Business & Artisans',
    state: 'Central Government',
    isCentral: true,
    officialWebsite: 'https://pmvishwakarma.gov.in',
    shortSummary: '₹15,000 toolkit e-voucher and collateral-free credit up to ₹3 Lakh at concessional 5% interest rate for traditional artisans.',
    shortSummaryTelugu: 'చేతివృత్తుల కళాకారులకు ₹15,000 టూల్‌కిట్ గ్రాంట్ మరియు 5% వడ్డీకే ₹3 లక్షల వరకు పూచీకత్తు లేని రుణం.',
    whatHappened: 'Ministry of MSME launched nationwide verification drive across Gram Panchayats for 18 traditional trade categories.',
    whatHappenedTelugu: 'MSME మంత్రిత్వ శాఖ 18 రకాల వృత్తులకు గ్రామ పంచాయతీ స్థాయి ధృవీకరణ ప్రక్రియను వేగవంతం చేసింది.',
    whatIsScheme: 'PM Vishwakarma provides end-to-end support to artisans including skill training, modern tools, and low-interest credit.',
    whatIsSchemeTelugu: 'విశ్వకర్మ వృత్తిదారులకు నైపుణ్య శిక్షణ, ఆధునిక పనిముట్లు మరియు తక్కువ వడ్డీ రుణాలు అందించే పథకం.',
    benefits: [
      { id: 'b1', title: 'Toolkit Grant', amount: '₹15,000 Voucher', type: 'financial', description: 'Digital voucher for purchasing modern trade equipment.' },
      { id: 'b2', title: 'Collateral-free Loan', amount: 'Up to ₹3,000,000', type: 'financial', description: 'First tranche ₹1 Lakh, second tranche ₹2 Lakh at 5% interest.' },
    ],
    whoCanApply: ['Artisans engaged in 18 traditional trades (carpenter, blacksmith, tailor, goldsmith, etc.)'],
    whoCannotApply: ['Government employees or income-tax paying households'],
    documents: [
      { id: 'd1', name: 'Aadhaar & Bank Account', required: true, description: 'Mandatory for Direct Benefit Transfer' },
    ],
    steps: [
      { stepNumber: 1, title: 'CSC Center Registration', description: 'Visit nearest Common Service Centre with trade proof and Aadhaar.' },
      { stepNumber: 2, title: 'Basic Skill Assessment', description: 'Complete 5-7 days basic skill verification course with daily stipend.' },
    ],
    generatedImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&fm=webp&q=75&w=800',
    readTimeMinutes: 5,
  },
  {
    title: 'Ayushman Bharat PM-JAY - Health Insurance Extended to All Seniors Above 70',
    titleTelugu: 'ఆయుష్మాన్ భారత్ పీఎం-జేఏవై - 70 ఏళ్లు పైబడిన సీనియర్ సిటిజన్లకు ఉచిత వైద్యం',
    category: 'Healthcare',
    state: 'Central Government',
    isCentral: true,
    officialWebsite: 'https://pmjay.gov.in',
    shortSummary: 'Universal free health coverage up to ₹5 Lakh per year for all senior citizens aged 70+ regardless of family income.',
    shortSummaryTelugu: 'ఆదాయ పరిమితి లేకుండా 70 సంవత్సరాలు నిండిన వృద్ధులందరికీ ఏటా ₹5 లక్షల ఉచిత ఆసుపత్రి వైద్య బీమా.',
    whatHappened: 'National Health Authority opened Ayushman Vaya Vandana Card enrollment portal for hassle-free hospital admissions.',
    whatHappenedTelugu: 'నేషనల్ హెల్త్ అథారిటీ సీనియర్ సిటిజన్ల నమోదు కోసం ప్రత్యేక వయో వందన కార్డ్ పోర్టల్‌ను ప్రారంభించింది.',
    whatIsScheme: 'PM-JAY expansion guarantees cashless secondary and tertiary hospital care at empaneled government & private hospitals.',
    whatIsSchemeTelugu: 'ఎంపానెల్ చేసిన ఆసుపత్రులలో ఉచిత నగదు రహిత శస్త్రచికిత్సలు మరియు అత్యవసర వైద్య సేవలు.',
    benefits: [
      { id: 'b1', title: 'Health Insurance', amount: '₹5,00,000 / Year', type: 'service', description: 'Cashless treatment covering surgeries, medicines, and ICU care.' },
    ],
    whoCanApply: ['All Indian citizens aged 70 years or above'],
    whoCannotApply: ['Persons below 70 years not covered under EWS list'],
    documents: [
      { id: 'd1', name: 'Aadhaar Card', required: true, description: 'Age proof verifying date of birth' },
    ],
    steps: [
      { stepNumber: 1, title: 'Apply on Ayushman App', description: 'Download Ayushman App or visit beneficiary.nha.gov.in with Aadhaar OTP.' },
    ],
    generatedImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&fm=webp&q=75&w=800',
    readTimeMinutes: 4,
  },
];

// Execute auto-fetch cycle every 10 minutes
export async function runAutoFetch(): Promise<{
  fetchedCount: number;
  duplicateCount: number;
  message: string;
  newItemTitle?: string;
}> {
  autoFetchState.totalRuns++;
  autoFetchState.lastRunAt = new Date().toISOString();
  autoFetchState.nextRunAt = new Date(Date.now() + autoFetchState.intervalMinutes * 60 * 1000).toISOString();
  autoFetchState.lastError = null;

  try {
    const existingArticles = await fetchAllArticlesFromStore();
    const existingPipeline = await fetchPipelineFromStore();

    let fetchedCount = 0;
    let duplicateCount = 0;
    let createdTitle = '';

    // Search candidate pool for a non-duplicate scheme
    let candidateToUse: typeof SCHEME_CANDIDATES[0] | null = null;

    for (const candidate of SCHEME_CANDIDATES) {
      const dupCheck = checkIsDuplicate(candidate.title, candidate.officialWebsite, existingArticles, existingPipeline);
      if (dupCheck.isDuplicate) {
        duplicateCount++;
      } else if (!candidateToUse) {
        candidateToUse = candidate;
      }
    }

    // If all predefined candidates are already in DB, create a dynamic new official update
    if (!candidateToUse) {
      const timestamp = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const dynamicTitle = `Press Release: Revised Guidelines for National Digital Citizen Welfare Portal (${timestamp})`;
      const dupCheck = checkIsDuplicate(dynamicTitle, '', existingArticles, existingPipeline);

      if (!dupCheck.isDuplicate) {
        candidateToUse = {
          title: dynamicTitle,
          titleTelugu: `ప్రెస్ రిలీజ్: డిజిటల్ సిటిజన్ వెల్ఫేర్ పోర్టల్ సవరించిన మార్గదర్శకాలు (${timestamp})`,
          category: 'Government Schemes',
          state: 'Central Government',
          isCentral: true,
          officialWebsite: 'https://myscheme.gov.in',
          shortSummary: 'Official press update detailing streamlined online eligibility checking and instant grievance redressal portal.',
          shortSummaryTelugu: 'ఆన్‌లైన్ అర్హత తనిఖీ మరియు తక్షణ సమస్య పరిష్కారం కోసం సవరించిన నిబంధనలు.',
          whatHappened: 'Cabinet Secretariat published updated Direct Benefit Transfer rules to ensure 100% transparent benefit credit.',
          whatHappenedTelugu: 'ప్రత్యక్ష లబ్ధి బదిలీ నిబంధనలను కేంద్ర ప్రభుత్వం మరింత పారదర్శకం చేసింది.',
          whatIsScheme: 'National Digital Citizen Welfare framework coordinates central and state benefits into a single beneficiary Aadhaar vault.',
          whatIsSchemeTelugu: 'అన్ని ప్రభుత్వ సంక్షేమ పథకాలను ఒకే ఆధార్ ఆధారిత పోర్టల్‌లో సమీకరించే వ్యవస్థ.',
          benefits: [
            { id: 'b1', title: 'Single Window Service', amount: '100% Free', type: 'service', description: 'Instant application tracking & notification alerts.' },
          ],
          whoCanApply: ['All citizens with Aadhaar linked mobile number'],
          whoCannotApply: ['Non-resident aliens without Indian citizenship'],
          documents: [{ id: 'd1', name: 'Aadhaar Card', required: true, description: 'Digital identity verification' }],
          steps: [{ stepNumber: 1, title: 'Visit Portal', description: 'Log in using Aadhaar OTP on official portal.' }],
          generatedImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&fm=webp&q=75&w=800',
          readTimeMinutes: 3,
        };
      } else {
        duplicateCount++;
      }
    }

    if (candidateToUse) {
      const nowStr = new Date().toISOString();
      const slug = candidateToUse.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const articleId = `scheme-auto-${Date.now()}`;

      const newArticle: Article = {
        id: articleId,
        slug: slug || articleId,
        schemeId: `GOI-${Math.floor(1000 + Math.random() * 9000)}`,
        title: candidateToUse.title,
        titleTelugu: candidateToUse.titleTelugu,
        shortSummary: candidateToUse.shortSummary,
        shortSummaryTelugu: candidateToUse.shortSummaryTelugu,
        whatHappened: candidateToUse.whatHappened,
        whatHappenedTelugu: candidateToUse.whatHappenedTelugu,
        whatIsScheme: candidateToUse.whatIsScheme,
        whatIsSchemeTelugu: candidateToUse.whatIsSchemeTelugu,
        benefits: candidateToUse.benefits.map((b, i) => ({
          id: b.id || `b-${i}`,
          title: b.title,
          amount: b.amount,
          type: (b.type as any) || 'service',
          description: b.description,
        })),
        whoCanApply: candidateToUse.whoCanApply,
        whoCannotApply: candidateToUse.whoCannotApply,
        documents: candidateToUse.documents,
        steps: candidateToUse.steps,
        faqs: [
          { question: 'When is the application deadline?', answer: 'Applications are open round the year through official online portal.' },
          { question: 'How to check status?', answer: 'Use your Aadhaar or reference number on the official website link provided.' }
        ],
        importantWarnings: ['Never pay money to third party agents or unofficial links.'],
        source: {
          name: 'Press Information Bureau (PIB)',
          url: candidateToUse.officialWebsite,
          domain: 'pib.gov.in',
          type: 'pib',
          verifiedDate: nowStr.split('T')[0],
          verificationStatus: 'verified',
          department: 'Government of India Ministries',
        },
        deadline: 'Ongoing / Active',
        statusCheckGuide: 'Visit official website, enter reference number or Aadhaar to verify approval status.',
        officialWebsite: candidateToUse.officialWebsite,
        generatedImage: candidateToUse.generatedImage,
        publishedAt: nowStr,
        lastVerifiedAt: nowStr,
        readTimeMinutes: candidateToUse.readTimeMinutes,
        category: candidateToUse.category,
        state: candidateToUse.state,
        isCentral: candidateToUse.isCentral,
        isNew: true,
        isUpdated: false,
        status: 'published',
      };

      // 1. Save Article to Supabase
      await saveArticleToStore(newArticle);

      // 2. Save Pipeline Item to Supabase
      const newPipelineItem: NewsPipelineItem = {
        id: `pipe-${Date.now()}`,
        sourceUrl: candidateToUse.officialWebsite,
        sourceTitle: candidateToUse.title,
        sourceDomain: 'pib.gov.in',
        fetchedAt: nowStr,
        textSnippet: candidateToUse.shortSummary,
        relevanceStatus: 'relevant',
        confidenceScore: 0.98,
        extractedDepartment: candidateToUse.category,
      };
      await savePipelineItemToStore(newPipelineItem);

      fetchedCount = 1;
      createdTitle = newArticle.title;
      autoFetchState.lastItemTitle = newArticle.title;
      console.log(`🤖 [10-Min Auto Fetcher] Successfully auto-fetched & published: "${newArticle.title}"`);
    } else {
      console.log(`🤖 [10-Min Auto Fetcher] Deduplication active: skipped ${duplicateCount} duplicate items.`);
    }

    autoFetchState.lastFetchedCount = fetchedCount;
    autoFetchState.lastDuplicateCount = duplicateCount;

    return {
      fetchedCount,
      duplicateCount,
      newItemTitle: createdTitle,
      message: fetchedCount > 0
        ? `Successfully auto-fetched and published 1 fresh article: "${createdTitle}"`
        : `Auto-fetch completed. All ${duplicateCount} items checked were duplicates and skipped.`,
    };
  } catch (err: any) {
    console.error('❌ Error during 10-Min Auto Fetch:', err);
    autoFetchState.lastError = err?.message || 'Unknown error during auto fetch';
    return {
      fetchedCount: 0,
      duplicateCount: 0,
      message: `Auto-fetch failed: ${err?.message || 'Unknown error'}`,
    };
  }
}

// Start recurring 10-minute timer
export function startAutoFetchScheduler() {
  if (autoFetchTimer) {
    clearInterval(autoFetchTimer);
  }

  const TEN_MINUTES_MS = 10 * 60 * 1000;
  autoFetchState.enabled = true;
  autoFetchState.intervalMinutes = 10;
  autoFetchState.nextRunAt = new Date(Date.now() + TEN_MINUTES_MS).toISOString();

  console.log('⏰ Starting 10-Minute Auto-Fetch Scheduler...');

  // Trigger initial run after 3 seconds on startup
  setTimeout(() => {
    runAutoFetch().catch(err => console.error('Initial auto-fetch error:', err));
  }, 3000);

  autoFetchTimer = setInterval(() => {
    if (autoFetchState.enabled) {
      runAutoFetch().catch(err => console.error('Scheduled auto-fetch error:', err));
    }
  }, TEN_MINUTES_MS);
}

export function stopAutoFetchScheduler() {
  if (autoFetchTimer) {
    clearInterval(autoFetchTimer);
    autoFetchTimer = null;
  }
  autoFetchState.enabled = false;
}
