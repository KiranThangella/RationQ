import React from 'react';
import {
  Sprout,
  GraduationCap,
  Heart,
  Briefcase,
  Home,
  Activity,
  UserCheck,
  Users,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sprout,
  GraduationCap,
  Heart,
  Briefcase,
  Home,
  Activity,
  UserCheck,
  Users,
  Wrench,
  ShieldCheck,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Explore By Sector</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Scheme Categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Browse verified Central and State Government schemes grouped by primary citizen benefit sectors.
          </p>
        </div>

        {/* Grid of Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sprout;
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase() || selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-800 shadow-xl ring-2 ring-emerald-500'
                    : 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-lg text-slate-800'
                }`}
              >
                <div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-colors border ${
                    isSelected
                      ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/50'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <h3 className={`font-bold text-sm mb-1 leading-snug line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-900 group-hover:text-emerald-800'
                  }`}>
                    {cat.name}
                  </h3>

                  <p className={`text-[11px] line-clamp-2 mb-3 leading-relaxed ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {cat.description}
                  </p>
                </div>

                <div className={`pt-2.5 border-t flex items-center justify-between text-[10px] font-semibold ${
                  isSelected ? 'border-slate-800 text-emerald-400' : 'border-slate-100 text-slate-400'
                }`}>
                  <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                    {cat.count} Active Schemes
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${
                    isSelected ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
