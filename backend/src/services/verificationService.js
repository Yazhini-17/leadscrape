const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX_IN = /^(\+91[\s\-]?)?[6-9]\d{9}$/;
const PHONE_REGEX_LAND = /^0[2-9]\d{1,2}[\s\-]?\d{6,8}$/;

function validateEmail(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

function validatePhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX_IN.test(digits) || PHONE_REGEX_LAND.test(digits);
}

function validateUrl(url) {
  if (!url) return false;
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url.trim());
}

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

function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

function normalizeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean.replace(/\/+$/, '');
}

module.exports = {
  validateEmail,
  validatePhone,
  validateUrl,
  normalizePhone,
  normalizeEmail,
  normalizeUrl,
};
