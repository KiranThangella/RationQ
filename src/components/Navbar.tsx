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
    if (view === 'admin' && !isAdminAuthenticated && onRequestAdminLogin) {
      onRequestAdminLogin();
      setMobileMenuOpen(false);
      return;
    }
    setCurrentView(view);
    if (view === 'latest' || view === 'home') {
      setSelectedCategory(null);
      setSelectedState(null);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                Q
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-serif">
                    Ration<span className="text-emerald-700">Q</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
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

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="uppercase">{lang}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'en' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>English</span>
                      {lang === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => { setLang('te'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'te' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>తెలుగు (Telugu)</span>
                      {lang === 'te' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between ${lang === 'hi' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>हिन्दी (Hindi)</span>
                      {lang === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* AI Assistant Drawer Trigger (Desktop & Tablet) */}
              <button
                onClick={openAiAssistant}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>RationQ AI</span>
              </button>

              {/* Saved Schemes */}
              <button
                onClick={() => handleNavClick('saved')}
                className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                title={t.savedSchemes}
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>

              {/* Alerts / Notifications */}
              <button
                onClick={openNotifications}
                className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                title={t.alerts}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Admin Hub Button (Desktop) */}
              {isAdminAuthenticated && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`hidden sm:flex p-2 rounded-lg text-xs font-semibold transition-colors items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Admin Curation Hub"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span className="hidden xl:inline">🔒 అడ్మిన్</span>
                </button>
              )}

              {/* Mobile Menu Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Menu Header Bar */}
          <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md border-b border-slate-800 shrink-0">
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                Q
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white font-serif">
                  Ration<span className="text-emerald-400">Q</span>
                </span>
                <span className="ml-1.5 text-[9px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 uppercase">
                  Menu
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5 border border-slate-700"
              aria-label="Close menu"
            >
              <span className="text-xs font-black uppercase text-amber-300">మూసివేయి</span>
              <X className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Quick Language Switcher Banner */}
          <div className="bg-emerald-950 text-white px-4 py-2.5 border-b border-emerald-900 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>భాషను ఎంచుకోండి (Language):</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${lang === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${lang === 'te' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${lang === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                హిందీ
              </button>
            </div>
          </div>

          {/* Main Menu Links List */}
          <div className="p-4 space-y-4 flex-1 pb-28 bg-slate-50">
            
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider px-1">
              ముఖ్యమైన లింకులు (Main Navigation)
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Home */}
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${
                  currentView === 'home'
                    ? 'bg-emerald-800 text-white font-black shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-bold shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${currentView === 'home' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-snug">{lang === 'te' ? '🏠 హోమ్ పేజీ (Home)' : '🏠 Home'}</div>
                    <div className={`text-xs ${currentView === 'home' ? 'text-emerald-100' : 'text-slate-500'}`}>అన్ని సంక్షేమ పథకాలు & సమాచారం</div>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-current opacity-80" />
              </button>

              {/* Latest Schemes */}
              <button
                onClick={() => handleNavClick('latest')}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${
                  currentView === 'latest'
                    ? 'bg-emerald-800 text-white font-black shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-bold shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${currentView === 'latest' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-snug">{lang === 'te' ? '⚡ తాజా పథకాలు (Latest Schemes)' : '⚡ Latest Schemes'}</div>
                    <div className={`text-xs ${currentView === 'latest' ? 'text-emerald-100' : 'text-slate-500'}`}>కొత్తగా విడుదలైన నోటిఫికేషన్‌లు</div>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-current opacity-80" />
              </button>

              {/* Categories */}
              <button
                onClick={() => handleNavClick('categories')}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${
                  currentView === 'categories'
                    ? 'bg-emerald-800 text-white font-black shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-bold shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${currentView === 'categories' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-snug">{lang === 'te' ? '📂 కేటగిరీలు (Categories)' : '📂 Categories'}</div>
                    <div className={`text-xs ${currentView === 'categories' ? 'text-emerald-100' : 'text-slate-500'}`}>రైతు, మహిళ, విద్యార్థి & పెన్షన్ పథకాలు</div>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-current opacity-80" />
              </button>

              {/* States & Central */}
              <button
                onClick={() => handleNavClick('states')}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${
                  currentView === 'states'
                    ? 'bg-emerald-800 text-white font-black shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-bold shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${currentView === 'states' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-snug">{lang === 'te' ? '🗺️ రాష్ట్రాలు & కేంద్ర పథకాలు (States & Central)' : '🗺️ States & Central'}</div>
                    <div className={`text-xs ${currentView === 'states' ? 'text-emerald-100' : 'text-slate-500'}`}>AP, Telangana, Central Government</div>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-current opacity-80" />
              </button>

              {/* Eligibility Checker */}
              <button
                onClick={() => handleNavClick('eligibility')}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${
                  currentView === 'eligibility'
                    ? 'bg-emerald-800 text-white font-black shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-bold shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${currentView === 'eligibility' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-snug">{lang === 'te' ? '🎯 అర్హత పరీక్ష (Eligibility Checker)' : '🎯 Eligibility Checker'}</div>
                    <div className={`text-xs ${currentView === 'eligibility' ? 'text-emerald-100' : 'text-slate-500'}`}>మీ కుటుంబ అర్హతను తనిఖీ చేయండి</div>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-current opacity-80" />
              </button>
            </div>

            {/* Special AI Assistant Banner */}
            <div className="pt-2">
              <button
                onClick={() => { openAiAssistant(); setMobileMenuOpen(false); }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 text-white font-extrabold text-sm flex items-center justify-between shadow-xl border border-teal-700/80"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-black text-amber-300">RationQ AI Assistant</div>
                    <div className="text-xs text-slate-300 font-medium">ప్రభుత్వ పథకాల సందేహాలు నిమిషాల్లో తీర్చుకోండి</div>
                  </div>
                </div>
                <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase shrink-0">
                  Ask AI
                </span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleNavClick('saved')}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-between border border-slate-200 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-700" />
                  <span>{t.savedSchemes}</span>
                </div>
                <span className="bg-emerald-700 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between border border-slate-800 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>{isAdminAuthenticated ? 'Admin Hub' : 'Admin Login'}</span>
                </div>
                <span className="text-emerald-400 font-black">&rarr;</span>
              </button>
            </div>

            {/* AdSense Policy Links in Drawer */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 px-1">
                పాలసీలు & సపోర్ట్ (Policies & Support)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <button
                  onClick={() => handleNavClick('legal-privacy')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:bg-slate-100 transition-colors"
                >
                  🔒 Privacy Policy
                </button>
                <button
                  onClick={() => handleNavClick('legal-terms')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:bg-slate-100 transition-colors"
                >
                  📄 Terms of Use
                </button>
                <button
                  onClick={() => handleNavClick('legal-disclaimer')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:bg-slate-100 transition-colors"
                >
                  ⚠️ Disclaimer
                </button>
                <button
                  onClick={() => handleNavClick('legal-contact')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:bg-slate-100 transition-colors"
                >
                  ✉️ Contact Us
                </button>
              </div>
            </div>

            <div className="pt-3 text-center">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                ✕ మూసివేయి (Close Menu)
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 py-1.5 px-3 flex justify-around items-center shadow-lg">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${currentView === 'home' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('latest')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${currentView === 'latest' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Latest</span>
        </button>

        <button
          onClick={openAiAssistant}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-emerald-800 group"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center -mt-4 shadow-md border-2 border-white group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span>AI Help</span>
        </button>

        <button
          onClick={() => handleNavClick('eligibility')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${currentView === 'eligibility' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Checker</span>
        </button>

        <button
          onClick={() => handleNavClick(isAdminAuthenticated ? 'admin' : 'saved')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${currentView === 'admin' || currentView === 'saved' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {isAdminAuthenticated ? <LayoutDashboard className="w-5 h-5 text-emerald-700" /> : <Bookmark className="w-5 h-5" />}
          <span>{isAdminAuthenticated ? 'Admin' : 'Saved'}</span>
        </button>
      </div>
    </>
  );
};
