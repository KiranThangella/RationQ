import React from 'react';
import { Home, Sparkles, Bookmark } from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  lang: Language;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  lang,
  savedCount,
}) => {
  const getHomeLabel = () => {
    switch (lang) {
      case 'te': return 'హోమ్';
      case 'hi': return 'होम';
      default: return 'Home';
    }
  };

  const getLatestLabel = () => {
    switch (lang) {
      case 'te': return 'కొత్తవి';
      case 'hi': return 'नवीनतम';
      default: return 'Latest';
    }
  };

  const getSavedLabel = () => {
    switch (lang) {
      case 'te': return 'సేవ్ చేసినవి';
      case 'hi': return 'सहेजे गए';
      default: return 'Saved';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentView === 'home' || currentView === 'article-detail' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' || currentView === 'article-detail' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-bold">{getHomeLabel()}</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('latest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentView === 'latest' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentView === 'latest' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-bold">{getLatestLabel()}</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('saved');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentView === 'saved' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${currentView === 'saved' ? 'fill-emerald-100' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">{getSavedLabel()}</span>
        </button>
      </div>
    </div>
  );
};
