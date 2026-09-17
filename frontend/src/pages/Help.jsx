import React, { useState } from 'react'
import {
  HelpCircle, Search, Rocket, Settings2, Activity,
  Users, Download, AlertCircle, ChevronDown, ChevronUp,
  Globe, Phone, Mail, MapPin, CheckCircle2, ShieldCheck,
  FileSpreadsheet, FileText, ArrowRight, Bookmark, Sparkles,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openSections, setOpenSections] = useState({
    'getting-started': true,
    'creating-task': true,
    'task-status': false,
    'working-with-leads': false,
    'exporting-data': false,
    'faq': false,
  })

  function toggleSection(sectionKey) {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  function expandAll() {
    setOpenSections({
      'getting-started': true,
      'creating-task': true,
      'task-status': true,
      'working-with-leads': true,
      'exporting-data': true,
      'faq': true,
    })
  }

  function collapseAll() {
    setOpenSections({
      'getting-started': false,
      'creating-task': false,
      'task-status': false,
      'working-with-leads': false,
      'exporting-data': false,
      'faq': false,
    })
  }

  const sections = [
    {
      id: 'getting-started',
      title: '1. Getting Started',
      icon: Rocket,
      description: 'Overview of LeadScrape and how to launch your first extraction job.',
      content: (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="leading-relaxed">
            <strong>LeadScrape</strong> is an automated B2B lead generation and web scraping platform. It discovers businesses based on your targeted niche and geographic location, navigates each business website, and extracts high-value contact details into structured, exportable leads.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
            <div className="p-3.5 rounded-lg bg-mint-50/60 dark:bg-mint-950/20 border border-mint-200/60 dark:border-mint-900/40">
              <div className="flex items-center gap-2 font-semibold text-mint-900 dark:text-mint-200 mb-1">
                <Search className="w-4 h-4 text-mint-500" />
                <span>1. Discover</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Queries search engines for matching business entities in your target area.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-mint-50/60 dark:bg-mint-950/20 border border-mint-200/60 dark:border-mint-900/40">
              <div className="flex items-center gap-2 font-semibold text-mint-900 dark:text-mint-200 mb-1">
                <Globe className="w-4 h-4 text-mint-500" />
                <span>2. Crawl & Extract</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Crawls homepages and internal pages (about, contact) to harvest verified contact data.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-mint-50/60 dark:bg-mint-950/20 border border-mint-200/60 dark:border-mint-900/40">
              <div className="flex items-center gap-2 font-semibold text-mint-900 dark:text-mint-200 mb-1">
                <Download className="w-4 h-4 text-mint-500" />
                <span>3. Score & Export</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Calculates lead confidence scores and exports clean datasets in Excel or PDF.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How to create your first task:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600 dark:text-gray-300">
              <li>Click <strong className="text-gray-900 dark:text-gray-100">New Scraping Task</strong> in the left navigation sidebar.</li>
              <li>Enter a <strong className="text-gray-900 dark:text-gray-100">Location</strong> (e.g. <em>Austin, TX</em> or <em>London</em>) and a <strong className="text-gray-900 dark:text-gray-100">Keyword</strong> (e.g. <em>Dental Clinics</em> or <em>Digital Agencies</em>).</li>
              <li>Configure your <strong className="text-gray-900 dark:text-gray-100">Required Data Fields</strong> and crawler settings.</li>
              <li>Click <strong className="text-mint-600 dark:text-mint-400">Start Scraping Task</strong>. You will automatically be taken to the live Task Progress monitor.</li>
            </ol>
            <div className="mt-3">
              <Link
                to="/tasks/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300"
              >
                Create your first task now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'creating-task',
      title: '2. Creating a Scraping Task',
      icon: Settings2,
      description: 'Detailed explanation of inputs, data fields, and crawler configuration switches.',
      content: (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Search Parameters</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
                <span className="font-medium text-gray-900 dark:text-gray-100">Location: </span>
                <span>The city, state, postal region, or geographic boundary for discovery.</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
                <span className="font-medium text-gray-900 dark:text-gray-100">Keyword: </span>
                <span>The industry, business category, or entity type you wish to discover (e.g., <em>"Hotels"</em>, <em>"Law Firms"</em>, <em>"HVAC"</em>).</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
                <span className="font-medium text-gray-900 dark:text-gray-100">Search Radius (5 km – 100 km): </span>
                <span>Controls the geographic proximity radius around your target location.</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
                <span className="font-medium text-gray-900 dark:text-gray-100">Maximum Results & Pages per Website: </span>
                <span>Cap the total organizations found (1–1,000) and how many sub-pages the crawler visits per domain (1–50).</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Data Fields</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Only select fields that matter to your campaign. LeadScrape extracts the following data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Organization Name</strong>
                Discovered entity or company title cleaned of marketing fluff.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Phone Number</strong>
                Landline and mobile numbers parsed from links, tel: tags, and page body.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Email Address</strong>
                Business contact emails extracted from mailto: anchors, footers, and contact sections.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Website</strong>
                Official root URL of the organization.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Physical Address</strong>
                Street, locality, city, state, and postal/ZIP codes detected in address tags or footers.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">WhatsApp</strong>
                Direct chat numbers extracted from wa.me or api.whatsapp.com links.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Social Profiles</strong>
                Official LinkedIn, Facebook, Instagram, Twitter/X, and YouTube page links.
              </div>
              <div className="p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <strong className="text-gray-900 dark:text-gray-100 block mb-0.5">Contact Person & Designation</strong>
                Key executives, founders, or team members identified from About and Team pages.
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Crawler Options</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100 block">Crawl Internal Pages (Recommended)</strong>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    When enabled, the crawler automatically discovers and visits internal <code>/contact</code>, <code>/about</code>, <code>/team</code>, and <code>/reach-us</code> pages to capture emails and phone numbers not present on the homepage.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100 block">Respect robots.txt (Polite Crawling)</strong>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Fetches and parses the target domain's <code>robots.txt</code> file before scanning. If the site disallows scrapers, the crawler respects the rule and skips restricted pages.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-mint-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100 block">Enable JavaScript Rendering</strong>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Uses headless Chromium (Playwright) instead of fast static HTTP fetching. Recommended for single-page applications (React/Vue) where contact details are rendered client-side via JavaScript.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'task-status',
      title: '3. Understanding Task Status & Progress',
      icon: Activity,
      description: 'How tasks progress through their lifecycle and how to monitor real-time execution.',
      content: (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p>Every scraping operation is assigned an identifier (e.g. <code>TASK-000001</code>) and passes through lifecycle states:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">PENDING</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The task is registered in MySQL and queued for background execution.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">RUNNING</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search engines are querying results, domains are being crawled, and leads are being extracted.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">COMPLETED</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Crawling finished successfully, leads were scored, and data is ready for viewing and export.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">FAILED / CANCELLED</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The task encountered a fatal error or was manually halted by clicking "Cancel Task".
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Monitoring Live Progress</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              On the <strong>Task Progress</strong> screen (<code>/tasks/:taskId/progress</code>), you will find:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <li><strong>Real-time Counters:</strong> Organizations found, websites scanned, phone numbers harvested, and emails collected.</li>
              <li><strong>Live Activity Stream:</strong> Step-by-step logs showing which URLs were visited, robots.txt status, and extraction results.</li>
              <li><strong>Direct Action Buttons:</strong> View leads once complete, or cancel a running task anytime.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'working-with-leads',
      title: '4. Working with Leads & Confidence Scores',
      icon: Users,
      description: 'Understanding lead quality scoring, duplicate filtering, and saving leads.',
      content: (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Confidence Scoring Algorithm</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              LeadScrape automatically grades every extracted organization on a 100-point quality scale based on data completeness and verification:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Phone Number</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+25 points</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Email Address</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+25 points</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Official Website</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+20 points</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Postal Address</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+15 points</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Contact Person</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+10 points</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block">Social Links</span>
                <span className="text-mint-600 dark:text-mint-400 font-bold">+5 points</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                HIGH: 70 – 100
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                MEDIUM: 40 – 69
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                LOW: 0 – 39
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Saving & Organizing Leads</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
              In any task's leads list, click the <strong>Bookmark</strong> icon on a row to save that lead into your personal account bookmark collection.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              All bookmarked contacts appear permanently under <strong className="text-gray-900 dark:text-gray-100">Saved Leads</strong> in the sidebar, allowing you to build an active prospect pool across multiple separate scraping tasks.
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Automated Deduplication</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              To prevent duplicate leads from multiple search engines or variations of domain names, LeadScrape runs an automated deduplication service. It compares root domains, normalizes corporate suffixes (e.g. Inc, LLC, Ltd), and computes bigram text similarity to merge duplicates into a single comprehensive lead record.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'exporting-data',
      title: '5. Exporting Data (Excel & PDF)',
      icon: Download,
      description: 'Formats, compatibility, and finding past generated export files.',
      content: (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            You can export your leads directly from any task's leads table by clicking either the <strong>Export Excel</strong> or <strong>Export PDF</strong> button in the top-right toolbar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Excel Export (.xlsx)</span>
              </div>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Full formatted workbook created with ExcelJS.</li>
                <li>Features a styled <strong>Leads</strong> sheet with auto-sized columns and wrapped text.</li>
                <li>Includes a dedicated <strong>Task Info</strong> summary sheet showing the task ID, keyword, location, and export timestamp.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>PDF Export (.pdf)</span>
              </div>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Professionally formatted landscape document with company branding and metadata.</li>
                <li>Clean table presentation with organization name, phone, email, website, address, and confidence rating.</li>
                <li>Paginated sensibly with page numbers and alternate row shading for sharing and printing.</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export History</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Every time you download a dataset, an entry is logged in the <strong className="text-gray-900 dark:text-gray-100">Exports</strong> page (accessible in the sidebar). You can check total record counts, file names, format types, and past export dates anytime.
            </p>
            <div className="mt-2">
              <Link
                to="/exports"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-600 dark:text-mint-400 hover:text-mint-700"
              >
                View your export history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: '6. FAQ & Troubleshooting',
      icon: AlertCircle,
      description: 'Common troubleshooting steps for empty results, missing data, and bot protections.',
      content: (
        <div className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
            <strong className="text-gray-900 dark:text-gray-100 block mb-1">
              Why did my task return 0 results?
            </strong>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              A task might return 0 results due to one of the following reasons:
            </p>
            <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-1.5 space-y-1">
              <li><strong>Overly specific query:</strong> Try broadening the keyword or increasing the search radius (e.g., use "Cafes" instead of "Organic Artisanal Nitro Cold Brew").</li>
              <li><strong>robots.txt restrictions:</strong> Target websites may disallow automated scrapers in their robots policy. If permitted for your use case, you can disable "Respect robots.txt".</li>
              <li><strong>JavaScript-rendered content:</strong> If a website is built as a Single Page Application (SPA), raw HTML will be blank. Enable <em>JavaScript Rendering</em> in Crawler Options.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
            <strong className="text-gray-900 dark:text-gray-100 block mb-1">
              Why are phone numbers or email addresses missing for some leads?
            </strong>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              LeadScrape only extracts data that is publicly published on the organization's website. If a business uses an embedded contact form (e.g. Typeform, HubSpot form) or protects their email address behind Captcha instead of a clickable <code>mailto:</code> link, an email cannot be ethically or reliably extracted.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
            <strong className="text-gray-900 dark:text-gray-100 block mb-1">
              How fast does scraping run?
            </strong>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              To be respectful and prevent IP bans, LeadScrape applies rate limiting (polite request throttling) between consecutive requests to the same domain. Static HTTP crawling processes pages in seconds; enabling JavaScript Rendering (Playwright) takes slightly longer as it boots a real headless browser instance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
            <strong className="text-gray-900 dark:text-gray-100 block mb-1">
              Can I stop a running scraping task?
            </strong>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Yes. Navigate to the task's progress page and click the red <strong>Cancel Task</strong> button. The scraper will immediately halt further page crawling and mark the task as <code>CANCELLED</code> while preserving any leads already extracted.
            </p>
          </div>
        </div>
      ),
    },
  ]

  // Filter sections if search query is entered
  const filteredSections = sections.filter(sec => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-50 dark:bg-mint-950/40 text-mint-600 dark:text-mint-400 text-xs font-semibold mb-3 border border-mint-200/50 dark:border-mint-800/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Documentation & Guides</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Help & Documentation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Learn how to configure scraping tasks, interpret lead confidence, and export your data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documentation topics (e.g. JavaScript, confidence, PDF, robots.txt)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
            <HelpCircle className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">No matching documentation topics found.</p>
            <p className="text-xs text-gray-400 mt-1">Try searching with a different term or clear the filter.</p>
          </div>
        ) : (
          filteredSections.map(sec => {
            const Icon = sec.icon
            const isOpen = openSections[sec.id] || searchQuery.trim().length > 0

            return (
              <div
                key={sec.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-mint-50 dark:bg-mint-950/40 text-mint-500 dark:text-mint-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {sec.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 pl-4">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50 dark:border-slate-700/50">
                    {sec.content}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Support Card */}
      <div className="bg-gradient-to-r from-mint-500/10 to-transparent dark:from-mint-950/20 rounded-xl border border-mint-200/60 dark:border-mint-800/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            Need more assistance?
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure search radius, crawler concurrency, or proxy settings anytime from your configuration.
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="bg-mint-500 hover:bg-mint-600 text-white font-medium px-4 py-2 rounded-lg transition text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          Launch New Task <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
