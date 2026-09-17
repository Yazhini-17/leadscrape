import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { User, Lock, Monitor, Save } from 'lucide-react'
import { useToast } from '../components/Toast'

const SECTION_CLASS = "bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8"
const LABEL_CLASS = "block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1.5"
const INPUT_CLASS = "w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400/60 focus:border-mint-500 shadow-2xs transition text-sm"

export default function Settings() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const addToast = useToast()
  const [fullName, setFullName] = useState(user?.full_name || '')

  function handleSaveProfile(e) {
    e.preventDefault()
    addToast('Profile updated (demo session).', 'success')
  }

  function handleSavePassword(e) {
    e.preventDefault()
    addToast('Password update not implemented in this demo.', 'info')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your personal details, credentials, and interface preferences.
        </p>
      </div>

      {/* Profile */}
      <div className={SECTION_CLASS}>
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70">
          <div className="p-2 rounded-xl bg-mint-50 dark:bg-mint-950/50 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">User Profile</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400">Update your account name and contact identifier</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email Address</label>
            <input value={user?.email || ''} disabled className={INPUT_CLASS + ' opacity-60 cursor-not-allowed bg-gray-50 dark:bg-slate-900/50'} />
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Email address is managed by organization admin.</p>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-xs text-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className={SECTION_CLASS}>
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Change Password</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400">Ensure your account uses a secure credentials sequence</p>
          </div>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Current Password</label>
            <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>New Password</label>
              <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Confirm New Password</label>
              <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-mint-400 text-gray-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-xl transition shadow-2xs text-xs"
            >
              <Save className="w-3.5 h-3.5" /> Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className={SECTION_CLASS}>
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Appearance & Theme</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400">Customize how LeadScrape looks on your display</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/60">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Active Color Scheme</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Toggle between clear high-contrast Light mode and sleek Dark mode.</p>
          </div>
          <div className="flex gap-2">
            {['light', 'dark'].map(t => (
              <button
                key={t}
                onClick={() => theme !== t && toggleTheme()}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 capitalize ${
                  theme === t
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-mint-500 dark:text-white dark:border-mint-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300'
                }`}
              >
                {t} mode
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
