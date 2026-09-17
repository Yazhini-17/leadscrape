import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Target, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loading'

const FEATURES = [
  'Business Discovery', 'Website Crawling', 'Contact Extraction',
  'Data Cleaning', 'Lead Verification', 'Excel / PDF Export',
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-mint-600 to-mint-400 rounded-xl flex items-center justify-center shadow-lg shadow-mint-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">LeadScrape</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-500/10 border border-mint-500/20 text-mint-400 text-xs font-semibold mb-6">
            <span>Next-Gen Contact Scraping Engine</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5 tracking-tight">
            Turn Public Websites into{' '}
            <span className="bg-gradient-to-r from-mint-400 to-violet-300 bg-clip-text text-transparent">Actionable Leads</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Discover companies by niche and region, verify official websites, harvest direct emails and phone numbers, and export clean datasets.
          </p>
          <ul className="space-y-3.5">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <div className="p-1 rounded-md bg-mint-500/20 text-mint-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-slate-500 text-xs font-medium">© 2026 LeadScrape. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-gray-50/50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-800/90 rounded-3xl p-8 sm:p-10 border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-900/5">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-tr from-mint-600 to-mint-400 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 dark:text-gray-100 tracking-tight">LeadScrape</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">Sign in to your LeadScrape workspace.</p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400/60 focus:border-mint-500 shadow-2xs transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400/60 focus:border-mint-500 shadow-2xs transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-mint-500 focus:ring-mint-400"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-xs text-mint-600 hover:text-mint-700 dark:text-mint-400 font-semibold">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm shadow-md shadow-mint-500/20 hover:shadow-lg hover:shadow-mint-500/30"
            >
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-gray-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-mint-600 dark:text-mint-400 hover:text-mint-700 font-bold ml-1">
              Create Free Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
