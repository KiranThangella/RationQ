import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ArticleCard } from './components/ArticleCard';
import { CategoryGrid } from './components/CategoryGrid';
import { StateExplorer } from './components/StateExplorer';
import { ArticleDetailView } from './components/ArticleDetailView';
import { EligibilityWizard } from './components/EligibilityWizard';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SavedSchemesModal } from './components/SavedSchemesModal';
import { AboutModal } from './components/AboutModal';
import { LegalPagesView, LegalTab } from './components/LegalPagesView';

import { Article, Category, State, Notification } from './types';
import { CATEGORIES, INITIAL_ARTICLES, INITIAL_NOTIFICATIONS, STATES } from './data/mockDatabase';
import { fetchAllArticlesFromStore } from './lib/supabase';
import { Language, TRANSLATIONS } from './lib/translations';
import { Sparkles, SlidersHorizontal, ShieldCheck, Search, Filter, Info, ChevronRight, HeartHandshake } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [lang, setLang] = useState<Language>('en');

  // Data states (initialized with client-side fallback & localStorage for static hosting like Cloudflare Pages / Vercel)
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem('rationq_articles_store') || localStorage.getItem('rationq_articles_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ARTICLES;
  });
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [states, setStates] = useState<State[]>(STATES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Sync articles to localStorage whenever they update
  useEffect(() => {
    try {
      if (articles && articles.length > 0) {
        const serialized = JSON.stringify(articles);
        localStorage.setItem('rationq_articles_store', serialized);
        localStorage.setItem('rationq_articles_cache', serialized);
      }
    } catch (e) {}
  }, [articles]);

  // Listen for custom article update events across the app
  useEffect(() => {
    const handleArticleUpdate = () => {
      loadData();
    };
    window.addEventListener('rationq_articles_updated', handleArticleUpdate);
    return () => {
      window.removeEventListener('rationq_articles_updated', handleArticleUpdate);
    };
  }, []);

  // Selection states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

  // Saved articles
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rationq_saved_articles');
      return stored ? JSON.parse(stored) : ['rythu-bharosa-2025', 'pm-vishwakarma-2025'];
    } catch {
      return ['rythu-bharosa-2025', 'pm-vishwakarma-2025'];
    }
  });

  const t = TRANSLATIONS[lang];

  // Fetch initial data with safe fallback for static hosting
  const loadData = async () => {
    try {
      let localArticles: Article[] = [];
      try {
        localArticles = await fetchAllArticlesFromStore();
      } catch (err) {
        console.warn('Supabase/local store load skipped:', err);
      }

      let serverArticles: Article[] = [];
      try {
        const res = await fetch('/api/articles?status=all');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              serverArticles = data;
            } else if (data && Array.isArray(data.articles) && data.articles.length > 0) {
              serverArticles = data.articles;
            }
          }
        }
      } catch (err) {
        // Backend Express server not available
      }

      // Merge localArticles and serverArticles by id/slug preserving newest updates
      const map = new Map<string, Article>();
      for (const a of localArticles) {
        if (a && (a.id || a.slug)) {
          map.set(a.id || a.slug, a);
        }
      }
      for (const a of serverArticles) {
        if (a && (a.id || a.slug)) {
          const key = a.id || a.slug;
          const existing = map.get(key);
          if (!existing) {
            map.set(key, a);
          } else {
            const existingTime = new Date(existing.lastVerifiedAt || existing.publishedAt || 0).getTime();
            const serverTime = new Date(a.lastVerifiedAt || a.publishedAt || 0).getTime();
            if (serverTime >= existingTime) {
              map.set(key, a);
            }
          }
        }
      }

      const mergedList = Array.from(map.values());
      if (mergedList.length > 0) {
        mergedList.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
        setArticles(mergedList);
        try {
          const serialized = JSON.stringify(mergedList);
          localStorage.setItem('rationq_articles_store', serialized);
          localStorage.setItem('rationq_articles_cache', serialized);
        } catch (e) {}
      }
    } catch (err) {
      console.warn('loadData notice:', err);
    }

    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setCategories(data);
        }
      }
    } catch (err) {}

    try {
      const res = await fetch('/api/states');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setStates(data);
        }
      }
    } catch (err) {}

    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setNotifications(data);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadData();
    // Auto-refresh feed every 30 seconds to show newly auto-fetched 10-minute articles live
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSaveArticle = (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    let updated: string[];
    if (savedArticleIds.includes(articleId)) {
      updated = savedArticleIds.filter((id) => id !== articleId);
    } else {
      updated = [...savedArticleIds, articleId];
    }
    setSavedArticleIds(updated);
    try {
      localStorage.setItem('rationq_saved_articles', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeStates = Array.isArray(states) ? states : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const handleOpenArticle = (art: Article) => {
    const slug = art.slug || art.id;
    setSelectedArticle(art);
    setCurrentView('article-detail');
    try {
      const cleanPath = `/article/${slug}`;
      window.history.pushState({ slug }, '', cleanPath);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedArticle(null);
    setCurrentView('home');
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticleBySlug = (slug: string) => {
    const found = safeArticles.find((a) => a.slug === slug || a.id === slug || a.schemeId === slug);
    if (found) {
      handleOpenArticle(found);
    }
  };

  // Sync URL slug parameter on page load & popstate
  useEffect(() => {
    if (safeArticles.length === 0) return;

    const syncArticleFromUrl = () => {
      const pathname = window.location.pathname;
      // Do not navigate away if the user is currently on the admin dashboard or path is /admin
      if (currentView === 'admin' || pathname.toLowerCase() === '/admin') {
        return;
      }

      const params = new URLSearchParams(window.location.search);

      let extractedSlug = '';

      // 1. Check path e.g. /article/pm-kisan-19th-installment-release-guidelines or /pm-kisan-19th-installment-release-guidelines
      if (pathname && pathname !== '/' && !['/admin', '/category', '/saved', '/notifications', '/index.html'].includes(pathname.toLowerCase())) {
        extractedSlug = pathname.replace(/^\/article\//i, '').replace(/^\//, '');
      }

      // 2. Fallback for legacy query params (?article= or ?artical= or ?slug=)
      if (!extractedSlug) {
        extractedSlug = params.get('article') || params.get('artical') || params.get('slug') || window.location.hash.replace('#', '');
      }

      if (extractedSlug) {
        const decodedSlug = decodeURIComponent(extractedSlug).trim();
        const found = safeArticles.find((a) => a.slug === decodedSlug || a.id === decodedSlug || a.schemeId === decodedSlug);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('article-detail');

          // Clean up legacy ?article= or ?artical= parameter in address bar to /article/slug
          if (window.location.search.includes('article=') || window.location.search.includes('artical=')) {
            try {
              window.history.replaceState({ slug: found.slug }, '', `/article/${found.slug || found.id}`);
            } catch (e) {}
          }
        }
      }
    };

    syncArticleFromUrl();

    const handlePopState = () => {
      syncArticleFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles, currentView]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCurrentView('latest');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Filtered Articles Logic for public UI screens
  const publishedArticles = safeArticles.filter((art) => art.status === 'published');

  const filteredArticles = publishedArticles.filter((art) => {
    if (selectedCategory && art.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedState && art.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = art.shortSummary.toLowerCase().includes(q);
      const matchCat = art.category.toLowerCase().includes(q);
      const matchState = art.state.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchCat && !matchState) {
        return false;
      }
    }
    return true;
  });

  const featuredArticle = publishedArticles.find((a) => a.isFeatured) || publishedArticles[0] || safeArticles[0];
  const savedArticles = publishedArticles.filter((a) => savedArticleIds.includes(a.id));
  const unreadNotifCount = safeNotifications.filter((n) => !n.read).length;

  // Dynamic SEO Metadata helper for AdSense & Search Engines
  const getSeoMeta = () => {
    if (currentView === 'article-detail' && selectedArticle) {
      return {
        title: `${selectedArticle.title} | RationQ Eligibility & Application Guide`,
        description: selectedArticle.shortSummary || `Complete details, eligibility criteria, required documents, and application steps for ${selectedArticle.title} on RationQ.`,
      };
    }
    if (currentView === 'latest') {
      return {
        title: 'Latest Government Schemes & Circulars 2026 | RationQ',
        description: 'Stay updated with newly launched central and state government schemes, G.O. notifications, and welfare updates in Telugu & English.',
      };
    }
    if (currentView === 'categories') {
      return {
        title: 'Browse Schemes by Category | Farmers, Women, Students & Pensions | RationQ',
        description: 'Explore government welfare schemes categorized by Farmer Welfare, Women Empowerment, Student Scholarships, Pensions, and Healthcare.',
      };
    }
    if (currentView === 'states') {
      return {
        title: 'State & Central Welfare Schemes (AP, Telangana & All India) | RationQ',
        description: 'Discover welfare schemes specific to Andhra Pradesh, Telangana, and Central Government initiatives with verified application steps.',
      };
    }
    if (currentView === 'eligibility') {
      return {
        title: 'Smart Welfare Scheme Eligibility Checker | RationQ',
        description: 'Check which government welfare schemes your family is eligible for using our interactive 1-minute eligibility wizard.',
      };
    }
    if (currentView.startsWith('legal-')) {
      const tab = currentView.replace('legal-', '') as LegalTab;
      switch (tab) {
        case 'privacy':
          return {
            title: 'Privacy Policy | RationQ - Citizen Information Portal',
            description: 'Read RationQ Privacy Policy covering Google AdSense cookies, DART cookies, user data protection, and privacy rights.',
          };
        case 'terms':
          return {
            title: 'Terms of Service | RationQ',
            description: 'RationQ Terms of Service and guidelines for using our independent citizen welfare information portal.',
          };
        case 'disclaimer':
          return {
            title: 'Government Non-Affiliation Disclaimer | RationQ',
            description: 'Official disclaimer: RationQ is an independent citizen information portal and is not affiliated with any government department.',
          };
        case 'contact':
          return {
            title: 'Contact Us & Editorial Desk | RationQ',
            description: 'Get in touch with the RationQ team for queries, corrections, feedback, or scheme information support.',
          };
        case 'about':
          return {
            title: 'About Us & Verification Standards | RationQ',
            description: 'Learn about RationQ - our mission to provide accurate, verified, and accessible government scheme information for citizens.',
          };
      }
    }
    return {
      title: 'RationQ - Government Schemes, Eligibility & Updates in Telugu & English',
      description: 'India\'s citizen intelligence portal for verified welfare schemes, eligibility guides, and step-by-step application procedures.',
    };
  };

  const seo = getSeoMeta();

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Dynamic Dynamic SEO Head Tags */}
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RationQ" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'admin') {
            if (isAdminAuthenticated) {
              setCurrentView('admin');
              try { window.history.pushState({}, '', '/admin'); } catch (e) {}
            } else {
              setShowAdminAuthModal(true);
            }
          } else {
            setCurrentView(view);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
        setLang={setLang}
        savedCount={savedArticleIds.length}
        unreadNotifCount={unreadNotifCount}
        openNotifications={() => setNotificationsOpen(true)}
        openAiAssistant={() => setAiAssistantOpen(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        isAdminAuthenticated={isAdminAuthenticated}
        onRequestAdminLogin={() => setShowAdminAuthModal(true)}
      />

      {/* VIEW 1: HOME PAGE */}
      {currentView === 'home' && (
        <main className="flex-1 pb-20 space-y-12">
          
          {/* Hero & Intelligence Search */}
          <HeroSearch
            onSearchSubmit={handleSearchSubmit}
            onStartEligibility={() => {
              setCurrentView('eligibility');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreLatest={() => {
              setCurrentView('latest');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            lang={lang}
          />

          {/* Interactive Categories Sector Grid */}
          <CategoryGrid
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catName) => {
              setSelectedCategory(selectedCategory === catName ? null : catName);
              setCurrentView('latest');
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
          />

          {/* Featured Scheme Spotlight Section */}
          {featuredArticle && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Major Scheme Spotlight</span>
              </div>
              <ArticleCard
                article={featuredArticle}
                featured={true}
                onSelect={handleOpenArticle}
                isSaved={savedArticleIds.includes(featuredArticle.id)}
                onToggleSave={toggleSaveArticle}
                lang={lang}
              />
            </section>
          )}

          {/* State & Central Jurisdiction Explorer */}
          <StateExplorer
            states={states}
            selectedState={selectedState}
            onSelectState={(stName) => {
              setSelectedState(stName);
              if (stName) {
                setCurrentView('latest');
              }
            }}
          />

          {/* Latest Verified Scheme Guides Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  {t.latestUpdates}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Step-by-step application guides verified from official government portals.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedState(null);
                  setSearchQuery('');
                  setCurrentView('latest');
                }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>View All Schemes ({articles.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  onSelect={handleOpenArticle}
                  isSaved={savedArticleIds.includes(art.id)}
                  onToggleSave={toggleSaveArticle}
                  lang={lang}
                />
              ))}
            </div>
          </section>

          {/* Eligibility Callout Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rule-Engine Matcher</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
                  Unsure Which Schemes Apply To Your Household?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                  Use our 5-step Citizen Eligibility Wizard to check income limits, land holding rules, and age criteria across 500+ Central and State welfare programs.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('eligibility');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-700/30 shrink-0 transition-all hover:scale-105"
              >
                Launch Eligibility Wizard →
              </button>
            </div>
          </section>

        </main>
      )}

      {/* VIEW 2: LATEST SCHEMES / FILTERED GRID */}
      {currentView === 'latest' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Latest Government Scheme Updates
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Showing {filteredArticles.length} verified articles and guides.
              </p>
            </div>

            {/* Clear Filters Button */}
            {(selectedCategory || selectedState || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedState(null);
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory || selectedState || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500">Active Filters:</span>
              {selectedCategory && (
                <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedState && (
                <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  State: {selectedState}
                </span>
              )}
              {searchQuery && (
                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  Search: "{searchQuery}"
                </span>
              )}
            </div>
          )}

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-serif font-bold text-slate-800 text-lg">
                No matching schemes found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try adjusting your category or state filter, or ask our RationQ AI Assistant for custom guidance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  onSelect={handleOpenArticle}
                  isSaved={savedArticleIds.includes(art.id)}
                  onToggleSave={toggleSaveArticle}
                  lang={lang}
                />
              ))}
            </div>
          )}

        </main>
      )}

      {/* VIEW 3: CATEGORIES VIEW */}
      {currentView === 'categories' && (
        <main className="flex-1 py-8">
          <CategoryGrid
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catName) => {
              setSelectedCategory(selectedCategory === catName ? null : catName);
              setCurrentView('latest');
            }}
          />
        </main>
      )}

      {/* VIEW 4: STATES EXPLORER VIEW */}
      {currentView === 'states' && (
        <main className="flex-1 py-8">
          <StateExplorer
            states={states}
            selectedState={selectedState}
            onSelectState={(stName) => {
              setSelectedState(stName);
              if (stName) setCurrentView('latest');
            }}
          />
        </main>
      )}

      {/* VIEW 5: ELIGIBILITY WIZARD VIEW */}
      {currentView === 'eligibility' && (
        <main className="flex-1 py-8">
          <EligibilityWizard
            states={states}
            onSelectArticle={handleSelectArticleBySlug}
          />
        </main>
      )}

      {/* VIEW 6: ARTICLE DETAIL VIEW */}
      {currentView === 'article-detail' && selectedArticle && (
        <main className="flex-1">
          <ArticleDetailView
            article={selectedArticle}
            onBack={handleBackToHome}
            isSaved={savedArticleIds.includes(selectedArticle.id)}
            onToggleSave={toggleSaveArticle}
            lang={lang}
            allArticles={safeArticles}
            onSelectArticle={handleOpenArticle}
            savedArticleIds={savedArticleIds}
          />
        </main>
      )}

      {/* VIEW 7: SAVED SCHEMES VIEW */}
      {currentView === 'saved' && (
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Saved Citizen Schemes ({savedArticles.length})
            </h1>
          </div>

          {savedArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No saved schemes. Click the bookmark icon on any scheme card to save it for quick reference.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedArticles.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  onSelect={handleOpenArticle}
                  isSaved={true}
                  onToggleSave={toggleSaveArticle}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* VIEW 8: ADMIN DASHBOARD VIEW */}
      {currentView === 'admin' && (
        <main className="flex-1 py-8">
          <AdminDashboard
            articles={articles}
            onArticlePublished={loadData}
            onSelectArticle={handleSelectArticleBySlug}
            onLogoutAdmin={() => {
              setIsAdminAuthenticated(false);
              setCurrentView('home');
            }}
          />
        </main>
      )}

      {/* VIEW 9: ADSENSE COMPLIANCE LEGAL PAGES VIEW */}
      {currentView.startsWith('legal-') && (
        <main className="flex-1 py-8">
          <LegalPagesView
            initialTab={currentView.replace('legal-', '') as LegalTab}
            onNavigateHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {/* MODALS & DRAWERS */}
      <AiAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onSelectArticle={handleSelectArticleBySlug}
      />

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }}
        onSelectLink={() => {
          setCurrentView('latest');
        }}
      />

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setShowAdminAuthModal(false);
          setCurrentView('admin');
          try { window.history.pushState({}, '', '/admin'); } catch (e) {}
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Column 1: Brand */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-lg">
                Q
              </div>
              <span className="text-lg font-serif font-bold text-white">RationQ</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Government Schemes. Explained Simply. India's independent citizen intelligence and application guide platform.
            </p>
          </div>

          {/* Column 2: Sectors */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">
              Explore Sectors
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setCurrentView('latest');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Citizen Tools */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">
              Citizen Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('eligibility');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Eligibility Checker Wizard
                </button>
              </li>
              <li>
                <button onClick={() => setAiAssistantOpen(true)} className="hover:text-emerald-400 transition-colors text-left">
                  RationQ AI Grounded Assistant
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('legal-about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Verification Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Important Pages (Google AdSense Compliance) */}
          <div>
            <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AdSense Policies</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('legal-privacy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 font-medium transition-colors text-slate-300 text-left"
                >
                  🔒 Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('legal-terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 font-medium transition-colors text-slate-300 text-left"
                >
                  📄 Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('legal-disclaimer');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 font-medium transition-colors text-slate-300 text-left"
                >
                  ⚠️ Disclaimer & Non-Affiliation
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('legal-contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 font-medium transition-colors text-slate-300 text-left"
                >
                  ✉️ Contact Us & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('legal-about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-300 font-medium transition-colors text-slate-300 text-left"
                >
                  ℹ️ About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Verification & Official Sources */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">
              Official Verification
            </h4>
            <p className="text-slate-400 leading-relaxed mb-2 text-xs">
              RationQ cross-checks updates daily against PIB releases, myScheme.gov.in, AP Seva & TG Meeseva portals.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Independent Citizen Information Portal</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>© {new Date().getFullYear()} RationQ. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => {
                setCurrentView('legal-privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 underline"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentView('legal-terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 underline"
            >
              Terms
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentView('legal-disclaimer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 underline"
            >
              Disclaimer
            </button>
          </div>

          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                setCurrentView('admin');
                try { window.history.pushState({}, '', '/admin'); } catch (e) {}
              } else {
                setShowAdminAuthModal(true);
              }
            }}
            className="text-slate-600 hover:text-emerald-400 transition-colors text-sm p-1 inline-flex items-center justify-center font-medium"
            title="Admin Access"
          >
            <span>🔒</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

export default App;
