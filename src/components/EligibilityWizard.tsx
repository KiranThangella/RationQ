import React, { useState } from 'react';
import {
  SlidersHorizontal,
  MapPin,
  User,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { EligibilityFormData, MatchResult, State } from '../types';

interface EligibilityWizardProps {
  states: State[];
  onSelectArticle: (slug: string) => void;
  onClose?: () => void;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({
  states,
  onSelectArticle,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ eligible: MatchResult[]; notEligible: MatchResult[] } | null>(null);

  const [formData, setFormData] = useState<EligibilityFormData>({
    state: 'Telangana',
    occupation: 'Farmer',
    age: 32,
    annualIncome: 180000,
    gender: 'male',
    category: 'General/OBC',
    hasLandHolding: true,
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResults(data);
      setStep(6); // Results view
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Structured Rule Engine v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100">
            Citizen Eligibility Wizard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Answer 5 quick questions to match your household profile against official Central and State Government eligibility rules.
          </p>
        </div>
      </div>

      {/* Wizard Steps Stepper */}
      {step <= 5 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-8">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Step {step} of 5</span>
              <span>{Math.round((step / 5) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: State Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Which state do you live in?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {states.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFormData({ ...formData, state: st.name })}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                      formData.state === st.name
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-slate-50'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Occupation */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                What best describes your primary occupation or role?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Farmer',
                  'Student',
                  'Artisan / Craftsman',
                  'Employee / Worker',
                  'Business Owner / MSME',
                  'Homemaker',
                  'Senior Citizen (60+)',
                  'Unemployed Youth',
                ].map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setFormData({ ...formData, occupation: occ })}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                      formData.occupation === occ
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-slate-50'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Age & Gender */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Age & Gender Profile
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Your Age: <span className="text-emerald-700 text-sm">{formData.age} years</span>
                </label>
                <input
                  type="range"
                  min="16"
                  max="85"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Gender:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['female', 'male', 'other'].map((gen) => (
                    <button
                      key={gen}
                      onClick={() => setFormData({ ...formData, gender: gen })}
                      className={`p-3 rounded-xl border text-center text-xs font-bold uppercase transition-all ${
                        formData.gender === gen
                          ? 'bg-emerald-900 text-white border-emerald-800 shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Income Range */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Annual Household Income Bracket
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Below ₹1 Lakh (BPL / EWS)', value: 90000 },
                  { label: '₹1 Lakh to ₹2.5 Lakhs', value: 180000 },
                  { label: '₹2.5 Lakhs to ₹6 Lakhs (LIG)', value: 450000 },
                  { label: '₹6 Lakhs to ₹8 Lakhs (MIG-I)', value: 700000 },
                  { label: 'Above ₹8 Lakhs', value: 1000000 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setFormData({ ...formData, annualIncome: item.value })}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                      formData.annualIncome === item.value
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Category & Additional details */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Social Category & Assets
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Social Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['General/OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        formData.category === cat
                          ? 'bg-emerald-900 text-white border-emerald-800 shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Do you own agricultural land?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, hasLandHolding: true })}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      formData.hasLandHolding
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Yes (Agricultural Land Owner / Tenant)
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, hasLandHolding: false })}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      !formData.hasLandHolding
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    No (Non-agricultural / Landless)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Matching Database Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Calculate Eligible Schemes</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* STEP 6: Results View */}
      {step === 6 && results && (
        <div className="space-y-8 animate-in fade-in zoom-in-95">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Matching Scheme Results
            </h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate Profile
            </button>
          </div>

          {/* Eligible Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>You May Be Eligible ({results.eligible.length} Schemes)</span>
            </div>

            {results.eligible.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No direct high-confidence scheme matches for this exact combination. Try broadening your criteria or search all categories.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {results.eligible.map((item) => (
                  <div
                    key={item.article.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {item.article.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {item.article.state}
                        </span>
                      </div>

                      <div className="bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                        <span>Match Score: {item.matchScore}%</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-slate-900 text-lg">
                      {item.article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.article.shortSummary}
                    </p>

                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/80 text-xs text-emerald-900 space-y-1">
                      <strong className="block font-bold">Matching Eligibility Reasons:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                        {item.matchingReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => onSelectArticle(item.article.slug)}
                        className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Full Application Guide
                      </button>
                      <a
                        href={item.article.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-600 hover:text-emerald-800 underline"
                      >
                        Official Website
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Not Eligible Section */}
          {results.notEligible.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-800 uppercase tracking-wider">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>You May Not Qualify ({results.notEligible.length} Schemes)</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {results.notEligible.map((item) => (
                  <div
                    key={item.article.id}
                    className="p-4 rounded-xl bg-rose-50/30 border border-rose-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">{item.article.title}</h4>
                      <span className="text-[10px] text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                        Match Score: {item.matchScore}%
                      </span>
                    </div>

                    <div className="text-xs text-rose-900">
                      <strong>Disqualification Reason:</strong>{' '}
                      {item.disqualificationReasons.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
