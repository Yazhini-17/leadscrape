class PlaywrightScraper {
  async fetch(url, timeout = 30) {
    try {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      try {
        const context = await browser.newContext({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/120.0.0.0 Safari/537.36 LeadScrape/1.0',
          viewport: { width: 1280, height: 800 },
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout * 1000 });
        await page.waitForTimeout(2000);
        const html = await page.content();
        await browser.close();
        return { success: true, html, error: null };
      } catch (err) {
        await browser.close();
        const isTimeout = err.name === 'TimeoutError' || err.message?.includes('Timeout');
        return { success: false, html: '', error: isTimeout ? 'TIMEOUT' : err.message };
      }
    } catch (importErr) {
      console.warn('Playwright browser unavailable or not installed:', importErr.message);
      return { success: false, html: '', error: importErr.message };
    }
  }
}

module.exports = PlaywrightScraper;
