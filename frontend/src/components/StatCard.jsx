import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { SkeletonCard } from './Loading'

export default function StatCard({ title, value, icon: Icon, color = 'mint', trend, subtitle, loading }) {
  if (loading) return <SkeletonCard />

  const colorStyles = {
    mint: {
      bg: 'bg-gradient-to-br from-mint-500/10 via-mint-500/5 to-transparent dark:from-mint-950/30 dark:via-mint-950/10',
      iconBg: 'bg-mint-50 dark:bg-mint-950/60 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60',
      borderAccent: 'hover:border-mint-300 dark:hover:border-mint-700/60',
    },
    purple: {
      bg: 'bg-gradient-to-br from-mint-500/10 via-mint-500/5 to-transparent dark:from-mint-950/30 dark:via-mint-950/10',
      iconBg: 'bg-mint-50 dark:bg-mint-950/60 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60',
      borderAccent: 'hover:border-mint-300 dark:hover:border-mint-700/60',
    },
    violet: {
      bg: 'bg-gradient-to-br from-mint-500/10 via-mint-500/5 to-transparent dark:from-mint-950/30 dark:via-mint-950/10',
      iconBg: 'bg-mint-50 dark:bg-mint-950/60 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60',
      borderAccent: 'hover:border-mint-300 dark:hover:border-mint-700/60',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/10',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
      borderAccent: 'hover:border-emerald-300 dark:hover:border-emerald-700/60',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-950/30 dark:via-blue-950/10',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60',
      borderAccent: 'hover:border-blue-300 dark:hover:border-blue-700/60',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-950/10',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
      borderAccent: 'hover:border-amber-300 dark:hover:border-amber-700/60',
    },
    red: {
      bg: 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/30 dark:via-rose-950/10',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60',
      borderAccent: 'hover:border-rose-300 dark:hover:border-rose-700/60',
    },
  }

  const theme = colorStyles[color] || colorStyles.mint

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${theme.borderAccent}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 ${theme.bg}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-xl shadow-2xs transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {value ?? '0'}
          </p>
        </div>

        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/60 text-xs">
            {trend !== undefined ? (
              <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-md ${
                trend >= 0 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            ) : null}
            <span className="text-gray-400 dark:text-slate-400 text-[11px] truncate">
              {subtitle || (trend !== undefined ? 'vs previous period' : '')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
