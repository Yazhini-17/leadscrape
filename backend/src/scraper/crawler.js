const cheerio = require('cheerio');
const HTTPScraper = require('./httpScraper');
const PlaywrightScraper = require('./playwrightScraper');
const {
  extractPhones,
  extractEmails,
  extractAddress,
  extractSocialLinks,
  extractContactPersons,
  detectPageType,
} = require('./extractor');

const RELEVANT_PAGE_KEYWORDS = [
  'about', 'contact', 'reach', 'admissions', 'admission',
  'management', 'principal', 'faculty', 'staff', 'administration',
  'branches', 'locations', 'infrastructure', 'team', 'leadership',
];

class WebsiteCrawler {
  constructor(taskId, rateLimit = 2.0) {
    this.taskId = taskId;
    this.http = new HTTPScraper(15, 2);
    this.playwright = new PlaywrightScraper();
    this.visitedUrls = new Set();
    this.domainLastRequest = new Map();
    this.rateLimit = rateLimit * 1000; // ms
  }

  extractDomain(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '').toLowerCase();
    } catch (err) {
      return '';
    }
  }

  async rateLimitDomain(domain) {
    if (!domain) return;
    const last = this.domainLastRequest.get(domain) || 0;
    const now = Date.now();
    const elapsed = now - last;
    if (elapsed < this.rateLimit) {
      await new Promise(r => setTimeout(r, this.rateLimit - elapsed));
    }
    this.domainLastRequest.set(domain, Date.now());
  }

  async crawlOrganization(
    orgId,
    websiteUrl,
    maxPages = 20,
    requiredFields = null,
    enableJavascript = false,
    respectRobots = true,
    crawlInternal = true
  ) {
    const result = {
      phones: [],
      emails: [],
      address: null,
      contacts: [],
      social_links: [],
      source_pages: [],
    };

    if (!websiteUrl) return result;
    const domain = this.extractDomain(websiteUrl);

    // robots.txt check
    if (respectRobots) {
      const allowed = await this.http.checkRobots(websiteUrl);
      if (!allowed) {
        console.log(`[${this.taskId}] robots.txt disallows: ${websiteUrl}`);
        return result;
      }
    }

    // Fetch homepage
    const { html, statusCode, finalUrl } = await this.fetchWithFallback(websiteUrl, enableJavascript);
    if (!html) return result;

    if (this.http.isAccessDenied(statusCode, html)) {
      console.warn(`[${this.taskId}] Access denied: ${websiteUrl}`);
      return result;
    }

    const $ = cheerio.load(html);
    const resolvedUrl = finalUrl || websiteUrl;

    result.source_pages.push({
      url: resolvedUrl,
      page_type: 'home',
      status_code: statusCode,
    });
    this.visitedUrls.add(websiteUrl);
    this.visitedUrls.add(resolvedUrl);

    this.extractAndMerge(result, html, $, resolvedUrl);

    if (crawlInternal) {
      const internalUrls = this.discoverRelevantPages(resolvedUrl, $);
      let pagesCrawled = 1;

      for (const pageUrl of internalUrls) {
        if (pagesCrawled >= maxPages) break;
        if (this.visitedUrls.has(pageUrl)) continue;
        this.visitedUrls.add(pageUrl);

        await this.rateLimitDomain(domain);

        const pageRes = await this.fetchWithFallback(pageUrl, enableJavascript);
        if (!pageRes.html) continue;

        if (this.http.isAccessDenied(pageRes.statusCode, pageRes.html)) {
          break; // Stop crawling this domain
        }

        const page$ = cheerio.load(pageRes.html);
        const title = page$('title').text() || '';
        const pageType = detectPageType(pageUrl, title, pageRes.html);
        const resolvedPageUrl = pageRes.finalUrl || pageUrl;

        result.source_pages.push({
          url: resolvedPageUrl,
          page_type: pageType,
          status_code: pageRes.statusCode,
        });

        this.extractAndMerge(result, pageRes.html, page$, resolvedPageUrl);
        pagesCrawled++;
      }
    }

    return result;
  }

  async fetchWithFallback(url, enableJs) {
    const response = await this.http.fetch(url);
    if (response.success) {
      if (enableJs && response.is_js_required) {
        const pwResp = await this.playwright.fetch(url);
        if (pwResp.success) {
          return { html: pwResp.html, statusCode: 200, finalUrl: url };
        }
      }
      return { html: response.html, statusCode: response.status_code, finalUrl: response.final_url };
    }
    return { html: '', statusCode: response.status_code, finalUrl: url };
  }

  extractAndMerge(result, html, $, sourceUrl) {
    const phones = extractPhones(html, sourceUrl);
    const emails = extractEmails(html, sourceUrl);
    const address = extractAddress($, sourceUrl);
    const social = extractSocialLinks($, sourceUrl);
    const contacts = extractContactPersons($, sourceUrl);

    result.phones.push(...phones);
    result.emails.push(...emails);
    result.social_links.push(...social);
    result.contacts.push(...contacts);

    if (address && !result.address) {
      result.address = address;
    } else if (address && address.pincode && (!result.address || !result.address.pincode)) {
      result.address = address;
    }
  }

  discoverRelevantPages(baseUrl, $) {
    const baseDomain = this.extractDomain(baseUrl);
    const priorityLinks = [];
    const otherLinks = [];

    $('a[href]').each((_, el) => {
      const href = ($(el).attr('href') || '').trim();
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      let fullUrl;
      try {
        fullUrl = new URL(href, baseUrl).toString();
      } catch (err) {
        return;
      }

      const linkDomain = this.extractDomain(fullUrl);
      if (linkDomain !== baseDomain) {
        return;
      }

      const anchorText = $(el).text().trim().toLowerCase();
      const urlLower = fullUrl.toLowerCase();

      const isRelevant = RELEVANT_PAGE_KEYWORDS.some(
        kw => anchorText.includes(kw) || urlLower.includes(kw)
      );

      if (isRelevant) {
        priorityLinks.push(fullUrl);
      } else {
        otherLinks.push(fullUrl);
      }
    });

    const seen = new Set([baseUrl]);
    const relevant = [];
    for (const u of [...priorityLinks, ...otherLinks]) {
      if (!seen.has(u)) {
        relevant.push(u);
        seen.add(u);
      }
    }

    return relevant.slice(0, 30);
  }
}

module.exports = WebsiteCrawler;
