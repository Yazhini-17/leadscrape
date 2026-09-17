import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, XCircle, Eye, History } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import { taskApi } from '../services/taskApi'
import { useToast } from '../components/Toast'
import { formatDate, formatNumber } from '../utils/formatters'

export default function TaskHistory() {
  const navigate = useNavigate()
  const addToast = useToast()

  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', confidence: '' })

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  async function fetchTasks(p = page) {
    setLoading(true)
    try {
      const res = await taskApi.getTasks(p, perPage, filters.status || null)
      setTasks(res.data.tasks || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      addToast('Failed to load tasks.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks(1); setPage(1) }, [filters.status])
  useEffect(() => { fetchTasks(page) }, [page])

  async function handleDelete(taskId) {
    if (!confirm(`Delete task ${taskId}? This also deletes all associated leads.`)) return
    try {
      await taskApi.deleteTask(taskId)
      addToast('Task deleted.', 'success')
      fetchTasks(page)
    } catch {
      addToast('Failed to delete task.', 'error')
    }
  }

  async function handleCancel(taskId) {
    try {
      await taskApi.cancelTask(taskId)
      addToast('Task cancellation requested.', 'info')
      fetchTasks(page)
    } catch {
      addToast('Failed to cancel task.', 'error')
    }
  }

  const filtered = search
    ? tasks.filter(t =>
        t.keyword?.toLowerCase().includes(search.toLowerCase()) ||
        t.location?.toLowerCase().includes(search.toLowerCase()) ||
        t.task_id?.toLowerCase().includes(search.toLowerCase())
      )
    : tasks

  const columns = [
    {
      key: 'task_id',
      label: 'Task ID',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-mint-600 dark:text-mint-400 px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/40 border border-mint-200/50 dark:border-mint-900/50">
          {val}
        </span>
      ),
    },
    {
      key: 'keyword',
      label: 'Keyword',
      render: (val) => <span className="font-medium text-gray-900 dark:text-gray-100">{val}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      render: (val) => <span className="text-gray-600 dark:text-slate-300">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'results_discovered',
      label: 'Leads Found',
      render: (val) => <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(val)}</span>,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => <span className="text-xs text-gray-400 dark:text-slate-400">{formatDate(val)}</span>,
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {['PENDING', 'RUNNING'].includes(row.status) ? (
            <>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/tasks/${row.task_id}/progress`) }}
                className="p-2 text-gray-500 hover:text-mint-600 dark:text-slate-400 dark:hover:text-mint-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition"
                title="View Live Progress"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleCancel(row.task_id) }}
                className="p-2 text-gray-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Cancel Task"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/tasks/${row.task_id}/leads`) }}
                className="p-2 text-gray-500 hover:text-mint-600 dark:text-slate-400 dark:hover:text-mint-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition"
                title="View Discovered Leads"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(row.task_id) }}
                className="p-2 text-gray-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Task History
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Monitor, inspect, or manage past and ongoing web scraping jobs.
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-mint-500/20 hover:shadow-lg hover:shadow-mint-500/30 transition-all duration-150 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Scraping Task</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-700/70 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchBar value={search} onChange={setSearch} placeholder="Search keyword, location, ID…" />
        </div>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onClear={() => setFilters({ status: '', confidence: '' })}
        />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 overflow-hidden">
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <History className="w-4 h-4 text-mint-500" />
            <span>All Tasks</span>
            {!loading && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                {formatNumber(total)} total
              </span>
            )}
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No tasks found matching your filters"
          emptyIcon={<History className="w-8 h-8 text-gray-400" />}
          emptyAction={
            <button
              onClick={() => navigate('/tasks/new')}
              className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Task
            </button>
          }
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rowKey="task_id"
        />
      </div>
    </div>
  )
}
