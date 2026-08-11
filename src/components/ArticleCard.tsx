import React from 'react';
import { ShieldCheck, Clock, Bookmark, ArrowUpRight, Sparkles, MapPin, Tag } from 'lucide-react';
import { Article } from '../types';
import { Language } from '../lib/translations';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, articleId: string) => void;
  featured?: boolean;
  lang?: Language;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  isSaved,
  onToggleSave,
  featured = false,
  lang = 'te',
}) => {
  const displayTitle = (lang === 'te' && article.titleTelugu) ? article.titleTelugu : (lang === 'hi' && (article as any).titleHindi) ? (article as any).titleHindi : article.title;
  const displaySummary = (lang === 'te' && article.shortSummaryTelugu) ? article.shortSummaryTelugu : (lang === 'hi' && (article as any).shortSummaryHindi) ? (article as any).shortSummaryHindi : article.shortSummary;
  return (
    <div
      onClick={() => onSelect(article)}
      className={`group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-400/80 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-0.5 ${
        featured ? 'md:grid md:grid-cols-12 md:gap-6 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20' : ''
      }`}
    >
      {/* Thumbnail Container */}
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'md:col-span-5 aspect-16/10 md:aspect-auto' : 'aspect-16/10'}`}>
        <img
          src={article.generatedImage}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if unsplash fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800';
          }}
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {article.isNew && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
          {article.isUpdated && !article.isNew && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              UPDATED
            </span>
          )}
          <span className="bg-slate-900/85 backdrop-blur-md text-slate-100 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            {article.state}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onToggleSave(e, article.id)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white/85 text-slate-700 hover:bg-white hover:text-emerald-700'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Content Container */}
      <div className={`p-5 flex-1 flex flex-col justify-between ${featured ? 'md:col-span-7 md:py-6 md:pr-6' : ''}`}>
        <div className="space-y-2.5">
          
          {/* Category & Verified Source Pill */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-800 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1 text-[11px] font-bold">
              <Tag className="w-3 h-3 text-emerald-600" />
              {article.category}
            </span>

            {article.source?.verificationStatus === 'verified' && (
              <span className="text-emerald-800 flex items-center gap-1 text-[11px] font-bold bg-emerald-50/60 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Source
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-serif font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug ${featured ? 'text-xl md:text-2xl' : 'text-base sm:text-lg'}`}>
            {displayTitle}
          </h3>

          {/* Short Summary */}
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
            {displaySummary}
          </p>

          {/* Key Benefit Highlight */}
          {article.benefits && article.benefits.length > 0 && (
            <div className="bg-slate-50/80 border-l-3 border-emerald-600 px-3 py-2 rounded-r-xl text-xs text-slate-700 font-medium">
              <strong className="text-emerald-800">Key Benefit:</strong> {article.benefits[0].title}
              {article.benefits[0].amount ? ` (${article.benefits[0].amount})` : ''}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>{new Date(article.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {article.readTimeMinutes} min read
            </span>
          </div>

          <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
            Read Guide <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>
    </div>
  );
};
