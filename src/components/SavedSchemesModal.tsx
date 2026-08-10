import React from 'react';
import { Bookmark, X, FileText, ArrowUpRight, Trash2 } from 'lucide-react';
import { Article } from '../types';

interface SavedSchemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: Article[];
  onSelectArticle: (slug: string) => void;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
}

export const SavedSchemesModal: React.FC<SavedSchemesModalProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onToggleSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400 fill-current" />
            <h3 className="font-bold text-lg font-serif">Saved Citizen Schemes</h3>
            <span className="bg-emerald-800 text-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
              {savedArticles.length}
            </span>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No saved schemes yet.</p>
              <p className="text-xs text-slate-400">Click the bookmark icon on any scheme card to save it for quick reference.</p>
            </div>
          ) : (
            savedArticles.map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800">
                    <span>{art.category}</span>
                    <span>•</span>
                    <span>{art.state}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{art.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{art.shortSummary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectArticle(art.slug);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <span>Open Guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => onToggleSave(e, art.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
