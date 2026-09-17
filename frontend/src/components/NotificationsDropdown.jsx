import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Ban,
  ArrowRight,
  Inbox,
  CheckCheck,
  RotateCw,
} from 'lucide-react'
import { taskApi } from '../services/taskApi'
import { formatTimeAgo, formatDate } from '../utils/formatters'

const STORAGE_KEY = 'leadscrape_seen_notifications'

function getNotificationDetails(task) {
  const keyword = task.keyword || 'leads'
  const location = task.location ? ` in ${task.location}` : ''
  const leadsCount = task.results_discovered ?? 0

  switch (task.status) {
    case 'COMPLETED':
      return {
        title: 'Task Completed',
        description: `Found ${leadsCount} ${leadsCount === 1 ? 'lead' : 'leads'} for "${keyword}"${location}`,
        Icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        destination: `/tasks/${task.task_id}/leads`,
        actionText: 'View leads',
      }
    case 'FAILED':
      return {
        title: 'Task Failed',
        description: `Scraping failed for "${keyword}"${location}`,
        Icon: XCircle,
        iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
        badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
        destination: `/tasks/${task.task_id}/progress`,
        actionText: 'View task log',
      }
    case 'RUNNING':
      return {
        title: 'Scraping in Progress',
        description: `Actively crawling websites for "${keyword}"${location} (${leadsCount} found)`,
        Icon: Loader2,
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        destination: `/tasks/${task.task_id}/progress`,
        actionText: 'Track progress',
      }
    case 'CANCELLED':
      return {
        title: 'Task Cancelled',
        description: `Scraping was cancelled for "${keyword}"${location}`,
        Icon: Ban,
        iconBg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/40',
        badgeBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        destination: `/tasks/${task.task_id}/progress`,
        actionText: 'View details',
      }
    case 'PENDING':
    default:
      return {
        title: 'Task Queued',
        description: `Task queued to scrape "${keyword}"${location}`,
        Icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        destination: `/tasks/${task.task_id}/progress`,
        actionText: 'View queue',
      }
  }
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [seenKeys, setSeenKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()

  // Load tasks and compute unread
  const loadTasks = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    try {
      const res = await taskApi.getTasks(1, 12)
      const fetchedTasks = res.data?.tasks || []
      setTasks(fetchedTasks)

      let storedSeen = []
      try {
        storedSeen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      } catch {
        storedSeen = []
      }

      const unread = fetchedTasks.filter(t => !storedSeen.includes(`${t.task_id}_${t.status}`))
      setUnreadCount(unread.length)
    } catch (err) {
      console.error('Failed to load tasks for notifications:', err)
    } finally {
      setLoading(false)
      if (isManualRefresh) setRefreshing(false)
    }
  }, [])

  // Initial load + periodic 30s background check
  useEffect(() => {
    loadTasks()
    const interval = setInterval(() => {
      loadTasks()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadTasks])

  // Mark all currently visible notifications as read
  const markAllAsRead = useCallback(() => {
    if (tasks.length === 0) return
    const allKeys = tasks.map(t => `${t.task_id}_${t.status}`)
    const updated = Array.from(new Set([...seenKeys, ...allKeys]))
    setSeenKeys(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to persist seen notifications:', e)
    }
    setUnreadCount(0)
  }, [tasks, seenKeys])

  // Handle toggling dropdown
  const handleToggle = () => {
    const nextState = !isOpen
    setIsOpen(nextState)

    // When opening the dropdown, clear unread count & mark current items as seen
    if (nextState) {
      markAllAsRead()
      // Also silently re-fetch to ensure fresh state
      loadTasks()
    }
  }

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Handle notification item click
  const handleItemClick = (task) => {
    setIsOpen(false)
    const key = `${task.task_id}_${task.status}`
    if (!seenKeys.includes(key)) {
      const updated = [...seenKeys, key]
      setSeenKeys(updated)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
    }

    const details = getNotificationDetails(task)
    navigate(details.destination)
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Notifications"
        className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/70 transition-colors relative focus:outline-hidden focus:ring-2 focus:ring-violet-500/40"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-violet-600 dark:bg-violet-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-in fade-in zoom-in duration-200 shadow-xs"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50">
                  {unreadCount} new
                </span>
              ) : (
                <span className="text-2xs text-gray-400 dark:text-slate-500 font-medium">
                  {tasks.length} total
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => loadTasks(true)}
                disabled={refreshing}
                title="Refresh notifications"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Refresh notifications"
              >
                <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-violet-600' : ''}`} />
              </button>

              {tasks.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y border-t-0 divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-100 dark:bg-slate-800/60 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              /* Designed Empty State */
              <div className="py-10 px-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                  No notifications yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed mb-4">
                  When you launch scraping tasks, real-time status and completion alerts will appear here.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/tasks/new')
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-2xs hover:shadow-sm transition-all"
                >
                  Start a scrape
                </button>
              </div>
            ) : (
              /* Notification Items */
              tasks.map((task) => {
                const details = getNotificationDetails(task)
                const Icon = details.Icon
                const isUnread = !seenKeys.includes(`${task.task_id}_${task.status}`)
                const timestamp = task.completed_at || task.created_at

                return (
                  <div
                    key={`${task.task_id}_${task.status}`}
                    onClick={() => handleItemClick(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleItemClick(task)
                      }
                    }}
                    className={`group w-full text-left p-3.5 flex items-start gap-3 hover:bg-gray-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      isUnread ? 'bg-violet-50/30 dark:bg-violet-950/15' : ''
                    }`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${details.iconBg} shadow-2xs`}
                    >
                      <Icon
                        className={`w-4 h-4 ${task.status === 'RUNNING' ? 'animate-spin text-amber-600 dark:text-amber-400' : ''}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {details.title}
                          </span>
                          <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 shrink-0 font-medium">
                            #{task.task_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="text-2xs text-gray-400 dark:text-slate-500 whitespace-nowrap"
                            title={formatDate(timestamp)}
                          >
                            {formatTimeAgo(timestamp)}
                          </span>
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-violet-500 shrink-0"
                              title="New notification"
                            />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                        {details.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-medium text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          <span>{details.actionText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                        {task.status === 'COMPLETED' && (
                          <span className="text-2xs text-gray-400 dark:text-slate-500">
                            {task.results_discovered} leads
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50/70 dark:bg-slate-900/70 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/tasks')
              }}
              className="text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1.5 transition-colors"
            >
              <span>View all task history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-2xs text-gray-400 dark:text-slate-500 font-medium">
              LeadScrape
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
