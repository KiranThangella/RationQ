import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';
import { apiUrl } from '../lib/apiBase';

interface HeroSearchProps {
  onSearchSubmit: (query: string) => void;
  onStartEligibility: () => void;
  onExploreLatest: () => void;
  lang: Language;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearchSubmit,
  onStartEligibility,
  onExploreLatest,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetch(apiUrl(`/api/search?q=${encodeURIComponent(searchQuery)}`))
        .then((res) => res.json())
        .then((data) => {
          if (data.suggestions) {
            setSuggestions(data.suggestions);
            setShowDropdown(true);
          }
        })
        .catch(() => {});
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
      setShowDropdown(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    onSearchSubmit(tag);
    setShowDropdown(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 shadow-xl">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-8">
        
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Government Source Intelligence • Updated Daily</span>
        </div>

        {/* Hero Headlines */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-slate-100 leading-tight">
            {t.findSchemesHeader}
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {t.findSchemesSub}
          </p>
        </div>

        {/* Intelligent Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-28 py-4 bg-white/95 backdrop-blur-md rounded-2xl text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-left text-slate-800 animate-in fade-in">
              <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Schemes & Keywords
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTagClick(item)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tag Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 font-medium">Popular Searches:</span>
          {[
            'PM-KISAN ₹2,000',
            'Telangana Rythu Bharosa',
            'Ayushman Card ₹5 Lakh',
            'PM Vishwakarma Loan',
            'Vidya Lakshmi Education Loan',
            'Maharashtra MahaDBT',
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartEligibility}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <SlidersHorizontal className="w-5 h-5 text-amber-300" />
            <span>{t.findMySchemes}</span>
          </button>
          <button
            onClick={onExploreLatest}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm sm:text-base border border-slate-700 transition-all"
          >
            {t.exploreLatest}
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Hallucinations Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Ministry Source Linked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Simple Language Step-by-Step</span>
          </div>
        </div>

      </div>
    </section>
  );
};
