import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Phone, Mail, Globe, MapPin, User, Bookmark,
  BookmarkCheck, ExternalLink, Facebook, Instagram, Linkedin,
  Youtube, Twitter, Building2, Copy, CheckCheck,
} from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import { leadApi } from '../services/leadApi'
import { useToast } from '../components/Toast'
import { formatDate, formatPhone } from '../utils/formatters'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-slate-700/70">
        {Icon && <Icon className="w-4 h-4 text-mint-500" />}
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href, copyable }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0 group">
      <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 text-gray-400 dark:text-slate-400 group-hover:text-mint-500 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="text-sm font-medium text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 break-all inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{value}</span>
            {href.startsWith('http') && <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />}
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{value}</p>
        )}
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          title="Copy value"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}

const SOCIAL_ICONS = {
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  YOUTUBE: Youtube,
  TWITTER: Twitter,
}

export default function LeadDetail() {
  const { leadId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    leadApi.getLead(leadId)
      .then(res => {
        setLead(res.data)
        setLoading(false)
      })
      .catch(() => {
        addToast('Failed to load lead details.', 'error')
        setLoading(false)
      })
  }, [leadId])

  async function handleSave() {
    try {
      await leadApi.saveLead(leadId)
      setIsSaved(true)
      addToast('Lead saved!', 'success')
    } catch {
      addToast('Could not save lead.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Lead not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-mint-600 hover:underline text-sm">Go back</button>
      </div>
    )
  }

  const mainPhone = lead.phone_numbers?.find(p => !p.is_whatsapp)
  const whatsapp = lead.phone_numbers?.find(p => p.is_whatsapp)
  const mainEmail = lead.email_addresses?.[0]
  const website = lead.websites?.find(w => w.is_official) || lead.websites?.[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 mb-4 group transition"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Building2 className="w-7 h-7 text-mint-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">{lead.name}</h1>
                {lead.category && <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2.5">{lead.category}</p>}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <ConfidenceBadge level={lead.confidence_level} score={lead.confidence_score} />
                  {lead.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />{lead.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 shadow-2xs ${
                isSaved
                  ? 'bg-mint-50 dark:bg-mint-950/40 border-mint-200/80 dark:border-mint-800/60 text-mint-700 dark:text-mint-400'
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-mint-400 hover:text-mint-600 bg-white dark:bg-slate-800'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved to Bookmarks' : 'Save Lead'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Section title="Contact Information" icon={Phone}>
          {mainPhone && (
            <InfoRow icon={Phone} label="Primary Phone" value={formatPhone(mainPhone.normalized || mainPhone.number)}
              href={`tel:${mainPhone.number}`} copyable />
          )}
          {whatsapp && (
            <InfoRow icon={Phone} label="WhatsApp" value={formatPhone(whatsapp.normalized || whatsapp.number)}
              href={`https://wa.me/${(whatsapp.normalized || whatsapp.number).replace(/[^0-9]/g, '')}`} copyable />
          )}
          {lead.phone_numbers?.filter(p => !p.is_whatsapp && p !== mainPhone).map((p, i) => (
            <InfoRow key={i} icon={Phone} label="Alt. Phone" value={formatPhone(p.normalized || p.number)}
              href={`tel:${p.number}`} copyable />
          ))}
          {mainEmail && (
            <InfoRow icon={Mail} label="Primary Email" value={mainEmail.normalized || mainEmail.email}
              href={`mailto:${mainEmail.email}`} copyable />
          )}
          {lead.email_addresses?.slice(1).map((e, i) => (
            <InfoRow key={i} icon={Mail} label="Alt. Email" value={e.normalized || e.email}
              href={`mailto:${e.email}`} copyable />
          ))}
          {website && (
            <InfoRow icon={Globe} label="Official Website" value={website.url} href={website.url} copyable />
          )}
        </Section>

        {/* Address */}
        <Section title="Location & Address" icon={MapPin}>
          {lead.address && (
            <InfoRow icon={MapPin} label="Full Address" value={lead.address} copyable />
          )}
          {lead.city && <InfoRow icon={MapPin} label="City" value={lead.city} />}
          {lead.state && <InfoRow icon={MapPin} label="State" value={lead.state} />}
          {lead.pincode && <InfoRow icon={MapPin} label="Postal Code" value={lead.pincode} copyable />}
          {!lead.address && !lead.city && (
            <p className="text-xs text-gray-400 dark:text-slate-500 py-4 text-center">No physical address information extracted.</p>
          )}
        </Section>
      </div>

      {/* Contacts & Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* People */}
        {lead.contacts && lead.contacts.length > 0 && (
          <Section title="Contact Persons" icon={User}>
            {lead.contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                  {c.designation && <p className="text-xs text-gray-400 dark:text-slate-400">{c.designation}</p>}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Social Links */}
        {lead.social_links && lead.social_links.length > 0 && (
          <Section title="Social Media Presence" icon={Globe}>
            {lead.social_links.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.platform] || Globe
              return (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0 hover:text-mint-600 group transition-colors">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 text-gray-400 group-hover:text-mint-500 transition-colors">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-mint-600 truncate">{s.url}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-mint-500 flex-shrink-0 ml-auto" />
                </a>
              )
            })}
          </Section>
        )}
      </div>

      {/* Source pages */}
      {lead.source_pages && lead.source_pages.length > 0 && (
        <Section title="Source Pages Crawled" icon={Globe}>
          <div className="space-y-2">
            {lead.source_pages.map((sp, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-700/50">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  sp.status_code === 200
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                }`}>{sp.status_code || '—'}</span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-bold w-20">{sp.page_type}</span>
                <a href={sp.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-mint-600 dark:text-mint-400 hover:underline truncate flex-1">{sp.url}</a>
              </div>
            ))}
          </div>
        </Section>
      )}

      <p className="text-xs text-center text-gray-400 dark:text-slate-500 pb-4">
        Lead extracted on {formatDate(lead.created_at)} · Confidence Quality: {Math.round(lead.confidence_score || 0)}%
      </p>
    </div>
  )
}
