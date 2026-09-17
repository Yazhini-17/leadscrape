const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const IRRELEVANT_DOMAINS = new Set([
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'youtube.com', 'wikipedia.org', 'justdial.com',
  'sulekha.com', 'indiamart.com', 'quora.com', 'reddit.com',
  'maps.google.com', 'google.com', 'yelp.com',
]);

function isIrrelevantUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace('www.', '').toLowerCase();
    for (const irr of IRRELEVANT_DOMAINS) {
      if (domain.includes(irr)) return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

function cleanTitle(title) {
  if (!title) return '';
  let cleaned = title.replace(/\s*[-|–]\s*.+$/, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ');
  return cleaned.substring(0, 200);
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

function extractDomainName(url) {
  try {
    const parsed = new URL(url);
    const netloc = parsed.hostname.replace('www.', '');
    const base = netloc.split('.')[0];
    return base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch (err) {
    return '';
  }
}

class DuckDuckGoProvider {
  async discover(keyword, location, maxResults) {
    const results = [];
    const query = `${keyword} ${location} official website`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    try {
      const resp = await axios.get(url, {
        headers: HEADERS,
        timeout: 20000,
        validateStatus: status => status < 400,
      });

      const $ = cheerio.load(resp.data);
      const bodies = $('.result__body');

      bodies.slice(0, maxResults * 2).each((_, el) => {
        const titleEl = $(el).find('.result__title');
        const urlEl = $(el).find('.result__url');
        const snippetEl = $(el).find('.result__snippet');

        if (!titleEl.length) return;

        const title = titleEl.text().trim();
        let resultUrl = '';
        if (urlEl.length) {
          resultUrl = urlEl.text().trim();
          if (!resultUrl.startsWith('http')) {
            resultUrl = 'https://' + resultUrl;
          }
        }

        if (isIrrelevantUrl(resultUrl)) return;

        const orgName = cleanTitle(title);
        if (!orgName) return;

        results.push({
          name: orgName,
          website_url: resultUrl,
          source: 'duckduckgo',
          confidence: 0.7,
          snippet: snippetEl.length ? snippetEl.text().trim() : '',
        });

        if (results.length >= maxResults) return false;
      });

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.warn('DuckDuckGo search failed:', err.message);
    }

    return results;
  }
}

class BingProvider {
  async discover(keyword, location, maxResults) {
    const results = [];
    const query = `${keyword} ${location}`;
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=20`;

    try {
      const resp = await axios.get(url, {
        headers: HEADERS,
        timeout: 20000,
        validateStatus: status => status < 400,
      });

      const $ = cheerio.load(resp.data);
      const items = $('li.b_algo');

      items.slice(0, maxResults * 2).each((_, el) => {
        const titleEl = $(el).find('h2 a');
        if (!titleEl.length) return;

        const title = titleEl.text().trim();
        const href = titleEl.attr('href') || '';

        if (isIrrelevantUrl(href)) return;

        const orgName = cleanTitle(title);
        if (!orgName) return;

        results.push({
          name: orgName,
          website_url: href.startsWith('http') ? href : '',
          source: 'bing',
          confidence: 0.65,
        });

        if (results.length >= maxResults) return false;
      });

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.warn('Bing search failed:', err.message);
    }

    return results;
  }
}

class UserProvidedURLProvider {
  constructor(urls) {
    this.urls = urls || [];
  }

  async discover(keyword, location, maxResults) {
    const results = [];
    for (const url of this.urls.slice(0, maxResults)) {
      const domainName = extractDomainName(url);
      results.push({
        name: domainName || url,
        website_url: url,
        source: 'user_provided',
        confidence: 0.9,
      });
    }
    return results;
  }
}

class DiscoveryOrchestrator {
  constructor(providers) {
    this.providers = providers;
  }

  async discoverAll(keyword, location, maxResults) {
    const allResults = [];
    const seenDomains = new Set();

    for (const provider of this.providers) {
      if (allResults.length >= maxResults) break;
      try {
        const results = await provider.discover(keyword, location, maxResults - allResults.length);
        for (const r of results) {
          const domain = extractDomain(r.website_url || '');
          if (domain && seenDomains.has(domain)) {
            continue;
          }
          allResults.push(r);
          if (domain) {
            seenDomains.add(domain);
          }
          if (allResults.length >= maxResults) break;
        }
      } catch (err) {
        console.error('Provider failed:', err.message);
      }
    }

    return allResults.slice(0, maxResults);
  }
}

module.exports = {
  DuckDuckGoProvider,
  BingProvider,
  UserProvidedURLProvider,
  DiscoveryOrchestrator,
  extractDomain,
};
