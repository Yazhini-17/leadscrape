import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Plus, Users, History, BookmarkCheck,
  Download, Settings, HelpCircle, LogOut, ChevronRight,
  Target, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_GROUPS = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks/new', icon: Plus, label: 'New Scraping Task' },
      { to: '/tasks', icon: History, label: 'Task History' },
    ],
  },
  {
    label: 'DATA',
    items: [
      { to: '/saved-leads', icon: BookmarkCheck, label: 'Saved Leads' },
      { to: '/exports', icon: Download, label: 'Exports' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { to: '/help', icon: HelpCircle, label: 'Help & Docs' },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30
        w-64 bg-brand-secondary dark:bg-slate-900
        border-r border-slate-700/50
        flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-mint-600 to-mint-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-mint-500/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-white font-extrabold text-base tracking-tight leading-tight">LeadScrape</span>
              <span className="block text-mint-400/90 text-[10px] font-medium tracking-wide">Find. Connect. Grow.</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-mint-500/15 to-mint-500/5 text-mint-300 font-semibold shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-mint-400 before:rounded-r-full pl-4'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-mint-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-mint-400" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3.5 py-4 border-t border-slate-800/80 bg-slate-900/40">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mint-600 to-mint-400 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
