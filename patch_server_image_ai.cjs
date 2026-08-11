const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const imageAiEndpoints = `
  // AI Feature Image Prompt Generator Endpoint
  app.post('/api/admin/generate-image-prompt', async (req: Request, res: Response) => {
    try {
      const { title = '', category = '', state = '', shortSummary = '' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured.' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = \`You are an expert AI photo prompt engineer for Indian government scheme portals. Create a vivid, highly photorealistic 1-sentence image generation prompt in English for a hero image representing this government scheme:
Title: \${title}
Category: \${category}
State: \${state}
Summary: \${shortSummary}

Requirements:
- Photorealistic Indian context (farmers, students, women, digital India, solar, housing, etc.)
- Bright, authentic, professional aesthetic suitable for a news portal
- Return ONLY valid JSON: {"prompt": "A photorealistic high definition image of..."}\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text || '{}';
      let parsed = { prompt: \`Photorealistic Indian government scheme illustration for \${title}, bright cinematic lighting, authentic\` };
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.warn('Fallback prompt parsing');
      }

      res.json({ success: true, prompt: parsed.prompt });
    } catch (err: any) {
      console.error('Image prompt error:', err);
      res.status(500).json({ error: 'Failed to generate prompt', message: err.message });
    }
  });

  // AI Feature Image Generator Endpoint
  app.post('/api/admin/generate-feature-image', async (req: Request, res: Response) => {
    try {
      const { prompt = '', title = '', category = '', state = '' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      let keywords = prompt || \`\${title} \${category} \${state}\`;
      
      if (apiKey) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey });
          const extractPrompt = \`Extract 3-4 English visual keywords (comma separated) for an Unsplash photo search based on this description: "\${keywords}"\`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: extractPrompt,
          });
          if (response.text) {
            keywords = response.text.trim().replace(/[^a-zA-Z0-9, ]/g, '');
          }
        } catch (e) {
          console.warn('Keyword extraction fallback');
        }
      }

      const schemeImgs = getSchemeImages(title, category, state, keywords);
      const imageUrl = schemeImgs.heroImage;

      res.json({ success: true, imageUrl, prompt });
    } catch (err: any) {
      console.error('Feature image gen error:', err);
      res.status(500).json({ error: 'Failed to generate feature image', message: err.message });
    }
  });

  app.post('/api/admin/auto-fetch/toggle'`;

code = code.replace("  app.post('/api/admin/auto-fetch/toggle'", imageAiEndpoints);
fs.writeFileSync('server.ts', code);
console.log('Patched server.ts with Image AI endpoints');
