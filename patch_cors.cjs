const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The block to remove:
const interceptorRegex = /\/\/ Fail-safe CORS Header Interceptor[\s\S]*?next\(\);\n  \}\);\n/g;

code = code.replace(interceptorRegex, '');

fs.writeFileSync('server.ts', code);
