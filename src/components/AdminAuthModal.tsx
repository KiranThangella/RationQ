import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, Check, Eye, EyeOff } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Valid secret passcodes
    const validCodes = ['1234', 'admin123', 'rationq123'];
    if (validCodes.includes(passcode.trim())) {
      setError(false);
      setPasscode('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3 mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-lg ring-4 ring-slate-100">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-slate-900">
              రహస్య అడ్మిన్ లాగిన్
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Secret Admin Portal Verification
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-6 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">
              ఈ విభాగం కేవలం అధికారులకు మాత్రమే
            </p>
            <p className="text-[11px] text-slate-500">
              Enter secret PIN to unlock Scheme Curation & Publishing tools.
            </p>
          </div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              అడ్మిన్ రహస్య పిన్ (Secret Passcode)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="ఎంటర్ పిన్ (e.g. 1234)"
                autoFocus
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-slate-900 text-sm font-mono font-bold tracking-widest outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* PIN Hint */}
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>డిఫాల్ట్ పిన్ / Passcode: <strong className="font-mono text-emerald-700 font-bold">1234</strong></span>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center gap-2 font-medium animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>అమాన్యమైన పిన్! దయచేసి సరైన రహస్య పిన్ (1234) నమోదు చేయండి.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              రద్దు చేయి (Cancel)
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>అన్‌లాక్ చేయండి (Unlock)</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
