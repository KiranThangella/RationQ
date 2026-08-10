import React from 'react';
import { MapPin, Building2, CheckCircle2, ArrowUpRight, Sparkles, Filter } from 'lucide-react';
import { State } from '../types';

interface StateExplorerProps {
  states: State[];
  onSelectState: (stateName: string | null) => void;
  selectedState: string | null;
}

export const StateExplorer: React.FC<StateExplorerProps> = ({
  states,
  onSelectState,
  selectedState,
}) => {
  return (
    <section className="py-12 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Jurisdiction Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              State & Central Scheme Explorer
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Select your state or Central Government to view tailored welfare initiatives, local application windows, and official portals.
          </p>
        </div>

        {/* State Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-6">
          <button
            onClick={() => onSelectState(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedState === null
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Jurisdictions
          </button>
          
          {states.map((st) => {
            const isSelected = selectedState?.toLowerCase() === st.name.toLowerCase();
            return (
              <button
                key={st.id}
                onClick={() => onSelectState(isSelected ? null : st.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500'
                    : st.type === 'central'
                    ? 'bg-amber-50/90 text-amber-900 border border-amber-200/80 hover:bg-amber-100 font-bold'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                {st.type === 'central' ? (
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{st.name}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {st.popularSchemesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected State Overview Spotlight Box */}
        {selectedState && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active Jurisdiction Filter: {selectedState}
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-100">
                Official Schemes Active in {selectedState}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Displaying verified welfare programs, Direct Benefit Transfers (DBT), education scholarships, and agricultural subsidies available for residents of {selectedState}.
              </p>
            </div>

            <button
              onClick={() => onSelectState(null)}
              className="z-10 px-4 py-2 bg-white text-emerald-950 font-bold text-xs rounded-full shadow-md hover:bg-slate-100 transition-colors shrink-0"
            >
              Clear Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
