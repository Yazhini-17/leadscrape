const cheerio = require('cheerio');

// ─── Phone Extraction ─────────────────────────────────────────────────────────

const PHONE_PATTERNS = [
  /(?:\+91[\s\-]?)?[6-9]\d{9}/g,
  /\+91[\s\-]?\d{5}[\s\-]?\d{5}/g,
  /0[2-9]\d{1,2}[\s\-]?\d{6,8}/g,
  /\d{4}[\s\-]\d{6}/g,
];

const WHATSAPP_HINTS = /whatsapp|wa\.me/i;

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+91')) {
    digits = digits.substring(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.substring(2);
  }
  digits = digits.replace(/^0+/, '');
  if (digits.length === 10 && '6789'.includes(digits[0])) {
    return '+91' + digits;
  }
  return phone;
}

function extractPhones(html, sourceUrl) {
  const results = [];
  const seen = new Set();
  const $ = cheerio.load(html || '');

  // Tel links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('tel:')) {
      const num = href.replace('tel:', '').trim();
      if (num && !seen.has(num)) {
        const text = $(el).text() + ' ' + $(el).parent().text();
        const isWa = WHATSAPP_HINTS.test(text);
        results.push({
          number: num,
          normalized: normalizePhone(num),
          phone_type: isWa ? 'WHATSAPP' : 'MAIN',
          source_url: sourceUrl,
          is_whatsapp: isWa,
        });
        seen.add(num);
      }
    }
  });

  // WhatsApp links (wa.me)
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('wa.me')) {
      const match = href.match(/wa\.me\/(\d+)/);
      if (match) {
        const num = match[1];
        if (!seen.has(num)) {
          results.push({
            number: '+' + num,
            normalized: '+' + num,
            phone_type: 'WHATSAPP',
            source_url: sourceUrl,
            is_whatsapp: true,
          });
          seen.add(num);
        }
      }
    }
  });

  // Text scan
  const text = $('body').text() || $.text();
  for (const pattern of PHONE_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const num = match[0].trim();
      const clean = num.replace(/[\s\-\(\)]/g, '');
      if (!seen.has(clean) && clean.length >= 8) {
        results.push({
          number: num,
          normalized: normalizePhone(num),
          phone_type: 'UNKNOWN',
          source_url: sourceUrl,
          is_whatsapp: false,
        });
        seen.add(clean);
      }
    }
  }

  return results;
}

// ─── Email Extraction ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;
const OBFUSCATED_EMAIL = /[a-zA-Z0-9._%+\-]+\s*[\[\(]?at[\]\)]?\s*[a-zA-Z0-9.\-]+\s*[\[\(]?dot[\]\)]?\s*[a-zA-Z]{2,}/gi;

const EMAIL_TYPE_MAP = {
  info: 'INFO',
  contact: 'CONTACT',
  admin: 'CONTACT',
  admissions: 'ADMISSIONS',
  admission: 'ADMISSIONS',
  support: 'SUPPORT',
  help: 'SUPPORT',
};

function classifyEmail(email) {
  const local = (email.split('@')[0] || '').toLowerCase();
  for (const [key, val] of Object.entries(EMAIL_TYPE_MAP)) {
    if (local.includes(key)) {
      return val;
    }
  }
  return 'GENERAL';
}

function extractEmails(html, sourceUrl) {
  const results = [];
  const seen = new Set();
  const $ = cheerio.load(html || '');

  // mailto links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('mailto:')) {
      const email = href.replace('mailto:', '').split('?')[0].trim();
      if (email && !seen.has(email)) {
        results.push({
          email,
          normalized: email.toLowerCase(),
          email_type: classifyEmail(email),
          source_url: sourceUrl,
          is_valid: true,
        });
        seen.add(email);
      }
    }
  });

  // Text scan
  const text = $('body').text() || $.text();
  let match;
  const regex = new RegExp(EMAIL_PATTERN.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    const email = match[0].trim();
    const norm = email.toLowerCase();
    if (!seen.has(norm) && !norm.endsWith('.png') && !norm.endsWith('.jpg') && !norm.endsWith('.gif')) {
      results.push({
        email,
        normalized: norm,
        email_type: classifyEmail(email),
        source_url: sourceUrl,
        is_valid: true,
      });
      seen.add(norm);
    }
  }

  // Obfuscated
  const obfRegex = new RegExp(OBFUSCATED_EMAIL.source, 'gi');
  while ((match = obfRegex.exec(text)) !== null) {
    const raw = match[0];
    let email = raw.replace(/\s*[\[\(]?at[\]\)]?\s*/gi, '@');
    email = email.replace(/\s*[\[\(]?dot[\]\)]?\s*/gi, '.').trim();
    const norm = email.toLowerCase();
    if (!seen.has(norm) && norm.includes('@')) {
      results.push({
        email,
        normalized: norm,
        email_type: classifyEmail(email),
        source_url: sourceUrl,
        is_valid: true,
      });
      seen.add(norm);
    }
  }

  return results;
}

// ─── Address Extraction ────────────────────────────────────────────────────────

const PINCODE_PATTERN = /\b[1-9]\d{5}\b/;
const INDIAN_STATES = [
  'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh',
  'West Bengal', 'Bihar', 'Punjab', 'Haryana', 'Odisha', 'Assam',
  'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand',
  'Goa', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura',
  'Arunachal Pradesh', 'Sikkim', 'Delhi', 'Puducherry', 'Chandigarh',
];
const STATE_PATTERN = new RegExp(INDIAN_STATES.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'i');

function parseAddressText(text, sourceUrl) {
  const result = {
    address: text.substring(0, 500),
    source_url: sourceUrl,
    street: null,
    area: null,
    city: null,
    state: null,
    pincode: null,
  };

  const pincodeMatch = text.match(PINCODE_PATTERN);
  if (pincodeMatch) {
    result.pincode = pincodeMatch[0];
  }

  const stateMatch = text.match(STATE_PATTERN);
  if (stateMatch) {
    result.state = stateMatch[0];
  }

  return result;
}

function extractAddress($, sourceUrl) {
  // Try <address> tags first
  let found = null;
  $('address').each((_, el) => {
    if (found) return;
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length > 10) {
      found = parseAddressText(text, sourceUrl);
    }
  });
  if (found) return found;

  // Try footer
  const footer = $('footer');
  if (footer.length > 0) {
    const text = footer.text().replace(/\s+/g, ' ').trim();
    if (text.length > 10) {
      const parsed = parseAddressText(text, sourceUrl);
      if (parsed && parsed.pincode) {
        return parsed;
      }
    }
  }

  // Try common contact section patterns
  const selectors = [
    'div.contact', 'div.address', 'section.contact',
    "div[class*='contact']", "div[class*='address']", "div[class*='location']",
  ];
  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      const text = el.text().replace(/\s+/g, ' ').trim();
      const parsed = parseAddressText(text, sourceUrl);
      if (parsed && parsed.address) {
        return parsed;
      }
    }
  }

  return null;
}

// ─── Social Links ──────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = {
  'facebook.com': 'FACEBOOK',
  'fb.com': 'FACEBOOK',
  'instagram.com': 'INSTAGRAM',
  'linkedin.com': 'LINKEDIN',
  'youtube.com': 'YOUTUBE',
  'youtu.be': 'YOUTUBE',
  'twitter.com': 'TWITTER',
  'x.com': 'TWITTER',
};

function extractSocialLinks($, sourceUrl) {
  const results = [];
  const seen = new Set();
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    for (const [domain, platform] of Object.entries(SOCIAL_PLATFORMS)) {
      if (href.includes(domain) && !seen.has(href)) {
        if (href.startsWith('http')) {
          results.push({
            platform,
            url: href,
            source_url: sourceUrl,
          });
          seen.add(href);
        }
        break;
      }
    }
  });
  return results;
}

// ─── Contact Person ────────────────────────────────────────────────────────────

const DESIGNATION_KEYWORDS = [
  'Principal', 'Director', 'Founder', 'Manager', 'Administrator',
  'Chairman', 'Correspondent', 'Headmaster', 'Headmistress',
  'Admissions Officer', 'Secretary', 'Trustee', 'President',
  'CEO', 'MD', 'Managing Director',
];

const escapedKeywords = DESIGNATION_KEYWORDS.map(d => d.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
const DESIGNATION_PATTERN = new RegExp(
  '(' + escapedKeywords + ')[:\\s]+([A-Z][a-z]+(?:\\s[A-Z][a-z]+){1,3})',
  'gi'
);

function extractContactPersons($, sourceUrl) {
  const results = [];
  const text = $('body').text() || $.text();
  let match;
  const regex = new RegExp(DESIGNATION_PATTERN.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    const designation = match[1].trim().replace(/\b\w/g, c => c.toUpperCase());
    const name = match[2].trim();
    if (name && name.length > 3) {
      results.push({
        name,
        designation,
        source_url: sourceUrl,
      });
    }
    if (results.length >= 5) break;
  }
  return results;
}

// ─── Page Type Detection ───────────────────────────────────────────────────────

const PAGE_KEYWORDS = {
  contact: ['contact', 'reach us', 'get in touch', 'find us'],
  about: ['about us', 'about', 'who we are', 'our story'],
  admissions: ['admissions', 'admission', 'enroll', 'enrollment', 'apply'],
  management: ['management', 'leadership', 'board', 'governance'],
  faculty: ['faculty', 'staff', 'teachers', 'team', 'our team'],
  branches: ['branches', 'locations', 'centers', 'campus'],
};

function detectPageType(url, title, content) {
  const combined = ((title || '') + ' ' + (url || '').toLowerCase()).toLowerCase();
  for (const [pageType, keywords] of Object.entries(PAGE_KEYWORDS)) {
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        return pageType;
      }
    }
  }
  return 'other';
}

module.exports = {
  extractPhones,
  extractEmails,
  extractAddress,
  extractSocialLinks,
  extractContactPersons,
  detectPageType,
  normalizePhone,
};
