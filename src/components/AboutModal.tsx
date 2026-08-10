import React from 'react';
import { ShieldCheck, Info, X, CheckCircle2, FileText, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-lg font-serif">About RationQ & Trust Framework</h3>
              <p className="text-xs text-slate-400">Government Schemes. Explained Simply.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-950 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Our Core Purpose: Discover → Verify → Explain → Guide
            </h4>
            <p className="text-emerald-900">
              RationQ is an India-focused government scheme intelligence platform. Our mission is to bridge the gap between complex government notifications and citizen understanding by providing verified, simplified, and structured application guides.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base">Verified Source Hierarchy</h4>
            <p className="text-slate-600">
              Every scheme published on RationQ is directly verified against official government channels:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
              <li>Press Information Bureau (PIB)</li>
              <li>Union & State Ministry Official Websites</li>
              <li>myScheme & India.gov.in Official Portals</li>
              <li>State Revenue & Agriculture Portals (e.g. Dharani, MahaDBT)</li>
            </ul>
          </div>

          <div className="space-y-2 bg-amber-50 p-4 rounded-2xl border border-amber-200/80">
            <h4 className="font-bold text-amber-950 text-sm">Transparency & Independent Disclaimer</h4>
            <p className="text-amber-900 text-xs">
              RationQ is an independent information platform and is NOT a government website or agency. We do not collect money or processing fees. Always verify important application steps and submit documents directly on official government portals (e.g. .gov.in, .nic.in).
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
