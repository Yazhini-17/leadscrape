const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'at', 'to', 'for',
  'school', 'college', 'academy', 'institute', 'international',
  'pvt', 'ltd', 'private', 'limited', 'inc', 'co',
]);

function normalizeName(name) {
  if (!name) return '';
  let normalized = name.toLowerCase().trim();
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized
    .split(/\s+/)
    .filter(w => !STOPWORDS.has(w) && w.length > 1);
  words.sort();
  return words.join(' ');
}

// Similar to Python's SequenceMatcher(None, a, b).ratio()
function nameSimilarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0.0;
  if (na === nb) return 1.0;

  // Dice coefficient / bigram similarity matching SequenceMatcher ratio closely
  const bigramsA = getBigrams(na);
  const bigramsB = getBigrams(nb);

  let intersection = 0;
  const countB = {};
  for (const bg of bigramsB) {
    countB[bg] = (countB[bg] || 0) + 1;
  }
  for (const bg of bigramsA) {
    if (countB[bg] && countB[bg] > 0) {
      intersection++;
      countB[bg]--;
    }
  }

  const total = bigramsA.length + bigramsB.length;
  if (total === 0) return 0.0;
  return (2.0 * intersection) / total;
}

function getBigrams(str) {
  const bigrams = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2));
  }
  return bigrams;
}

function extractDomain(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '').toLowerCase();
  } catch (err) {
    return '';
  }
}

function deduplicateOrganizations(discovered) {
  const unique = [];
  const seenNames = [];
  const seenDomains = new Set();

  for (const item of discovered) {
    const name = item.name || '';
    const domain = extractDomain(item.website_url || '');

    // Check domain dedup
    if (domain && seenDomains.has(domain)) {
      continue;
    }

    // Check name similarity
    let isDup = false;
    for (const existingName of seenNames) {
      if (nameSimilarity(name, existingName) > 0.85) {
        isDup = true;
        break;
      }
    }

    if (!isDup) {
      unique.push(item);
      seenNames.push(name);
      if (domain) {
        seenDomains.add(domain);
      }
    }
  }

  return unique;
}

module.exports = {
  normalizeName,
  nameSimilarity,
  deduplicateOrganizations,
  extractDomain,
};
