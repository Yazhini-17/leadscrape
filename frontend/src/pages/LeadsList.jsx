import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Phone, Mail, Globe, MapPin, User, BookmarkPlus, BookmarkCheck,
  ExternalLink, Download, ArrowLeft, Users, Filter, FileSpreadsheet, FileText,
} from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import { leadApi } from '../services/leadApi'
import { exportApi } from '../services/exportApi'
import { taskApi } from '../services/taskApi'
import { useToast } from '../components/Toast'
import { formatDate, formatNumber, formatPhone, truncate } from '../utils/formatters'

export default function LeadsList() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()

  const [task, setTask] = useState(null)
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())

  const perPage = 25
  const totalPages = Math.ceil(total / perPage)

  const fetchLeads = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, per_page: perPage }
      if (confidenceFilter) params.confidence = confidenceFilter
      if (search) params.search = search
      const res = await leadApi.getLeads(taskId, params)
      setLeads(res.data.leads || [])
      setTotal(res.data.total || 0)
    } catch {
      addToast('Failed to load leads.', 'error')
    } finally {
      setLoading(false)
    }
  }, [taskId, confidenceFilter, search])

  useEffect(() => {
    taskApi.getTask(taskId).then(r => setTask(r.data)).catch(() => {})
  }, [taskId])

  useEffect(() => { setPage(1); fetchLeads(1) }, [confidenceFilter, search])
  useEffect(() => { fetchLeads(page) }, [page])

  async function handleSave(leadId) {
    try {
      await leadApi.saveLead(leadId)
      setSavedIds(s => new Set([...s, leadId]))
      addToast('Lead saved!', 'success')
    } catch {
      addToast('Could not save lead.', 'error')
    }
  }

  async function handleExportPDF() {
    try { await exportApi.exportPDF(taskId) }
    catch { addToast('Export failed.', 'error') }
  }

  async function handleExportExcel() {
    try { await exportApi.exportExcel(taskId) }
    catch { addToast('Export failed.', 'error') }
  }

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      render: (val, row) => (
        <div>
          <button
            onClick={() => navigate(`/leads/${row.id}`)}
            className="text-gray-900 dark:text-gray-100 font-bold hover:text-mint-600 dark:hover:text-mint-400 text-left transition-colors"
          >
            {truncate(val, 38)}
          </button>
          {row.city && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{row.city}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'main_phone',
      label: 'Phone',
      render: (val) => val ? (
        <a
          href={`tel:${val}`}
          className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-mint-600 dark:hover:text-mint-400 flex items-center gap-1.5 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-mint-500 flex-shrink-0" />
          <span>{formatPhone(val)}</span>
        </a>
      ) : <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>,
    },
    {
      key: 'main_email',
      label: 'Email',
      render: (val) => val ? (
        <a
          href={`mailto:${val}`}
          className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-mint-600 dark:hover:text-mint-400 flex items-center gap-1.5 max-w-[180px] truncate transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-mint-500 flex-shrink-0" />
          <span>{truncate(val, 25)}</span>
        </a>
      ) : <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>,
    },
    {
      key: 'main_website',
      label: 'Website',
      render: (val) => val ? (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-mint-600 dark:text-mint-400 hover:text-mint-700 flex items-center gap-1.5 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{truncate(val.replace(/^https?:\/\/(www\.)?/, ''), 22)}</span>
          <ExternalLink className="w-3 h-3 opacity-60 flex-shrink-0" />
        </a>
      ) : <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>,
    },
    {
      key: 'confidence_level',
      label: 'Quality',
      render: (val, row) => <ConfidenceBadge level={val} score={row.confidence_score} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/leads/${val}`)}
            className="p-2 text-gray-500 hover:text-mint-600 dark:text-slate-400 dark:hover:text-mint-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 transition"
            title="View Details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleSave(val)}
            className={`p-2 rounded-xl transition ${
              savedIds.has(val) || row.is_saved
                ? 'text-mint-600 bg-mint-50 dark:bg-mint-950/40 border border-mint-200/60 dark:border-mint-800/60'
                : 'text-gray-500 hover:text-mint-600 dark:text-slate-400 dark:hover:text-mint-400 hover:bg-gray-100 dark:hover:bg-slate-700/60'
            }`}
            title="Save Lead"
          >
            {savedIds.has(val) || row.is_saved
              ? <BookmarkCheck className="w-3.5 h-3.5" />
              : <BookmarkPlus className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button & Task header card */}
      <div>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 mb-3 group transition"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Task History
        </button>

        {task && (
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 md:p-6 border border-gray-200/80 dark:border-slate-700/70 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/40 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-900/50">
                  {task.task_id}
                </span>
                <span className="text-gray-300 dark:text-slate-600">·</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  {task.location}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {task.keyword}
              </h2>
            </div>

            {/* Quick stats on task */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-700/60 text-center">
                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">Total Leads</p>
                <p className="text-base font-black text-gray-900 dark:text-white">{formatNumber(task.results_discovered)}</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-700/60 text-center">
                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400">Websites</p>
                <p className="text-base font-black text-gray-900 dark:text-white">{formatNumber(task.websites_found)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: Search + Filter Chips + Export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-700/70 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-72">
            <SearchBar value={search} onChange={setSearch} placeholder="Search organization, location…" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Quality:</span>
            {[
              { id: '', label: 'All' },
              { id: 'HIGH', label: 'High Quality' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'LOW', label: 'Low' }
            ].map(conf => (
              <button
                key={conf.id}
                onClick={() => setConfidenceFilter(conf.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  confidenceFilter === conf.id
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-mint-500 dark:text-white dark:border-mint-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export options */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/60 text-gray-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-150"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700/60 text-gray-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all duration-150"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 overflow-hidden">
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-mint-500" />
            <span>Extracted Leads</span>
            {!loading && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                {formatNumber(total)} total
              </span>
            )}
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={leads}
          loading={loading}
          emptyMessage="No leads found for this task"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rowKey="id"
        />
      </div>
    </div>
  )
}
