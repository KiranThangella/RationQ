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
import { apiUrl } from '../lib/apiBase';

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
  const [duplicateWarning, setDuplicateWarning] = useState<{ message: string; matchTitle?: string; score?: number } | null>(null);
  const [sourcePipelineId, setSourcePipelineId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<{ message: string; existingArticle?: { slug: string; title: string } } | null>(null);
  const [crawlStatusMessage, setCrawlStatusMessage] = useState<{ text: string; source?: string } | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/admin/metrics'))
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(() => {});

    fetch(apiUrl('/api/admin/pipeline'))
      .then(res => res.json())
      .then(data => setPipelineItems(data))
      .catch(() => {});
  }, [articles]);

  const handleCrawlSources = async () => {
    setFetchingCrawl(true);
    setCrawlStatusMessage(null);
    try {
      const res = await fetch(apiUrl('/api/admin/fetch-pipeline'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePortal: 'pib.gov.in' }),
      });
      const data = await res.json();
      const items: any[] = data.newItems && data.newItems.length ? data.newItems : (data.newItem ? [data.newItem] : []);
      if (items.length > 0) {
        setPipelineItems([...items, ...pipelineItems]);
        setMetrics(m => ({ ...m, pipelineItems: m.pipelineItems + items.length }));
      }
      if (data.message) {
        setCrawlStatusMessage({ text: data.message, source: data.source });
      }
    } catch (err) {
      console.error(err);
      setCrawlStatusMessage({ text: 'Crawl failed — check server logs / network settings.', source: 'error' });
    } finally {
      setFetchingCrawl(false);
    }
  };

  const handlePublishArticle = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/admin/articles/${id}/publish`), { method: 'POST' });
      onArticlePublished();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiRestructure = async () => {
    if (!rawTextForAi.trim()) return;
    setAiRewriting(true);
    setDuplicateWarning(null);
    try {
      const res = await fetch(apiUrl('/api/ai/rewrite'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSourceText: rawTextForAi,
          schemeName: editingArticle.title,
          stateName: editingArticle.state,
          categoryName: editingArticle.category,
        }),
      });
      const data = await res.json();
      if (data.duplicateWarning) {
        setDuplicateWarning(data.duplicateWarning);
      }
      if (data.structuredData) {
        const s = data.structuredData;
        setEditingArticle(prev => ({
          ...prev,
          title: s.title || prev.title,
          shortSummary: s.shortSummary || prev.shortSummary,
          whatHappened: s.whatHappened || prev.whatHappened,
          whatIsScheme: s.whatIsScheme || prev.whatIsScheme,
          benefits: s.benefits || prev.benefits,
          whoCanApply: s.whoCanApply || prev.whoCanApply,
          whoCannotApply: s.whoCannotApply || prev.whoCannotApply,
          documents: s.documents || prev.documents,
          steps: s.steps || prev.steps,
          readTimeMinutes: s.readTimeMinutes || prev.readTimeMinutes,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiRewriting(false);
    }
  };

  const handleSaveArticleForm = async (force: boolean = false) => {
    setSaveError(null);
    try {
      const slug = editingArticle.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const payload = {
        ...editingArticle,
        slug,
        schemeId: slug,
        publishedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        status: editingArticle.status || 'published',
        sourcePipelineId: sourcePipelineId || undefined,
        forceCreateDuplicate: force,
      };

      const res = await fetch(apiUrl('/api/admin/articles'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const errData = await res.json();
        setSaveError({ message: errData.message, existingArticle: errData.existingArticle });
        return;
      }

      setSourcePipelineId(null);
      setDuplicateWarning(null);
      onArticlePublished();
      setActiveTab('articles');
    } catch (err) {
      console.error(err);
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
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {safeArticles.map(art => (
                  <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{art.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{art.slug}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-700">{art.category}</td>
                    <td className="p-3.5 whitespace-nowrap font-semibold text-slate-800">{art.state}</td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600">{art.source.domain}</td>
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
                        onClick={() => onSelectArticle(art.slug)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        title="Preview Article"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {art.status !== 'published' && (
                        <button
                          onClick={() => handlePublishArticle(art.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                        >
                          Approve & Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

          {crawlStatusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                crawlStatusMessage.source === 'live'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : crawlStatusMessage.source === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{crawlStatusMessage.text}</span>
            </div>
          )}

          <div className="space-y-3">
            {pipelineItems.map(item => {
              const isDuplicate = item.relevanceStatus === 'duplicate';
              const isUsed = !!item.generatedArticleId;
              const disabled = isDuplicate || isUsed;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${
                    disabled ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                      {item.sourceDomain} • {item.extractedDepartment || 'Ministry'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isDuplicate && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Duplicate — already in queue/published
                        </span>
                      )}
                      {isUsed && !isDuplicate && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Already used for an article
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Confidence: {Math.round(item.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.sourceTitle}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.textSnippet}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-500 hover:text-emerald-800 underline"
                    >
                      View Official Source Link
                    </a>

                    <button
                      onClick={() => {
                        setSourcePipelineId(item.id);
                        setDuplicateWarning(null);
                        setSaveError(null);
                        setRawTextForAi(`${item.sourceTitle}\n\n${item.textSnippet}`);
                        setActiveTab('editor');
                      }}
                      disabled={disabled}
                      title={isDuplicate ? 'This source matches existing content — skip it to avoid a duplicate article' : undefined}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                        disabled
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${disabled ? 'text-slate-400' : 'text-amber-300'}`} />
                      {isDuplicate ? 'Skip — Duplicate' : isUsed ? 'Already Generated' : 'Restructure into Article'}
                    </button>
                  </div>
                </div>
              );
            })}
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
              onClick={() => handleSaveArticleForm()}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
            >
              Save & Publish Scheme
            </button>
          </div>

          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{duplicateWarning.message}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{saveError.message}</span>
              </div>
              <div className="flex gap-2 pl-6">
                {saveError.existingArticle && (
                  <button
                    onClick={() => onSelectArticle(saveError.existingArticle!.slug)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-white font-bold text-[11px]"
                  >
                    View Existing Article
                  </button>
                )}
                <button
                  onClick={() => handleSaveArticleForm(true)}
                  className="px-3 py-1 rounded-lg bg-rose-700 text-white font-bold text-[11px]"
                >
                  Save Anyway (Not a Duplicate)
                </button>
              </div>
            </div>
          )}

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

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => handleSaveArticleForm()}
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
