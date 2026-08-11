const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
  app.post('/api/admin/auto-fetch/ai-crawl', async (req: Request, res: Response) => {
    try {
      const { stateName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const searchTarget = stateName ? \`latest official government schemes launched in \${stateName}, India within the last 3 months\` : 'latest central government schemes launched in India';
      
      const prompt = \`Search the web for the \${searchTarget}. Pick ONE real, officially announced government scheme (not older than 6 months) and return a detailed JSON object representing it.
Return ONLY valid JSON matching this schema:
{
  "title": "Scheme Name",
  "titleTelugu": "Scheme Name in Telugu",
  "shortSummary": "1-2 lines",
  "shortSummaryTelugu": "1-2 lines in Telugu",
  "whatHappened": "What was recently announced?",
  "whatHappenedTelugu": "In Telugu",
  "whatIsScheme": "Description",
  "whatIsSchemeTelugu": "Description in Telugu",
  "benefits": [{ "id": "b1", "title": "Benefit", "amount": "₹5000", "type": "financial", "description": "Details" }],
  "whoCanApply": ["Condition 1"],
  "whoCannotApply": ["Condition 1"],
  "documents": [{ "id": "d1", "name": "Aadhaar", "required": true, "description": "Proof" }],
  "steps": [{ "stepNumber": 1, "title": "Apply", "description": "Details" }],
  "officialWebsite": "https://example.gov.in",
  "category": "Government Schemes",
  "state": "\${stateName || 'Central Government'}",
  "isCentral": \${!stateName},
  "readTimeMinutes": 3,
  "faqs": [{ "question": "Q", "answer": "A", "questionTelugu": "Q in Te", "answerTelugu": "A in Te" }],
  "source": {
    "name": "Official Source Name",
    "url": "https://example.gov.in",
    "domain": "example.gov.in",
    "type": "portal",
    "verifiedDate": "\${new Date().toISOString().split('T')[0]}",
    "verificationStatus": "verified",
    "department": "Department Name"
  }
}
Do not include markdown blocks like \\\`\\\`\\\`json. Return pure JSON.\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        // Strip markdown if AI still returned it
        const cleaned = text.replace(/^\\\`\\\`\\\`(json)?\\n/, '').replace(/\\\n\\\`\\\`\\\`$/, '');
        parsedData = JSON.parse(cleaned);
      }

      const articleId = \`ai-fetched-\${Date.now()}\`;
      const slug = parsedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newArticle: Article = {
        ...parsedData,
        id: articleId,
        slug: slug || articleId,
        schemeId: \`GOI-\${Math.floor(1000 + Math.random() * 9000)}\`,
        status: 'published',
        publishedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        isNew: true,
        isUpdated: false,
        generatedImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200'
      };

      await saveArticleToStore(newArticle);

      res.json({ success: true, article: newArticle, message: \`Successfully fetched and published AI scheme for \${stateName || 'Central'}\` });

    } catch (err: any) {
      console.error('AI Crawl Error:', err);
      res.status(500).json({ error: 'Failed to run AI Crawler', message: err.message });
    }
  });

  app.post('/api/admin/auto-fetch/toggle'`;

code = code.replace("  app.post('/api/admin/auto-fetch/toggle'", injection);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
