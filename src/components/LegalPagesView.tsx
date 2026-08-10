import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Mail, FileText, Lock, AlertTriangle, Info, Send, CheckCircle2, Building, MapPin, Phone } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'disclaimer' | 'contact' | 'about';

interface LegalPagesViewProps {
  initialTab?: LegalTab;
  onNavigateHome: () => void;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({
  initialTab = 'privacy',
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'privacy':
        return 'Privacy Policy | RationQ - Welfare Scheme Intelligence Portal';
      case 'terms':
        return 'Terms of Service | RationQ';
      case 'disclaimer':
        return 'Government Non-Affiliation Disclaimer | RationQ';
      case 'contact':
        return 'Contact Us & Editorial Support | RationQ';
      case 'about':
        return 'About Us & Verification Standards | RationQ';
      default:
        return 'Important Policy Pages | RationQ';
    }
  };

  const getPageMetaDescription = () => {
    switch (activeTab) {
      case 'privacy':
        return 'Read the Privacy Policy for RationQ. Understand how we handle data, Google AdSense cookies, DART cookies, and user privacy rights.';
      case 'terms':
        return 'Review the Terms of Service for RationQ, outlining information usage guidelines, independent citizen service rules, and terms of use.';
      case 'disclaimer':
        return 'Official disclaimer for RationQ: We are an independent information portal and are not affiliated with any government department or ministry.';
      case 'contact':
        return 'Contact RationQ team for editorial feedback, scheme corrections, support, and inquiries.';
      case 'about':
        return 'Learn about RationQ - our mission to provide verified, clear welfare scheme information in Telugu and English for citizens.';
      default:
        return 'Important compliance and policy pages for RationQ.';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageMetaDescription()} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageMetaDescription()} />
      </Helmet>

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={onNavigateHome} className="hover:text-emerald-700 font-medium">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-900 font-bold capitalize">{activeTab.replace('-', ' ')}</span>
      </div>

      {/* Top Header Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AdSense & Transparency Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            Important Information & Policy Portal
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            RationQ is committed to maximum transparency, accurate citizen information, and full compliance with Google AdSense Policies and Webmaster Quality Guidelines.
          </p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'privacy'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'terms'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={() => setActiveTab('disclaimer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'disclaimer'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Disclaimer</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'contact'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact Us</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'about'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Us</span>
        </button>
      </div>

      {/* Content Panels */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-800 space-y-6">
        
        {/* PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 text-sm text-slate-700">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 font-serif mb-1">Privacy Policy</h2>
              <p className="text-xs text-slate-500">Last updated: August 2026 • RationQ Information Portal</p>
            </div>

            <p>
              At <strong>RationQ</strong> (accessible from our web portal), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by RationQ and how we use it.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">1. Google DoubleClick DART Cookie & AdSense Cookies</h3>
            <p>
              Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our portal and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL –{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">
                https://policies.google.com/technologies/ads
              </a>.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">2. Third-Party Advertising Partners</h3>
            <p>
              Some of advertisers on our site may use cookies and web beacons. Our advertising partners include Google AdSense. Third-party ad servers or ad networks use technology in their respective advertisements and links that appear on RationQ, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            </p>
            <p className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs italic text-slate-600">
              Note: RationQ has no access to or control over these cookies that are used by third-party advertisers.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">3. Log Files</h3>
            <p>
              RationQ follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">4. Children's Information & Privacy</h3>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. RationQ does not knowingly collect any Personal Identifiable Information from children under the age of 13.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">5. User Consent</h3>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </div>
        )}

        {/* TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className="space-y-6 text-sm text-slate-700">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 font-serif mb-1">Terms of Service</h2>
              <p className="text-xs text-slate-500">Effective Date: August 2026 • RationQ Terms of Use</p>
            </div>

            <p>
              Welcome to <strong>RationQ</strong>. By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are advised not to use our portal.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">1. Educational & Informational Purpose Only</h3>
            <p>
              RationQ is an independent welfare scheme intelligence portal created solely to educate and inform citizens in Andhra Pradesh, Telangana, and across India about public welfare initiatives, eligibility criteria, application steps, and verified guidelines.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">2. Non-Governmental Entity</h3>
            <p>
              RationQ is a non-governmental, privately operated platform. We do not process government applications, issue cards, collect official fees, or guarantee scheme approvals. For official applications, users must visit official government portals such as myScheme.gov.in, AP Seva, or TG Meeseva.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">3. Accuracy of Information</h3>
            <p>
              While our editorial team strives to verify every article against official Press Information Bureau (PIB) releases and official gazettes, government rules and deadlines change periodically. RationQ is not liable for errors, omissions, or outdated criteria.
            </p>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">4. Intellectual Property</h3>
            <p>
              All original content, summaries, translations into Telugu and Hindi, and custom guides hosted on RationQ are protected by copyright. Unauthorised copying, scraping, or republishing without proper attribution is prohibited.
            </p>
          </div>
        )}

        {/* DISCLAIMER */}
        {activeTab === 'disclaimer' && (
          <div className="space-y-6 text-sm text-slate-700">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 font-serif mb-1">Government Non-Affiliation Disclaimer</h2>
              <p className="text-xs text-slate-500">Important Legal Notice for All Visitors</p>
            </div>

            <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>CRITICAL NOTICE:</strong> RationQ is an <strong>INDEPENDENT CITIZEN INFORMATION PORTAL</strong>. We are NOT associated, affiliated, endorsed, or sponsored by any Union Government ministry, State Government, or Grama/Ward Sachivalayam.
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">Official Sources & References</h3>
            <p>
              All scheme names, logos, acronyms, and official terms mentioned on RationQ are the trademarked property of their respective government bodies. We refer to them purely for informational, educational, and public-interest guidance.
            </p>
            <p>
              Official websites for verification:
            </p>
            <ul className="list-disc list-inside space-y-1 font-semibold text-emerald-800">
              <li>Central Government Portal: <a href="https://www.myscheme.gov.in" target="_blank" rel="noreferrer" className="underline">myscheme.gov.in</a></li>
              <li>Andhra Pradesh Govt: <a href="https://gramawardsachivalayam.ap.gov.in" target="_blank" rel="noreferrer" className="underline">gramawardsachivalayam.ap.gov.in</a></li>
              <li>Telangana Govt: <a href="https://telangana.gov.in" target="_blank" rel="noreferrer" className="underline">telangana.gov.in</a></li>
            </ul>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">No Fee Collection Notice</h3>
            <p>
              RationQ <strong>NEVER charges money</strong> or asks for personal identification details (like Aadhaar OTP, Bank PIN, or Passwords) to access scheme details or check eligibility. Please be cautious of fraudsters pretending to represent government departments.
            </p>
          </div>
        )}

        {/* CONTACT US */}
        {activeTab === 'contact' && (
          <div className="space-y-6 text-sm text-slate-700">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 font-serif mb-1">Contact Us & Editorial Support</h2>
              <p className="text-xs text-slate-500">Have questions, feedback, or spot an outdated scheme detail? Reach out to us.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <Mail className="w-5 h-5 text-emerald-700 mb-2" />
                <div className="text-xs font-bold text-slate-900">Email Editorial Team</div>
                <div className="text-xs text-slate-600">contact@rationq.in</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <MapPin className="w-5 h-5 text-emerald-700 mb-2" />
                <div className="text-xs font-bold text-slate-900">Coverage Location</div>
                <div className="text-xs text-slate-600">Andhra Pradesh, Telangana & Pan-India</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
                <div className="text-xs font-bold text-slate-900">Verification Turnaround</div>
                <div className="text-xs text-slate-600">Within 24-48 Hours</div>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-6 rounded-2xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-base">మీ సందేశం చేరింది! (Message Sent Successfully)</h3>
                <p className="text-xs text-emerald-800">
                  Thank you for contacting the RationQ editorial desk. Our team will review your query and update the relevant scheme article if necessary.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1">మీ పేరు (Full Name) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1">ఇమెయిల్ అడ్రస్ (Email Address) *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">విషయం (Subject) *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Correction needed in Rythu Bharosa guide"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">సందేశం (Your Message) *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please write your detailed feedback or inquiry here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Editorial Team</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ABOUT US */}
        {activeTab === 'about' && (
          <div className="space-y-6 text-sm text-slate-700">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 font-serif mb-1">About RationQ Portal</h2>
              <p className="text-xs text-slate-500">Bridging the Information Gap for Citizens in Telugu & English</p>
            </div>

            <p>
              <strong>RationQ</strong> was founded with a clear citizen-first mission: to simplify complex government scheme notifications, welfare rules, and eligibility criteria into clear, easy-to-understand guides in Telugu and English.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="font-extrabold text-emerald-900 mb-1">🎯 Citizen First Mission</div>
                <div className="text-xs text-emerald-800 leading-relaxed">
                  Millions of eligible families miss out on government welfare benefits simply because official circulars are written in complex bureaucratic jargon. RationQ breaks them down into 1000+ word verified step-by-step guides.
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <div className="font-extrabold text-slate-900 mb-1">🔍 Verification Standards</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Every scheme article on RationQ includes official source cross-checks, verified document checklists, helpline numbers, and direct application links to government portals.
                </div>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 pt-2">Key Categories Covered</h3>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">🌾 Farmers & Agriculture (రైతు సంక్షేమం)</span>
              <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">👩 Women & Children (మహిళా సంక్షేమం)</span>
              <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">🎓 Education & Youth (విద్య & నిరుద్యోగం)</span>
              <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">👵 Pensions & Healthcare (పెన్షన్ & ఆరోగ్యం)</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
