import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Loader2, Globe, Phone, Mail,
  Building2, ArrowRight, RotateCcw, FileSpreadsheet, FileText,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { taskApi } from '../services/taskApi'
import { exportApi } from '../services/exportApi'
import { formatDate, formatNumber } from '../utils/formatters'
import { useToast } from '../components/Toast'

const POLL_INTERVAL = 3000

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="w-full bg-gray-100 dark:bg-slate-700/60 rounded-full h-3 p-0.5 overflow-hidden">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-mint-500 to-violet-400 transition-all duration-500 shadow-xs"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function Metric({ icon: Icon, label, value, color = 'mint' }) {
  const colorMap = {
    mint: 'bg-mint-50 dark:bg-mint-950/50 text-mint-600 dark:text-mint-400 border-mint-200/60 dark:border-mint-800/60',
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
    green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
    yellow: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
  }

  const style = colorMap[color] || colorMap.mint

  return (
    <div className="flex items-center gap-3.5 p-4 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-slate-700/60 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
      <div className={`p-2.5 rounded-xl border ${style} flex-shrink-0 shadow-2xs`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{formatNumber(value)}</p>
      </div>
    </div>
  )
}

export default function TaskProgress() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  function fetchTask() {
    taskApi.getTask(taskId)
      .then(res => {
        setTask(res.data)
        setLoading(false)
        if (['PENDING', 'RUNNING'].includes(res.data.status)) {
          timerRef.current = setTimeout(fetchTask, POLL_INTERVAL)
        }
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchTask()
    return () => clearTimeout(timerRef.current)
  }, [taskId])

  async function handleCancel() {
    try {
      await taskApi.cancelTask(taskId)
      addToast('Task cancellation requested.', 'info')
    } catch {
      addToast('Failed to cancel task.', 'error')
    }
  }

  async function handleExportPDF() {
    try { await exportApi.exportPDF(taskId) } catch { addToast('Export failed.', 'error') }
  }

  async function handleExportExcel() {
    try { await exportApi.exportExcel(taskId) } catch { addToast('Export failed.', 'error') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-mint-500 animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Task not found.</p>
        <button onClick={() => navigate('/tasks')} className="mt-4 text-mint-600 hover:underline text-sm">
          Back to Tasks
        </button>
      </div>
    )
  }

  const isActive = ['PENDING', 'RUNNING'].includes(task.status)
  const isCompleted = task.status === 'COMPLETED'
  const progress = task.max_results > 0
    ? Math.min(100, Math.round((task.results_discovered / task.max_results) * 100))
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-mint-600 dark:text-mint-400 px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/40 border border-mint-200/50 dark:border-mint-900/50">
                {task.task_id}
              </span>
              <StatusBadge status={task.status} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {task.keyword} — {task.location}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Job created {formatDate(task.created_at)}
            </p>
          </div>
          {isActive && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/80 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shadow-2xs"
            >
              <XCircle className="w-4 h-4" /> Cancel Task
            </button>
          )}
        </div>

        {/* Main progress */}
        {isActive && (
          <div className="mb-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/60">
            <div className="flex justify-between text-xs mb-2.5 font-semibold">
              <span className="text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-mint-500" />
                {task.status === 'RUNNING' ? 'Engine actively discovering & crawling websites…' : 'Queued in database, starting shortly…'}
              </span>
              <span className="text-mint-600 dark:text-mint-400 font-bold">{progress}% completed</span>
            </div>
            <ProgressBar value={task.results_discovered} max={task.max_results} />
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-800 dark:text-emerald-200 text-sm font-bold">
                Extraction finished successfully — {formatNumber(task.results_discovered)} leads identified.
              </p>
              {task.completed_at && (
                <p className="text-emerald-700/80 dark:text-emerald-300/80 text-xs mt-0.5">
                  Completed at {formatDate(task.completed_at)}. Ready for outreach and export.
                </p>
              )}
            </div>
          </div>
        )}

        {task.status === 'FAILED' && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 rounded-xl">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-800 dark:text-rose-200 text-sm font-bold">Task halted with error</p>
              {task.error_message && (
                <p className="text-rose-700/90 dark:text-rose-300/90 text-xs mt-0.5 leading-relaxed">{task.error_message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>Real-time Extraction Metrics</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          <Metric icon={Building2} label="Organizations" value={task.results_discovered} color="mint" />
          <Metric icon={Globe} label="Websites Found" value={task.websites_found} color="blue" />
          <Metric icon={Globe} label="Pages Crawled" value={task.websites_crawled} color="green" />
          <Metric icon={Phone} label="Phones Found" value={task.phones_found} color="yellow" />
          <Metric icon={Mail} label="Emails Found" value={task.emails_found} color="purple" />
          <Metric icon={Building2} label="Addresses Found" value={task.addresses_found} color="mint" />
        </div>
        {task.duplicates_removed > 0 && (
          <p className="mt-3.5 text-xs text-gray-400 dark:text-slate-500 font-medium">
            ✓ Automated deduplication filtered {formatNumber(task.duplicates_removed)} duplicate entities
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {isCompleted && (
          <>
            <button
              onClick={() => navigate(`/tasks/${taskId}/leads`)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-mint-500/20 hover:shadow-lg hover:shadow-mint-500/30 transition-all duration-150"
            >
              <span>View Discovered Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/60 text-gray-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-150"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700/60 text-gray-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all duration-150"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Export PDF</span>
            </button>
          </>
        )}
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/70 text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-2xs"
        >
          <span>All Tasks</span>
        </button>
      </div>
    </div>
  )
}
