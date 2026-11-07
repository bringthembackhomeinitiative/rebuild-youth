/**
 * Readbook — Secure PDF reader with account system, reading timer, and logo watermark.
 *
 * PDF is served from /books/why-harm-your-body.pdf (public folder, original file, no compression).
 * Rendering: PDF.js at devicePixelRatio × fitScale × userZoom so text stays crisp at 200% zoom.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import logoUrl from '@/assets/logo.png'

declare global { interface Window { pdfjsLib: any } }

const PDF_URL      = '/books/why-harm-your-body.pdf'
const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const IDLE_TIMEOUT = 60_000

const ZOOM_STEPS       = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0]
const ZOOM_DEFAULT_IDX = 2   // 1.0 = 100%

// ── Logo watermark ────────────────────────────────────────────────────────────
let _logoImg: HTMLImageElement | null = null
function getLogoImg(): Promise<HTMLImageElement> {
  if (_logoImg) return Promise.resolve(_logoImg)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => { _logoImg = img; resolve(img) }
    img.onerror = () => reject(new Error('Logo load failed'))
    img.src = logoUrl
  })
}
async function paintWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  try {
    const img  = await getLogoImg()
    const logoW = w * 0.35
    const logoH = (img.naturalHeight / img.naturalWidth) * logoW
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(img, (w - logoW) / 2, (h - logoH) / 2, logoW, logoH)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  } catch { /* silent */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
function fmtTime(secs: number): string {
  if (secs < 60) return `${secs} sec${secs !== 1 ? 's' : ''}`
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m} min${m !== 1 ? 's' : ''}`
  const h = Math.floor(m / 60), rem = m % 60
  return rem > 0 ? `${h} hr ${rem} min` : `${h} hr`
}

// ── Shared form styles ────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #cccccc', borderRadius: '8px',
  padding: '12px 14px', fontSize: '14px',
  color: '#111111', background: '#ffffff', outline: 'none',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 700,
  color: '#111111', marginBottom: '6px',
}
const btnStyle = (primary: boolean, disabled = false): React.CSSProperties => ({
  width: '100%', padding: '14px', borderRadius: '8px',
  fontSize: '15px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
  background: primary ? (disabled ? '#a0522d' : '#8B4513') : '#ffffff',
  color: primary ? '#ffffff' : '#8B4513',
  outline: 'none',
  borderWidth: '1.5px', borderStyle: 'solid',
  borderColor: primary ? 'transparent' : '#8B4513',
  opacity: disabled ? 0.7 : 1, transition: 'background 0.2s',
})

// ── Eye icons ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, disabled = false, title, children }: {
  onClick: () => void; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} aria-label={title}
      style={{
        background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px',
        color: disabled ? '#555' : '#fff', fontSize: '12px', fontWeight: 700,
        padding: '6px 10px', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        whiteSpace: 'nowrap', transition: 'background 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)' }}
    >{children}</button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Readbook() {
  const navigate = useNavigate()
  type Mode = 'register' | 'verify' | 'login' | 'reading'
  const [mode, setMode] = useState<Mode>('register')

  // Form state
  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [codeInput,       setCodeInput]       = useState('')
  const [formErr,         setFormErr]         = useState('')
  const [formMsg,         setFormMsg]         = useState('')
  const [resendCooldown,  setResendCooldown]  = useState(0)
  const [showPw,          setShowPw]          = useState(false)
  const [showConfirmPw,   setShowConfirmPw]   = useState(false)
  const [showLoginPw,     setShowLoginPw]     = useState(false)
  const [loading,         setLoading]         = useState(false)

  // Reader state
  const [readerId,    setReaderId]    = useState<string | null>(null)
  const [readerName,  setReaderName]  = useState('')
  const [pdfErr,      setPdfErr]      = useState('')
  const [pdfDoc,      setPdfDoc]      = useState<any>(null)
  const [totalPages,  setTotalPages]  = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [renderBusy,  setRenderBusy]  = useState(false)
  const [pdfjsReady,  setPdfjsReady]  = useState(false)
  const [zoomIdx,     setZoomIdx]     = useState(ZOOM_DEFAULT_IDX)
  const zoomLevel = ZOOM_STEPS[zoomIdx]

  // Timer state
  const [totalSecs,   setTotalSecs]   = useState(0)
  const [sessionSecs, setSessionSecs] = useState(0)
  const activeRef     = useRef(false)
  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<any>(null)
  const containerRef  = useRef<HTMLDivElement>(null)

  // Load PDF.js
  useEffect(() => {
    if (window.pdfjsLib) { setPdfjsReady(true); return }
    const s = document.createElement('script')
    s.src = PDFJS_CDN
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; setPdfjsReady(true) }
    s.onerror = () => setPdfErr('Failed to load PDF viewer. Please refresh.')
    document.head.appendChild(s)
  }, [])

  // Block print
  useEffect(() => {
    if (mode !== 'reading') return
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); e.stopPropagation() }
    }
    window.addEventListener('keydown', block, true)
    const style = document.createElement('style')
    style.id = 'no-print'; style.textContent = '@media print{body{display:none!important}}'
    document.head.appendChild(style)
    return () => { window.removeEventListener('keydown', block, true); document.getElementById('no-print')?.remove() }
  }, [mode])

  // Timer
  const startTimer = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    tickRef.current = setInterval(() => { setSessionSecs(s => s + 1); setTotalSecs(s => s + 1) }, 1000)
  }, [])
  const pauseTimer = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
  }, [])
  const resetIdle = useCallback(() => {
    startTimer()
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(pauseTimer, IDLE_TIMEOUT)
  }, [startTimer, pauseTimer])

  useEffect(() => {
    if (mode !== 'reading') return
    const events = ['scroll', 'mousemove', 'keydown', 'touchstart', 'click']
    events.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }))
    const onVis = () => { document.hidden ? pauseTimer() : resetIdle() }
    document.addEventListener('visibilitychange', onVis)
    resetIdle()
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetIdle))
      document.removeEventListener('visibilitychange', onVis)
      pauseTimer()
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [mode, resetIdle, pauseTimer])

  const saveProgress = useCallback(async () => {
    if (!readerId || sessionSecs === 0) return
    await supabase.from('book_readers').update({
      total_seconds_read: totalSecs, current_page: currentPage,
      total_pages: totalPages, last_read_at: new Date().toISOString(),
    }).eq('id', readerId)
    setSessionSecs(0)
  }, [readerId, sessionSecs, totalSecs, currentPage, totalPages])

  useEffect(() => {
    if (mode !== 'reading' || !readerId) return
    const id = setInterval(saveProgress, 30_000)
    return () => clearInterval(id)
  }, [mode, readerId, saveProgress])

  useEffect(() => {
    if (mode === 'reading' && readerId) saveProgress()
  }, [currentPage]) // eslint-disable-line

  // Load PDF from public folder
  useEffect(() => {
    if (!pdfjsReady || mode !== 'reading') return
    setPdfErr('')
    window.pdfjsLib.getDocument({ url: PDF_URL, withCredentials: false })
      .promise
      .then((doc: any) => { setPdfDoc(doc); setTotalPages(doc.numPages); setCurrentPage(1) })
      .catch((err: any) => { console.error('PDF load error:', err); setPdfErr('Could not open PDF. Please refresh.') })
  }, [pdfjsReady, mode])

  // ── Render page — DPR-aware for crisp text at any zoom ───────────────────
  const renderPage = useCallback(async (pageNum: number, zoom: number) => {
    if (!pdfDoc || !canvasRef.current) return
    if (renderTaskRef.current) { try { await renderTaskRef.current.cancel() } catch { /**/ } }
    setRenderBusy(true)
    try {
      const page      = await pdfDoc.getPage(pageNum)
      const canvas    = canvasRef.current
      const container = canvas.parentElement!
      // DPR capped at 3 — higher values give diminishing returns and waste memory
      const dpr       = Math.min(window.devicePixelRatio || 1, 3)
      const baseVP    = page.getViewport({ scale: 1 })
      // Fit width to container, then multiply by zoom and DPR
      const fitScale  = (container.clientWidth - 4) / baseVP.width
      const renderScale = fitScale * zoom * dpr
      const vp        = page.getViewport({ scale: renderScale })
      // Physical canvas = full high-DPI resolution
      canvas.width  = vp.width
      canvas.height = vp.height
      // CSS display = physical / DPR → 1:1 CSS pixel = exactly 1 device pixel
      canvas.style.width  = `${vp.width  / dpr}px`
      canvas.style.height = `${vp.height / dpr}px`
      const ctx  = canvas.getContext('2d')!
      const task = page.render({ canvasContext: ctx, viewport: vp })
      renderTaskRef.current = task
      await task.promise
      await paintWatermark(ctx, vp.width, vp.height)
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') console.error('Render:', e)
    } finally { setRenderBusy(false) }
  }, [pdfDoc])

  useEffect(() => { renderPage(currentPage, zoomLevel) }, [currentPage, zoomLevel, renderPage])

  const prevPage  = () => setCurrentPage(p => Math.max(1, p - 1))
  const nextPage  = () => setCurrentPage(p => Math.min(totalPages, p + 1))
  const zoomIn    = () => setZoomIdx(i => Math.min(i + 1, ZOOM_STEPS.length - 1))
  const zoomOut   = () => setZoomIdx(i => Math.max(i - 1, 0))
  const zoomReset = () => setZoomIdx(ZOOM_DEFAULT_IDX)

  const handleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => { /* ignore */ })
    else document.exitFullscreen().catch(() => { /* ignore */ })
  }
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = PDF_URL; a.download = 'Why-Harm-Your-Body.pdf'; a.click()
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr(''); setFormMsg('')
    if (!fullName.trim() || fullName.trim().length < 2) { setFormErr('Please enter your full name.'); return }
    if (!EMAIL_RE.test(email.trim())) { setFormErr('Please enter a valid email.'); return }
    if (password.length < 6) { setFormErr('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setFormErr('Passwords do not match.'); return }
    setLoading(true)
    try {
      const hash = await hashPassword(password)
      const code = genCode()
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      const { data: existing } = await supabase.from('book_readers').select('id, verified')
        .eq('email', email.trim().toLowerCase()).single()
      if (existing) {
        if (existing.verified) { setFormErr('This email is already registered. Please login.') }
        else {
          await supabase.from('book_readers').update({
            verification_code: code, code_expires_at: expires, name: fullName.trim(), password_hash: hash,
          }).eq('id', existing.id)
          const r = await sendVerificationEmail(email.trim(), fullName.trim(), code)
          if (!r.ok) { setFormErr(`Could not send code — ${r.error || 'please try again.'}`); return }
          setFormMsg('Verification code sent to your email.'); setMode('verify'); setResendCooldown(60)
        }
        return
      }
      const { error } = await supabase.from('book_readers').insert([{
        name: fullName.trim(), email: email.trim().toLowerCase(), phone: '',
        password_hash: hash, verified: false, verification_code: code,
        code_expires_at: expires, created_at: new Date().toISOString(),
        total_seconds_read: 0, current_page: 1, total_pages: 0,
      }])
      if (error) { setFormErr('Registration failed: ' + error.message); return }
      const r = await sendVerificationEmail(email.trim(), fullName.trim(), code)
      if (!r.ok) { setFormMsg('Account created, but email could not be sent. Use Resend Code below.'); setMode('verify'); return }
      setFormMsg('Account created! Check your email for your 6-digit code.'); setMode('verify'); setResendCooldown(60)
    } catch (err) { setFormErr('Something went wrong. Please try again.'); console.error(err) }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr('')
    if (codeInput.length !== 6) { setFormErr('Please enter the 6-digit code.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.from('book_readers')
        .select('id, name, verification_code, code_expires_at').eq('email', email.trim().toLowerCase()).single()
      if (error || !data) { setFormErr('Account not found.'); return }
      if (data.verification_code !== codeInput.trim()) { setFormErr('Incorrect code. Please try again.'); return }
      if (new Date(data.code_expires_at) < new Date()) { setFormErr('Code has expired. Please register again.'); return }
      await supabase.from('book_readers').update({ verified: true, verification_code: null }).eq('id', data.id)
      await openReader(data.id, data.name)
    } catch (err) { setFormErr('Verification failed. Please try again.'); console.error(err) }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setFormErr(''); setFormMsg(''); setLoading(true)
    try {
      const code = genCode()
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      const { data: existing } = await supabase.from('book_readers').select('id, name').eq('email', email.trim().toLowerCase()).single()
      if (!existing) { setFormErr('Account not found. Please register again.'); return }
      await supabase.from('book_readers').update({ verification_code: code, code_expires_at: expires }).eq('id', existing.id)
      const r = await sendVerificationEmail(email.trim(), existing.name || fullName.trim(), code)
      if (!r.ok) { setFormErr(`Could not send code — ${r.error || 'please try again.'}`); return }
      setFormMsg('New code sent! Check your inbox (and spam folder).'); setResendCooldown(60)
    } catch (err) { setFormErr('Could not resend code.'); console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCooldown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr('')
    if (!EMAIL_RE.test(email.trim())) { setFormErr('Please enter a valid email.'); return }
    if (!password) { setFormErr('Please enter your password.'); return }
    setLoading(true)
    try {
      const hash = await hashPassword(password)
      const { data, error } = await supabase.from('book_readers')
        .select('id, name, email, verified, password_hash, total_seconds_read, current_page, total_pages')
        .eq('email', email.trim().toLowerCase()).single()
      if (error || !data) { setFormErr('No account found with this email.'); return }
      if (data.password_hash !== hash) { setFormErr('Incorrect password.'); return }
      if (!data.verified) {
        setFormErr('Email not verified. Check your inbox for the verification code.')
        setFullName(data.name || ''); setMode('verify'); return
      }
      setTotalSecs(data.total_seconds_read || 0)
      setCurrentPage(data.current_page || 1)
      await openReader(data.id, data.name)
    } catch (err) { setFormErr('Login failed. Please try again.'); console.error(err) }
    finally { setLoading(false) }
  }

  const openReader = async (id: string, name: string) => {
    setReaderId(id); setReaderName(name); setMode('reading')
    await supabase.from('book_readers').update({ last_read_at: new Date().toISOString() }).eq('id', id)
  }

  const sendVerificationEmail = async (toEmail: string, toName: string, code: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-book-verification', { body: { email: toEmail, name: toName, code } })
      if (error) return { ok: false, error: 'Email service error. Please try again.' }
      if (data && data.success === false) return { ok: false, error: (data.reason as string) || 'Email could not be sent.' }
      return { ok: true }
    } catch (e) { console.error('[verify email]:', e); return { ok: false, error: 'Could not reach email service.' } }
  }

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

  // ── READING VIEW ──────────────────────────────────────────────────────────
  if (mode === 'reading') {
    return (
      <div ref={containerRef} className="min-h-screen bg-gray-950 flex flex-col select-none"
        onContextMenu={e => e.preventDefault()}>

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20, background: '#111827',
          borderBottom: '1px solid #1f2937', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
        }}>
          {/* Book info */}
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📖 Why Harm Your Body?
            </p>
            <p style={{ color: '#fbbf24', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {readerName} · Pg {currentPage}/{totalPages || '…'} · {progress}% · {fmtTime(totalSecs)} read
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <ToolBtn onClick={prevPage} disabled={currentPage <= 1} title="Previous page">← Prev</ToolBtn>
            <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, minWidth: '54px', textAlign: 'center' }}>
              {currentPage}/{totalPages || '…'}
            </span>
            <ToolBtn onClick={nextPage} disabled={currentPage >= totalPages} title="Next page">Next →</ToolBtn>

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} aria-hidden="true" />

            <ToolBtn onClick={zoomOut} disabled={zoomIdx <= 0} title="Zoom out">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              −
            </ToolBtn>
            <button type="button" onClick={zoomReset} title="Reset zoom"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '6px', color: '#fbbf24', fontSize: '12px', fontWeight: 800, padding: '6px 8px', cursor: 'pointer', minWidth: '44px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </button>
            <ToolBtn onClick={zoomIn} disabled={zoomIdx >= ZOOM_STEPS.length - 1} title="Zoom in">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              +
            </ToolBtn>

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} aria-hidden="true" />

            <ToolBtn onClick={handleDownload} title="Download original PDF">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </ToolBtn>

            <ToolBtn onClick={handleFullscreen} title="Toggle fullscreen">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              Fullscreen
            </ToolBtn>

            <button type="button"
              onClick={async () => { pauseTimer(); await saveProgress(); setMode('login'); setPdfDoc(null) }}
              style={{ background: '#dc2626', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px 10px', cursor: 'pointer', flexShrink: 0 }}>
              Exit
            </button>
          </div>
        </div>

        {/* ── Page area ────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'auto',
          background: '#111', display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '16px',
        }}>
          {pdfErr ? (
            <div style={{ marginTop: '80px', textAlign: 'center' }}>
              <p style={{ color: '#f87171', marginBottom: '16px' }}>{pdfErr}</p>
              <button onClick={() => window.location.reload()}
                style={{ background: '#eab308', color: '#000', fontWeight: 700, padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
          ) : !pdfDoc ? (
            <div style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#9ca3af' }}>
              <svg className="animate-spin" style={{ width: 32, height: 32, color: '#eab308' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p style={{ fontSize: '14px' }}>Loading book…</p>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div style={{ width: '100%', maxWidth: '800px', marginBottom: '12px' }}>
                <div style={{ height: '3px', background: '#1f2937', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#eab308', borderRadius: '2px', transition: 'width 0.5s', width: `${progress}%` }} />
                </div>
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '5px', textAlign: 'center' }}>
                  <span style={{ color: '#fbbf24' }}>{fmtTime(totalSecs)}</span> reading ·
                  Page <span style={{ color: '#fbbf24' }}>{currentPage} of {totalPages}</span> ·
                  <span style={{ color: '#fbbf24' }}> {progress}%</span> complete
                </p>
              </div>

              {/* Canvas — CSS size set by renderPage */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '6px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', imageRendering: 'auto' }} />
                {renderBusy && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '6px' }}>
                    <svg className="animate-spin" style={{ width: 32, height: 32, color: '#eab308' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Bottom nav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', marginBottom: '8px' }}>
                <ToolBtn onClick={prevPage} disabled={currentPage <= 1} title="Previous page">← Prev</ToolBtn>
                <span style={{ color: '#d1d5db', fontSize: '13px', fontFamily: 'monospace' }}>{currentPage} / {totalPages}</span>
                <ToolBtn onClick={nextPage} disabled={currentPage >= totalPages} title="Next page">Next →</ToolBtn>
              </div>
              <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '6px', marginBottom: '20px', textAlign: 'center', padding: '0 16px' }}>
                🔒 Secure reader · print disabled · right-click disabled
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── AUTH FORMS ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E7', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.13)', width: '100%', maxWidth: '440px', padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px' }}>📖</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', marginTop: '12px', marginBottom: '4px' }}>Why Harm Your Body?</h1>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>by Dr. Barnabas &amp; Mrs. Moyosola Adefemi</p>
          <p style={{ fontSize: '11px', color: '#888' }}>Free to read — register once, read on any device.</p>
        </div>

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111' }}>Create Free Account</h2>
            <div>
              <label style={lbl}>Full Name</label>
              <input required type="text" placeholder="e.g. Chidi Okafor" value={fullName}
                onChange={e => { setFullName(e.target.value); setFormErr('') }} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input required type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setFormErr('') }} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
            </div>
            <div>
              <label style={lbl}>Create Password <span style={{ fontWeight: 400, color: '#888' }}>(min 6 chars)</span></label>
              <div style={{ position: 'relative' }}>
                <input required type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setFormErr('') }}
                  style={{ ...inp, paddingRight: '48px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
            </div>
            <div>
              <label style={lbl}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showConfirmPw ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setFormErr('') }}
                  style={{ ...inp, paddingRight: '48px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)} aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {showConfirmPw ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
            </div>
            {formErr && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{formErr}</p>}
            {formMsg && <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>{formMsg}</p>}
            <button type="submit" disabled={loading} style={btnStyle(true, loading)}>
              {loading ? 'Creating account…' : 'Create Account & Get Code →'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setFormErr(''); setFormMsg('') }}
              style={{ background: 'none', border: 'none', color: '#8B4513', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              Already have an account? Login here
            </button>
          </form>
        )}

        {/* VERIFY */}
        {mode === 'verify' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111' }}>Verify Your Email</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below. Valid for 10 minutes.
            </p>
            <div>
              <label style={lbl}>Verification Code</label>
              <input required type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={codeInput}
                onChange={e => { setCodeInput(e.target.value.replace(/\D/g, '')); setFormErr('') }}
                style={{ ...inp, fontSize: '22px', textAlign: 'center', letterSpacing: '8px' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
            </div>
            {formErr && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{formErr}</p>}
            {formMsg && <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>{formMsg}</p>}
            <button type="submit" disabled={loading || codeInput.length !== 6} style={btnStyle(true, loading || codeInput.length !== 6)}>
              {loading ? 'Verifying…' : 'Verify & Open Book →'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button" onClick={handleResend} disabled={loading || resendCooldown > 0}
                style={{ background: 'none', border: 'none', padding: 0, color: resendCooldown > 0 ? '#aaa' : '#8B4513', fontSize: '13px', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: resendCooldown > 0 ? 'none' : 'underline' }}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
            <button type="button" onClick={() => { setMode('register'); setFormErr('') }}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              ← Back to registration
            </button>
          </form>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111' }}>Login to Read</h2>
            <div>
              <label style={lbl}>Email Address</label>
              <input required type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setFormErr('') }} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showLoginPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setFormErr('') }}
                  style={{ ...inp, paddingRight: '48px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#D4AF37')} onBlur={e => (e.currentTarget.style.borderColor = '#ccc')} />
                <button type="button" onClick={() => setShowLoginPw(v => !v)} aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {showLoginPw ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
            </div>
            {formErr && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{formErr}</p>}
            <button type="submit" disabled={loading} style={btnStyle(true, loading)}>
              {loading ? 'Logging in…' : 'Login & Read →'}
            </button>
            <button type="button" onClick={() => { setMode('register'); setFormErr('') }}
              style={{ background: 'none', border: 'none', color: '#8B4513', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              Don't have an account? Register free
            </button>
          </form>
        )}

        <button type="button" onClick={() => navigate('/')}
          style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
          ← Back to site
        </button>
      </div>
    </div>
  )
}
