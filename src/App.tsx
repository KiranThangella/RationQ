import React, { useState, useEffect } from 'react';
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

import { Article, Category, State, Notification } from './types';
import { Language, TRANSLATIONS } from './lib/translations';
import { apiUrl } from './lib/apiBase';
import { Sparkles, SlidersHorizontal, ShieldCheck, Search, Filter, Info, ChevronRight, HeartHandshake } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [lang, setLang] = useState<Language>('en');

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  // Fetch initial data
  const loadData = () => {
    fetch(apiUrl('/api/articles'))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        } else if (data && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          setArticles([]);
        }
      })
      .catch((err) => console.error(err));

    fetch(apiUrl('/api/categories'))
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch(apiUrl('/api/states'))
      .then((res) => res.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch(apiUrl('/api/notifications'))
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
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

  const handleSelectArticleBySlug = (slug: string) => {
    const found = safeArticles.find((a) => a.slug === slug || a.id === slug);
    if (found) {
      setSelectedArticle(found);
      setCurrentView('article-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCurrentView('latest');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Filtered Articles Logic
  const filteredArticles = safeArticles.filter((art) => {
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

  const featuredArticle = safeArticles.find((a) => a.isFeatured) || safeArticles[0];
  const savedArticles = safeArticles.filter((a) => savedArticleIds.includes(a.id));
  const unreadNotifCount = safeNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'admin') {
            if (isAdminAuthenticated) {
              setCurrentView('admin');
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
                onSelect={(art) => {
                  setSelectedArticle(art);
                  setCurrentView('article-detail');
                }}
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
                  onSelect={(selected) => {
                    setSelectedArticle(selected);
                    setCurrentView('article-detail');
                  }}
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
                  onSelect={(selected) => {
                    setSelectedArticle(selected);
                    setCurrentView('article-detail');
                  }}
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
            onBack={() => setCurrentView('home')}
            isSaved={savedArticleIds.includes(selectedArticle.id)}
            onToggleSave={toggleSaveArticle}
            lang={lang}
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
                  onSelect={(selected) => {
                    setSelectedArticle(selected);
                    setCurrentView('article-detail');
                  }}
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
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-lg">
                Q
              </div>
              <span className="text-lg font-serif font-bold text-white">RationQ</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Government Schemes. Explained Simply. India's independent citizen intelligence and application guide platform.
            </p>
          </div>

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
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">
              Citizen Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('eligibility')} className="hover:text-emerald-400">
                  Eligibility Checker Wizard
                </button>
              </li>
              <li>
                <button onClick={() => setAiAssistantOpen(true)} className="hover:text-emerald-400">
                  RationQ AI Grounded Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setAboutOpen(true)} className="hover:text-emerald-400">
                  Trust & Verification Methodology
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">
              Official Sources
            </h4>
            <p className="text-slate-400 leading-relaxed mb-2">
              RationQ cross-checks updates daily against PIB releases, myScheme.gov.in, and State portals.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent Citizen Information Portal</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} RationQ. Independent information service. Not affiliated with any government entity.
          </div>
          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                setCurrentView('admin');
              } else {
                setShowAdminAuthModal(true);
              }
            }}
            className="text-slate-600 hover:text-emerald-400 transition-colors text-[11px] inline-flex items-center gap-1 font-medium"
            title="Secret Admin Verification Portal"
          >
            <span>🔒</span>
            <span>రహస్య అడ్మిన్ ల్యాగిన్ (Secret Admin)</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

export default App;
