import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Bookmark,
  Share2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  HelpCircle,
  Building2,
  Calendar,
  Sparkles,
  Check,
  Printer,
  Globe,
  Grid
} from 'lucide-react';
import { Article } from '../types';
import { Language } from '../lib/translations';
import { getSchemeImages } from '../lib/schemeImageLibrary';

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  lang?: Language;
  allArticles?: Article[];
  onSelectArticle?: (article: Article) => void;
  savedArticleIds?: string[];
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  isSaved,
  onToggleSave,
  lang: initialLang = 'te',
  allArticles = [],
  onSelectArticle,
  savedArticleIds = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>(initialLang);

  const relatedSchemes = useMemo(() => {
    if (!allArticles || allArticles.length === 0) return [];

    const sameCategory = allArticles.filter(
      (a) => a.id !== article.id && a.category === article.category
    );
    const sameState = allArticles.filter(
      (a) => a.id !== article.id && a.category !== article.category && a.state === article.state
    );
    const others = allArticles.filter(
      (a) => a.id !== article.id && a.category !== article.category && a.state !== article.state
    );

    const combined = [...sameCategory, ...sameState, ...others];
    return combined.slice(0, 4);
  }, [allArticles, article.id, article.category, article.state]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.shortSummary,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isTelugu = activeLang === 'te';
  const displayTitle = (isTelugu && article.titleTelugu) ? article.titleTelugu : article.title;
  const displaySummary = (isTelugu && article.shortSummaryTelugu) ? article.shortSummaryTelugu : article.shortSummary;
  const displayWhatIsScheme = (isTelugu && article.whatIsSchemeTelugu) ? article.whatIsSchemeTelugu : article.whatIsScheme;
  const displayWhatHappened = (isTelugu && article.whatHappenedTelugu) ? article.whatHappenedTelugu : article.whatHappened;

  return (
    <article className="min-h-screen bg-slate-50/50 pb-20 pt-6 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Action Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Schemes</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Telugu / English Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveLang('te')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  isTelugu
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>తెలుగు</span>
              </button>
              <button
                onClick={() => setActiveLang('en')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !isTelugu
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs relative"
              title="Share Scheme"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => onToggleSave(e, article.id)}
              className={`p-2 rounded-xl border transition-colors shadow-2xs ${
                isSaved
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-800'
              }`}
              title={isSaved ? 'Saved in My Schemes' : 'Save Scheme'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs hidden sm:block"
              title="Print Summary Guide"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Article Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
          
          {/* Hero Image & Metadata Banner */}
          <div className="relative aspect-21/9 bg-slate-900 overflow-hidden">
            <img
              src={article.generatedImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                  {article.category}
                </span>
                <span className="bg-slate-800/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-slate-200 border border-white/20">
                  {article.state}
                </span>
                {article.isNew && (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                    NEW UPDATE
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-100 leading-snug">
                {displayTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
                <span>{isTelugu ? 'ప్రచురించబడింది' : 'Published'}: {new Date(article.publishedAt).toLocaleDateString(isTelugu ? 'te-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{isTelugu ? 'ధృవీకరించబడింది' : 'Verified'}: {new Date(article.lastVerifiedAt).toLocaleDateString(isTelugu ? 'te-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {article.readTimeMinutes} {isTelugu ? 'నిమిషాల చదువు' : 'min read'}
                </span>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 sm:p-10 space-y-10">

            {/* Verification Status Badge Header */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-950">
                      {isTelugu ? 'అధికారిక ప్రభుత్వ మూలం ధృవీకరించబడింది' : 'Official Government Source Verified'}
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Pass
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    {isTelugu ? 'శాఖ నుండి సేకరించబడింది:' : 'Verified from'} {article.source.department} ({article.source.domain})
                  </p>
                </div>
              </div>

              <a
                href={article.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{isTelugu ? 'అధికారిక పోర్టల్‌లో దరఖాస్తు చేయండి' : 'Apply on Official Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Short Summary Callout */}
            <div className="bg-slate-50 border-l-4 border-slate-900 p-5 rounded-r-2xl">
              <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed">
                {displaySummary}
              </p>
            </div>

            {/* SECTION 1: What Happened? */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {isTelugu ? 'ఏమి జరిగింది? (ముఖ్య సమాచారం)' : 'What Happened?'}
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {displayWhatHappened}
              </p>
            </section>

            {/* SECTION 2: What Is This Scheme? */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                {isTelugu ? 'ఈ పథకం ఏమిటి? (పూర్తి వివరాలు)' : 'What Is This Scheme?'}
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {displayWhatIsScheme}
              </p>
            </section>

            {/* SECTION 3: What Benefit Will You Get? */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {isTelugu ? 'మీకు లభించే లబ్ధి / ప్రయోజనాలు' : 'What Benefit Will You Get?'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.benefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 hover:border-emerald-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                          {benefit.type}
                        </span>
                        {benefit.amount && (
                          <span className="bg-emerald-700 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                            {benefit.amount}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4 & 5: Who Can Apply? & Who Cannot Apply? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Who Can Apply */}
              <section className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-emerald-200 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {isTelugu ? 'ఎవరు దరఖాస్తు చేసుకోవచ్చు? (అర్హతలు)' : 'Who Can Apply?'}
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {article.whoCanApply.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Who Cannot Apply */}
              <section className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-rose-200 pb-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  {isTelugu ? 'ఎవరు అర్హులు కారు? (అనర్హతలు)' : 'Who Cannot Apply?'}
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {article.whoCannotApply.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* SECTION 6: Documents Required */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {isTelugu ? 'కావలసిన పత్రాల జాబితా (డాక్యుమెంట్లు)' : 'Documents Required Checklist'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {article.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{doc.name}</span>
                        {doc.required && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 7: How To Apply (Visual Timeline) */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                How To Apply — Step-by-Step Guide
              </h2>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {article.steps.map((step) => (
                  <div key={step.stepNumber} className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {step.stepNumber}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {step.description}
                      </p>
                      {step.tip && (
                        <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/80 font-medium">
                          <strong>Pro Tip:</strong> {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: Deadline & Application Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  Application Deadline
                </div>
                <p className="text-xl font-serif font-bold text-slate-100">
                  {article.deadline || 'Ongoing Official Window'}
                </p>
                <p className="text-xs text-slate-400">
                  Always submit applications ahead of window closures.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  How to Check Status
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {article.statusCheckGuide}
                </p>
              </div>

            </div>

            {/* SECTION: In-depth Guide (AdSense Rich Content) */}
            {(article.detailedGuideText || article.detailedGuideTextTelugu) && (
              <section className="space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  {isTelugu ? 'వివరమైన మార్గదర్శి & పూర్తి సమాచారం' : 'Comprehensive Scheme Guide & Analysis'}
                </h2>
                
                <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3">
                  {(isTelugu && article.detailedGuideTextTelugu) ? article.detailedGuideTextTelugu : article.detailedGuideText}
                </div>

                {/* Content-based WebP Images */}
                {(() => {
                  const imagesToRender = (article.contentImages && article.contentImages.length > 0)
                    ? article.contentImages
                    : getSchemeImages(article.title, article.category, article.state).contentImages;

                  if (!imagesToRender || imagesToRender.length === 0) return null;

                  return (
                    <div className="pt-4 border-t border-slate-200/80 space-y-4">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isTelugu ? 'పథకం ఆన్‌లైన్ దరఖాస్తు & పత్రాల ప్రక్రియ దృశ్యాలు' : 'Official Portal & Document Process Visuals'}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {imagesToRender.map((img, idx) => (
                          <div key={idx} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                            <div className="aspect-16/10 bg-slate-100 overflow-hidden relative">
                              <img
                                src={img.url}
                                alt={img.caption}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3 bg-slate-50 border-t border-slate-100">
                              <p className="text-xs font-semibold text-slate-800 leading-snug">
                                {(isTelugu && img.captionTelugu) ? img.captionTelugu : img.caption}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* SECTION: Frequently Asked Questions (FAQs) */}
            {article.faqs && article.faqs.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  {isTelugu ? 'తరచుగా అడిగే ప్రశ్నలు & సమాధానాలు (FAQs)' : 'Frequently Asked Questions (FAQs)'}
                </h2>

                <div className="space-y-3">
                  {article.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                        <span className="text-emerald-700 font-extrabold">Q:</span>
                        <span>{(isTelugu && faq.questionTelugu) ? faq.questionTelugu : faq.question}</span>
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm pl-6 leading-relaxed">
                        {(isTelugu && faq.answerTelugu) ? faq.answerTelugu : faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 9: Important Warnings */}
            {article.importantWarnings && article.importantWarnings.length > 0 && (
              <section className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Important Information & Limitations
                </h3>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {article.importantWarnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* SECTION 10: Source Verification Box */}
            <section className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Source Verification Record
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-900">Official Department:</span>{' '}
                  {article.source.department}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Source Domain:</span>{' '}
                  {article.source.domain}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Verified Date:</span>{' '}
                  {article.source.verifiedDate}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Verification Status:</span>{' '}
                  <span className="text-emerald-700 font-bold uppercase">{article.source.verificationStatus}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  View Original Source Release ({article.source.name}) <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>

            {/* Platform Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-[11px] leading-relaxed">
              <strong>RationQ Transparency Disclaimer:</strong> RationQ is an independent citizen intelligence platform and is NOT a government agency. Always verify official notifications on original government portals before submitting personal documents or payments.
            </div>

            {/* Bottom Apply Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ← Back to All Schemes
              </button>

              <a
                href={article.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <span>Proceed to Official Government Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

        {/* RELATED SCHEMES SECTION */}
        {relatedSchemes.length > 0 && (
          <div className="mt-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1">
                  <Grid className="w-3 h-3 text-emerald-700" />
                  <span>{isTelugu ? 'మరిన్ని సలహా పథకాలు' : 'More Welfare Recommendations'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                  {isTelugu
                    ? `${article.category} కేటగిరీకి సంబంధిత ఇతర పథకాలు`
                    : `Related Schemes in ${article.category}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTelugu
                    ? 'మీ కుటుంబ అర్హతకు ఉపయోగపడే మరిన్ని సంక్షేమ కార్యక్రమాలు చూడండి'
                    : 'Explore additional eligible welfare schemes for citizens and families'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedSchemes.map((relScheme) => {
                const relTitle = (isTelugu && relScheme.titleTelugu) ? relScheme.titleTelugu : relScheme.title;
                const relSummary = (isTelugu && relScheme.shortSummaryTelugu) ? relScheme.shortSummaryTelugu : relScheme.shortSummary;
                const isRelSaved = savedArticleIds.includes(relScheme.id);

                return (
                  <div
                    key={relScheme.id}
                    onClick={() => {
                      if (onSelectArticle) onSelectArticle(relScheme);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                        <img
                          src={relScheme.generatedImage}
                          alt={relScheme.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                            {relScheme.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSave(e, relScheme.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                              isRelSaved
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white/90 border-slate-200 text-slate-700 hover:text-emerald-800'
                            }`}
                            title={isRelSaved ? 'Saved' : 'Save'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-3 right-3 text-[10px] text-slate-200 font-medium">
                          <span className="bg-slate-950/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10">
                            📍 {relScheme.state}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {relTitle}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {relSummary}
                        </p>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs border-t border-slate-100 mt-2">
                      <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {relScheme.readTimeMinutes} {isTelugu ? 'నిమి' : 'min'}
                      </span>
                      <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{isTelugu ? 'పూర్తి వివరాలు' : 'Read Guide'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
