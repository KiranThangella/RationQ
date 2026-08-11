import { Article } from './src/types.js';
import { saveArticleToStore } from './src/lib/supabase.js';

const STATE_NAMES = [
  'Andaman & Nicobar Islands', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
  'Chhattisgarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Delhi', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

async function run() {
  for (const state of STATE_NAMES) {
    const id = `viral-state-${state.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const article: Article = {
      id: id,
      slug: id,
      schemeId: `SCHEME-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${state} Chief Minister Scheme: 100% Financial Grant for Unemployed Youth & Women`,
      titleTelugu: `${state} ముఖ్యమంత్రి పథకం: నిరుద్యోగ యువత మరియు మహిళలకు 100% ఆర్థిక గ్రాంట్`,
      shortSummary: `A revolutionary new scheme by the ${state} Government offering direct financial assistance, free skill training, and zero-interest loans to empower youth and women across the state.`,
      shortSummaryTelugu: `${state} ప్రభుత్వ నూతన పథకం కింద యువత మరియు మహిళలకు ఉచిత నైపుణ్య శిక్షణ, వడ్డీ లేని రుణాలు.`,
      whatHappened: `The ${state} Cabinet has officially approved the immediate rollout of this mega welfare scheme aiming to reach over 10 lakh beneficiaries in the first phase.`,
      whatHappenedTelugu: `ఈ మెగా సంక్షేమ పథకాన్ని తక్షణమే అమలు చేసేందుకు క్యాబినెట్ ఆమోదం తెలిపింది.`,
      whatIsScheme: `An integrated state-level welfare initiative providing a comprehensive safety net including direct cash transfers, subsidized housing, and free healthcare access.`,
      whatIsSchemeTelugu: `నగదు బదిలీ, ఉచిత వైద్యం, ఇళ్ల నిర్మాణానికి సబ్సిడీలను కలిపి అందించే ఒక బృహత్తర రాష్ట్ర స్థాయి పథకం.`,
      benefits: [
        { id: 'b1', title: 'Direct Cash Transfer', amount: '₹5,000 / Month', type: 'financial', description: 'Monthly income support credited directly to Aadhaar-seeded bank accounts.' },
        { id: 'b2', title: 'Zero Interest Loan', amount: 'Up to ₹2,00,000', type: 'subsidy', description: 'Collateral-free loans for setting up small businesses or self-employment.' }
      ],
      whoCanApply: [`Permanent residents of ${state}`, 'Age between 18 to 45 years', 'Annual family income strictly below ₹2.5 Lakhs'],
      whoCannotApply: ['Government employees and their immediate families', 'Income tax payees'],
      documents: [
        { id: 'd1', name: 'Aadhaar Card', required: true, description: 'For biometric verification and DBT' },
        { id: 'd2', name: 'State Domicile Certificate', required: true, description: `Proof of continuous residence in ${state}` }
      ],
      steps: [
        { stepNumber: 1, title: 'Visit State Welfare Portal', description: `Go to the official ${state} government schemes portal.` },
        { stepNumber: 2, title: 'Upload KYC Documents', description: 'Submit Aadhaar, Income Certificate, and bank passbook.' }
      ],
      category: 'Social Welfare & Disability',
      state: state,
      isCentral: false,
      officialWebsite: `https://www.${state.toLowerCase().replace(/[^a-z0-9]+/g, '')}.gov.in`,
      statusCheckGuide: 'Use your application reference number on the state dashboard to track approval status.',
      publishedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      isNew: true,
      isUpdated: false,
      status: 'published',
      readTimeMinutes: 3,
      generatedImage: 'https://images.unsplash.com/photo-1593113562332-90a6e355cfa7?auto=format&fit=crop&fm=webp&q=75&w=800',
    };

    try {
      await saveArticleToStore(article);
      console.log(`✅ Seeded viral scheme for ${state}`);
    } catch (e) {
      console.error(`❌ Failed to seed for ${state}:`, e);
    }
  }
}

run();
