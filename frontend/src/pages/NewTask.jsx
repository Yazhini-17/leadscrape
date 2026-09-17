import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Tag, Maximize2, FileText, Plus, X, Loader2,
  Layers, Settings2, Globe,
} from 'lucide-react'
import { taskApi } from '../services/taskApi'
import { useToast } from '../components/Toast'

const ALL_FIELDS = [
  'Organization Name', 'Phone Number', 'Email', 'Website',
  'Address', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn',
  'YouTube', 'Twitter', 'Contact Person', 'Designation',
]

const DEFAULT_FIELDS = [
  'Organization Name', 'Phone Number', 'Email', 'Website', 'Address', 'WhatsApp',
]

const INPUT_CLASS =
  "w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400/60 focus:border-mint-500 shadow-2xs transition text-sm"

const LABEL_CLASS = "block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1.5"

export default function NewTask() {
  const navigate = useNavigate()
  const addToast = useToast()

  const [form, setForm] = useState({
    location: '',
    keyword: '',
    search_radius: 25,
    max_results: 50,
    max_pages_per_site: 10,
    required_fields: [...DEFAULT_FIELDS],
    enable_javascript: false,
    respect_robots: true,
    crawl_internal_pages: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function toggleField(field) {
    setForm(f => ({
      ...f,
      required_fields: f.required_fields.includes(field)
        ? f.required_fields.filter(x => x !== field)
        : [...f.required_fields, field],
    }))
  }

  function selectAllFields() {
    setForm(f => ({ ...f, required_fields: [...ALL_FIELDS] }))
  }

  function clearAllFields() {
    setForm(f => ({ ...f, required_fields: ['Organization Name'] }))
  }

  function validate() {
    const errs = {}
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.keyword.trim()) errs.keyword = 'Keyword is required.'
    if (form.max_results < 1 || form.max_results > 1000) errs.max_results = 'Between 1 and 1000.'
    if (form.max_pages_per_site < 1 || form.max_pages_per_site > 50) errs.max_pages_per_site = 'Between 1 and 50.'
    if (form.required_fields.length === 0) errs.required_fields = 'Select at least one field.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const res = await taskApi.createTask(form)
      addToast('Scraping task started successfully!', 'success')
      navigate(`/tasks/${res.data.task_id}/progress`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create task'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          New Scraping Task
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Configure discovery queries, select targeted contact fields, and set crawler policies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Parameters */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70">
            <div className="p-2 rounded-xl bg-mint-50 dark:bg-mint-950/50 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Search Parameters</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Where and what businesses should the engine discover</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLASS}>
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.location}
                onChange={e => setField('location', e.target.value)}
                placeholder="e.g. Austin, TX or Chennai"
                className={INPUT_CLASS}
              />
              {errors.location && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.location}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>
                Keyword / Category <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.keyword}
                onChange={e => setField('keyword', e.target.value)}
                placeholder="e.g. Dental Clinics, Law Firms, CBSE Schools"
                className={INPUT_CLASS}
              />
              {errors.keyword && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.keyword}</p>}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={LABEL_CLASS}>Search Proximity Radius</label>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-mint-50 dark:bg-mint-950/40 text-mint-600 dark:text-mint-400 border border-mint-200/60 dark:border-mint-800/60">
                  {form.search_radius} km
                </span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs text-gray-400 dark:text-slate-500">5 km</span>
                <input
                  type="range"
                  min={5} max={100} step={5}
                  value={form.search_radius}
                  onChange={e => setField('search_radius', Number(e.target.value))}
                  className="flex-1 accent-mint-500 cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">100 km</span>
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Maximum Results</label>
              <input
                type="number"
                min={1} max={1000}
                value={form.max_results}
                onChange={e => setField('max_results', Number(e.target.value))}
                className={INPUT_CLASS}
              />
              {errors.max_results && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.max_results}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>Max Pages per Website</label>
              <input
                type="number"
                min={1} max={50}
                value={form.max_pages_per_site}
                onChange={e => setField('max_pages_per_site', Number(e.target.value))}
                className={INPUT_CLASS}
              />
              {errors.max_pages_per_site && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.max_pages_per_site}</p>}
            </div>
          </div>
        </div>

        {/* Required Fields */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Required Data Fields</h3>
                <p className="text-xs text-gray-400 dark:text-slate-400">Choose attributes to harvest for each business</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllFields}
                className="text-xs text-mint-600 dark:text-mint-400 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-gray-300 dark:text-slate-600">·</span>
              <button
                type="button"
                onClick={clearAllFields}
                className="text-xs text-gray-500 dark:text-slate-400 hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {errors.required_fields && (
            <p className="text-rose-500 text-xs mb-4 font-medium">{errors.required_fields}</p>
          )}

          <div className="flex flex-wrap gap-2.5">
            {ALL_FIELDS.map(field => {
              const selected = form.required_fields.includes(field)
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    selected
                      ? 'bg-mint-500 border-mint-500 text-white shadow-xs shadow-mint-500/20'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-mint-400/60 hover:text-mint-600 dark:hover:text-mint-400'
                  }`}
                >
                  {selected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{field}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Crawler Options */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-700/70 p-6 md:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-slate-700/70">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Crawler Options</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Fine-tune HTTP scraping engine and rendering behaviors</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'crawl_internal_pages', label: 'Crawl Internal Pages (Recommended)', desc: 'Scans /about, /contact, and /team pages within each site to harvest hidden contacts.' },
              { key: 'respect_robots', label: 'Respect robots.txt (Polite Crawling)', desc: 'Adheres to site crawler policies to ensure safe, responsible data extraction.' },
              { key: 'enable_javascript', label: 'Enable JavaScript Rendering', desc: 'Boots headless Chromium (Playwright) to extract SPAs with client-side contact components.' },
            ].map(opt => (
              <div
                key={opt.key}
                onClick={() => setField(opt.key, !form[opt.key])}
                className="flex items-start gap-4 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700/60 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
              >
                <div className="relative mt-0.5 flex-shrink-0">
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      form[opt.key] ? 'bg-mint-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-xs ${
                        form[opt.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">{opt.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-mint-500 via-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-mint-500/25 hover:shadow-xl hover:shadow-mint-500/35 hover:-translate-y-0.5"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Starting Scraping Task…</>
          ) : (
            <><Layers className="w-5 h-5" /> Start Scraping Task</>
          )}
        </button>
      </form>
    </div>
  )
}
