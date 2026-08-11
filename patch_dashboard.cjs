const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const stateInjection = `
  const [triggeringAutoFetch, setTriggeringAutoFetch] = useState(false);
  const [runningAiCrawler, setRunningAiCrawler] = useState(false);
  const [aiCrawlerStateQuery, setAiCrawlerStateQuery] = useState('');
  const [aiCrawlerMsg, setAiCrawlerMsg] = useState<string | null>(null);
`;
code = code.replace("  const [triggeringAutoFetch, setTriggeringAutoFetch] = useState(false);", stateInjection);

const fnInjection = `
  const handleManualAutoFetchTrigger = async () => {
    setTriggeringAutoFetch(true);
    setAutoFetchMsg(null);
    try {
      const data = await safeFetchJson<{ message?: string; status?: any }>('/api/admin/auto-fetch/trigger', { method: 'POST' });
      if (data) {
        if (data.message) setAutoFetchMsg(data.message);
        if (data.status) setAutoFetchStatus(data.status);
      } else {
        setAutoFetchMsg('Sync completed or using offline mode.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringAutoFetch(false);
    }
  };

  const handleRunAiCrawler = async () => {
    setRunningAiCrawler(true);
    setAiCrawlerMsg(null);
    try {
      const data = await safeFetchJson<{ success?: boolean; article?: Article; message?: string }>('/api/admin/auto-fetch/ai-crawl', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stateName: aiCrawlerStateQuery })
      });
      if (data && data.success) {
        setAiCrawlerMsg(\`🤖 AI Successfully fetched & published: "\${data.article?.title}"\`);
        onArticlePublished();
      } else {
        setAiCrawlerMsg('AI Crawler completed with error or using offline mode. Check logs.');
      }
    } catch (err) {
      console.error(err);
      setAiCrawlerMsg('❌ Error running AI crawler.');
    } finally {
      setRunningAiCrawler(false);
    }
  };
`;

code = code.replace(/  const handleManualAutoFetchTrigger = async \(\) => \{[\s\S]*?finally \{\s*setTriggeringAutoFetch\(false\);\s*\}\s*\};/, fnInjection);

const uiInjection = `
      {/* 10-Minute Auto Fetcher Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-xl space-y-4">
        
        {/* Gemini AI Smart Crawler Section */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-blue-300 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Gemini AI Smart Crawler (All States)
              </h3>
              <p className="text-[11px] text-slate-400">Search the internet via Gemini AI to fetch real-time scheme data for any state.</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="State Name (e.g., Telangana)"
                value={aiCrawlerStateQuery}
                onChange={(e) => setAiCrawlerStateQuery(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 w-full sm:w-48 outline-none focus:border-blue-500"
              />
              <button
                onClick={handleRunAiCrawler}
                disabled={runningAiCrawler}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                <Search className={\`w-3.5 h-3.5 \${runningAiCrawler ? 'animate-pulse' : ''}\`} />
                {runningAiCrawler ? 'Searching Web...' : 'AI Web Fetch'}
              </button>
            </div>
          </div>
          
          {aiCrawlerMsg && (
            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
              {aiCrawlerMsg}
            </div>
          )}
        </div>
`;

code = code.replace("{/* 10-Minute Auto Fetcher Box */}\n      <div className=\"p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 shadow-xl space-y-4\">", uiInjection);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
