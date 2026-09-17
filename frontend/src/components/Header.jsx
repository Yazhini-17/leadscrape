import React from 'react'
import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import NotificationsDropdown from './NotificationsDropdown'

export default function Header({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-gray-200/70 dark:border-slate-800 px-4 md:px-6 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Real system notifications */}
        <NotificationsDropdown />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-gray-200/80 dark:border-slate-700/80 text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all duration-150 shadow-2xs"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  )
}
