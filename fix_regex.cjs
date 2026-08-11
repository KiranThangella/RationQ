const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/const cleaned = text\.replace\(\/\\^\`\`\`\(json\)\?\\n\/, ''\)\.replace\(\/\\\\`\`\`\$\/, ''\);/, "const cleaned = text.replace(/^```(json)?\\n/, '').replace(/\\n```$/, '');");
fs.writeFileSync('server.ts', code);
