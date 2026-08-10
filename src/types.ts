export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  latestUpdate?: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
  type: 'central' | 'state' | 'ut';
  popularSchemesCount: number;
  capital?: string;
}

export interface Benefit {
  id: string;
  title: string;
  amount?: string;
  type: 'financial' | 'subsidy' | 'pension' | 'scholarship' | 'insurance' | 'service';
  description: string;
}

export interface EligibilityRule {
  id: string;
  state?: string;
  occupations?: string[];
  ageMin?: number;
  ageMax?: number;
  incomeMax?: number; // in INR per annum
  gender?: 'all' | 'female' | 'male' | 'other';
  categories?: string[]; // e.g. Student, Farmer, BC, SC, ST, General, EWS
  description: string;
}

export interface Document {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  description: string;
  url?: string;
  tip?: string;
}

export interface Source {
  name: string;
  url: string;
  domain: string;
  type: 'pib' | 'ministry' | 'myscheme' | 'state_portal' | 'official_pdf';
  verifiedDate: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  department: string;
}

export interface ContentImage {
  url: string;
  caption: string;
  captionTelugu?: string;
}

export interface Article {
  id: string;
  slug: string;
  schemeId: string;
  title: string;
  shortSummary: string;
  whatHappened: string;
  whatIsScheme: string;
  benefits: Benefit[];
  whoCanApply: string[];
  whoCannotApply: string[];
  documents: Document[];
  steps: ApplicationStep[];
  deadline: string | null;
  statusCheckGuide: string;
  officialWebsite: string;
  importantWarnings: string[];
  source: Source;
  generatedImage: string;
  contentImages?: ContentImage[];
  publishedAt: string;
  lastVerifiedAt: string;
  readTimeMinutes: number;
  category: string;
  state: string; // "Central" or state name
  isCentral: boolean;
  isNew: boolean;
  isUpdated: boolean;
  status: 'draft' | 'pending_verification' | 'published' | 'archived';
  aiConfidenceScore?: number;
  language?: 'en' | 'te' | 'hi';
  titleTelugu?: string;
  shortSummaryTelugu?: string;
  whatIsSchemeTelugu?: string;
  whatHappenedTelugu?: string;
  faqs?: { question: string; answer: string; questionTelugu?: string; answerTelugu?: string }[];
  detailedGuideText?: string;
  detailedGuideTextTelugu?: string;
}

export interface NewsPipelineItem {
  id: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  fetchedAt: string;
  textSnippet: string;
  relevanceStatus: 'relevant' | 'irrelevant' | 'duplicate';
  confidenceScore: number;
  extractedDepartment?: string;
  generatedArticleId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  state: string;
  occupation: string;
  ageRange: string;
  incomeRange: string;
  gender: string;
  category: string;
  savedSchemeIds: string[];
  notificationPreferences: {
    categories: string[];
    states: string[];
    newSchemes: boolean;
    deadlines: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  linkUrl?: string;
  type: 'scheme_update' | 'deadline' | 'eligibility_alert' | 'system';
}

export interface EligibilityFormData {
  state: string;
  occupation: string;
  age: number;
  annualIncome: number;
  gender: string;
  category: string;
  hasLandHolding: boolean;
  isPccaHolder?: boolean;
}

export interface MatchResult {
  article: Article;
  eligible: boolean;
  matchScore: number; // 0 to 100
  matchingReasons: string[];
  disqualificationReasons: string[];
  missingInfo: string[];
}
