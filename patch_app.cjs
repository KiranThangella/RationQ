const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('import { MobileBottomNav }')) {
  code = code.replace(
    "import { LegalPagesView, LegalTab } from './components/LegalPagesView';",
    "import { LegalPagesView, LegalTab } from './components/LegalPagesView';\nimport { MobileBottomNav } from './components/MobileBottomNav';"
  );
}

// 2. Add padding to main container
code = code.replace(
  '<div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-900">',
  '<div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-900 pb-16 md:pb-0">'
);

// 3. Inject MobileBottomNav before closing div
const closingDiv = "    </div>\n  );\n}\n\nexport default App;";
const injection = `
      <MobileBottomNav 
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          try {
            if (view === 'home') {
               window.history.pushState({}, '', '/');
            } else if (['latest', 'saved'].includes(view)) {
               window.history.pushState({}, '', \`/\${view}\`);
            }
          } catch(e) {}
        }}
        lang={lang}
        savedCount={savedArticles.length}
      />
    </div>
  );
}

export default App;`;

code = code.replace(closingDiv, injection);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx successfully");
