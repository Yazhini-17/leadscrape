export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateShort(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatTimeAgo(date) {
  if (!date) return '—'
  const now = new Date()
  const d = new Date(date)
  const diffSec = Math.max(0, Math.floor((now - d) / 1000))
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString('en-IN')
}

export function formatPhone(phone) {
  if (!phone) return '—'
  // Format +91XXXXXXXXXX → +91 XXXXX XXXXX
  const match = phone.match(/^\+91(\d{5})(\d{5})$/)
  if (match) return `+91 ${match[1]} ${match[2]}`
  return phone
}

export function truncate(str, n = 40) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function getStatusColor(status) {
  const map = {
    PENDING: 'text-amber-700 bg-amber-50 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    RUNNING: 'text-amber-700 bg-amber-50 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    COMPLETED: 'text-emerald-700 bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
    FAILED: 'text-rose-700 bg-rose-50 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50',
    CANCELLED: 'text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  }
  return map[status] || 'text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
}

export function getConfidenceColor(level) {
  const map = {
    HIGH: 'text-emerald-700 bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
    MEDIUM: 'text-amber-700 bg-amber-50 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    LOW: 'text-rose-700 bg-rose-50 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50',
  }
  return map[level] || 'text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
}

export function getDomain(url) {
  if (!url) return ''
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}
