import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Globe, Phone, Sparkles, BadgeCheck, Download, ArrowRight, Target, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const FEATURES = [
  { icon: Search, title: 'Smart Discovery', desc: 'Discover businesses using intelligent web search across multiple sources.' },
  { icon: Globe, title: 'Website Crawling', desc: 'Automatically crawl and navigate official websites for contact data.' },
  { icon: Phone, title: 'Contact Extraction', desc: 'Extract phones, emails, and addresses from public web pages.' },
  { icon: Sparkles, title: 'Data Cleaning', desc: 'Normalize, deduplicate, and validate all extracted information.' },
  { icon: BadgeCheck, title: 'Lead Verification', desc: 'Confidence scoring rates the quality of every lead automatically.' },
  { icon: Download, title: 'Excel / PDF Export', desc: 'Export your leads as Excel or PDF files ready for outreach.' },
]

const STEPS = [
  { step: '01', title: 'Enter Location & Keyword', desc: 'Tell LeadScrape where to look and what kind of businesses to find.' },
  { step: '02', title: 'Start Scraping', desc: 'The engine discovers organizations, finds their websites, and crawls public pages.' },
  { step: '03', title: 'Review Your Leads', desc: 'Browse extracted contacts with confidence scores and source tracking.' },
  { step: '04', title: 'Export & Grow', desc: 'Export your lead list as Excel or PDF and start reaching out.' },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      {/* Nav */}
      <nav className="bg-white dark:bg-brand-dark sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-mint-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-lg">LeadScrape</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              Sign In
            </Link>
            <Link to="/register" className="bg-mint-500 hover:bg-mint-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-brand-dark text-gray-900 dark:text-white py-24 px-6">
        {/* Glow ambient meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-mint-500/15 via-violet-400/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-mint-50 dark:bg-mint-950/50 border border-mint-200 dark:border-mint-800/60 rounded-full px-4 py-1.5 text-mint-700 dark:text-mint-300 text-xs sm:text-sm font-semibold mb-8 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-mint-500 dark:bg-mint-400 animate-pulse" />
            Responsible • Fast • Verified Contact Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight mb-7">
            Find Businesses.{' '}
            <span className="bg-gradient-to-r from-mint-600 via-violet-500 to-mint-400 bg-clip-text text-transparent">Extract Leads.</span>{' '}
            Grow Faster.
          </h1>
          <p className="text-gray-600 dark:text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover relevant organizations, navigate their official websites, harvest verified emails & phone numbers, and download ready-to-use leads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-mint-500/25 hover:shadow-xl hover:shadow-mint-500/35 hover:-translate-y-0.5"
            >
              <span>Start Free Scraping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Mock preview */}
        <div className="relative max-w-5xl mx-auto mt-20 z-10">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-gray-200/90 dark:border-slate-700/80 rounded-3xl p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                leadscrape.app/dashboard
              </div>
              <div className="w-12" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
              {[['Total Tasks', '24'], ['Total Leads', '1,842'], ['Completed', '21'], ['Exported', '980']].map(([label, val]) => (
                <div key={label} className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 text-center border border-gray-100 dark:border-slate-700">
                  <p className="text-gray-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">{val}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">Live Discovered Leads</span>
                <span className="font-mono text-[11px] font-bold text-mint-600 dark:text-mint-400 px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/50">
                  TASK-000021 · RUNNING
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Apex Pediatric Clinic', location: 'Austin, TX', quality: 'HIGH', score: '95%' },
                  { name: 'Cedar Ridge Family Practice', location: 'Austin, TX', quality: 'HIGH', score: '88%' },
                  { name: 'Austin Wellness Collective', location: 'Round Rock, TX', quality: 'HIGH', score: '82%' },
                  { name: 'Summit Healthcare Center', location: 'Austin, TX', quality: 'MEDIUM', score: '65%' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900/70 border border-gray-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{item.name}</span>
                      <span className="text-gray-400 dark:text-slate-500 ml-2">({item.location})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.quality === 'HIGH'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50'
                    }`}>
                      {item.quality} {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50/70 dark:bg-slate-900/60 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Everything you need to discover verified B2B leads
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              From search engine discovery to verified multi-format export — LeadScrape handles the entire pipeline autonomously.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-7 border border-gray-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-mint-50 dark:bg-mint-950/60 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-brand-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mint-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[['24+ Fields', 'Extracted per business entity'], ['Multi-Source', 'Search & direct crawler engine'], ['100% Client-Side', 'Transparent, reproducible data']].map(([val, label]) => (
            <div key={val}>
              <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-mint-400 to-violet-300 bg-clip-text text-transparent mb-2">{val}</p>
              <p className="text-slate-400 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white dark:bg-brand-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">How It Works</h2>
            <p className="text-gray-500 dark:text-slate-400 text-base">Four automated steps from inquiry to outreach-ready leads.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative p-6 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition">
                <div className="text-4xl font-black text-mint-500/40 dark:text-mint-400/30 mb-3">{s.step}</div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-mint-600 via-mint-500 to-violet-600 text-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Ready to supercharge your prospect outreach?</h2>
          <p className="text-mint-50 text-base sm:text-lg mb-8 max-w-xl mx-auto">Start extracting rich contact info right now. No external paid subscription required.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-mint-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-mint-50 transition shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-mint-400" />
            <span className="text-white font-semibold">LeadScrape</span>
            <span className="text-slate-500 text-sm ml-2">Find. Connect. Grow.</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 LeadScrape. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
