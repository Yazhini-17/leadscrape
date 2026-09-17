import React, { useEffect, useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportApi } from '../services/exportApi'
import { useToast } from '../components/Toast'
import { formatDate, formatNumber } from '../utils/formatters'

export default function Exports() {
  const addToast = useToast()
  const [exports, setExports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    exportApi.getExports()
      .then(res => setExports(res.data || []))
      .catch(() => addToast('Failed to load export history.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Export History
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Review, track, and re-access all generated Excel spreadsheets and PDF dossiers.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700/80">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-mint-500" />
            <span>Generated File Archive</span>
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
            Download directly from any task's leads table. All downloads are cataloged below.
          </p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : exports.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/60 dark:border-slate-700/60 flex items-center justify-center text-gray-400 dark:text-slate-400 mx-auto mb-4 shadow-2xs">
              <Download className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">No exports recorded yet</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Open any task's leads table and click Excel or PDF to export your prospect list.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {exports.map(exp => (
              <div key={exp.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl border flex-shrink-0 shadow-2xs ${
                    exp.format === 'EXCEL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60'
                  }`}>
                    {exp.format === 'EXCEL'
                      ? <FileSpreadsheet className="w-5 h-5" />
                      : <FileText className="w-5 h-5" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{exp.filename}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {exp.task_id && (
                        <span className="font-mono font-bold text-mint-600 dark:text-mint-400">
                          {exp.task_id} ·
                        </span>
                      )}
                      <span>{formatNumber(exp.record_count)} records</span>
                      <span>·</span>
                      <span>{formatDate(exp.created_at)}</span>
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${
                  exp.format === 'EXCEL'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
                    : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
                }`}>
                  {exp.format}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
