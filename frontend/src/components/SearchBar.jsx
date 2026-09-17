import React from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search…', onClear }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-9 py-2.5 text-sm w-full border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400/60 focus:border-mint-500 shadow-2xs transition-all duration-150"
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
