import React from 'react'
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react'
import { getConfidenceColor } from '../utils/formatters'

export default function ConfidenceBadge({ level, score }) {
  const colorClass = getConfidenceColor(level)

  const Icon = {
    HIGH: ShieldCheck,
    MEDIUM: AlertTriangle,
    LOW: AlertCircle,
  }[level] || HelpCircle

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs ${colorClass}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{level}</span>
      {score !== undefined && (
        <span className="opacity-70 font-mono text-[11px] ml-0.5">
          {Math.round(score)}%
        </span>
      )}
    </span>
  )
}
