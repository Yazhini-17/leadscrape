import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookmarkCheck, Trash2, Eye, Phone, Mail, Globe, Users } from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import { leadApi } from '../services/leadApi'
import { useToast } from '../components/Toast'
import { formatNumber, truncate, formatPhone } from '../utils/formatters'

export default function SavedLeads() {
  const navigate = useNavigate()
  const addToast = useToast()
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const perPage = 25
  const totalPages = Math.ceil(total / perPage)

  async function fetchLeads(p = 1) {
    setLoading(true)
    try {
      const res = await leadApi.getSavedLeads(p, perPage)
      setLeads(res.data.saved_leads || [])
      setTotal(res.data.total || 0)
    } catch {
      addToast('Failed to load saved leads.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads(page) }, [page])

  async function handleRemove(id) {
    try {
      await leadApi.removeSavedLead(id)
      addToast('Removed from saved leads.', 'info')
      fetchLeads(page)
    } catch {
      addToast('Failed to remove.', 'error')
    }
  }

  const filtered = search
    ? leads.filter(l =>
        l.organization?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.organization?.city?.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  const columns = [
    {
      key: 'organization',
      label: 'Organization',
      render: (org) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{truncate(org?.name, 35)}</p>
          {org?.city && <p className="text-xs text-gray-400">{org.city}</p>}
        </div>
      ),
    },
    {
      key: 'organization',
      label: 'Phone',
      render: (org) => {
        const phone = org?.phone_numbers?.[0]
        return phone
          ? <a href={`tel:${phone.number}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-mint-600 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-400" />{formatPhone(phone.normalized || phone.number)}
            </a>
          : <span className="text-gray-300 dark:text-slate-600">—</span>
      },
    },
    {
      key: 'organization',
      label: 'Email',
      render: (org) => {
        const email = org?.email_addresses?.[0]
        return email
          ? <a href={`mailto:${email.email}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-mint-600 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" />{truncate(email.email, 25)}
            </a>
          : <span className="text-gray-300 dark:text-slate-600">—</span>
      },
    },
    {
      key: 'organization',
      label: 'Quality',
      render: (org) => org ? <ConfidenceBadge level={org.confidence_level} score={org.confidence_score} /> : null,
    },
    {
      key: 'id',
      label: '',
      render: (val, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/leads/${row.organization?.id}`)}
            className="p-1.5 text-gray-400 hover:text-mint-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRemove(val)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Saved Leads
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Your bookmarked prospects and high-value target accounts.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-700/70 shadow-xs">
        <div className="w-full sm:w-80">
          <SearchBar value={search} onChange={setSearch} placeholder="Search saved leads by name, city…" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 overflow-hidden">
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-mint-500" />
            <span>Saved Prospects</span>
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
          emptyMessage="No saved leads bookmarked yet"
          emptyIcon={<BookmarkCheck className="w-8 h-8 text-gray-400" />}
          emptyAction={
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
            >
              Browse Task Leads
            </button>
          }
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rowKey="id"
        />
      </div>
    </div>
  )
}
