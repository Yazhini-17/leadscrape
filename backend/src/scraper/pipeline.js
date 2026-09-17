const {
  ScrapingTask,
  Organization,
  Website,
  PhoneNumber,
  EmailAddress,
  Contact,
  SocialLink,
  SourcePage,
  ScrapingLog,
} = require('../models');
const { DuckDuckGoProvider, BingProvider, DiscoveryOrchestrator } = require('./discovery');
const WebsiteCrawler = require('./crawler');
const {
  isValidPhone,
  isValidEmail,
  deduplicatePhones,
  deduplicateEmails,
  deduplicateSocialLinks,
} = require('./cleaner');
const { deduplicateOrganizations, extractDomain } = require('../services/deduplicationService');
const { calculateConfidence } = require('../services/leadService');
const { updateTaskStatus } = require('../services/taskService');

async function runScrapingPipeline(taskDbId, taskId, request) {
  try {
    await updateTaskStatus(taskDbId, 'RUNNING');
    console.log(`[${taskId}] Starting scraping pipeline for '${request.keyword}' in '${request.location}'`);

    const providers = [new DuckDuckGoProvider(), new BingProvider()];
    const orchestrator = new DiscoveryOrchestrator(providers);
    let discovered = await orchestrator.discoverAll(
      request.keyword,
      request.location,
      request.max_results || 100
    );

    if (request.enable_deduplication !== false) {
      discovered = deduplicateOrganizations(discovered);
    }

    const task = await ScrapingTask.findByPk(taskDbId);
    if (!task) return;

    task.results_discovered = discovered.length;
    task.websites_found = discovered.filter(d => d.website_url).length;
    await task.save();

    const crawler = new WebsiteCrawler(taskId, 2.0);

    for (const disc of discovered) {
      // Check cancellation
      await task.reload();
      if (task.status === 'CANCELLED') {
        console.log(`[${taskId}] Task cancelled by user`);
        break;
      }

      const orgName = disc.name || 'Unknown';
      const websiteUrl = disc.website_url || '';

      // Create organization
      const org = await Organization.create({
        task_id: taskDbId,
        name: orgName,
        category: request.keyword,
        location: request.location,
        source: disc.source || 'search',
        is_duplicate: false,
      });

      // Add website
      if (websiteUrl) {
        await Website.create({
          organization_id: org.id,
          url: websiteUrl,
          domain: extractDomain(websiteUrl),
          is_official: true,
          discovery_source: disc.source || 'search',
          confidence: disc.confidence || 0.5,
          status: 'ACTIVE',
        });

        // Add scraping log
        const log = await ScrapingLog.create({
          task_id: taskDbId,
          url: websiteUrl,
          status: 'PENDING',
        });

        try {
          const crawlResult = await crawler.crawlOrganization(
            org.id,
            websiteUrl,
            request.max_pages_per_site || 20,
            request.required_fields,
            request.enable_javascript || false,
            request.respect_robots_txt !== false,
            request.crawl_internal_pages !== false
          );

          // Save extracted phones
          const savedPhones = new Set();
          const uniquePhones = deduplicatePhones(crawlResult.phones || []);
          for (const p of uniquePhones) {
            const norm = p.normalized || p.number;
            if (!savedPhones.has(norm) && isValidPhone(p.number)) {
              await PhoneNumber.create({
                organization_id: org.id,
                number: p.number,
                normalized: norm,
                phone_type: p.phone_type || 'UNKNOWN',
                source_url: p.source_url,
                is_whatsapp: p.is_whatsapp || false,
              });
              savedPhones.add(norm);
            }
          }

          // Save extracted emails
          const savedEmails = new Set();
          const uniqueEmails = deduplicateEmails(crawlResult.emails || []);
          for (const e of uniqueEmails) {
            const norm = (e.normalized || e.email).toLowerCase();
            if (!savedEmails.has(norm) && isValidEmail(e.email)) {
              await EmailAddress.create({
                organization_id: org.id,
                email: e.email,
                normalized: norm,
                email_type: e.email_type || 'GENERAL',
                source_url: e.source_url,
                is_valid: true,
              });
              savedEmails.add(norm);
            }
          }

          // Save address
          if (crawlResult.address) {
            org.address = crawlResult.address.address;
            org.street = crawlResult.address.street;
            org.area = crawlResult.address.area;
            org.city = crawlResult.address.city;
            org.state = crawlResult.address.state;
            org.pincode = crawlResult.address.pincode;
            org.address_source = crawlResult.address.source_url;
            await org.save();
          }

          // Save contacts
          for (const ct of crawlResult.contacts || []) {
            await Contact.create({
              organization_id: org.id,
              name: ct.name,
              designation: ct.designation,
              source_url: ct.source_url,
            });
          }

          // Save social links
          const savedSocial = new Set();
          const uniqueSocials = deduplicateSocialLinks(crawlResult.social_links || []);
          for (const sl of uniqueSocials) {
            if (!savedSocial.has(sl.url)) {
              await SocialLink.create({
                organization_id: org.id,
                platform: sl.platform,
                url: sl.url,
                is_valid: true,
              });
              savedSocial.add(sl.url);
            }
          }

          // Save source pages
          for (const sp of crawlResult.source_pages || []) {
            await SourcePage.create({
              organization_id: org.id,
              url: sp.url,
              page_type: sp.page_type,
              status_code: sp.status_code,
              scraped_at: new Date(),
            });
          }

          // Update log
          log.status = 'SUCCESS';
          log.pages_crawled = (crawlResult.source_pages || []).length;
          log.phones_extracted = savedPhones.size;
          log.emails_extracted = savedEmails.size;
          await log.save();

          // Update task counters
          await task.reload();
          task.websites_crawled += 1;
          task.phones_found += savedPhones.size;
          task.emails_found += savedEmails.size;
          if (org.address) {
            task.addresses_found += 1;
          }
          await task.save();
        } catch (crawlErr) {
          console.error(`[${taskId}] Error crawling ${websiteUrl}:`, crawlErr.message);
          log.status = 'FAILED';
          log.error_message = crawlErr.message.substring(0, 500);
          await log.save();
        }
      }

      // Calculate confidence
      await org.reload({
        include: [
          { association: 'websites' },
          { association: 'phone_numbers' },
          { association: 'email_addresses' },
          { association: 'contacts' },
          { association: 'social_links' },
        ],
      });
      const { score, level } = calculateConfidence(org);
      org.confidence_score = score;
      org.confidence_level = level;
      await org.save();
    }

    await task.reload();
    if (task.status !== 'CANCELLED') {
      task.status = 'COMPLETED';
      task.completed_at = new Date();
      await task.save();
      console.log(`[${taskId}] Scraping completed successfully`);
    }
  } catch (err) {
    console.error(`[${taskId}] Fatal error in scraping pipeline:`, err);
    try {
      const task = await ScrapingTask.findByPk(taskDbId);
      if (task) {
        task.status = 'FAILED';
        task.error_message = err.message.substring(0, 500);
        task.completed_at = new Date();
        await task.save();
      }
    } catch (dbErr) {
      console.error('Failed to update task to FAILED:', dbErr);
    }
  }
}

module.exports = {
  runScrapingPipeline,
};
