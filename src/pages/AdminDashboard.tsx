import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { RegistrationRow } from '@/types'
import logo from '../assets/logo.png'

const AUTH_KEY = 'rtyf_admin_auth'
const GOLD = '#D4AF37'

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookReader {
  id: string
  name: string | null
  email: string | null
  created_at: string | null
  total_seconds_read?: number | null
  current_page?: number | null
  total_pages?: number | null
  last_read_at?: string | null
  [key: string]: unknown
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const fmtTime = (secs: number | null | undefined): string => {
  if (!secs || secs <= 0) return '—'
  const m = Math.floor(secs / 60)
  if (m < 1) return `${secs}s`
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), rem = m % 60
  return rem > 0 ? `${h} hr ${rem} min` : `${h} hr`
}

const fmtProgress = (r: BookReader): string => {
  const cur = r.current_page ?? 0
  const tot = r.total_pages  ?? 0
  if (!cur || !tot) return '—'
  const pct = Math.round((cur / tot) * 100)
  return `${cur} / ${tot} — ${pct}%`
}

// Mask phone: 0803*1234
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone || '—'
  return phone.slice(0, 4) + '*'.repeat(Math.max(0, phone.length - 8)) + phone.slice(-4)
}

// Registration field accessors
const getName = (r: RegistrationRow): string =>
  (r.name as string) || (r.full_name as string) || '—'
const getPhoto = (r: RegistrationRow): string | null =>
  (r.photo as string) || (r.photo_url as string) || null
const getEmail = (r: RegistrationRow): string => (r.email as string) || '—'
const getRawPhone = (r: RegistrationRow): string => (r.phone as string) || ''
const getTicketType = (r: RegistrationRow): string =>
  (r.ticket_type as string) || (r.attendance_mode as string) || '—'

const REG_COLS    = ['Photo', 'Name', 'Email', 'Phone', 'Ticket Type', 'Date']
const READER_COLS = ['Name', 'Email', 'Time Spent', 'Progress', 'Last Read', 'Date Joined']

const Spinner = () => (
  <svg className="animate-spin h-7 w-7" style={{ color: GOLD }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)
const GoldBar = () => <div style={{ height: 3, background: GOLD }} />

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'registrations' | 'readers'>('registrations')

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [regLoading,    setRegLoading]    = useState(true)
  const [regQuery,      setRegQuery]      = useState('')
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set())

  const [readers,        setReaders]       = useState<BookReader[]>([])
  const [readersLoading, setReadersLoading] = useState(true)
  const [readerQuery,    setReaderQuery]   = useState('')

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== 'true') navigate('/admin/login', { replace: true })
  }, [navigate])

  const loadRegistrations = async () => {
    setRegLoading(true)
    try {
      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false })
      if (error) { console.error('[admin] reg:', error.message); setRegistrations([]) }
      else setRegistrations((data ?? []) as RegistrationRow[])
    } catch (e) { console.error(e); setRegistrations([]) }
    finally { setRegLoading(false) }
  }

  const loadReaders = async () => {
    setReadersLoading(true)
    try {
      const { data, error } = await supabase
        .from('book_readers').select('*')
        .order('total_seconds_read', { ascending: false })  // sort by time spent DESC
      if (error) { console.error('[admin] readers:', error.message); setReaders([]) }
      else setReaders((data ?? []) as BookReader[])
    } catch (e) { console.error(e); setReaders([]) }
    finally { setReadersLoading(false) }
  }

  useEffect(() => { loadRegistrations(); loadReaders() }, [])

  const filteredRegs = useMemo(() => {
    const q = regQuery.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter(r => getName(r).toLowerCase().includes(q) || getEmail(r).toLowerCase().includes(q))
  }, [registrations, regQuery])

  const filteredReaders = useMemo(() => {
    const q = readerQuery.trim().toLowerCase()
    if (!q) return readers
    return readers.filter(r =>
      (r.name ?? '').toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q)
    )
  }, [readers, readerQuery])

  // Reading time stats
  const totalReadSecs = useMemo(() => readers.reduce((sum, r) => sum + (r.total_seconds_read ?? 0), 0), [readers])
  const avgReadSecs   = useMemo(() => readers.length > 0 ? Math.round(totalReadSecs / readers.length) : 0, [readers, totalReadSecs])

  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  const today = () => new Date().toISOString().slice(0, 10)
  const download = (csv: string, name: string) => {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
  }

  const exportRegCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Ticket Type', 'Date', 'Photo']
    const lines = filteredRegs.map(r =>
      [getName(r), getEmail(r), getRawPhone(r), getTicketType(r), r.created_at || '', getPhoto(r) || ''].map(esc).join(',')
    )
    download([headers.map(esc).join(','), ...lines].join('\n'), `registrations-${today()}.csv`)
  }

  const exportReadersCsv = () => {
    const headers = ['Name', 'Email', 'Time Spent', 'Progress', 'Last Read', 'Date Joined']
    const lines = filteredReaders.map(r =>
      [r.name || '—', r.email || '—', fmtTime(r.total_seconds_read), fmtProgress(r), r.last_read_at || '—', r.created_at || '—'].map(esc).join(',')
    )
    download([headers.map(esc).join(','), ...lines].join('\n'), `book-readers-${today()}.csv`)
  }

  const logout = () => { localStorage.removeItem(AUTH_KEY); navigate('/admin/login', { replace: true }) }
  const refresh = () => { loadRegistrations(); loadReaders() }

  const toggleReveal = (id: string) => {
    setRevealedPhones(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Render rows ───────────────────────────────────────────────────────────
  const renderRegRow = (r: RegistrationRow) => {
    const photo = getPhoto(r)
    const key   = (r.id as string) || `${getEmail(r)}|${r.created_at}`
    const raw   = getRawPhone(r)
    const id    = (r.id as string) || key
    const shown = revealedPhones.has(id)
    return (
      <tr key={key} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-5 py-3">
          {photo ? (
            <img src={photo} alt={getName(r)} className="w-10 h-10 rounded-full object-cover border border-gray-200"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getName(r))}&background=D4AF37&color=fff&size=128` }} />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-100 text-gray-400">
              {getName(r).charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </td>
        <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{getName(r)}</td>
        <td className="px-5 py-3 text-sm text-gray-600">{getEmail(r)}</td>
        <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
          <span className="font-mono">{shown ? raw || '—' : maskPhone(raw)}</span>
          {raw && (
            <button onClick={() => toggleReveal(id)} className="ml-2 text-xs text-yellow-700 underline hover:text-yellow-900">
              {shown ? 'Hide' : 'Reveal'}
            </button>
          )}
        </td>
        <td className="px-5 py-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: 'rgba(212,175,55,0.15)', color: '#8a6d1a' }}>
            {getTicketType(r)}
          </span>
        </td>
        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
      </tr>
    )
  }

  const renderReaderRow = (r: BookReader) => (
    <tr key={r.id || r.email} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{r.name || '—'}</td>
      <td className="px-5 py-3 text-sm text-gray-600">{r.email || '—'}</td>
      <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap font-mono">
        {fmtTime(r.total_seconds_read)}
      </td>
      <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">
        {fmtProgress(r)}
      </td>
      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.last_read_at)}</td>
      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
    </tr>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Rebuild The Youth Foundation logo" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
            <div>
              <h1 className="text-gray-900 font-bold text-lg leading-none">Admin Dashboard</h1>
              <p className="text-gray-500 text-xs mt-1">Rebuild The Youth Foundation</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={refresh} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 transition-colors">Refresh</button>
            <button onClick={tab === 'registrations' ? exportRegCsv : exportReadersCsv}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors">Export CSV</button>
            <button onClick={logout} className="px-3 py-2 rounded-lg text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Registrations', value: registrations.length,   color: GOLD },
            { label: 'Book Readers',         value: readers.length,          color: '#6B7280' },
            { label: 'Total Reading Time',   value: fmtTime(totalReadSecs),  color: '#059669' },
            { label: 'Avg Time / Reader',    value: fmtTime(avgReadSecs),    color: '#7C3AED' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-md p-5 flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium truncate">{label}</p>
                <p className="text-gray-900 text-2xl font-bold leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-full sm:w-fit">
          {(['registrations', 'readers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {t === 'registrations' ? `🎫 Registrations (${registrations.length})` : `📖 Book Readers (${readers.length})`}
            </button>
          ))}
        </div>

        {/* ── Registrations tab ── */}
        {tab === 'registrations' && (
          <>
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <input type="search" value={regQuery} onChange={e => setRegQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full sm:max-w-md px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" />
              <p className="text-gray-500 text-sm hidden sm:block whitespace-nowrap">
                {regLoading ? 'Loading…' : `${filteredRegs.length} of ${registrations.length}`}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
              <GoldBar />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead className="bg-gray-900 text-white text-xs">
                    <tr>{REG_COLS.map(h => <th key={h} className="px-5 py-3.5 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {regLoading ? (
                      <tr><td colSpan={6} className="px-5 py-16"><div className="flex flex-col items-center gap-3"><Spinner /><p className="text-gray-500 text-sm">Loading…</p></div></td></tr>
                    ) : filteredRegs.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-500">{regQuery ? `No results for "${regQuery}"` : 'No registrations yet.'}</td></tr>
                    ) : filteredRegs.map(renderRegRow)}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Book readers tab ── */}
        {tab === 'readers' && (
          <>
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <input type="search" value={readerQuery} onChange={e => setReaderQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full sm:max-w-md px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" />
              <p className="text-gray-500 text-sm hidden sm:block whitespace-nowrap">
                {readersLoading ? 'Loading…' : `${filteredReaders.length} of ${readers.length} · sorted by time spent`}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
              <div style={{ height: 3, background: '#059669' }} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead className="bg-gray-900 text-white text-xs">
                    <tr>{READER_COLS.map(h => <th key={h} className="px-5 py-3.5 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {readersLoading ? (
                      <tr><td colSpan={6} className="px-5 py-16"><div className="flex flex-col items-center gap-3"><Spinner /><p className="text-gray-500 text-sm">Loading…</p></div></td></tr>
                    ) : filteredReaders.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-500">{readerQuery ? `No results for "${readerQuery}"` : 'No book readers yet.'}</td></tr>
                    ) : filteredReaders.map(renderReaderRow)}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default AdminDashboard
