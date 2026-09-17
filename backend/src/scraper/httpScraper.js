const axios = require('axios');
const robotsParser = require('robots-parser');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/120.0.0.0 Safari/537.36 LeadScrape/1.0';

const JS_INDICATORS = [
  'react', 'angular', 'vue', 'next.js', 'nuxt',
  '__NEXT_DATA__', 'ng-app', 'data-reactroot',
  'window.__INITIAL_STATE__',
];

class HTTPScraper {
  constructor(timeout = 15, maxRetries = 2) {
    this.timeout = timeout * 1000;
    this.maxRetries = maxRetries;
    this.headers = {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  async fetch(url) {
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: this.headers,
          timeout: this.timeout,
          maxRedirects: 5,
          validateStatus: status => status < 400,
        });

        const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const finalUrl = response.request?.res?.responseUrl || url;

        return {
          success: true,
          html,
          status_code: response.status,
          error: null,
          is_js_required: this.isJsRequired(html),
          final_url: finalUrl,
        };
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          lastError = 'TIMEOUT';
        } else if (err.response) {
          return {
            success: false,
            html: '',
            status_code: err.response.status,
            error: `HTTP ${err.response.status}`,
            is_js_required: false,
            final_url: url,
          };
        } else {
          lastError = err.message || 'Unknown network error';
        }

        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return {
      success: false,
      html: '',
      status_code: null,
      error: lastError,
      is_js_required: false,
      final_url: url,
    };
  }

  isJsRequired(html) {
    if (!html || html.length < 200) {
      return true;
    }
    const htmlLower = html.toLowerCase();
    const jsCount = JS_INDICATORS.reduce((count, ind) => count + (htmlLower.includes(ind.toLowerCase()) ? 1 : 0), 0);

    // Also check for very little text content
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textContent.length < 100 && jsCount > 0) {
      return true;
    }
    return jsCount >= 3;
  }

  async checkRobots(url) {
    try {
      const parsed = new URL(url);
      const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
      const resp = await axios.get(robotsUrl, {
        headers: this.headers,
        timeout: 5000,
        validateStatus: status => status < 400,
      });

      if (resp.status === 200 && typeof resp.data === 'string') {
        const robots = robotsParser(robotsUrl, resp.data);
        return robots.isAllowed(url, USER_AGENT) !== false;
      }
    } catch (err) {
      // If robots.txt unavailable, assume allowed
    }
    return true;
  }

  isAccessDenied(statusCode, html) {
    if ([401, 403, 429].includes(statusCode)) {
      return true;
    }
    if (html) {
      const htmlLower = html.toLowerCase();
      const deniedSignals = [
        'access denied', '403 forbidden', 'blocked',
        'captcha', 'verify you are human', 'robot',
        'cloudflare', 'please enable cookies',
      ];
      if (deniedSignals.some(sig => htmlLower.includes(sig))) {
        return true;
      }
    }
    return false;
  }

  hasLoginForm(html) {
    if (!html) return false;
    return /type=["']password["']/i.test(html);
  }
}

module.exports = HTTPScraper;
