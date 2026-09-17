import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SkeletonRow, EmptyState } from './Loading'

export default function DataTable({
  columns, data, loading, emptyMessage = 'No data found',
  emptyIcon, emptyAction,
  page, totalPages, onPageChange,
  rowKey = 'id',
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200/80 dark:border-slate-700 bg-gray-50/75 dark:bg-slate-800/60">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState icon={emptyIcon} title={emptyMessage} action={emptyAction} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row[rowKey] || idx}
                  className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-4 text-gray-700 dark:text-slate-300 whitespace-nowrap align-middle">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700/70 bg-gray-50/40 dark:bg-slate-800/40">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            Page <strong className="text-gray-900 dark:text-white">{page}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
