const fs = require('fs');
let code = fs.readFileSync('src/lib/apiConfig.ts', 'utf8');
code = code.replace(/export function getBackendBaseUrl\(\): string \{[\s\S]*?return 'https:\/\/rationq-hs7w\.onrender\.com';\n\}/g, `export function getBackendBaseUrl(): string {
  if (rawApiUrl) {
    return rawApiUrl.replace(/\\/$/, '');
  }
  return '';
}`);
fs.writeFileSync('src/lib/apiConfig.ts', code);
