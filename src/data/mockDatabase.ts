import { Article, Category, NewsPipelineItem, Notification, State, UserProfile } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'agriculture', name: 'Agriculture & Farmers', icon: 'Sprout', count: 18, description: 'PM-KISAN, crop subsidies, Kisan credit card, equipment support', latestUpdate: 'Updated 2 days ago' },
  { id: 'education', name: 'Education & Scholarships', icon: 'GraduationCap', count: 24, description: 'Pre & post matric scholarships, tuition fee waivers, education loans', latestUpdate: 'Updated 1 day ago' },
  { id: 'women', name: 'Women & Child Welfare', icon: 'Heart', count: 16, description: 'Maternity assistance, self-help group loans, girl child education', latestUpdate: 'Updated 3 days ago' },
  { id: 'business', name: 'Business, Artisans & Micro-Loans', icon: 'Briefcase', count: 12, description: 'PM Vishwakarma, Mudra loans, MSME subsidies, street vendor loans', latestUpdate: 'Updated Today' },
  { id: 'housing', name: 'Housing & Urban Development', icon: 'Home', count: 9, description: 'PM Awas Yojana Urban & Rural, interest subvention, home construction', latestUpdate: 'Updated 4 days ago' },
  { id: 'health', name: 'Health & Medical Cover', icon: 'Activity', count: 14, description: 'Ayushman Bharat, state health cards, free hospital care, medicine subsidies', latestUpdate: 'Updated Today' },
  { id: 'senior', name: 'Senior Citizens & Pensions', icon: 'UserCheck', count: 11, description: 'Atal Pension Yojana, Old age pension, disability pension, widow support', latestUpdate: 'Updated 5 days ago' },
  { id: 'social', name: 'Social Welfare & Disability', icon: 'Users', count: 15, description: 'Assistance for SC/ST/OBC, disability aids, marriage assistance', latestUpdate: 'Updated 2 days ago' },
  { id: 'employment', name: 'Jobs, Training & Skill Development', icon: 'Wrench', count: 13, description: 'PM Kaushal Vikas Yojana, apprenticeship incentives, job seeker stipends', latestUpdate: 'Updated 3 days ago' },
  { id: 'insurance', name: 'Insurance & Security', icon: 'ShieldCheck', count: 8, description: 'PM Suraksha Bima, Jeevan Jyoti, crop insurance (PMFBY)', latestUpdate: 'Updated 1 week ago' },
];

export const STATES: State[] = [
  { id: 'central', name: 'Central Government', code: 'CG', type: 'central', popularSchemesCount: 42, capital: 'New Delhi' },
  { id: 'telangana', name: 'Telangana', code: 'TS', type: 'state', popularSchemesCount: 28, capital: 'Hyderabad' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', code: 'AP', type: 'state', popularSchemesCount: 26, capital: 'Amaravati' },
  { id: 'karnataka', name: 'Karnataka', code: 'KA', type: 'state', popularSchemesCount: 31, capital: 'Bengaluru' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', code: 'TN', type: 'state', popularSchemesCount: 29, capital: 'Chennai' },
  { id: 'kerala', name: 'Kerala', code: 'KL', type: 'state', popularSchemesCount: 22, capital: 'Thiruvananthapuram' },
  { id: 'maharashtra', name: 'Maharashtra', code: 'MH', type: 'state', popularSchemesCount: 35, capital: 'Mumbai' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', code: 'UP', type: 'state', popularSchemesCount: 38, capital: 'Lucknow' },
  { id: 'rajasthan', name: 'Rajasthan', code: 'RJ', type: 'state', popularSchemesCount: 25, capital: 'Jaipur' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', code: 'MP', type: 'state', popularSchemesCount: 27, capital: 'Bhopal' },
  { id: 'bihar', name: 'Bihar', code: 'BR', type: 'state', popularSchemesCount: 24, capital: 'Patna' },
  { id: 'west-bengal', name: 'West Bengal', code: 'WB', type: 'state', popularSchemesCount: 23, capital: 'Kolkata' },
  { id: 'gujarat', name: 'Gujarat', code: 'GJ', type: 'state', popularSchemesCount: 30, capital: 'Gandhinagar' },
  { id: 'punjab', name: 'Punjab', code: 'PB', type: 'state', popularSchemesCount: 19, capital: 'Chandigarh' },
  { id: 'delhi', name: 'Delhi', code: 'DL', type: 'ut', popularSchemesCount: 20, capital: 'Delhi' },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'pm-kisan-19th-installment',
    slug: 'pm-kisan-19th-installment-release-guidelines',
    schemeId: 'pm-kisan',
    title: 'PM-KISAN 19th Installment Released: ₹2,000 Direct Bank Credit & eKYC Mandatory Check',
    shortSummary: 'The Union Ministry of Agriculture has confirmed the 19th installment release under Pradhan Mantri Kisan Samman Nidhi. Eligible farmers receive ₹2,000 directly into Aadhaar-linked bank accounts provided eKYC and land seeding are verified.',
    whatHappened: 'The Ministry of Agriculture & Farmers Welfare has announced that the 19th installment under PM-KISAN is now being disbursed directly via Direct Benefit Transfer (DBT) to over 9.5 crore registered farmers across India.',
    whatIsScheme: 'PM-KISAN is a Central Sector scheme launched in 2019 that provides income support of ₹6,000 per year to landholding farmer families across India. The financial assistance is transferred in three equal installments of ₹2,000 every 4 months directly into the beneficiary bank accounts.',
    benefits: [
      { id: 'b1', title: 'Direct Income Support', amount: '₹6,000 per year', type: 'financial', description: 'Transferred in 3 equal installments of ₹2,000 every 4 months directly to the bank account.' },
      { id: 'b2', title: 'Zero Middlemen', type: 'service', description: '100% Aadhaar-enabled Direct Benefit Transfer (DBT) ensuring zero leakages.' },
      { id: 'b3', title: 'Kisan Credit Card (KCC) Linkage', type: 'subsidy', description: 'Beneficiaries get priority access to low-interest credit via Kisan Credit Cards.' }
    ],
    whoCanApply: [
      'Small and marginal farmer families who own cultivable land in their name',
      'Citizens of India with valid Aadhaar card and land ownership record (Khatauni/Pahani)',
      'Bank account registered with mandatory Aadhaar seed and active eKYC status'
    ],
    whoCannotApply: [
      'Institutional landholders',
      'Families with members holding constitutional posts or serving/retired government employees (excluding Multi Tasking Staff)',
      'Income Tax payers in the last assessment year',
      'Professionals like Doctors, Engineers, Lawyers, Chartered Accountants, and Architects'
    ],
    documents: [
      { id: 'd1', name: 'Aadhaar Card', required: true, description: 'Must be linked with active mobile number for OTP eKYC verification.' },
      { id: 'd2', name: 'Land Ownership Document (RoR / Pahani)', required: true, description: 'Valid land revenue record proving cultivable land ownership.' },
      { id: 'd3', name: 'Aadhaar-Seeded Bank Passbook', required: true, description: 'Bank account with active NPCI mapping for DBT transfers.' },
      { id: 'd4', name: 'Active Mobile Number', required: true, description: 'For OTP verification and status SMS updates.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Visit Official Portal', description: 'Navigate to official PM-KISAN website at pmkisan.gov.in and select Farmers Corner.', url: 'https://pmkisan.gov.in' },
      { stepNumber: 2, title: 'Complete eKYC Verification', description: 'Click "eKYC", enter your 12-digit Aadhaar number, and complete OTP verification sent to Aadhaar-linked mobile.', tip: 'You can also do biometric eKYC at your nearest CSC center.' },
      { stepNumber: 3, title: 'Check Beneficiary Status & Land Seeding', description: 'Select "Know Your Status", enter Registration Number or Mobile Number to check if Land Seeding status is marked YES.' },
      { stepNumber: 4, title: 'Verify Aadhaar-NPCI Bank Seeding', description: 'Ensure your bank account is linked with NPCI mapper so DBT funds do not bounce.' },
      { stepNumber: 5, title: 'Track Credit Confirmation', description: 'Check your mobile SMS or bank passbook for direct credit from PFMS (Public Financial Management System).' }
    ],
    deadline: 'Ongoing / 19th Installment Active',
    statusCheckGuide: 'Farmers can check status online at pmkisan.gov.in -> Know Your Status using Registration No. or Aadhaar No., or via PM-KISAN mobile app with face authentication.',
    officialWebsite: 'https://pmkisan.gov.in',
    importantWarnings: [
      'Beware of fake websites asking for processing fees or OTP. Official PM-KISAN registration is 100% free.',
      'If Land Seeding shows "NO", visit your local District Agriculture Office / Tehsildar with land papers to update status.'
    ],
    source: {
      name: 'Press Information Bureau (PIB)',
      url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=198000',
      domain: 'pib.gov.in',
      type: 'pib',
      verifiedDate: '2026-08-05',
      verificationStatus: 'verified',
      department: 'Ministry of Agriculture & Farmers Welfare'
    },
    generatedImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-05T10:00:00Z',
    lastVerifiedAt: '2026-08-07T08:00:00Z',
    readTimeMinutes: 3,
    category: 'Agriculture & Farmers',
    state: 'Central Government',
    isCentral: true,
    isNew: true,
    isUpdated: false,
    status: 'published',
    aiConfidenceScore: 0.98,
    titleTelugu: 'పీఎం-కిసాన్ 19వ విడత విడుదల: ₹2,000 నేరుగా బ్యాంక్ ఖాతాలో జమ & eKYC తనిఖీ',
    shortSummaryTelugu: 'కేంద్ర వ్యవసాయ మంత్రిత్వ శాఖ పిఎం-కిసాన్ సమ్మాన్ నిధి కింద 19వ విడత విడుదలను ధృవీకరించింది. eKYC మరియు భూమి సీడింగ్ పూర్తి చేసిన అర్హులైన రైతులకు ₹2,000 నేరుగా ఆధార్ అనుసంధానిత బ్యాంక్ ఖాతాలో జమ కానుంది.',
    whatIsSchemeTelugu: 'పీఎం-కిసాన్ అనేది రైతు కుటుంబాలకు ఏడాదికి ₹6,000 ఆర్థిక సాయం అందించే కేంద్ర ప్రభుత్వ పథకం. ప్రతి 4 నెలలకు ఒకసారి ₹2,000 చొప్పున మూడు విడతలలో సాయం నేరుగా బ్యాంక్ ఖాతాల్లో జమ చేయబడుతుంది.',
    whatHappenedTelugu: 'కేంద్ర వ్యవసాయం & రైతు సంక్షేమ మంత్రిత్వ శాఖ దేశవ్యాప్తంగా 9.5 కోట్లకు పైగా నమోదైన రైతులకు డైరెక్ట్ బెనిఫిట్ ట్రాన్స్‌ఫర్ (DBT) ద్వారా 19వ విడతను విడుదల చేసింది.'
  },
  {
    id: 'pm-vishwakarma-scheme-2026',
    slug: 'pm-vishwakarma-artisans-collateral-free-loan-toolkit',
    schemeId: 'pm-vishwakarma',
    title: 'PM Vishwakarma Scheme: ₹3 Lakh Collateral-Free Loan @ 5% & ₹15,000 Toolkit Incentive',
    shortSummary: 'Comprehensive Central scheme for traditional artisans and craftspeople across 18 trades. Includes PM Vishwakarma ID Card, basic skill training with ₹500/day stipend, ₹15,000 e-voucher for modern toolkits, and subsidized loan up to ₹3 Lakhs.',
    whatHappened: 'Ministry of Micro, Small & Medium Enterprises (MSME) has expanded verification hubs across Gram Panchayats and Urban Local Bodies for PM Vishwakarma scheme, providing financial and technological empowerment to traditional craftsmen.',
    whatIsScheme: 'PM Vishwakarma is a Central Sector Scheme launched to support traditional artisans and craftspeople working with their hands and tools. It provides end-to-end support including skill upgradation, toolkit incentive, collateral-free credit, and digital transaction rewards across 18 traditional trades like Carpenters, Blacksmiths, Goldsmiths, Potters, Tailors, and Cobblers.',
    benefits: [
      { id: 'bv1', title: 'Collateral-Free Enterprise Credit', amount: 'Up to ₹3 Lakhs', type: 'subsidy', description: '₹1 Lakh First Tranche (18 months) and ₹2 Lakhs Second Tranche (30 months) at a concessional interest rate of 5%.' },
      { id: 'bv2', title: 'Toolkit E-Voucher Incentive', amount: '₹15,000', type: 'financial', description: 'Provided upon completion of basic skill training to purchase modern tools.' },
      { id: 'bv3', title: 'Skill Training Stipend', amount: '₹500 / day', type: 'financial', description: '5-7 days basic training and optional 15 days advanced training with daily stipend.' },
      { id: 'bv4', title: 'Digital Transaction Cashback', amount: '₹1 / transaction', type: 'financial', description: 'Cashback up to 100 digital transactions per month.' }
    ],
    whoCanApply: [
      'Artisans and craftspeople working manually with tools in one of 18 traditional family-based trades',
      'Minimum age of 18 years on the date of registration',
      'Only one member per family is eligible for benefits under the scheme'
    ],
    whoCannotApply: [
      'Persons who have availed loans under PMEGP, PM MUDRA, or PM SVANidhi in the last 5 years',
      'Government employees and their immediate family members'
    ],
    documents: [
      { id: 'dv1', name: 'Aadhaar Card', required: true, description: 'Mandatory for identity and biometric verification.' },
      { id: 'dv2', name: 'Bank Account Passbook', required: true, description: 'Must be linked with Aadhaar and active mobile number.' },
      { id: 'dv3', name: 'Ration Card / Family Detail Document', required: true, description: 'To verify family unit compliance.' },
      { id: 'dv4', name: 'Trade Verification Certificate', required: true, description: 'Verified by Gram Panchayat Pradhan or ULB Chairman.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Visit CSC Centre or Official Portal', description: 'Artisan visits nearest Common Service Centre (CSC) with Aadhaar and mobile for biometric registration on pmvishwakarma.gov.in.', url: 'https://pmvishwakarma.gov.in' },
      { stepNumber: 2, title: 'Submit Trade Application Form', description: 'Choose your traditional trade (e.g., Carpenter, Tailor, Barber, Mason) and fill family details.' },
      { stepNumber: 3, title: 'Three-Stage Verification', description: 'Application is verified by: Stage 1 (Gram Panchayat/ULB), Stage 2 (District Implementation Committee), Stage 3 (Screening Committee).' },
      { stepNumber: 4, title: 'Receive PM Vishwakarma Certificate & Digital ID', description: 'Download official Vishwakarma Digital Certificate upon approval.' },
      { stepNumber: 5, title: 'Skill Training & Toolkit Incentive', description: 'Attend 5-day basic training to receive ₹15,000 e-voucher for modern tools and qualify for ₹1 Lakh loan.' }
    ],
    deadline: 'Ongoing / Registration Open',
    statusCheckGuide: 'Track application status on pmvishwakarma.gov.in by clicking "Login" -> "Artisan Login" using registered mobile number and OTP.',
    officialWebsite: 'https://pmvishwakarma.gov.in',
    importantWarnings: [
      'CSC registration is free of charge. Do not pay any extra service fees to unauthorized agents.',
      'Ensure trade selection matches your actual practice as physical inspection may be carried out by district officials.'
    ],
    source: {
      name: 'Ministry of MSME / myScheme Portal',
      url: 'https://www.myscheme.gov.in/schemes/pmvishwakarma',
      domain: 'myscheme.gov.in',
      type: 'myscheme',
      verifiedDate: '2026-08-06',
      verificationStatus: 'verified',
      department: 'Ministry of Micro, Small and Medium Enterprises'
    },
    generatedImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-06T14:30:00Z',
    lastVerifiedAt: '2026-08-07T11:00:00Z',
    readTimeMinutes: 4,
    category: 'Business, Artisans & Micro-Loans',
    state: 'Central Government',
    isCentral: true,
    isNew: true,
    isUpdated: true,
    status: 'published',
    aiConfidenceScore: 0.99,
    titleTelugu: 'పీఎం విశ్వకర్మ పథకం: 5% వడ్డీకి ₹3 లక్షల గ్యారెంటీ లేని రుణం & ₹15,000 టూల్‌కిట్ ప్రోత్సాహకం',
    shortSummaryTelugu: '18 రకాల చేతివృత్తుల వారికి సమగ్ర మద్దతు అందించే కేంద్ర పథకం. ఉచిత విశ్వకర్మ ఐడీ కార్డు, రోజుకు ₹500 స్టైపెండ్‌తో ఉచిత శిక్షణ, ₹15,000 టూల్‌కిట్ వోచర్ మరియు ₹3 లక్షల వరకు తక్కువ వడ్డీ రుణం అందించబడుతుంది.',
    whatIsSchemeTelugu: 'చేతివృత్తుల కళాకారులు, కుమ్మరులు, మేదరులు, దర్జీలు, కమ్మరులు, వడ్రంగులు మొదలైన 18 రకాల సాంప్రదాయ వృత్తుల వారికి ఆర్థిక మరియు సాంకేతిక చేయూతనిచ్చే కేంద్ర ప్రభుత్వం ప్రారంభించిన పథకం.',
    whatHappenedTelugu: 'సూక్ష్మ, చిన్న & మధ్య తరహా పరిశ్రమల మంత్రిత్వ శాఖ గ్రామ్ పంచాయితీలు మరియు మున్సిపాలిటీల ద్వారా లబ్ధిదారుల నమోదు ప్రక్రియను వేగవంతం చేసింది.'
  },
  {
    id: 'pmay-u-2-housing-subsidy',
    slug: 'pm-awas-yojana-urban-2-interest-subsidy-guidelines',
    schemeId: 'pmay-u-2',
    title: 'PM Awas Yojana - Urban 2.0 (PMAY-U): Up to ₹2.5 Lakh Interest Subsidy for EWS, LIG & MIG Families',
    shortSummary: 'Government of India has approved PMAY-U 2.0 to assist 1 crore urban poor and middle-class families in constructing, purchasing, or renting affordable homes with interest subvention up to ₹1.8 Lakhs to ₹2.5 Lakhs.',
    whatHappened: 'The Union Cabinet approved PMAY-U 2.0 with a central assistance budget of ₹2.30 Lakh Crore. Beneficiaries under EWS, LIG, and MIG categories can apply for Interest Subsidy Scheme (ISS), Beneficiary Led Construction (BLC), and Affordable Housing in Partnership (AHP).',
    whatIsScheme: 'Pradhan Mantri Awas Yojana - Urban 2.0 provides financial assistance to eligible urban households across India to acquire a pucca house equipped with basic amenities like water, electricity, and sanitation.',
    benefits: [
      { id: 'bh1', title: 'Interest Subsidy Scheme (ISS)', amount: 'Up to ₹1.80 Lakhs', type: 'subsidy', description: '4% interest subsidy on housing loans up to ₹8 Lakhs for a tenure up to 12 years.' },
      { id: 'bh2', title: 'Beneficiary Led Construction (BLC)', amount: '₹2.50 Lakhs', type: 'financial', description: 'Direct financial subsidy for constructing a house on self-owned land.' },
      { id: 'bh3', title: 'Affordable Rental Housing (ARHC)', type: 'service', description: 'Rental housing support near industrial hubs for migrant workers and students.' }
    ],
    whoCanApply: [
      'EWS households (Annual Income up to ₹3 Lakhs), LIG (Income ₹3 Lakhs to ₹6 Lakhs), MIG (Income ₹6 Lakhs to ₹9 Lakhs)',
      'Family must not own a pucca house anywhere in India in the name of any family member',
      'Female head ownership or co-ownership mandatory for house allotment under EWS/LIG'
    ],
    whoCannotApply: [
      'Families owning a pucca house anywhere in India',
      'Prior beneficiaries of PMAY-Urban 1.0, PMAY-Gramin, or state housing schemes'
    ],
    documents: [
      { id: 'dh1', name: 'Aadhaar Card of All Family Members', required: true, description: 'Mandatory for deduplication and DBT credit.' },
      { id: 'dh2', name: 'Income Certificate / Salary Slips', required: true, description: 'Issued by competent authority proving household income bracket.' },
      { id: 'dh3', name: 'Property Documents / Patta', required: true, description: 'Proof of land ownership for BLC component.' },
      { id: 'dh4', name: 'Bank Account Passbook', required: true, description: 'Aadhaar-seeded bank account for milestone disbursements.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Access PMAY-U 2.0 Portal', description: 'Visit pmaymis.gov.in or pmay-urban.gov.in and click Citizen Assessment.', url: 'https://pmay-urban.gov.in' },
      { stepNumber: 2, title: 'Select Vertical & Enter Aadhaar', description: 'Choose your category (BLC, ISS, or AHP) and submit Aadhaar for instant verification.' },
      { stepNumber: 3, title: 'Fill Household & Property Details', description: 'Provide income, urban local body (ULB), plot details, and bank account info.' },
      { stepNumber: 4, title: 'Submit & Receive Assessment ID', description: 'Download acknowledgement slip containing unique 18-digit Assessment ID.' },
      { stepNumber: 5, title: 'ULB Geo-Tagging & Approval', description: 'Municipal officials perform physical inspection and geo-tag plot prior to fund release.' }
    ],
    deadline: '2029 (5-Year Window Active)',
    statusCheckGuide: 'Track application via pmaymis.gov.in -> Track Assessment Status using Mobile No. or Assessment ID.',
    officialWebsite: 'https://pmay-urban.gov.in',
    importantWarnings: [
      'Housing allotment and interest subsidy are directly processed through accredited banks and ULBs. Beware of fake brokers.',
      'Construction milestones are verified via mobile geo-tagging before releasing subsequent tranches.'
    ],
    source: {
      name: 'Ministry of Housing and Urban Affairs (MoHUA)',
      url: 'https://pmay-urban.gov.in',
      domain: 'pmay-urban.gov.in',
      type: 'official_pdf',
      verifiedDate: '2026-08-04',
      verificationStatus: 'verified',
      department: 'Ministry of Housing and Urban Affairs'
    },
    generatedImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-04T09:15:00Z',
    lastVerifiedAt: '2026-08-06T15:00:00Z',
    readTimeMinutes: 5,
    category: 'Housing & Urban Development',
    state: 'Central Government',
    isCentral: true,
    isNew: true,
    isUpdated: false,
    status: 'published',
    aiConfidenceScore: 0.97,
    titleTelugu: 'పీఎం ఆవాస్ యోజన - అర్బన్ 2.0 (PMAY-U): ఇళ్ల నిర్మాణానికి ₹2.5 లక్షల వరకు వడ్డీ సబ్సిడీ',
    shortSummaryTelugu: 'పట్టణ పేదలు మరియు మధ్యతరగతి కుటుంబాలకు సొంతింటి కల నెరవేర్చుకోవడానికి కేంద్ర ప్రభుత్వం PMAY-U 2.0 ని ఆమోదించింది. ఇల్లు కట్టుకోవడానికి లేదా కొనుగోలు చేయడానికి ₹2.50 లక్షల వరకు సాయం లభిస్తుంది.',
    whatIsSchemeTelugu: 'పట్టణ ప్రాంతాల అర్హులైన పేద కుటుంబాలు పక్కా ఇల్లు నిర్మించుకోవడానికి నీరు, విద్యుత్ మరియు శౌచాలయ సౌకర్యాలతో సహా ఆర్థిక సహాయం అందించే పథకం.',
    whatHappenedTelugu: 'కేంద్ర మంత్రివర్గం ₹2.30 లక్షల కోట్లతో PMAY-U 2.0 కి ఆమోదం తెలిపింది. EWS, LIG మరియు MIG వర్గాల కుటుంబాలు ఈ వడ్డీ సబ్సిడీకి దరఖాస్తు చేసుకోవచ్చు.'
  },
  {
    id: 'telangana-rythu-bharosa-2026',
    slug: 'telangana-rythu-bharosa-farmer-investment-support-guide',
    schemeId: 'rythu-bharosa-ts',
    title: 'Telangana Rythu Bharosa Scheme: ₹15,000 Per Acre Annual Financial Assistance for Farmers & Tenant Cultivators',
    shortSummary: 'Telangana Government provides financial assistance for crop investment per acre per year directly into farmer bank accounts. Includes expanded coverage for tenant farmers holding valid CCRC cards.',
    whatHappened: 'The Agriculture Department of Telangana has updated guidelines for Rythu Bharosa disbursal, incorporating digital land record validation (Bhoomi Portal) and mandatory e-KYC verification for tenant farmers.',
    whatIsScheme: 'Rythu Bharosa is a major welfare scheme by the Government of Telangana to provide timely financial assistance to farmers at the beginning of the Kharif and Rabi agricultural seasons to buy seeds, fertilizers, pesticides, and meet labor expenses.',
    benefits: [
      { id: 'bt1', title: 'Crop Investment Support', amount: '₹15,000 / acre / year', type: 'financial', description: 'Disbursed in two installments of ₹7,500 per acre per season (Kharif and Rabi).' },
      { id: 'bt2', title: 'Tenant Farmer Inclusion', amount: '₹15,000 / year', type: 'financial', description: 'Financial assistance extended to recognized tenant farmers holding CCRC cards.' },
      { id: 'bt3', title: 'Agricultural Worker Stipend', amount: '₹12,000 / year', type: 'financial', description: 'Support for landless agricultural laborers.' }
    ],
    whoCanApply: [
      'Pattadar farmers holding valid agricultural land in Telangana',
      'Tenant farmers with Crop Cultivator Rights Cards (CCRC) issued by Revenue Department',
      'Resident of Telangana state with Aadhaar and active bank account'
    ],
    whoCannotApply: [
      'Non-agricultural landholders or converted commercial plots',
      'Income Tax paying government officials above Class-IV designation'
    ],
    documents: [
      { id: 'dt1', name: 'Pattadar Passbook / Dharani Record', required: true, description: 'Digital land revenue record proof.' },
      { id: 'dt2', name: 'Aadhaar Card', required: true, description: 'Aadhaar card linked with active mobile number.' },
      { id: 'dt3', name: 'CCRC Card (for Tenant Farmers)', required: true, description: 'Crop Cultivator Rights Card issued by MRO/Tehsildar.' },
      { id: 'dt4', name: 'Bank Passbook Copy', required: true, description: 'Account seeded with Aadhaar and NPCI.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Verify Dharani/Bhoomi Portal Data', description: 'Visit dharani.telangana.gov.in or rythubharosa.telangana.gov.in to check passbook details.', url: 'https://rythubharosa.telangana.gov.in' },
      { stepNumber: 2, title: 'Submit Details to Agriculture Extension Officer (AEO)', description: 'Contact your local Rythu Vedika or AEO to ensure land details are mapped correctly.' },
      { stepNumber: 3, title: 'Complete e-KYC Verification', description: 'Verify biometric/Aadhaar OTP at Rythu Vedika or MeeSeva centre.' },
      { stepNumber: 4, title: 'Track DBT Installment', description: 'Funds will be directly credited to your Aadhaar-linked bank account via Treasury DBT.' }
    ],
    deadline: 'Seasonal Disbursal (Kharif & Rabi Window)',
    statusCheckGuide: 'Check status on rythubharosa.telangana.gov.in by entering Pattadar Passbook Number or Aadhaar Number.',
    officialWebsite: 'https://rythubharosa.telangana.gov.in',
    importantWarnings: [
      'Always verify land entries on Dharani portal. Discrepancies in survey numbers can pause disbursement.',
      'No application fees required at Rythu Vedika offices.'
    ],
    source: {
      name: 'Department of Agriculture, Govt of Telangana',
      url: 'https://telangana.gov.in',
      domain: 'telangana.gov.in',
      type: 'state_portal',
      verifiedDate: '2026-08-03',
      verificationStatus: 'verified',
      department: 'Agriculture and Cooperation Department, Govt of Telangana'
    },
    generatedImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-03T11:20:00Z',
    lastVerifiedAt: '2026-08-07T09:00:00Z',
    readTimeMinutes: 4,
    category: 'Agriculture & Farmers',
    state: 'Telangana',
    isCentral: false,
    isNew: true,
    isUpdated: true,
    status: 'published',
    aiConfidenceScore: 0.99,
    titleTelugu: 'తెలంగాణ రైతు భరోసా పథకం: ఎకరానికి ఏడాదికి ₹15,000 పెట్టుబడి సహాయం & కౌలు రైతులకు వర్తింపు',
    shortSummaryTelugu: 'తెలంగాణ ప్రభుత్వం ప్రతీ ఎకరానికి ఏటా ₹15,000 సాగు పెట్టుబడి సాయాన్ని నేరుగా రైతుల బ్యాంక్ ఖాతాల్లో జమ చేస్తోంది. CCRC కార్డులు ఉన్న కౌలు రైతులకు కూడా ఈ పథకం వర్తిస్తుంది.',
    whatIsSchemeTelugu: 'వానకాలం మరియు యాసంగి పంట కాలం ప్రారంభంలో విత్తనాలు, ఎరువులు మరియు పురుగుమందుల కొనుగోలుకు తెలంగాణ ప్రభుత్వం అందించే ఆర్థిక సహాయం.',
    whatHappenedTelugu: 'వ్యవసాయ శాఖ ధరణి పోర్టల్ మరియు డిజిటల్ భూ రికార్డుల ద్వారా రైతు భరోసా నిధుల విడుదల మార్గదర్శకాలను సవరించింది.'
  },
  {
    id: 'pm-vidya-lakshmi-loan-scheme',
    slug: 'pm-vidya-lakshmi-scholarship-education-loan-subvention',
    schemeId: 'pm-vidya-lakshmi',
    title: 'PM Vidya Lakshmi Scheme: Collateral-Free Education Loan up to ₹7.5 Lakhs & 3.5% Interest Subvention',
    shortSummary: 'Central government scheme providing seamless access to education loans and scholarships through a single portal for students pursuing higher education in top Indian institutions.',
    whatHappened: 'The Union Ministry of Education has integrated 86 commercial banks on the Vidya Lakshmi portal with automated credit guarantee support up to 75% for loans up to ₹7.5 Lakhs.',
    whatIsScheme: 'PM Vidya Lakshmi is a First-of-its-kind portal for students seeking Education Loans and Government Scholarships. Developed under the guidance of Department of Financial Services and Ministry of Education, it allows students to apply to multiple banks using a single Common Educational Loan Application Form (CELAF).',
    benefits: [
      { id: 'be1', title: 'Collateral-Free & Guarantee-Free Loan', amount: 'Up to ₹7.5 Lakhs', type: 'subsidy', description: 'No collateral security or third-party guarantee required for loans up to ₹7.5 Lakhs.' },
      { id: 'be2', title: 'Full Interest Subvention during Moratorium', amount: '3.5% Interest Subvention', type: 'financial', description: 'Interest subsidy during course duration + 1 year moratorium for families with annual income up to ₹8 Lakhs.' },
      { id: 'be3', title: 'Single Unified Portal', type: 'service', description: 'Apply to up to 3 banks simultaneously with one common application form.' }
    ],
    whoCanApply: [
      'Indian citizens who have secured admission to higher education courses in NIRF top-ranked institutes or accredited colleges',
      'Students with annual family income up to ₹8 Lakhs eligible for full interest subvention',
      'Valid Aadhaar, 10th/12th marksheets, and college admission fee structure'
    ],
    whoCannotApply: [
      'Students pursuing unaccredited private correspondence courses without recognized affiliation',
      'Defaulters on existing commercial bank credit facilities'
    ],
    documents: [
      { id: 'de1', name: 'Aadhaar Card & PAN Card of Student & Parent', required: true, description: 'Mandatory for KYC and loan processing.' },
      { id: 'de2', name: 'Proof of Admission & Fee Structure', required: true, description: 'Official letter from university specifying tuition, hostel, and book expenses.' },
      { id: 'de3', name: 'Mark Sheets of Qualifying Exam (10th, 12th, Graduation)', required: true, description: 'Academic performance verification.' },
      { id: 'de4', name: 'Income Certificate / Form 16 of Parents', required: true, description: 'Issued by Tehsildar or employer for interest subvention eligibility.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Register on Vidya Lakshmi Portal', description: 'Visit vidyalakshmi.co.in and click Student Register.', url: 'https://www.vidyalakshmi.co.in' },
      { stepNumber: 2, title: 'Fill Common Educational Loan Application Form (CELAF)', description: 'Provide personal details, course details, institute fee structure, and co-borrower income details.' },
      { stepNumber: 3, title: 'Search & Select Loan Schemes', description: 'Choose up to 3 preferred banks (e.g. SBI, Canara Bank, Union Bank) matching your location.' },
      { stepNumber: 4, title: 'Upload Mandatory Documents', description: 'Scan and upload marksheet, admission letter, income certificate, and Aadhaar.' },
      { stepNumber: 5, title: 'Track Bank Sanction Online', description: 'Monitor application status on your dashboard. Bank communicates sanction letter digitally.' }
    ],
    deadline: 'Academic Session 2026-27 Open',
    statusCheckGuide: 'Log into vidyalakshmi.co.in -> Dashboard to check individual status across selected banks.',
    officialWebsite: 'https://www.vidyalakshmi.co.in',
    importantWarnings: [
      'Applying via Vidya Lakshmi is completely free. Banks cannot charge processing fees for educational loans up to ₹4 Lakhs.',
      'Moratorium period covers full course duration plus 12 months before repayment starts.'
    ],
    source: {
      name: 'Ministry of Education & NSDL e-Gov',
      url: 'https://www.vidyalakshmi.co.in',
      domain: 'vidyalakshmi.co.in',
      type: 'pib',
      verifiedDate: '2026-08-02',
      verificationStatus: 'verified',
      department: 'Department of Higher Education'
    },
    generatedImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-02T08:00:00Z',
    lastVerifiedAt: '2026-08-06T12:00:00Z',
    readTimeMinutes: 4,
    category: 'Education & Scholarships',
    state: 'Central Government',
    isCentral: true,
    isNew: false,
    isUpdated: true,
    status: 'published',
    aiConfidenceScore: 0.98,
    titleTelugu: 'పిఎం విద్యా లక్ష్మి పథకం: ₹7.5 లక్షల వరకు గ్యారెంటీ లేని విద్యా రుణం & 3.5% వడ్డీ సబ్సిడీ',
    shortSummaryTelugu: 'భారతదేశంలోని అత్యుత్తమ కళాశాలల్లో ఉన్నత విద్యనభ్యసించే విద్యార్థులకు సింగిల్ పోర్టల్ ద్వారా విద్యా రుణాలు మరియు స్కాలర్‌షిప్‌లు అందించే కేంద్ర ప్రభుత్వ పథకం.',
    whatIsSchemeTelugu: 'పిఎం విద్యా లక్ష్మి అనేది విద్యా రుణాలు మరియు ప్రభుత్వ స్కాలర్‌షిప్‌ల కోసం రూపొందించబడిన ఏకీకృత డిజిటల్ పోర్టల్. కామన్ అప్లికేషన్ ఫారమ్ (CELAF) ద్వారా ఒకేసారి పలు బ్యాంకులకు దరఖాస్తు చేసుకోవచ్చు.',
    whatHappenedTelugu: 'కేంద్ర విద్యా మంత్రిత్వ శాఖ విద్యా లక్ష్మి పోర్టల్‌లో 86 వాణిజ్య బ్యాంకులను అనుసంధానించింది. ₹7.5 లక్షల వరకు రుణాలకు 75% వరకు క్రెడిట్ గ్యారెంటీ మద్దతు అందిస్తోంది.'
  },
  {
    id: 'ayushman-bharat-pmjay-5lakh-cover',
    slug: 'ayushman-bharat-pmjay-free-hospitalization-5lakh-health-card',
    schemeId: 'pmjay',
    title: 'Ayushman Bharat (PM-JAY): ₹5 Lakh Free Health Insurance Cover Per Family & Senior Citizen Expansion',
    shortSummary: 'World’s largest government-funded health insurance scheme providing cashless hospitalization up to ₹5 Lakhs per family per year across 29,000+ empaneled public and private hospitals. Now covers all senior citizens aged 70+ regardless of income.',
    whatHappened: 'Government of India expanded PM-JAY to cover all senior citizens aged 70 years and above with an additional distinct health cover of ₹5 Lakhs per year under Ayushman Vaya Vandana Card.',
    whatIsScheme: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides health coverage for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families (approx 55 crore beneficiaries) across India.',
    benefits: [
      { id: 'ba1', title: 'Cashless Hospital Cover', amount: '₹5,000,000 / family / year', type: 'insurance', description: 'Covers medical examination, treatment, consultation, pre-and post-hospitalization, medicines, and ICU charges.' },
      { id: 'ba2', title: 'No Family Size Cap', type: 'service', description: 'Covers all family members with no restriction on age or gender.' },
      { id: 'ba3', title: 'Pre-existing Conditions Covered', type: 'insurance', description: 'All pre-existing diseases are covered from Day 1 of card activation.' },
      { id: 'ba4', title: 'Ayushman Vaya Vandana (Senior 70+)', amount: '₹5 Lakh Extra', type: 'insurance', description: 'Dedicated card for all elderly citizens aged 70+ irrespective of income.' }
    ],
    whoCanApply: [
      'Families identified under SECC 2011 data or active state ration card list (BPL / AAY)',
      'All Indian citizens aged 70 years and above (for Ayushman Vaya Vandana card)',
      'Building and Construction Workers (BOCW) registered with state welfare boards'
    ],
    whoCannotApply: [
      'Families covered under CGHS, ESI, or private commercial health insurance earning high taxable income (unless applying for 70+ Senior Citizen Card)'
    ],
    documents: [
      { id: 'da1', name: 'Aadhaar Card', required: true, description: 'Mandatory for biometric identity validation and card generation.' },
      { id: 'da2', name: 'Ration Card / Family ID Card', required: true, description: 'Proves family unit composition.' },
      { id: 'da3', name: 'Active Mobile Number', required: true, description: 'For OTP verification on Ayushman App.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Check Eligibility Online or on App', description: 'Visit beneficiary.nha.gov.in or download the "Ayushman App" from Google Play Store.', url: 'https://beneficiary.nha.gov.in' },
      { stepNumber: 2, title: 'Search by Ration Card or Aadhaar', description: 'Select State, enter Ration Card Number, Aadhaar Number, or Mobile Number.' },
      { stepNumber: 3, title: 'Complete e-KYC', description: 'Select beneficiary name and complete e-KYC using Aadhaar OTP, Mobile Face Auth, or Fingerprint scanner.' },
      { stepNumber: 4, title: 'Download Ayushman Card (PVC Digital Card)', description: 'Upon instant verification, download the official digital Ayushman Card.' },
      { stepNumber: 5, title: 'Avail Cashless Hospital Treatment', description: 'Present Ayushman Card at any empaneled hospital Ayushman Mitra desk during admission.' }
    ],
    deadline: 'Ongoing / Permanent Registration',
    statusCheckGuide: 'Verify card and find empaneled hospitals at beneficiary.nha.gov.in -> Find Hospital.',
    officialWebsite: 'https://beneficiary.nha.gov.in',
    importantWarnings: [
      'Empaneled hospitals CANNOT charge any cash fees from Ayushman Card holders for covered procedures.',
      'In case of denial of cashless treatment, immediately call toll-free helpline 14555.'
    ],
    source: {
      name: 'National Health Authority (NHA)',
      url: 'https://nha.gov.in',
      domain: 'nha.gov.in',
      type: 'pib',
      verifiedDate: '2026-08-01',
      verificationStatus: 'verified',
      department: 'Ministry of Health and Family Welfare'
    },
    generatedImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-08-01T10:00:00Z',
    lastVerifiedAt: '2026-08-07T10:00:00Z',
    readTimeMinutes: 4,
    category: 'Health & Medical Cover',
    state: 'Central Government',
    isCentral: true,
    isNew: true,
    isUpdated: true,
    status: 'published',
    aiConfidenceScore: 0.99,
    titleTelugu: 'ఆయుష్మాన్ భారత్ (PM-JAY): కుటుంబానికి ₹5 లక్షల ఉచిత వైద్య బీమా కార్డ్ & 70+ ఏళ్ల వయోవృద్ధులకు వర్తింపు',
    shortSummaryTelugu: 'దేశవ్యాప్తంగా 29,000 కంటే ఎక్కువ నెట్‌వర్క్ ఆసుపత్రులలో ఉచిత నగదు రహిత వైద్య చికిత్స కోసం ఏటా ₹5 లక్షల ఆరోగ్య బీమా కవరేజ్. 70 ఏళ్లు దాటిన జ్యేష్ఠ పౌరులందరికీ ప్రత్యేక కార్డులు జారీ చేయబడతాయి.',
    whatIsSchemeTelugu: 'ఆయుష్మాన్ భారత్ ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన (PM-JAY) అనేది పేద మరియు అత్యంత వెనుకబడిన కుటుంబాలకు ఉచిత ఆసుపత్రి చికిత్స అందించే ప్రపంచంలోనే అతిపెద్ద ప్రభుత్వ వైద్య బీమా పథకం.',
    whatHappenedTelugu: 'కేంద్ర ప్రభుత్వం PM-JAY ను విస్తరించి 70 ఏళ్లు పైబడిన వయోవృద్ధులందరికీ ఆదాయ పరిమితితో సంబంధం లేకుండా \'ఆయుష్మాన్ వయో వందన కార్డు\' ద్వారా అదనపు ₹5 లక్షల ఉచిత వైద్య రక్షణ కల్పించింది.'
  },
  {
    id: 'maharashtra-mahadbt-scholarship-2026',
    slug: 'maharashtra-mahadbt-scholarship-tuition-fee-reimbursement',
    schemeId: 'mahadbt-mh',
    title: 'Maharashtra MahaDBT Scholarship: Up to 100% Tuition Fee Waiver & Hostel Maintenance Allowance',
    shortSummary: 'Government of Maharashtra provides post-matric scholarship and tuition fee reimbursement for SC, ST, VJNT, OBC, SBC, and EWS students studying in professional and non-professional diploma, degree, and PG courses.',
    whatHappened: 'The Social Justice & Special Assistance Department has opened the portal for 2026-27 renewals and fresh applications with direct Aadhaar-based bank disbursal.',
    whatIsScheme: 'MahaDBT is the centralized portal for post-matric scholarship schemes administered by 8 departments of Maharashtra State Government to ensure higher education accessibility.',
    benefits: [
      { id: 'bm1', title: 'Tuition & Exam Fee Waiver', amount: '50% to 100%', type: 'scholarship', description: 'Full reimbursement for SC/ST and up to 50%-100% for OBC/EWS in professional courses like Engineering, MBBS, MBA.' },
      { id: 'bm2', title: 'Hostel Maintenance Allowance', amount: 'Up to ₹12,000 / year', type: 'financial', description: 'Stipend for hosteller students residing in recognized hosteller setups.' }
    ],
    whoCanApply: [
      'Domicile resident student of Maharashtra state',
      'Enrolled in recognized Maharashtra university/college via CAP round allotment',
      'Annual family income within category limits (e.g. ≤ ₹8 Lakhs for EWS/SEBC, ≤ ₹2.5 Lakhs for SC/ST)'
    ],
    whoCannotApply: [
      'Students admitted under management quota seats without CAP round allotment',
      'Students who have failed or dropped out without valid sanction'
    ],
    documents: [
      { id: 'dm1', name: 'Maharashtra Domicile Certificate', required: true, description: 'Issued by competent authority proving state residence.' },
      { id: 'dm2', name: 'Caste & Validity Certificate (if applicable)', required: true, description: 'Mandatory for reserved category benefits.' },
      { id: 'dm3', name: 'Income Certificate from Tehsildar', required: true, description: 'Valid income proof for financial year.' },
      { id: 'dm4', name: 'CAP Allotment Letter & College Fee Receipt', required: true, description: 'Proves merit admission.' }
    ],
    steps: [
      { stepNumber: 1, title: 'Visit MahaDBT Portal', description: 'Go to mahadbt.maharashtra.gov.in and click New Applicant Registration.', url: 'https://mahadbt.maharashtra.gov.in' },
      { stepNumber: 2, title: 'Complete Aadhaar Authentication', description: 'Verify mobile OTP linked to Aadhaar.' },
      { stepNumber: 3, title: 'Fill Personal, Qualification & Course Details', description: 'Provide institute details, course year, and upload relevant certificates.' },
      { stepNumber: 4, title: 'Submit Application to College Desk', description: 'Submit digital application. College scrutinizes and forwards to Department.' }
    ],
    deadline: '2026-09-30',
    statusCheckGuide: 'Log in to mahadbt.maharashtra.gov.in -> My Applied Schemes to view college and department approval stages.',
    officialWebsite: 'https://mahadbt.maharashtra.gov.in',
    importantWarnings: [
      'Aadhaar bank account must have active NPCI mapper to receive scholarship installments.',
      'Double check course code and college code during online selection.'
    ],
    source: {
      name: 'Social Justice Dept, Govt of Maharashtra',
      url: 'https://maharashtra.gov.in',
      domain: 'maharashtra.gov.in',
      type: 'state_portal',
      verifiedDate: '2026-07-28',
      verificationStatus: 'verified',
      department: 'Social Justice and Special Assistance Department'
    },
    generatedImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
    publishedAt: '2026-07-28T12:00:00Z',
    lastVerifiedAt: '2026-08-05T14:00:00Z',
    readTimeMinutes: 4,
    category: 'Education & Scholarships',
    state: 'Maharashtra',
    isCentral: false,
    isNew: false,
    isUpdated: true,
    status: 'published',
    aiConfidenceScore: 0.96,
    titleTelugu: 'మహారాష్ట్ర మహాDBT స్కాలర్‌షిప్: 100% ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్ & హాస్టల్ నిర్వహణ అలవెన్స్',
    shortSummaryTelugu: 'మహారాష్ట్ర ప్రభుత్వం SC, ST, VJNT, OBC మరియు EWS విద్యార్థులకు ప్రొఫెషనల్ మరియు డిగ్రీ కోర్సుల కోసం 100% వరకు ఫీజు రీయింబర్స్‌మెంట్ మరియు హాస్టల్ మద్దతు అందిస్తోంది.',
    whatIsSchemeTelugu: 'మహాDBT అనేది మహారాష్ట్ర రాష్ట్ర ప్రభుత్వంలోని 8 విభాగాలు నిర్వహించే పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్ పథకాల కోసం కేంద్రీకృత డిజిటల్ పోర్టల్.',
    whatHappenedTelugu: 'సామాజిక న్యాయ శాఖ 2026-27 విద్యాసంవత్సరానికి కొత్త దరఖాస్తులు మరియు రెన్యూవల్స్ కోసం పోర్టల్‌ను తెరిచింది.'
  }
];

export const INITIAL_PIPELINE_ITEMS: NewsPipelineItem[] = [
  {
    id: 'pipe-1',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2012901',
    sourceTitle: 'Ministry of Labour Approves ESI Medical Benefit Extension to Unorganized Brick Kiln & Construction Workers',
    sourceDomain: 'pib.gov.in',
    fetchedAt: '2026-08-08T06:30:00Z',
    textSnippet: 'The Union Minister for Labour and Employment announced the integration of e-Shram portal with ESIC medical facilities, granting free outpatient and emergency treatment to registered construction workers across 15 states.',
    relevanceStatus: 'relevant',
    confidenceScore: 0.96,
    extractedDepartment: 'Ministry of Labour and Employment'
  },
  {
    id: 'pipe-2',
    sourceUrl: 'https://telangana.gov.in/news/cabinet-decisions-august-2026',
    sourceTitle: 'Telangana Cabinet Approves Additional Subsidized Solar Pump Sets under PM-KUSUM Component B',
    sourceDomain: 'telangana.gov.in',
    fetchedAt: '2026-08-08T05:15:00Z',
    textSnippet: 'State government sanction of 30,000 off-grid solar water pumps for farmers in off-grid agricultural zones with 80% subsidy (30% Central + 50% State).',
    relevanceStatus: 'relevant',
    confidenceScore: 0.94,
    extractedDepartment: 'Energy Department, Govt of Telangana'
  },
  {
    id: 'pipe-3',
    sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2012899',
    sourceTitle: 'Union Minister Inaugatues Annual Handicraft Expo in Pragati Maidan',
    sourceDomain: 'pib.gov.in',
    fetchedAt: '2026-08-08T04:00:00Z',
    textSnippet: 'Dignitaries visited stall exhibitions and delivered speeches praising Indian handloom heritage at the ceremonial opening.',
    relevanceStatus: 'irrelevant',
    confidenceScore: 0.12,
    extractedDepartment: 'Ministry of Textiles'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'PM-KISAN 19th Installment Live',
    message: 'Ministry has initiated ₹2,000 DBT transfer. Verify your eKYC and land seeding status now.',
    date: '2026-08-07',
    read: false,
    linkUrl: '/schemes/pm-kisan-19th-installment-release-guidelines',
    type: 'scheme_update'
  },
  {
    id: 'notif-2',
    title: 'Telangana Rythu Bharosa Deadline',
    message: 'AEO verification window open for Kharif season CCRC tenant farmer card updates.',
    date: '2026-08-06',
    read: false,
    linkUrl: '/schemes/telangana-rythu-bharosa-farmer-investment-support-guide',
    type: 'deadline'
  },
  {
    id: 'notif-3',
    title: 'Ayushman Vaya Vandana (Senior 70+)',
    message: 'New cashless ₹5 Lakh health cover card active for all citizens aged 70+ regardless of income.',
    date: '2026-08-05',
    read: true,
    linkUrl: '/schemes/ayushman-bharat-pmjay-free-hospitalization-5lakh-health-card',
    type: 'eligibility_alert'
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-default-1',
  name: 'Citizen User',
  email: 'qindiaration@gmail.com',
  state: 'Telangana',
  occupation: 'Farmer',
  ageRange: '26-40',
  incomeRange: 'Below ₹2.5 Lakhs',
  gender: 'male',
  category: 'General/OBC',
  savedSchemeIds: ['pm-kisan-19th-installment', 'telangana-rythu-bharosa-2026'],
  notificationPreferences: {
    categories: ['Agriculture & Farmers', 'Education & Scholarships', 'Health & Medical Cover'],
    states: ['Telangana', 'Central Government'],
    newSchemes: true,
    deadlines: true
  }
};
