import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Activity, CheckCircle, Download, Plus, ArrowRight,
  Phone, Mail, Globe, Sparkles, TrendingUp
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { leadApi } from '../services/leadApi'
import { taskApi } from '../services/taskApi'
import { formatDate, formatNumber } from '../utils/formatters'

const CONFIDENCE_COLORS = { HIGH: '#10B981', MEDIUM: '#F59E0B', LOW: '#EF4444' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      leadApi.getDashboardStats(),
      taskApi.getTasks(1, 5),
    ]).then(([statsRes, tasksRes]) => {
      setStats(statsRes.data)
      setRecentTasks(tasksRes.data.tasks || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const confidenceData = stats ? [
    { name: 'High Quality', value: stats.high_confidence || 0, color: CONFIDENCE_COLORS.HIGH },
    { name: 'Medium Quality', value: stats.medium_confidence || 0, color: CONFIDENCE_COLORS.MEDIUM },
    { name: 'Low Quality', value: stats.low_confidence || 0, color: CONFIDENCE_COLORS.LOW },
  ] : []

  const leadTrendData = stats?.lead_trend || []

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Real-time scraping operations, lead discovery metrics, and quality distribution.
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          loading={loading}
          title="Total Tasks"
          value={formatNumber(stats?.total_tasks)}
          icon={Activity}
          color="mint"
          subtitle="All scraping jobs"
        />
        <StatCard
          loading={loading}
          title="Total Leads"
          value={formatNumber(stats?.total_leads)}
          icon={Users}
          color="green"
          subtitle="Verified organizations"
        />
        <StatCard
          loading={loading}
          title="Completed Tasks"
          value={formatNumber(stats?.completed_tasks)}
          icon={CheckCircle}
          color="blue"
          subtitle="Finished jobs"
        />
        <StatCard
          loading={loading}
          title="Total Exports"
          value={formatNumber(stats?.total_exports)}
          icon={Download}
          color="yellow"
          subtitle="Excel & PDF files"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-xs border border-gray-200/80 dark:border-slate-700/70">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-mint-500" />
                Leads Discovered
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                New leads identified across all active and completed runs
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
              Last 7 days
            </span>
          </div>
          {loading ? (
            <div className="h-56 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={leadTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.2 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    color: '#f8fafc',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
                  itemStyle={{ color: '#A78BFA' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Leads"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#purpleGrad)"
                  activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Confidence pie */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-xs border border-gray-200/80 dark:border-slate-700/70 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Lead Quality Distribution
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              Confidence scores based on verification
            </p>
          </div>
          {loading ? (
            <div className="h-56 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={false}
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-300 ml-1">{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Data stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-slate-700/70 flex items-center gap-4 hover:border-mint-300 dark:hover:border-mint-700/60 transition-colors">
          <div className="p-3.5 bg-mint-50 dark:bg-mint-950/50 rounded-xl text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60 shadow-2xs">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Phones Extracted</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{formatNumber(stats?.total_phones)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-slate-700/70 flex items-center gap-4 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-colors">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Emails Extracted</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{formatNumber(stats?.total_emails)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-slate-700/70 flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Websites Crawled</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{formatNumber(stats?.total_websites_crawled)}</p>
          </div>
        </div>
      </div>

      {/* Recent tasks card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 overflow-hidden">
        <div className="flex items-center justify-between p-5 md:px-6 border-b border-gray-100 dark:border-slate-700/80">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Recent Scraping Tasks</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">Quickly access ongoing and recent batch runs</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-mint-600 dark:hover:text-mint-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/60 transition"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/75 dark:bg-slate-800/50">
                {['Task ID', 'Keyword', 'Location', 'Status', 'Leads', 'Created'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                    No tasks yet.{' '}
                    <button onClick={() => navigate('/tasks/new')} className="text-mint-600 dark:text-mint-400 font-semibold hover:underline">
                      Create your first task
                    </button>
                  </td>
                </tr>
              ) : (
                recentTasks.map(task => (
                  <tr
                    key={task.task_id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/70 cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(
                      ['PENDING', 'RUNNING'].includes(task.status)
                        ? `/tasks/${task.task_id}/progress`
                        : `/tasks/${task.task_id}/leads`
                    )}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-mint-600 dark:text-mint-400">
                      <span className="px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/40 border border-mint-200/50 dark:border-mint-900/50">
                        {task.task_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{task.keyword}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{task.location}</td>
                    <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{formatNumber(task.results_discovered)}</td>
                    <td className="px-6 py-4 text-gray-400 dark:text-slate-400 text-xs">{formatDate(task.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
