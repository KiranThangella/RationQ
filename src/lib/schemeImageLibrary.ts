import { ContentImage } from '../types.js';

export interface SchemeImagesResult {
  heroImage: string;
  contentImages: ContentImage[];
}

export function getSchemeImages(title: string = '', category: string = '', state: string = ''): SchemeImagesResult {
  const text = (title + ' ' + category + ' ' + state).toLowerCase();

  // Agriculture / Farmer
  if (text.includes('kisan') || text.includes('farmer') || text.includes('rythu') || text.includes('agri') || text.includes('crop') || text.includes('annadata')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&fm=webp&q=75&w=1200',
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

  // Education / Student / Scholarship
  if (text.includes('scholar') || text.includes('student') || text.includes('vidya') || text.includes('education') || text.includes('school') || text.includes('college') || text.includes('fee')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&fm=webp&q=75&w=1200',
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

  // Women Welfare / Maternity / Girl Child / SHG
  if (text.includes('women') || text.includes('mahila') || text.includes('girl') || text.includes('maternity') || text.includes('shg') || text.includes('dwcra') || text.includes('amma') || text.includes('cheyutha') || text.includes('stree')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&fm=webp&q=75&w=1200',
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

  // Business / Artisans / Loans / Mudra / Vishwakarma
  if (text.includes('business') || text.includes('loan') || text.includes('mudra') || text.includes('vishwakarma') || text.includes('vendor') || text.includes('artisan') || text.includes('trade')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1556742049-0a67dd3f1246?auto=format&fit=crop&fm=webp&q=75&w=1200',
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'MSME & Micro Enterprise Skill Certification & Equipment Grant',
          captionTelugu: 'చేతివృత్తులు, చేనేత మరియు ఎంఎస్ఎంఈ పరికరాల రాయితీ మార్గదర్శకాలు'
        },
        {
          url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Official Bank Subsidized Credit Sanction Letter & Disbursement',
          captionTelugu: 'బ్యాంక్ రుణ మంజూరు పత్రాల తనిఖీ మరియు ప్రాసెస్ క్లియరెన్స్'
        }
      ]
    };
  }

  // Housing / Urban / Rural Awas
  if (text.includes('house') || text.includes('housing') || text.includes('awas') || text.includes('home') || text.includes('plot') || text.includes('urban')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&fm=webp&q=75&w=1200',
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Geo-tagging Site Verification & Housing Construction Installment Approval',
          captionTelugu: 'గృహనిర్మాణ స్థలాల జియోటాగింగ్ మరియు నిర్మాణ నిధుల విడతల మంజూరు'
        }
      ]
    };
  }

  // Health / Medical / Ayushman
  if (text.includes('health') || text.includes('ayushman') || text.includes('hospital') || text.includes('arogyasri') || text.includes('medical') || text.includes('insurance')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&fm=webp&q=75&w=1200',
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Arogyasri / Ayushman Bharat Digital Card e-KYC Verification at Network Hospital',
          captionTelugu: 'నెట్‌వర్క్ ఆసుపత్రులలో డిజిటల్ హెల్త్ కార్డ్ ఈ-కేవైసీ తనిఖీ మరియు ఉచిత వైద్యం'
        }
      ]
    };
  }

  // Senior Pension / Social Welfare
  if (text.includes('pension') || text.includes('senior') || text.includes('elder') || text.includes('asara') || text.includes('widow') || text.includes('disability')) {
    return {
      heroImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&fm=webp&q=75&w=1200',
      contentImages: [
        {
          url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17373ce?auto=format&fit=crop&fm=webp&q=75&w=800',
          caption: 'Doorstep Pension Disbursement & Biometric Authentication at Village Secretariat',
          captionTelugu: 'గ్రామ సచివాలయం వాలంటీర్ల ద్వారా ఇంటివద్దకే పెన్షన్ పంపిణీ మరియు వేలిముద్రల ధృవీకరణ'
        }
      ]
    };
  }

  // Default Scheme Portal Image
  return {
    heroImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&fm=webp&q=75&w=1200',
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
