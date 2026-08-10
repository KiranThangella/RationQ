import { ContentImage } from '../types.js';

export interface SchemeImagesResult {
  heroImage: string;
  contentImages: ContentImage[];
  imageKeywords?: string[];
  visualSubject?: string;
}

/**
 * Intelligent Image Search & Scheme Matching Engine
 * Uses semantic keywords, scheme titles, category, state, and custom Gemini vision search queries
 * to dynamically generate highly relevant, high-definition Unsplash images with bilingual captions.
 */
export function getSchemeImages(
  title: string = '',
  category: string = '',
  state: string = '',
  customSearchQuery: string = ''
): SchemeImagesResult {
  const combined = (title + ' ' + category + ' ' + state + ' ' + customSearchQuery).toLowerCase();

  // Helper to construct dynamic Unsplash webp search image URL when needed
  const makeUnsplashSearchUrl = (keywords: string, w: number = 1200) => {
    const encoded = encodeURIComponent(keywords.trim());
    return `https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&fm=webp&q=75&w=${w}&search=${encoded}`;
  };

  // 1. Solar Energy & Rooftop Power (PM Surya Ghar, Kusum, Free Electricity, Muft Bijli)
  if (
    combined.includes('solar') ||
    combined.includes('surya') ||
    combined.includes('electricity') ||
    combined.includes('bijli') ||
    combined.includes('power') ||
    combined.includes('energy') ||
    combined.includes('kusum') ||
    combined.includes('rooftop')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Rooftop solar photovoltaic panels installed on home roof providing clean electricity',
      imageKeywords: ['solar energy', 'rooftop solar', 'clean power', 'electricity meter'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Rooftop Solar Panel Grid Connection & Subsidy Inspection',
          captionTelugu: 'రూఫ్‌టాప్ సోలార్ సిస్టమ్ గ్రిడ్ అనుసంధానం మరియు సబ్సిడీ తనిఖీ'
        },
        {
          url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Smart Digital Electricity Meter & Monthly Free Unit Calculation',
          captionTelugu: 'డిజిటల్ స్మార్ట్ మీటర్ ద్వారా నెలవారీ ఉచిత యూనిట్ల లెక్కింపు'
        }
      ]
    };
  }

  // 2. LPG Cooking Gas / Ujjwala / Deepam Scheme
  if (
    combined.includes('gas') ||
    combined.includes('ujjwala') ||
    combined.includes('deepam') ||
    combined.includes('cylinder') ||
    combined.includes('lpg')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Clean LPG cooking gas cylinder and stove in rural household kitchen',
      imageKeywords: ['lpg cylinder', 'ujjwala scheme', 'clean cooking gas', 'rural kitchen'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Free LPG Gas Cylinder Distribution & Refill Subsidy Credit',
          captionTelugu: 'ఉచిత ఎల్‌పీజీ గ్యాస్ సిలిండర్ పంపిణీ మరియు రీఫిల్ సబ్సిడీ జమ'
        },
        {
          url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Women Beneficiary e-KYC Verification at Gas Agency Portal',
          captionTelugu: 'గ్యాస్ ఏజెన్సీ సెంటర్‌లో మహిళా లబ్ధిదారుల ఈ-కేవైసీ సీడింగ్'
        }
      ]
    };
  }

  // 3. Post Office Small Savings (PPF, NSC, KVP, POMIS, Senior Citizen Savings)
  if (
    combined.includes('post office') ||
    combined.includes('ppf') ||
    combined.includes('provident fund') ||
    combined.includes('nsc') ||
    combined.includes('kvp') ||
    combined.includes('kisan vikas') ||
    combined.includes('pomis') ||
    combined.includes('monthly income') ||
    combined.includes('small savings')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Passbook and guaranteed savings certificates issued by India Post Office',
      imageKeywords: ['post office savings', 'ppf passbook', 'small savings', 'interest calculation'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'India Post Office Branch Passbook Entry & Interest Credit',
          captionTelugu: 'పోస్టాఫీస్ ఖాతా పాస్‌బుక్ వివరాలు మరియు నెలవారీ వడ్డీ జమ తనిఖీ'
        },
        {
          url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Government Guaranteed Small Savings Certificate Issuance',
          captionTelugu: 'భారత ప్రభుత్వ గ్యారంటీ సేవింగ్స్ సర్టిఫికేట్ మరియు బాండ్ పత్రాలు'
        }
      ]
    };
  }

  // 4. Financial Inclusion & Jan Dhan (PMJDY, Zero Balance, RuPay, Overdraft, Banking)
  if (
    combined.includes('jan dhan') ||
    combined.includes('pmjdy') ||
    combined.includes('zero balance') ||
    combined.includes('rupay') ||
    combined.includes('overdraft') ||
    combined.includes('bank account') ||
    combined.includes('banking')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Indian citizen at bank counter receiving RuPay debit card and passbook',
      imageKeywords: ['jan dhan account', 'rupay card', 'bank counter', 'dbt credit'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'RuPay Debit Card Issuance with Free Accident Insurance Cover',
          captionTelugu: 'ఉచిత ప్రమాద బీమా కలిగిన రూపే డెబిట్ కార్డ్ పంపిణీ'
        },
        {
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Bank Overdraft Facility Verification & Aadhaar Seeding',
          captionTelugu: 'రూ.10,000 బ్యాంక్ ఓవర్‌డ్రాఫ్ట్ అర్హత మరియు ఆధార్ సీడింగ్ తనిఖీ'
        }
      ]
    };
  }

  // 5. Girl Child & Sukanya Samriddhi (SSY, Beti Bachao)
  if (
    combined.includes('sukanya') ||
    combined.includes('ssy') ||
    (combined.includes('girl') && (combined.includes('child') || combined.includes('education') || combined.includes('kanya')))
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'School girl studying with book representing girl child education welfare',
      imageKeywords: ['sukanya samriddhi', 'girl education', 'post office savings', 'beti bachao'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Post Office Sukanya Samriddhi Account Opening & Tax Exemption Certificate',
          captionTelugu: 'పోస్టాఫీసు సుకన్య సమృద్ధి ఖాతా నమోదు మరియు 80C పన్ను మినహాయింపు'
        },
        {
          url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Girl Child Higher Education Fund Withdrawal Verification',
          captionTelugu: 'ఆడపిల్లల ఉన్నత చదువుల నిధుల విత్‌డ్రా మరియు కాలేజీ ధృవీకరణ'
        }
      ]
    };
  }

  // 6. Artisans, PM Vishwakarma, Weavers, Craftsmen, Tailors
  if (
    combined.includes('vishwakarma') ||
    combined.includes('artisan') ||
    combined.includes('craft') ||
    combined.includes('handloom') ||
    combined.includes('weaver') ||
    combined.includes('tailor') ||
    combined.includes('barber') ||
    combined.includes('carpenter') ||
    combined.includes('potter')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Skilled traditional artisan working with specialized tool kit and craft equipment',
      imageKeywords: ['pm vishwakarma', 'artisan toolkit', 'handloom weaver', 'skill training'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Traditional Skill Training & Free Tool Kit E-Voucher Distribution',
          captionTelugu: 'చేతివృత్తుల శిక్షణ మరియు రూ.15,000 ఉచిత టూల్‌కిట్ ఈ-వోచర్ల పంపిణీ'
        },
        {
          url: 'https://images.unsplash.com/photo-1556742049-0a67dd3f1246?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Collateral-Free Subsidized Loan Disbursement at 5% Interest',
          captionTelugu: 'వడ్డీ రాయితీతో రూ.3 లక్షల విడతల బ్యాంక్ అప్పు పంపిణీ'
        }
      ]
    };
  }

  // 7. Street Vendors, Micro Loans & Small Business (PM SVANidhi, Mudra, Vendor)
  if (
    combined.includes('svanidhi') ||
    combined.includes('vendor') ||
    combined.includes('mudra') ||
    combined.includes('micro loan') ||
    combined.includes('street') ||
    combined.includes('small business')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1556742049-0a67dd3f1246?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Street vendor accepting UPI QR code payment at small market stall',
      imageKeywords: ['pm svanidhi', 'street vendor loan', 'digital upi qr', 'working capital'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Digital UPI QR Code Setup & Cashless Cashback Incentives for Vendors',
          captionTelugu: 'వీధి వ్యాపారులకు డిజిటల్ క్యూఆర్‌ కోడ్ మరియు క్యాష్‌బ్యాక్ ప్రోత్సాహకాలు'
        },
        {
          url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Working Capital Micro-Loan Sanction Letter Verification',
          captionTelugu: 'కార్యచరణ మూలధనం రూ.10,000 - రూ.50,000 మైక్రో రుణ మంజూరు'
        }
      ]
    };
  }

  // 8. Generic Medicines & Jan Aushadhi Kendras
  if (
    combined.includes('aushadhi') ||
    combined.includes('generic') ||
    combined.includes('medicine') ||
    combined.includes('pharmacy') ||
    combined.includes('drug counter')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Pharmacist dispensing subsidized essential medicines at Jan Aushadhi Kendra counter',
      imageKeywords: ['jan aushadhi kendra', 'generic medicine', 'subsidized pharmacy', 'affordable drugs'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Jan Aushadhi Kendra Subsidized Quality Medicine Counter',
          captionTelugu: 'జన్ ఔషధి కేంద్రాల్లో 50%-90% సబ్సిడీతో నాణ్యమైన మందుల విక్రయం'
        },
        {
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Quality Verification of Generic Pharmaceutical Batches',
          captionTelugu: 'నాణ్యతా ప్రమాణాల తనిఖీ మరియు నిత్యావసర మందుల సరఫరా'
        }
      ]
    };
  }

  // 9. Health, Medical & Ayushman Bharat (PMJAY, Arogyasri, Health Card, Hospitals)
  if (
    combined.includes('health') ||
    combined.includes('ayushman') ||
    combined.includes('arogyasri') ||
    combined.includes('hospital') ||
    combined.includes('medical') ||
    combined.includes('treatment') ||
    combined.includes('pmjay') ||
    combined.includes('doctor')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Patient presenting Ayushman digital health card at hospital registration desk',
      imageKeywords: ['ayushman card', 'cashless treatment', 'hospital ward', 'health insurance'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Arogyasri / Ayushman Digital Card e-KYC Verification at Empaneled Hospital',
          captionTelugu: 'నెట్‌వర్క్ ఆసుపత్రులలో డిజిటల్ హెల్త్ కార్డ్ ఈ-కేవైసీ తనిఖీ మరియు నగదు రహిత సేవలు'
        },
        {
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Free Specialist Diagnostic & In-Patient Hospitalization Services',
          captionTelugu: 'రూ.5 లక్షల వరకు ఉచిత ఆసుపత్రి ఇన్-పేషెంట్ చికిత్స పొందే సౌకర్యం'
        }
      ]
    };
  }

  // 10. Disability & Divyangjan Assistive Devices (ADIP, UDID Card)
  if (
    combined.includes('disability') ||
    combined.includes('divyang') ||
    combined.includes('handicapped') ||
    combined.includes('adip') ||
    combined.includes('udid') ||
    combined.includes('wheelchair') ||
    combined.includes('assistive device')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Free motorized tricycle and hearing aid distribution camp for Divyangjan',
      imageKeywords: ['divyangjan', 'assistive devices', 'udid card', 'adip scheme'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Free Assistive Hearing Aids & Tricycle Distribution Camp for Divyangjan',
          captionTelugu: 'దివ్యాంగులకు ఉచిత సహాయ పరికరాలు మరియు మోటరైజ్డ్ వాహనాల పంపిణీ క్యాంప్'
        }
      ]
    };
  }

  // 11. Agriculture & Farmers (PM-KISAN, Kisan Credit Card, Rythu Bharosa, Crop Loan, Seeds, PMFBY)
  if (
    combined.includes('kisan') ||
    combined.includes('farmer') ||
    combined.includes('rythu') ||
    combined.includes('agri') ||
    combined.includes('crop') ||
    combined.includes('annadata') ||
    combined.includes('fasal') ||
    combined.includes('fertilizer') ||
    combined.includes('paddy')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Indian farmer standing proudly in lush green agricultural field holding mobile checking PM Kisan status',
      imageKeywords: ['pm kisan', 'farmer dbt credit', 'green farm field', 'kisan credit card'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Digital Verification of Land Ownership & Pahani Records at CSC / Meeseva Centre',
          captionTelugu: 'మీసేవ/సచివాలయంలో భూమి హక్కుల వివరాలు మరియు పహాణీ రికార్డుల తనిఖీ'
        },
        {
          url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Direct Benefit Transfer (DBT) Bank Account Passbook & eKYC Confirmation',
          captionTelugu: 'రైతు ఖాతాలో పీఎం-కిసాన్ / వైఎస్సార్ / రైతుబంధు నిధుల జమ మరియు eKYC ధృవీకరణ'
        }
      ]
    };
  }

  // 12. Education, Students & Scholarships (Vidya Deevena, Fee Reimbursement, College, Loans)
  if (
    combined.includes('scholar') ||
    combined.includes('student') ||
    combined.includes('vidya') ||
    combined.includes('education') ||
    combined.includes('school') ||
    combined.includes('college') ||
    combined.includes('fee') ||
    combined.includes('degree')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'College students walking together on campus representing higher education scholarships',
      imageKeywords: ['education scholarship', 'student portal', 'college fee reimbursement', 'vidya deevena'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Online Student Portal e-Scholarship Registration & College Verification',
          captionTelugu: 'విద్యార్థుల జ్ఞానభూమి / ఈ-పాస్ పోర్టల్‌లో ఆన్‌లైన్ దరఖాస్తు నమోదు'
        },
        {
          url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Certificates & Income Statement Verification for Fee Reimbursement',
          captionTelugu: 'ఫీజు రీయింబర్స్మెంట్ కోసం మార్కుల జాబితాలు మరియు ఆదాయ ధృవీకరణ తనిఖీ'
        }
      ]
    };
  }

  // 13. Women Welfare, SHG, DWCRA, Maternity, Cheyutha, Lakhpati Didi
  if (
    combined.includes('women') ||
    combined.includes('mahila') ||
    combined.includes('maternity') ||
    combined.includes('shg') ||
    combined.includes('dwcra') ||
    combined.includes('amma') ||
    combined.includes('cheyutha') ||
    combined.includes('stree') ||
    combined.includes('lakhpati')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Empowered Indian woman entrepreneur in traditional attire leading self-help group meeting',
      imageKeywords: ['women empowerment', 'dwcra shg group', 'cheyutha scheme', 'lakhpati didi'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Self Help Group (SHG) & Micro-Financial Assistance Distribution',
          captionTelugu: 'డ్వాక్రా మహిళా సంఘాల సమావేశం మరియు ఆర్థిక స్వావలంబన రుణాలు'
        },
        {
          url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Women Beneficiary Direct Bank Disbursement & Aadhaar Seeding',
          captionTelugu: 'మహిళా లబ్ధిదారుల బ్యాంక్ ఖాతాలో ఆర్థిక ప్రోత్సాహకాల జమ'
        }
      ]
    };
  }

  // 14. Housing, Urban & Rural Awas Yojana (PMAY, Home Loan Subvention, Construction)
  if (
    combined.includes('house') ||
    combined.includes('housing') ||
    combined.includes('awas') ||
    combined.includes('home') ||
    combined.includes('plot') ||
    combined.includes('construction') ||
    combined.includes('flat')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Modern newly constructed pucca house under Pradhan Mantri Awas Yojana',
      imageKeywords: ['pm awas yojana', 'housing subsidy', 'pucca house construction', 'home key'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Geo-tagging Site Verification & Housing Construction Installment Approval',
          captionTelugu: 'గృహనిర్మాణ స్థలాల జియోటాగింగ్ మరియు నిర్మాణ నిధుల విడతల మంజూరు'
        }
      ]
    };
  }

  // 15. Senior Pensions, Atal Pension, SCSS, Asara Pensions
  if (
    combined.includes('pension') ||
    combined.includes('senior') ||
    combined.includes('elder') ||
    combined.includes('asara') ||
    combined.includes('widow') ||
    combined.includes('atal pension') ||
    combined.includes('apy')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Happy elderly Indian couple receiving monthly pension at doorstep',
      imageKeywords: ['senior pension', 'atal pension yojana', 'doorstep pension delivery', 'asara pension'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17373ce?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Doorstep Pension Disbursement & Biometric Authentication at Village Secretariat',
          captionTelugu: 'గ్రామ సచివాలయం వాలంటీర్ల ద్వారా ఇంటివద్దకే పెన్షన్ పంపిణీ మరియు వేలిముద్రల ధృవీకరణ'
        }
      ]
    };
  }

  // 16. Skill India, Job Training, Apprenticeship, PMKVY
  if (
    combined.includes('skill') ||
    combined.includes('training') ||
    combined.includes('job') ||
    combined.includes('kaushal') ||
    combined.includes('pmkvy') ||
    combined.includes('apprentice')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Young students undergoing practical technical skill training in Skill India laboratory',
      imageKeywords: ['pmkvy skill center', 'vocational training', 'skill india card', 'employment training'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Skill India Vocational Center Hands-On Practical Training Lab',
          captionTelugu: 'స్కిల్ ఇండియా నైపుణ్య అభివృద్ధి కేంద్రంలో ఉపాధి శిక్షణ మరియు ప్రాక్టికల్స్'
        }
      ]
    };
  }

  // 17. Ration, Food Security, Free Rice Card, Public Distribution System
  if (
    combined.includes('ration') ||
    combined.includes('food') ||
    combined.includes('rice') ||
    combined.includes('grain') ||
    combined.includes('annapurna') ||
    combined.includes('pds shop')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Clean food grains and rice distribution at government fair price ration shop',
      imageKeywords: ['ration card', 'free food grain', 'epos machine', 'pds shop'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Fair Price Shop ePOS Biometric Grain Distribution',
          captionTelugu: 'రేషన్ షాపులలో ఇ-పాస్ మిషన్ ద్వారా ఉచిత బియ్యం మరియు నిత్యావసర సరుకుల పంపిణీ'
        }
      ]
    };
  }

  // 18. Free Bus Transport / Women Mobility Schemes
  if (
    combined.includes('bus') ||
    combined.includes('transport') ||
    combined.includes('travel') ||
    combined.includes('passenger') ||
    combined.includes('maha lakshmi bus')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Public state transport bus providing zero-fare travel for women passengers',
      imageKeywords: ['free bus travel', 'state transport', 'women passenger pass', 'public mobility'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Zero-Fare Bus Pass Issuance & Aadhaar Verification for Women Passengers',
          captionTelugu: 'ఆర్టీసీ బస్సులలో మహిళలకు ఉచిత ప్రయాణ టిక్కెట్లు మరియు ఆధార్ తనిఖీ'
        }
      ]
    };
  }

  // 19. Clean Water & Sanitation (Jal Jeevan Mission, Swachh Bharat)
  if (
    combined.includes('water') ||
    combined.includes('jal') ||
    combined.includes('tap') ||
    combined.includes('sanitation') ||
    combined.includes('swachh') ||
    combined.includes('toilet')
  ) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&fm=webp&q=75&w=1200',
      visualSubject: 'Clean piped tap water drinking connection in rural Indian household',
      imageKeywords: ['jal jeevan mission', 'har ghar jal', 'clean drinking water', 'swachh bharat'],
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Functional Household Tap Connection (FHTC) Water Quality Testing',
          captionTelugu: 'హర్ ఘర్ జల్ పథకం కింద ప్రతి ఇంటికీ రక్షిత మంచి నీటి కొళాయి అనుసంధానం'
        }
      ]
    };
  }

  // Default Scheme Portal Image
  return {
    heroImage: customSearchQuery ? makeUnsplashSearchUrl(customSearchQuery, 1200) : 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&fm=webp&q=75&w=1200',
    visualSubject: 'Official Government Welfare Portal Document Verification and Digital Services',
    imageKeywords: ['government portal', 'dbt scheme', 'public welfare', 'myscheme india'],
    contentImages: [
      {
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&fm=webp&q=75&w=800',
        caption: 'Official Government Portal Document Submission & Online Registration',
        captionTelugu: 'అధికారిక ప్రభుత్వ పోర్టల్‌లో ఆన్‌లైన్ దరఖాస్తు మరియు ధృవీకరణ పత్రాల సమర్పణ'
      },
      {
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&fm=webp&q=75&w=800',
        caption: 'Direct Benefit Transfer (DBT) Status Check & Public Grievance Portal',
        captionTelugu: 'నేరుగా లబ్ధి బదిలీ (DBT) స్టేటస్ తనిఖీ మరియు అధికారుల సమీక్ష'
      }
    ]
  };
}

export function getArticleWebpImage(title: string = '', category: string = '', state: string = '', customSearchQuery: string = ''): string {
  return getSchemeImages(title, category, state, customSearchQuery).heroImage;
}
