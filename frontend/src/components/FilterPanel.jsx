import React from 'react'
import { Filter, X } from 'lucide-react'

const SELECT_CLASS = "text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-mint-400/60 shadow-2xs transition-all duration-150 cursor-pointer"

export default function FilterPanel({ filters, onFilterChange, onClear }) {
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        <Filter className="w-3.5 h-3.5 text-mint-500" />
        <span>Filters</span>
      </div>

      <select
        value={filters.confidence || ''}
        onChange={e => onFilterChange({ ...filters, confidence: e.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">All Confidence</option>
        <option value="HIGH">High Quality</option>
        <option value="MEDIUM">Medium Quality</option>
        <option value="LOW">Low Quality</option>
      </select>

      <select
        value={filters.status || ''}
        onChange={e => onFilterChange({ ...filters, status: e.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="RUNNING">Running</option>
        <option value="COMPLETED">Completed</option>
        <option value="FAILED">Failed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
