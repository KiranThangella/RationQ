import React, { useState } from 'react';
import {
  Search,
  Bell,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  LayoutDashboard,
  Info,
  ShieldCheck,
  Home,
  Grid,
  MapPin,
  UserCheck
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  savedCount: number;
  unreadNotifCount: number;
  openNotifications: () => void;
  openAiAssistant: () => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedState: string | null;
  setSelectedState: (state: string | null) => void;
  isAdminAuthenticated?: boolean;
  onRequestAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  savedCount,
  unreadNotifCount,
  openNotifications,
  openAiAssistant,
  setSelectedCategory,
  setSelectedState,
  isAdminAuthenticated = false,
  onRequestAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (view === 'latest' || view === 'home') {
      setSelectedCategory(null);
      setSelectedState(null);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner Disclaimer */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">
          <strong>RationQ Intelligence:</strong> Independent Citizen Information Portal. Powered by verified official sources.
        </span>
      </div>

      {/* Main Desktop Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                Q
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 font-serif">
                    Ration<span className="text-emerald-700">Q</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 tracking-tight hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'home'
                    ? 'text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('latest')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'latest'
                    ? 'text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Latest Schemes
              </button>
              <button
                onClick={() => handleNavClick('categories')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'categories'
                    ? 'text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {t.categories}
              </button>
              <button
                onClick={() => handleNavClick('states')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'states'
                    ? 'text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {t.states}
              </button>
              <button
                onClick={() => handleNavClick('eligibility')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'eligibility'
                    ? 'text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-200/80'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                {t.eligibilityChecker}
              </button>
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="uppercase">{lang}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'en' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      English
                      {lang === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => { setLang('te'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'te' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      తెలుగు (Telugu)
                      {lang === 'te' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'hi' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      हिन्दी (Hindi)
                      {lang === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* AI Assistant Drawer Trigger */}
              <button
                onClick={openAiAssistant}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>RationQ AI</span>
              </button>

              {/* Saved Schemes */}
              <button
                onClick={() => handleNavClick('saved')}
                className="relative p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                title={t.savedSchemes}
              >
                <Bookmark className="w-5 h-5" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>

              {/* Alerts / Notifications */}
              <button
                onClick={openNotifications}
                className="relative p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                title={t.alerts}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Admin Curation Hub Button (Rendered ONLY when authenticated) */}
              {isAdminAuthenticated && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Admin Curation Hub"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span className="hidden xl:inline">🔒 అడ్మిన్ (Admin)</span>
                </button>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              Home
            </button>
            <button
              onClick={() => handleNavClick('latest')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Latest Schemes
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <Grid className="w-4 h-4 text-emerald-600" />
              {t.categories}
            </button>
            <button
              onClick={() => handleNavClick('states')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              {t.states}
            </button>
            <button
              onClick={() => handleNavClick('eligibility')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              {t.eligibilityChecker}
            </button>
            <button
              onClick={() => { openAiAssistant(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Ask RationQ AI Assistant
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-slate-500" />
              About & Trust Transparency
            </button>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 px-2 flex justify-around items-center shadow-lg">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium ${currentView === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => handleNavClick('categories')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium ${currentView === 'categories' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          <Grid className="w-5 h-5" />
          <span>Categories</span>
        </button>
        <button
          onClick={() => handleNavClick('eligibility')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium ${currentView === 'eligibility' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Checker</span>
        </button>
        <button
          onClick={openAiAssistant}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold text-emerald-800"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center -mt-3 shadow-md border-2 border-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => handleNavClick('saved')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium ${currentView === 'saved' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </button>
      </div>
    </>
  );
};
