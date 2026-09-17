import React from 'react'

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="w-12 h-12 border-3 border-mint-200 dark:border-mint-900 border-t-mint-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading…</p>
      </div>
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const sizeClass = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-3' }[size]
  return (
    <div className={`${sizeClass} border-mint-200 dark:border-mint-900 border-t-mint-500 rounded-full animate-spin`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/60 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-3.5 w-24 rounded-md" />
        <div className="skeleton h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-20 rounded-md mb-3" />
      <div className="skeleton h-3 w-32 rounded-md" />
    </div>
  )
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr className="border-b border-gray-100 dark:border-slate-700/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-4 w-full max-w-[120px] rounded-md" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded-md ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60 flex items-center justify-center text-gray-400 dark:text-slate-400 mb-4 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
