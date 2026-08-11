const fs = require('fs');
let code = fs.readFileSync('src/lib/autoFetcher.ts', 'utf8');

const replacement = `// Better duplicate checking using core scheme keywords
const CORE_KEYWORDS = [
  'surya ghar', 'mahalakshmi', 'vishwakarma', 'pm-jay', 'ayushman', 'pm-kisan', 'kisan samman', 
  'awas yojana', 'pmay', 'mudra', 'garib kalyan', 'annadata', 'pension', 'jan dhan', 'sukanya', 
  'kisan vikas', 'digital citizen'
];

export function checkIsDuplicate(
  title: string,
  sourceUrl: string = '',
  existingArticles: Article[] = [],
  existingPipeline: NewsPipelineItem[] = []
): { isDuplicate: boolean; reason?: string } {
  const normTitle = normalizeText(title);
  const titleLower = title.toLowerCase();
  const matchedKeyword = CORE_KEYWORDS.find(kw => titleLower.includes(kw));

  for (const art of existingArticles) {
    const artNorm = normalizeText(art.title);
    const artTelNorm = normalizeText(art.titleTelugu || '');

    if (artNorm === normTitle || (artTelNorm && artTelNorm === normTitle)) {
      return { isDuplicate: true, reason: \`Exact title match with existing article: "\${art.title}"\` };
    }

    if (art.source?.url && sourceUrl && art.source.url === sourceUrl) {
      return { isDuplicate: true, reason: \`Source URL already exists in database: \${sourceUrl}\` };
    }

    if (matchedKeyword && art.title.toLowerCase().includes(matchedKeyword)) {
       return { isDuplicate: true, reason: \`Scheme already exists based on keyword "\${matchedKeyword}" in "\${art.title}"\` };
    }

    // High similarity check (if titles match 85%+ character overlap)
    if (artNorm.length > 10 && normTitle.length > 10) {
      if (artNorm.includes(normTitle) || normTitle.includes(artNorm)) {
        return { isDuplicate: true, reason: \`High title similarity with article: "\${art.title}"\` };
      }
    }
  }

  for (const pipe of existingPipeline) {
    const pipeNorm = normalizeText(pipe.sourceTitle);
    
    if (pipeNorm === normTitle) {
      return { isDuplicate: true, reason: \`Matches existing news pipeline item: "\${pipe.sourceTitle}"\` };
    }
    
    if (matchedKeyword && pipe.sourceTitle.toLowerCase().includes(matchedKeyword)) {
       return { isDuplicate: true, reason: \`Matches existing pipeline item based on keyword "\${matchedKeyword}" in "\${pipe.sourceTitle}"\` };
    }

    if (pipe.sourceUrl && sourceUrl && pipe.sourceUrl === sourceUrl) {
      return { isDuplicate: true, reason: \`Source URL in pipeline: \${sourceUrl}\` };
    }
  }

  return { isDuplicate: false };
}`;

// regex from export function checkIsDuplicate to return { isDuplicate: false };}
code = code.replace(/export function checkIsDuplicate\([\s\S]*?return \{ isDuplicate: false \};\n\}/, replacement);
fs.writeFileSync('src/lib/autoFetcher.ts', code);
