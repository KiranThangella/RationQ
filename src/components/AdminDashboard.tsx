import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  Send,
  ShieldCheck,
  Building2,
  Database,
  Search,
  Check,
  X
} from 'lucide-react';
import { Article, NewsPipelineItem } from '../types';
import { requestAiRewrite, safeSaveArticle } from '../lib/aiRewriter';
import { fetchPipelineFromStore, deletePipelineItemFromStore, updateArticleInSupabase, updateArticle } from '../lib/supabase';
import { createSlug } from '../lib/slugUtils';
import { getApiUrl } from '../lib/apiConfig';

export function getArticleWordCount(art?: Partial<Article> | null): number {
  if (!art) return 0;
  const parts = [
    art.title,
    art.titleTelugu,
    art.shortSummary,
    art.shortSummaryTelugu,
    art.whatHappened,
    art.whatHappenedTelugu,
    art.whatIsScheme,
    art.whatIsSchemeTelugu,
    art.detailedGuideText,
    art.detailedGuideTextTelugu,
    art.statusCheckGuide,
    ...(art.benefits || []).map(b => `${b.title || ''} ${b.amount || ''} ${b.description || ''}`),
    ...(art.whoCanApply || []),
    ...(art.whoCannotApply || []),
    ...(art.documents || []).map(d => `${d.name || ''} ${d.description || ''}`),
    ...(art.steps || []).map(s => `${s.title || ''} ${s.description || ''}`),
    ...(art.faqs || []).map(f => `${f.question || ''} ${f.answer || ''} ${f.questionTelugu || ''} ${f.answerTelugu || ''}`),
    ...(art.importantWarnings || []),
  ];
  const fullText = parts.filter(Boolean).join(' ');
  const words = fullText.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function getArticleWebpImage(title: string = '', category: string = ''): string {
  const lower = (title + ' ' + category).toLowerCase();
  if (lower.includes('kisan') || lower.includes('farmer') || lower.includes('rythu') || lower.includes('agri') || lower.includes('crop')) {
    return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('awas') || lower.includes('house') || lower.includes('housing') || lower.includes('home') || lower.includes('construction')) {
    return 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('scholarship') || lower.includes('student') || lower.includes('education') || lower.includes('school') || lower.includes('vidya') || lower.includes('fee')) {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('health') || lower.includes('aarogya') || lower.includes('hospital') || lower.includes('medical') || lower.includes('ayushman')) {
    return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('pension') || lower.includes('elderly') || lower.includes('senior') || lower.includes('cheyutha') || lower.includes('woman') || lower.includes('mahila')) {
    return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('ration') || lower.includes('food') || lower.includes('rice') || lower.includes('grain')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else if (lower.includes('power') || lower.includes('electricity') || lower.includes('solar') || lower.includes('energy')) {
    return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&fm=webp&q=75&w=800';
  } else {
    return 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&fm=webp&q=75&w=800';
  }
}

interface AdminDashboardProps {
  articles: Article[];
  onArticlePublished: () => void;
  onSelectArticle: (slug: string) => void;
  onLogoutAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles = [],
  onArticlePublished,
  onSelectArticle,
  onLogoutAdmin,
}) => {
  const safeArticles = Array.isArray(articles) ? articles : [];

  const [metrics, setMetrics] = useState({
    totalSchemes: safeArticles.length,
    published: safeArticles.filter(a => a.status === 'published').length,
    drafts: safeArticles.filter(a => a.status === 'draft').length,
    pendingVerification: safeArticles.filter(a => a.status === 'pending_verification').length,
    pipelineItems: 3,
    failedFetches: 0,
    publishedToday: 2,
  });

  const [pipelineItems, setPipelineItems] = useState<NewsPipelineItem[]>([]);
  const [fetchingCrawl, setFetchingCrawl] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'pipeline' | 'editor'>('articles');

  // 10-Minute Auto Fetcher state
  const [autoFetchStatus, setAutoFetchStatus] = useState({
    enabled: true,
    intervalMinutes: 10,
    lastRunAt: null as string | null,
    nextRunAt: null as string | null,
    totalRuns: 0,
    lastFetchedCount: 0,
    lastDuplicateCount: 0,
    lastItemTitle: '',
  });
  const [triggeringAutoFetch, setTriggeringAutoFetch] = useState(false);
  const [autoFetchMsg, setAutoFetchMsg] = useState<string | null>(null);
  const [expandingArticleId, setExpandingArticleId] = useState<string | null>(null);

  const handleExpandForAdsense = async (articleId: string, title: string) => {
    setExpandingArticleId(articleId);
    try {
      const res = await fetch(getApiUrl(`/api/admin/articles/${articleId}/expand-adsense`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.article) {
          await updateArticleInSupabase(data.article);
        }
        onArticlePublished();
        setAutoFetchMsg(`⚡ "${title.slice(0, 30)}..." కథనం AdSense కోసం 1000+ పదాలకి విజయవంతంగా విస్తరించబడింది!`);
      } else {
        alert('Expansion failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExpandingArticleId(null);
    }
  };

  const handleExpandEditorDraftForAdsense = async () => {
    setAiRewriting(true);
    try {
      const rawPrompt = `You are a Senior Google AdSense Content Quality Specialist. Expand this article to 1000+ words for Google AdSense Approval:
Title: ${editingArticle.title || 'Government Welfare Scheme'}
Category: ${editingArticle.category || 'Welfare'}
State: ${editingArticle.state || 'India'}
Existing Summary: ${editingArticle.shortSummary || ''}
Existing Guide: ${editingArticle.detailedGuideText || editingArticle.whatIsScheme || ''}`;

      const s = await requestAiRewrite({
        rawSourceText: rawPrompt,
        schemeName: editingArticle.title,
        stateName: editingArticle.state,
        categoryName: editingArticle.category,
      });

      if (s) {
        const updatedObj: Partial<Article> = {
          ...editingArticle,
          title: s.title || editingArticle.title,
          titleTelugu: s.titleTelugu || editingArticle.titleTelugu,
          shortSummary: s.shortSummary || editingArticle.shortSummary,
          shortSummaryTelugu: s.shortSummaryTelugu || editingArticle.shortSummaryTelugu,
          whatHappened: s.whatHappened || editingArticle.whatHappened,
          whatHappenedTelugu: s.whatHappenedTelugu || editingArticle.whatHappenedTelugu,
          whatIsScheme: s.whatIsScheme || editingArticle.whatIsScheme,
          whatIsSchemeTelugu: s.whatIsSchemeTelugu || editingArticle.whatIsSchemeTelugu,
          detailedGuideText: s.detailedGuideText || editingArticle.detailedGuideText,
          detailedGuideTextTelugu: s.detailedGuideTextTelugu || editingArticle.detailedGuideTextTelugu,
          faqs: s.faqs || editingArticle.faqs,
          benefits: s.benefits || editingArticle.benefits,
          whoCanApply: s.whoCanApply || editingArticle.whoCanApply,
          whoCannotApply: s.whoCannotApply || editingArticle.whoCannotApply,
          documents: s.documents || editingArticle.documents,
          steps: s.steps || editingArticle.steps,
          lastVerifiedAt: new Date().toISOString(),
          status: editingArticle.status || 'published',
        };
        const slug = createSlug(updatedObj.slug || updatedObj.title || 'article', updatedObj.id);
        const finalArticle = { ...updatedObj, id: updatedObj.id || `art-${Date.now()}`, slug } as Article;

        setEditingArticle(finalArticle);
        await updateArticleInSupabase(finalArticle);
        onArticlePublished();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiRewriting(false);
    }
  };

  const fetchAutoFetchStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auto-fetch/status'));
      if (res.ok) {
        const data = await res.json();
        setAutoFetchStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAutoFetchStatus();
    const timer = setInterval(fetchAutoFetchStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleManualAutoFetchTrigger = async () => {
    setTriggeringAutoFetch(true);
    setAutoFetchMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/admin/auto-fetch/trigger'), { method: 'POST' });
      const data = await res.json();
      setAutoFetchMsg(data.message);
      if (data.status) {
        setAutoFetchStatus(data.status);
      }
      onArticlePublished();
    } catch (err) {
      console.error(err);
      setAutoFetchMsg('Manual sync failed');
    } finally {
      setTriggeringAutoFetch(false);
    }
  };

  // Editor State
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    shortSummary: '',
    whatHappened: '',
    whatIsScheme: '',
    category: 'Agriculture & Farmers',
    state: 'Central Government',
    isCentral: true,
    officialWebsite: 'https://myscheme.gov.in',
    status: 'draft',
    benefits: [
      { id: 'b1', title: 'Direct Bank Assistance', amount: '₹6,000 / year', type: 'financial', description: 'Transferred via DBT' }
    ],
    whoCanApply: ['Resident farmers with cultivable land'],
    whoCannotApply: ['Income tax payers'],
    documents: [{ id: 'd1', name: 'Aadhaar Card', required: true, description: 'Biometric verification' }],
    steps: [{ stepNumber: 1, title: 'Visit Portal', description: 'Complete online form' }],
    source: {
      name: 'PIB Release',
      url: 'https://pib.gov.in',
      domain: 'pib.gov.in',
      type: 'pib',
      verifiedDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'verified',
      department: 'Ministry of Agriculture',
    },
    generatedImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200',
    readTimeMinutes: 3,
  });

  const [rawTextForAi, setRawTextForAi] = useState('');
  const [aiRewriting, setAiRewriting] = useState(false);
  const [processingPipelineId, setProcessingPipelineId] = useState<string | null>(null);
  const [publishSuccessBanner, setPublishSuccessBanner] = useState<{ message: string; slug: string } | null>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/admin/metrics'))
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(() => {});

    fetch(getApiUrl('/api/admin/pipeline'))
      .then(res => res.json())
      .then(data => setPipelineItems(data))
      .catch(() => {});
  }, [articles]);

  const handleCrawlSources = async () => {
    setFetchingCrawl(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/fetch-pipeline'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePortal: 'pib.gov.in' }),
      });
      const data = await res.json();
      if (data.newItem) {
        setPipelineItems([data.newItem, ...pipelineItems]);
        setMetrics(m => ({ ...m, pipelineItems: m.pipelineItems + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingCrawl(false);
    }
  };

  const handlePublishArticle = async (id: string, slug?: string, title?: string) => {
    try {
      const existing = safeArticles.find(a => a.id === id || a.slug === id);
      const res = await fetch(getApiUrl(`/api/admin/articles/${id}/publish`), { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const updatedArt = data.article || data;
        if (updatedArt && updatedArt.id) {
          updatedArt.status = 'published';
          await updateArticleInSupabase(updatedArt);
        } else if (existing) {
          await updateArticleInSupabase({ ...existing, status: 'published', lastVerifiedAt: new Date().toISOString() });
        }
      } else {
        if (existing) {
          await updateArticleInSupabase({ ...existing, status: 'published', lastVerifiedAt: new Date().toISOString() });
        }
      }
      onArticlePublished();
      setPublishSuccessBanner({
        message: `✅ "${title || 'కథనం'}" విజయవంతంగా ఆమోదించబడింది మరియు UI లో పబ్లిష్ అయింది! (Article Approved & Live on UI!)`,
        slug: slug || id,
      });
    } catch (err) {
      console.error(err);
      const existing = safeArticles.find(a => a.id === id || a.slug === id);
      if (existing) {
        await updateArticleInSupabase({ ...existing, status: 'published', lastVerifiedAt: new Date().toISOString() });
      }
      onArticlePublished();
    }
  };

  const handleInstantPublishPipeline = async (item: NewsPipelineItem) => {
    setProcessingPipelineId(item.id);
    try {
      const s = await requestAiRewrite({
        rawSourceText: `${item.sourceTitle}\n\n${item.textSnippet}`,
        schemeName: item.sourceTitle,
        categoryName: 'Government Schemes',
      });

      const slug = createSlug(s.title || item.sourceTitle, item.id);

      const newArticlePayload: Partial<Article> = {
        title: s.title || item.sourceTitle,
        titleTelugu: s.titleTelugu || item.sourceTitle,
        shortSummary: s.shortSummary || item.textSnippet,
        shortSummaryTelugu: s.shortSummaryTelugu || item.textSnippet,
        whatHappened: s.whatHappened || item.textSnippet,
        whatHappenedTelugu: s.whatHappenedTelugu || item.textSnippet,
        whatIsScheme: s.whatIsScheme || item.textSnippet,
        whatIsSchemeTelugu: s.whatIsSchemeTelugu || item.textSnippet,
        detailedGuideText: s.detailedGuideText,
        detailedGuideTextTelugu: s.detailedGuideTextTelugu,
        faqs: s.faqs || [],
        category: 'Government Schemes',
        state: item.sourceDomain.includes('telangana') ? 'Telangana' : 'Central Government',
        isCentral: !item.sourceDomain.includes('telangana'),
        officialWebsite: item.sourceUrl,
        slug,
        schemeId: slug,
        status: 'published',
        benefits: s.benefits && s.benefits.length > 0
          ? s.benefits.map((b, i) => ({ id: b.id || `b_${i}`, title: b.title, amount: b.amount, type: (b.type as any) || 'financial', description: b.description }))
          : [{ id: 'b1', title: 'Direct Assistance', amount: 'Official Benefit', type: 'financial', description: 'Transferred directly via Aadhaar DBT' }],
        whoCanApply: s.whoCanApply || ['Eligible domicile citizens'],
        whoCannotApply: s.whoCannotApply || ['Income tax payers'],
        documents: s.documents && s.documents.length > 0
          ? s.documents.map((d, i) => ({ id: d.id || `d_${i}`, name: d.name, required: d.required, description: d.description }))
          : [{ id: 'd1', name: 'Aadhaar Card', required: true, description: 'Biometric validation' }],
        steps: s.steps || [{ stepNumber: 1, title: 'Visit Portal', description: 'Complete online form' }],
        source: {
          name: item.sourceDomain,
          url: item.sourceUrl,
          domain: item.sourceDomain,
          type: 'pib',
          verifiedDate: new Date().toISOString().split('T')[0],
          verificationStatus: 'verified',
          department: item.extractedDepartment || 'Ministry',
        },
        generatedImage: getArticleWebpImage(s.title || item.sourceTitle, 'Government Schemes'),
        readTimeMinutes: s.readTimeMinutes || 4,
      };

      await updateArticleInSupabase(newArticlePayload as Article);
      await deletePipelineItemFromStore(item.id);

      setPipelineItems(prev => prev.filter(p => p.id !== item.id));
      onArticlePublished();
      setPublishSuccessBanner({
        message: `⚡ "${newArticlePayload.title}" విజయవంతంగా జనరేట్ చేసి UI లో పబ్లిష్ చేయబడింది! (Generated & Live on UI!)`,
        slug,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPipelineId(null);
    }
  };

  const handleAiRestructure = async () => {
    if (!rawTextForAi.trim()) return;
    setAiRewriting(true);
    try {
      const s = await requestAiRewrite({
        rawSourceText: rawTextForAi,
        schemeName: editingArticle.title,
        stateName: editingArticle.state,
        categoryName: editingArticle.category,
      });

      if (s) {
        const articleId = editingArticle.id || `art-${Date.now()}`;
        const updatedObj: Partial<Article> = {
          ...editingArticle,
          id: articleId,
          title: s.title || editingArticle.title || 'Government Scheme',
          shortSummary: s.shortSummary || editingArticle.shortSummary,
          whatHappened: s.whatHappened || editingArticle.whatHappened,
          whatIsScheme: s.whatIsScheme || editingArticle.whatIsScheme,
          detailedGuideText: s.detailedGuideText || editingArticle.detailedGuideText,
          detailedGuideTextTelugu: s.detailedGuideTextTelugu || editingArticle.detailedGuideTextTelugu,
          benefits: s.benefits || editingArticle.benefits,
          whoCanApply: s.whoCanApply || editingArticle.whoCanApply,
          whoCannotApply: s.whoCannotApply || editingArticle.whoCannotApply,
          documents: s.documents || editingArticle.documents,
          steps: s.steps || editingArticle.steps,
          readTimeMinutes: s.readTimeMinutes || editingArticle.readTimeMinutes,
          lastVerifiedAt: new Date().toISOString(),
          status: editingArticle.status || 'published',
        };
        const slug = createSlug(updatedObj.slug || updatedObj.title || 'article', articleId);
        const finalArticle = {
          ...updatedObj,
          id: articleId,
          slug,
          schemeId: slug,
          generatedImage: updatedObj.generatedImage || getArticleWebpImage(updatedObj.title || 'Scheme', updatedObj.category || 'Welfare'),
        } as Article;

        setEditingArticle(finalArticle);
        await updateArticleInSupabase(finalArticle);
        onArticlePublished();
        setPublishSuccessBanner({
          message: `⚡ "${finalArticle.title}" విజయవంతంగా AI తో సృష్టించి సేవ్ చేయబడింది!`,
          slug: finalArticle.slug,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiRewriting(false);
    }
  };

  const handleSaveArticleForm = async () => {
    try {
      const articleId = editingArticle.id || `art-${Date.now()}`;
      const title = editingArticle.title?.trim() || 'New Government Scheme Announcement';
      const slug = createSlug(editingArticle.slug || title, articleId);

      const payload: Article = {
        id: articleId,
        title,
        titleTelugu: editingArticle.titleTelugu || title,
        slug,
        schemeId: slug,
        shortSummary: editingArticle.shortSummary || title,
        shortSummaryTelugu: editingArticle.shortSummaryTelugu || '',
        whatHappened: editingArticle.whatHappened || '',
        whatHappenedTelugu: editingArticle.whatHappenedTelugu || '',
        whatIsScheme: editingArticle.whatIsScheme || '',
        whatIsSchemeTelugu: editingArticle.whatIsSchemeTelugu || '',
        detailedGuideText: editingArticle.detailedGuideText || '',
        detailedGuideTextTelugu: editingArticle.detailedGuideTextTelugu || '',
        category: editingArticle.category || 'Agriculture & Farmers',
        state: editingArticle.state || 'Central Government',
        isCentral: editingArticle.isCentral ?? true,
        officialWebsite: editingArticle.officialWebsite || 'https://myscheme.gov.in',
        deadline: editingArticle.deadline ?? null,
        statusCheckGuide: editingArticle.statusCheckGuide || `Visit ${editingArticle.officialWebsite || 'myscheme.gov.in'} and log in with your registered Aadhaar or Mobile Number to track application status.`,
        importantWarnings: editingArticle.importantWarnings || ['Always apply through official portals. Do not pay agents or third parties.'],
        isNew: editingArticle.isNew ?? true,
        isUpdated: editingArticle.isUpdated ?? false,
        publishedAt: editingArticle.publishedAt || new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        status: (editingArticle.status as any) || 'published',
        benefits: editingArticle.benefits || [
          { id: 'b1', title: 'Direct Bank Assistance', amount: 'Official Benefit', type: 'financial', description: 'Transferred via DBT' }
        ],
        whoCanApply: editingArticle.whoCanApply || ['Eligible citizens'],
        whoCannotApply: editingArticle.whoCannotApply || ['Income tax payers'],
        documents: editingArticle.documents || [{ id: 'd1', name: 'Aadhaar Card', required: true, description: 'Identity verification' }],
        steps: editingArticle.steps || [{ stepNumber: 1, title: 'Visit Portal', description: 'Complete online form' }],
        faqs: editingArticle.faqs || [],
        source: editingArticle.source || {
          name: 'Official Portal',
          url: editingArticle.officialWebsite || 'https://myscheme.gov.in',
          domain: 'myscheme.gov.in',
          type: 'portal',
          verifiedDate: new Date().toISOString().split('T')[0],
          verificationStatus: 'verified',
          department: 'Ministry of Welfare',
        },
        generatedImage: editingArticle.generatedImage || getArticleWebpImage(title, editingArticle.category || 'Welfare'),
        readTimeMinutes: editingArticle.readTimeMinutes || 3,
      };

      await updateArticleInSupabase(payload);

      onArticlePublished();
      setPublishSuccessBanner({
        message: `✅ "${payload.title}" విజయవంతంగా సేవ్ మరియు పబ్లిష్ చేయబడింది!`,
        slug: payload.slug,
      });
      setActiveTab('articles');
    } catch (err) {
      console.error('Error saving article form:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>RationQ Moderation & Intelligence Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Editorial Curation & Pipeline Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCrawlSources}
            disabled={fetchingCrawl}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingCrawl ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Trigger Source Crawl</span>
          </button>

          <button
            onClick={() => {
              setEditingArticle({
                title: 'New Government Scheme Announcement',
                slug: `scheme-${Date.now()}`,
                shortSummary: '',
                category: 'Agriculture & Farmers',
                state: 'Central Government',
                isCentral: true,
                officialWebsite: 'https://myscheme.gov.in',
                generatedImage: getArticleWebpImage('New Government Scheme Announcement', 'Agriculture & Farmers'),
                status: 'draft',
              });
              setActiveTab('editor');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>

          {onLogoutAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              title="Lock Admin Portal & Logout"
            >
              <X className="w-4 h-4" />
              <span>🔒 ల్యాక్ & ఎగ్జిట్ (Lock)</span>
            </button>
          )}
        </div>
      </div>

      {/* Publish Success Banner */}
      {publishSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{publishSuccessBanner.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectArticle(publishSuccessBanner.slug)}
              className="px-4 py-2 rounded-xl bg-emerald-400 text-emerald-950 font-extrabold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>👁️ UI లో చూడండి (View Live in UI)</span>
            </button>
            <button
              onClick={() => setPublishSuccessBanner(null)}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 10-Minute Auto-Fetcher Scheduler Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                ⚡ 10-Minute Automated Article Fetcher & Deduplication Engine
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                Active (Auto-Sync 10 Min)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              ప్రతి 10 నిమిషాలకు కేంద్ర/రాష్ట్ర పోర్టల్స్ నుండి కొత్త పథకాలను ఆటోమేటిక్‌గా ఫెచ్ చేస్తుంది. నకిలీ (Duplicate) ఆర్టికల్స్‌ను సిస్టమ్ గుర్తిస్తుంది.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleManualAutoFetchTrigger}
              disabled={triggeringAutoFetch}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${triggeringAutoFetch ? 'animate-spin' : ''}`} />
              <span>{triggeringAutoFetch ? 'క్రాకింగ్... (Fetching Fresh)' : '⚡ క్రొత్త ఆర్టికల్ ఫెచ్ చేయి (Run 10-Min Sync Now)'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-indigo-900/60 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">మొత్తం రన్స్ (Total Runs)</span>
            <span className="font-extrabold text-slate-100">{autoFetchStatus.totalRuns} Cycles</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">లాస్ట్ ఫెచ్ (Last Item)</span>
            <span className="font-extrabold text-emerald-400 truncate block" title={autoFetchStatus.lastItemTitle || 'N/A'}>
              {autoFetchStatus.lastItemTitle ? autoFetchStatus.lastItemTitle.slice(0, 24) + '...' : 'Completed'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">డూప్లికేట్స్ విస్మరించినవి (Duplicates Skipped)</span>
            <span className="font-extrabold text-amber-400">{autoFetchStatus.lastDuplicateCount} Duplicates Filtered</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">తరువాతి రన్ (Next Auto Run)</span>
            <span className="font-extrabold text-indigo-300">
              {autoFetchStatus.nextRunAt ? new Date(autoFetchStatus.nextRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Every 10 mins'}
            </span>
          </div>
        </div>

        {autoFetchMsg && (
          <div className="p-2.5 rounded-xl bg-indigo-900/80 border border-indigo-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{autoFetchMsg}</span>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Schemes</div>
          <div className="text-2xl font-serif font-bold text-slate-900">{metrics.totalSchemes}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Active in Database</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">Published</div>
          <div className="text-2xl font-serif font-bold text-emerald-950">{metrics.published}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Live for Citizens</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-amber-800 uppercase">Drafts</div>
          <div className="text-2xl font-serif font-bold text-amber-950">{metrics.drafts}</div>
          <div className="text-[10px] text-amber-700 font-semibold">In Curation</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-indigo-800 uppercase">Pipeline Queue</div>
          <div className="text-2xl font-serif font-bold text-indigo-950">{metrics.pipelineItems}</div>
          <div className="text-[10px] text-indigo-700 font-semibold">Fetches Pending</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-rose-800 uppercase">Failed Fetches</div>
          <div className="text-2xl font-serif font-bold text-rose-950">{metrics.failedFetches}</div>
          <div className="text-[10px] text-rose-700 font-semibold">0 Errors</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-slate-300 uppercase">Published Today</div>
          <div className="text-2xl font-serif font-bold text-slate-100">{metrics.publishedToday}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">Updated Today</div>
        </div>

      </div>

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Articles & Schemes ({safeArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'pipeline'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Automated Source Pipeline</span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {pipelineItems.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'editor'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Structured AI Article Editor</span>
        </button>
      </div>

      {/* TAB 1: ARTICLES MANAGEMENT TABLE */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
            Verified Scheme Editorial List
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Scheme & Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">State</th>
                  <th className="p-3.5">Word Count & AdSense</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {safeArticles.map(art => {
                  const wc = getArticleWordCount(art);
                  const isEligible = wc >= 800;

                  return (
                    <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{art.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{art.slug}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-700">{art.category}</td>
                      <td className="p-3.5 whitespace-nowrap font-semibold text-slate-800">{art.state}</td>
                      
                      {/* Word Count & AdSense Eligibility Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              📝 {wc.toLocaleString()} Words
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              🖼️ {(art.contentImages?.length || 2)} Images
                            </span>
                          </div>
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>AdSense Ready (800+ W)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full w-fit">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Low Word Count (&lt;800 W)</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectArticle(art.slug);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1"
                          title="View Live in UI"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>👁️ UI</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleExpandForAdsense(art.id, art.title);
                          }}
                          disabled={expandingArticleId === art.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 shadow-xs transition-all ${
                            isEligible
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                              : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white animate-pulse'
                          }`}
                          title="Expand article with AI to 1000+ words for AdSense Eligibility"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${expandingArticleId === art.id ? 'animate-spin' : ''}`} />
                          <span>{expandingArticleId === art.id ? 'విస్తరిస్తోంది...' : '⚡ AdSense కి విస్తరించు (Expand)'}</span>
                        </button>

                        {art.status !== 'published' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePublishArticle(art.id, art.slug, art.title);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>⚡ పబ్లిష్</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED NEWS PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base font-serif">Official Source Pipeline Queue</h3>
              <p className="text-xs text-slate-300">
                Automated RSS & API fetches from PIB, myScheme, and State Portals. High-relevance items are classified for AI drafting.
              </p>
            </div>
            <button
              onClick={handleCrawlSources}
              disabled={fetchingCrawl}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
            >
              {fetchingCrawl ? 'Crawling...' : 'Fetch New Source Items'}
            </button>
          </div>

          <div className="space-y-3">
            {pipelineItems.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {item.sourceDomain} • {item.extractedDepartment || 'Ministry'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Confidence: {Math.round(item.confidenceScore * 100)}%
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.sourceTitle}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.textSnippet}</p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-emerald-800 underline"
                  >
                    View Official Source Link
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRawTextForAi(`${item.sourceTitle}\n\n${item.textSnippet}`);
                        setActiveTab('editor');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      <span>📝 ఎడిటర్‌లో మార్చు</span>
                    </button>

                    <button
                      onClick={() => handleInstantPublishPipeline(item)}
                      disabled={processingPipelineId === item.id}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${processingPipelineId === item.id ? 'animate-spin' : ''}`} />
                      <span>{processingPipelineId === item.id ? 'జనరేట్ అవుతోంది...' : '⚡ తక్షణ ఆమోదం & UI పబ్లిష్'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STRUCTURED AI ARTICLE EDITOR */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Structured Scheme Article Editor
              </h2>
              <p className="text-xs text-slate-500">
                Use AI restructuring to convert official PDF announcements into simple citizen sections.
              </p>
            </div>

            <button
              onClick={handleSaveArticleForm}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
            >
              Save & Publish Scheme
            </button>
          </div>

          {/* AI Restructuring Tool Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Source Text Restructurer</span>
            </div>
            <textarea
              rows={3}
              value={rawTextForAi}
              onChange={e => setRawTextForAi(e.target.value)}
              placeholder="Paste raw official government release text or news snippet here..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleAiRestructure}
              disabled={aiRewriting || !rawTextForAi.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiRewriting ? 'animate-spin' : ''}`} />
              <span>{aiRewriting ? 'Restructuring Data...' : 'Auto-Fill Structured Sections'}</span>
            </button>
          </div>

          {/* Google AdSense Word Count & Eligibility Live Inspector */}
          {(() => {
            const currentWc = getArticleWordCount(editingArticle);
            const isEligible = currentWc >= 800;
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white border border-amber-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">
                      📊 Live Word Count: <span className="text-white text-sm">{currentWc.toLocaleString()} Words</span>
                    </span>
                    {isEligible ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Google AdSense Eligible (&ge;800 Words)</span>
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Not Eligible for AdSense (&lt;800 Words)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    గూగుల్ యాడ్‌సెన్స్ అప్రూవల్ పొందడానికి ఆర్టికల్‌లో కనీసం 800+ పదాలు ఉండేలా 'AdSense కి విస్తరించు' బటన్ వాడండి.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExpandEditorDraftForAdsense}
                  disabled={aiRewriting}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Sparkles className={`w-4 h-4 text-slate-950 ${aiRewriting ? 'animate-spin' : ''}`} />
                  <span>{aiRewriting ? 'విస్తరిస్తోంది (Expanding)...' : '⚡ AI తో AdSense కోసం 1000+ పదాల కి విస్తరించు'}</span>
                </button>
              </div>
            );
          })()}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Scheme Title</label>
              <input
                type="text"
                value={editingArticle.title || ''}
                onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
              <select
                value={editingArticle.category || 'Agriculture & Farmers'}
                onChange={e => setEditingArticle({ ...editingArticle, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {[
                  'Agriculture & Farmers',
                  'Education & Scholarships',
                  'Women & Child Welfare',
                  'Business, Artisans & Micro-Loans',
                  'Housing & Urban Development',
                  'Health & Medical Cover',
                  'Senior Citizens & Pensions',
                  'Social Welfare & Disability',
                ].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Jurisdiction State</label>
              <input
                type="text"
                value={editingArticle.state || 'Central Government'}
                onChange={e => setEditingArticle({ ...editingArticle, state: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Official Portal URL</label>
              <input
                type="text"
                value={editingArticle.officialWebsite || ''}
                onChange={e => setEditingArticle({ ...editingArticle, officialWebsite: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Short Summary (1-2 Sentences)</label>
            <textarea
              rows={2}
              value={editingArticle.shortSummary || ''}
              onChange={e => setEditingArticle({ ...editingArticle, shortSummary: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">What Happened? (Explanation)</label>
            <textarea
              rows={3}
              value={editingArticle.whatHappened || ''}
              onChange={e => setEditingArticle({ ...editingArticle, whatHappened: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">What Is This Scheme?</label>
            <textarea
              rows={3}
              value={editingArticle.whatIsScheme || ''}
              onChange={e => setEditingArticle({ ...editingArticle, whatIsScheme: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Detailed Long-Form Guide (English - for AdSense 1000+ words)</label>
            <textarea
              rows={5}
              value={editingArticle.detailedGuideText || ''}
              onChange={e => setEditingArticle({ ...editingArticle, detailedGuideText: e.target.value })}
              placeholder="Deep-dive background, eligibility details, and application workflow..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">సవివరమైన మార్గదర్శి (తెలుగు - Detailed Telugu Guide)</label>
            <textarea
              rows={5}
              value={editingArticle.detailedGuideTextTelugu || ''}
              onChange={e => setEditingArticle({ ...editingArticle, detailedGuideTextTelugu: e.target.value })}
              placeholder="పథకం పూర్తి నేపథ్యం, అర్హతలు, మరియు దరఖాస్తు మార్గదర్శకాలు..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-sans"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveArticleForm}
              className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
            >
              Approve & Save Scheme
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
