const TELUGU_WORD_MAP: Record<string, string> = {
  'రైతు': 'rythu',
  'కిసాన్': 'kisan',
  'భరోసా': 'bharosa',
  'పెన్షన్': 'pension',
  'పింఛన్': 'pension',
  'అమ్మ ఒడి': 'amma-vodi',
  'అమ్మఒడి': 'amma-vodi',
  'విద్యా': 'vidya',
  'దీవెన': 'deevena',
  'వసతి': 'vasathi',
  'ఆరోగ్యశ్రీ': 'aarogyasri',
  'ఆరోగ్య': 'aarogya',
  'చేయూత': 'cheyutha',
  'ఆసరా': 'asara',
  'కల్యాణ': 'kalyana',
  'మస్తు': 'masthu',
  'షాదీ': 'shaadi',
  'తోఫా': 'thofa',
  'వాహన': 'vahana',
  'మిత్ర': 'mithra',
  'కాపు': 'kapu',
  'నేస్తం': 'nestham',
  'చేదోడు': 'chedodu',
  'మత్స్యకార': 'matsyakara',
  'సున్నా': 'sunna',
  'వడ్డీ': 'vaddi',
  'ఇళ్లు': 'housing',
  'గృహ': 'housing',
  'పథకం': 'scheme',
  'సంక్షేమ': 'welfare',
  'ప్రభుత్వం': 'government',
  'అప్‌డేట్': 'update',
  'అప్డేట్': 'update',
  'మార్గాదర్శకాలు': 'guidelines',
  'అర్హత': 'eligibility',
  'దరఖాస్తు': 'application',
  'లిస్ట్': 'list',
  'స్టేటస్': 'status',
  'పేమెంట్': 'payment',
  'ఉచిత': 'free',
  'బస్సు': 'bus',
  'ప్రయాణం': 'travel',
  'కార్డ్': 'card',
  'బియ్యం': 'rice',
  'రేషన్': 'ration',
};

const TELUGU_CHAR_MAP: Record<string, string> = {
  'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u', 'ఊ': 'oo', 'ఋ': 'ru', 'ఎ': 'e', 'ఏ': 'ae', 'ఐ': 'ai', 'ఒ': 'o', 'ఓ': 'oo', 'ఔ': 'au', 'అం': 'am',
  'క': 'k', 'ఖ': 'kh', 'గ': 'g', 'ఘ': 'gh', 'చ': 'ch', 'ఛ': 'chh', 'జ': 'j', 'ఝ': 'jh', 'ట': 't', 'ఠ': 'th', 'డ': 'd', 'ఢ': 'dh', 'ణ': 'n',
  'త': 'th', 'థ': 'th', 'ద': 'd', 'ధ': 'dh', 'న': 'n', 'ప': 'p', 'ఫ': 'f', 'బ': 'b', 'భ': 'bh', 'మ': 'm', 'య': 'y', 'ర': 'r', 'ల': 'l', 'వ': 'v',
  'శ': 'sh', 'ష': 'sh', 'స': 's', 'హ': 'h', 'ళ': 'l', 'క్ష': 'ksh', 'ఱ': 'r',
  'ా': 'aa', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo', 'ృ': 'ru', 'ె': 'e', 'ే': 'ae', 'ై': 'ai', 'ొ': 'o', 'ో': 'oo', 'ౌ': 'au', 'ం': 'm', 'ః': 'h', '్': '',
};

export function createSlug(title?: string, fallbackId?: string): string {
  if (!title && !fallbackId) {
    return `scheme-${Date.now()}`;
  }

  let text = (title || fallbackId || '').trim();

  // 1. Replace known Telugu dictionary terms with standard English transliteration
  for (const [teluguWord, englishWord] of Object.entries(TELUGU_WORD_MAP)) {
    if (text.includes(teluguWord)) {
      text = text.replace(new RegExp(teluguWord, 'g'), ` ${englishWord} `);
    }
  }

  // 2. Transliterate remaining individual Telugu characters to English phonetics
  let transliterated = '';
  for (const char of text) {
    if (TELUGU_CHAR_MAP[char] !== undefined) {
      transliterated += TELUGU_CHAR_MAP[char];
    } else {
      transliterated += char;
    }
  }

  // 3. Extract pure lower-case English alphanumeric characters and hyphens
  let clean = transliterated
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // 4. Guarantee clean English slug string
  if (!clean || clean.length < 3) {
    const timestamp = Date.now().toString(36);
    clean = `government-scheme-${timestamp}`;
  }

  // Trim trailing or leading hyphens
  clean = clean.replace(/^----+|----+$/g, '');

  return clean;
}
