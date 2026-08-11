const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add Image AI states if not present
if (!code.includes('aiImagePrompt')) {
  const stateInjection = `  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenSuccessMsg, setImageGenSuccessMsg] = useState<string | null>(null);
`;

  code = code.replace(
    "  const [aiCrawlerMsg, setAiCrawlerMsg] = useState<string | null>(null);",
    "  const [aiCrawlerMsg, setAiCrawlerMsg] = useState<string | null>(null);\n" + stateInjection
  );
}

// 2. Add handlers if not present
if (!code.includes('handleGenerateImagePrompt')) {
  const handlersInjection = `
  const handleGenerateImagePrompt = async () => {
    setGeneratingPrompt(true);
    setImageGenSuccessMsg(null);
    try {
      const data = await safeFetchJson<{ success?: boolean; prompt?: string }>('/api/admin/generate-image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingArticle.title,
          category: editingArticle.category,
          state: editingArticle.state,
          shortSummary: editingArticle.shortSummary,
        }),
      });
      if (data && data.prompt) {
        setAiImagePrompt(data.prompt);
        setImageGenSuccessMsg('✨ AI Image Prompt generated successfully! Click "Generate Feature Image" below.');
      } else {
        setAiImagePrompt("Photorealistic hero image depicting Indian citizens benefiting from " + (editingArticle.title || 'government welfare scheme') + ", warm lighting, highly detailed");
        setImageGenSuccessMsg('✨ Prompt generated with local template.');
      }
    } catch (err) {
      console.error(err);
      setImageGenSuccessMsg('❌ Error generating image prompt.');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleGenerateFeatureImage = async () => {
    setGeneratingImage(true);
    setImageGenSuccessMsg(null);
    try {
      const data = await safeFetchJson<{ success?: boolean; imageUrl?: string }>('/api/admin/generate-feature-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiImagePrompt || editingArticle.title,
          title: editingArticle.title,
          category: editingArticle.category,
          state: editingArticle.state,
        }),
      });
      if (data && data.imageUrl) {
        setEditingArticle(prev => ({ ...prev, generatedImage: data.imageUrl }));
        setImageGenSuccessMsg('🎨 Feature image successfully generated and updated for this article!');
      } else {
        setImageGenSuccessMsg('❌ Failed to update feature image.');
      }
    } catch (err) {
      console.error(err);
      setImageGenSuccessMsg('❌ Error generating feature image.');
    } finally {
      setGeneratingImage(false);
    }
  };
`;

  code = code.replace("  const handleRunAiCrawler = async () => {", handlersInjection + "\n  const handleRunAiCrawler = async () => {");
}

// 3. Add UI in the Editor section if not present
if (!code.includes('AI Feature Image & Prompt Generator')) {
  const editorUiSection = `
          {/* AI Feature Image & Prompt Generator Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800 text-white space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/80 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  🎨 AI Feature Image & Prompt Generator (ఆటోమేటిక్ ఇమేజ్ జనరేటర్)
                </h3>
                <p className="text-[11px] text-slate-300">
                  Generate an AI prompt based on article details, then click to generate and attach a high-definition feature image.
                </p>
              </div>

              {editingArticle.generatedImage && (
                <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shrink-0">
                  <img
                    src={editingArticle.generatedImage}
                    alt="Current Feature"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-600 shadow"
                  />
                  <div className="text-[10px] text-emerald-400 font-bold">Live Feature Image</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                  Feature Image URL (డైరెక్ట్ ఇమేజ్ లింక్)
                </label>
                <input
                  type="text"
                  value={editingArticle.generatedImage || ''}
                  onChange={e => setEditingArticle({ ...editingArticle, generatedImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    AI Image Prompt (ఇమేజ్ ప్రాంప్ట్)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateImagePrompt}
                    disabled={generatingPrompt}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={"w-3.5 h-3.5 " + (generatingPrompt ? 'animate-spin' : '')} />
                    <span>{generatingPrompt ? 'Creating Prompt...' : '✨ Create Prompt with Gemini'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={aiImagePrompt}
                  onChange={e => setAiImagePrompt(e.target.value)}
                  placeholder='Click "Create Prompt with Gemini" or type custom image prompt here...'
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-300 font-medium">
                {imageGenSuccessMsg ? (
                  <span className="text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {imageGenSuccessMsg}
                  </span>
                ) : (
                  <span>💡 Tip: Click "Create Prompt" first, then "Generate & Update Image".</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateFeatureImage}
                disabled={generatingImage}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                <Sparkles className={"w-4 h-4 " + (generatingImage ? 'animate-spin' : '')} />
                <span>{generatingImage ? 'Generating Image...' : '🖼️ Generate & Update Feature Image'}</span>
              </button>
            </div>
          </div>
`;

  code = code.replace(
    '<div className="space-y-1">\n            <label className="text-xs font-bold text-slate-700 uppercase">Short Summary (1-2 Sentences)</label>',
    editorUiSection + '\n          <div className="space-y-1">\n            <label className="text-xs font-bold text-slate-700 uppercase">Short Summary (1-2 Sentences)</label>'
  );
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Successfully patched AdminDashboard.tsx');
