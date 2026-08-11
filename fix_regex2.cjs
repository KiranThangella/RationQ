const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\/\/ Strip markdown if AI still returned it[\s\S]*?parsedData = JSON\.parse\(cleaned\);/, 
  "// Strip markdown if AI still returned it\n        const cleaned = text.replace(/^```(json)?\\n/i, '').replace(/\\n```$/i, '');\n        parsedData = JSON.parse(cleaned);");
fs.writeFileSync('server.ts', code);
