import React from 'react'
import { Clock, Loader2, CheckCircle2, XCircle, Ban, HelpCircle } from 'lucide-react'
import { getStatusColor } from '../utils/formatters'

const STATUS_LABELS = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
}

const STATUS_ICONS = {
  PENDING: Clock,
  RUNNING: Loader2,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: Ban,
}

export default function StatusBadge({ status }) {
  const colorClass = getStatusColor(status)
  const label = STATUS_LABELS[status] || status
  const Icon = STATUS_ICONS[status] || HelpCircle

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs ${colorClass}`}>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${status === 'RUNNING' ? 'animate-spin text-amber-500' : ''}`} />
      <span>{label}</span>
    </span>
  )
}
