function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function cleanPhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d+\s\-\(\)]/g, '').trim();
}

function cleanEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

function cleanUrl(url) {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

function isValidPhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function isValidEmail(email) {
  if (!email) return false;
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email.trim());
}

function deduplicatePhones(phones) {
  const seen = new Set();
  const unique = [];
  for (const p of phones) {
    const raw = p.normalized || p.number || '';
    const norm = raw.replace(/[^\d]/g, '');
    if (!seen.has(norm) && norm.length >= 8) {
      seen.add(norm);
      unique.push(p);
    }
  }
  return unique;
}

function deduplicateEmails(emails) {
  const seen = new Set();
  const unique = [];
  for (const e of emails) {
    const norm = (e.normalized || e.email || '').toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      unique.push(e);
    }
  }
  return unique;
}

function deduplicateSocialLinks(links) {
  const seen = new Set();
  const unique = [];
  for (const link of links) {
    const url = link.url || '';
    if (!seen.has(url)) {
      seen.add(url);
      unique.push(link);
    }
  }
  return unique;
}

function emptyToNull(val) {
  if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  return val;
}

module.exports = {
  cleanText,
  cleanPhone,
  cleanEmail,
  cleanUrl,
  isValidPhone,
  isValidEmail,
  deduplicatePhones,
  deduplicateEmails,
  deduplicateSocialLinks,
  emptyToNull,
};
