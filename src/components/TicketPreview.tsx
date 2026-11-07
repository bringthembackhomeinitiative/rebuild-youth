import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import Container from './ui/Container'
import { eventDate, eventVenuePhysical } from '@/content/siteContent'
import type { TicketData } from '@/types'

// Import logo as bundled asset URL (Vite resolves this at build time)
import logoAssetUrl from '@/assets/logo.png'

// ─── Canvas dimensions ───────────────────────────────────────────────────────
const W = 1080
const H = 1490   // taller to fit white header + all content without crowding

// ─── White header height ──────────────────────────────────────────────────────
const HEADER_H = 160

// ─── Generic image loader — works for any src (asset URL, data URL, blob URL) ─
function loadAnyImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    // crossOrigin needed for canvas export when src is a network URL
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (img.decode) {
        img.decode()
          .then(() => res(img))
          .catch(() => res(img))   // decode() fails on some browsers — still usable
      } else {
        res(img)
      }
    }
    img.onerror = () => rej(new Error(`Failed to load image: ${src.slice(0, 60)}`))
    img.src = src
  })
}

// ─── Strict loader for base64 data URLs (face photo) ─────────────────────────
function loadDataUrlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    if (!src || !src.startsWith('data:image')) {
      rej(new Error('Not a valid data URL')); return
    }
    const img = new Image()
    img.onload = () => {
      if (img.decode) {
        img.decode()
          .then(() => { console.log('[canvas] face decoded ✓', img.naturalWidth, '×', img.naturalHeight); res(img) })
          .catch(() => res(img))
      } else {
        console.log('[canvas] face loaded (no decode)', img.naturalWidth, '×', img.naturalHeight)
        res(img)
      }
    }
    img.onerror = (e) => { console.error('[canvas] face load error', e); rej(new Error('Face image failed to load')) }
    img.src = src
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, maxW: number, lineH: number,
): number {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y); line = word; y += lineH
    } else { line = test }
  }
  if (line) ctx.fillText(line, x, y)
  return y
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y);     ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r,  y + h);    ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x,      y + r);    ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

// ─── Main draw function ───────────────────────────────────────────────────────
async function drawTicket(
  canvas: HTMLCanvasElement,
  ticket: TicketData,
  qrDataUrl: string,
  logoUrl: string,
) {
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  // ── 1. LOAD LOGO FIRST (needed for both header and watermark) ─────────────
  let logoImg: HTMLImageElement | null = null
  try {
    logoImg = await loadAnyImage(logoUrl)
    console.log('[canvas] logo loaded ✓', logoImg.naturalWidth, '×', logoImg.naturalHeight)
  } catch (err) {
    console.warn('[canvas] logo failed to load:', err)
  }

  // ── 2. WHITE HEADER (160px) ───────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, HEADER_H)

  // Gold accent line under header
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0)
  goldGrad.addColorStop(0,   '#C8900A')
  goldGrad.addColorStop(0.5, '#E8C36B')
  goldGrad.addColorStop(1,   '#C8900A')
  ctx.fillStyle = goldGrad
  ctx.fillRect(0, HEADER_H - 6, W, 6)

  // Logo in header — circular clip, 100×100, at x=40, y=30
  if (logoImg) {
    const lX = 40, lY = 30, lR = 50   // center x, center y, radius
    ctx.save()
    // Gold border ring
    ctx.strokeStyle = '#C8900A'
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(lX + lR, lY + lR, lR + 3, 0, Math.PI * 2); ctx.stroke()
    // Circular clip for logo
    ctx.beginPath(); ctx.arc(lX + lR, lY + lR, lR, 0, Math.PI * 2); ctx.clip()
    ctx.drawImage(logoImg, lX, lY, lR * 2, lR * 2)
    ctx.restore()
  } else {
    // Fallback: gold circle placeholder
    ctx.save()
    ctx.strokeStyle = '#C8900A'
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(90, 80, 50, 0, Math.PI * 2); ctx.stroke()
    ctx.font = 'bold 36px Georgia, serif'
    ctx.fillStyle = '#C8900A'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('R', 90, 80)
    ctx.restore()
  }

  // Foundation name next to logo
  ctx.save()
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#0A1F44'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText('Rebuild The Youth', 160, 70)
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText('Foundation', 160, 110)
  ctx.restore()

  // Three-bar menu icon at right of header (decorative — shows org branding)
  ctx.save()
  ctx.strokeStyle = '#0A1F44'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i++) {
    const barY = 52 + i * 22
    ctx.beginPath(); ctx.moveTo(940, barY); ctx.lineTo(1000, barY); ctx.stroke()
  }
  ctx.restore()

  // ── 3. NAVY BODY BACKGROUND (below header) ───────────────────────────────
  const bg = ctx.createLinearGradient(0, HEADER_H, W, H)
  bg.addColorStop(0,   '#071A5E')
  bg.addColorStop(0.5, '#0B2A8C')
  bg.addColorStop(1,   '#071A5E')
  ctx.fillStyle = bg
  ctx.fillRect(0, HEADER_H, W, H - HEADER_H)

  // ── 4. LOGO WATERMARK (behind all content, on navy background) ───────────
  if (logoImg) {
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.filter = 'brightness(2.5) saturate(0)'   // lighten dark logo for faint visibility
    const wmSize = 900
    ctx.drawImage(logoImg,
      W / 2 - wmSize / 2,
      HEADER_H + (H - HEADER_H) / 2 - wmSize / 2,
      wmSize, wmSize,
    )
    ctx.globalAlpha = 1.0
    ctx.filter = 'none'
    ctx.restore()
    console.log('[canvas] watermark drawn ✓')
  }

  // ── 5. SUBTLE DOT PATTERN (over watermark, under content) ────────────────
  ctx.save()
  ctx.globalAlpha = 0.035
  for (let row = HEADER_H; row < H; row += 40)
    for (let col = 0; col < W; col += 40) {
      ctx.beginPath(); ctx.arc(col, row, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'; ctx.fill()
    }
  ctx.restore()

  // (top-right badge removed — badge is now centred below the attendee name)

  // ── 7. EVENT TITLE BLOCK ─────────────────────────────────────────────────
  // Org label
  ctx.save()
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillStyle = '#C9A86A'
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '5px'
  ctx.fillText('REBUILD THE YOUTH FOUNDATION', W / 2, HEADER_H + 52)
  ctx.restore()

  // Event title — "THE REBUILD HANGOUT 2026" 36px white
  ctx.save()
  ctx.font = 'bold 36px Georgia, serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'
  ctx.fillText('THE REBUILD HANGOUT 2026', W / 2, HEADER_H + 104)
  ctx.restore()

  // Theme — HUGE hero element 70px gold italic
  ctx.save()
  ctx.font = 'italic bold 70px Georgia, serif'
  ctx.fillStyle = '#E8C36B'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '1px'
  ctx.fillText('"Beyond the Message"', W / 2, HEADER_H + 194)
  ctx.restore()

  // Divider
  const divGrad = ctx.createLinearGradient(0, 0, W, 0)
  divGrad.addColorStop(0, 'transparent'); divGrad.addColorStop(0.5, '#C8900A'); divGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = divGrad; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, HEADER_H + 218); ctx.lineTo(W - 80, HEADER_H + 218); ctx.stroke()

  // ── 8. FACE CIRCLE ───────────────────────────────────────────────────────
  const faceR  = 174
  const faceCX = W / 2
  const faceCY = HEADER_H + 410   // vertically centered in body

  // Gold glow ring
  ctx.save()
  ctx.shadowColor = 'rgba(200,144,10,0.7)'; ctx.shadowBlur = 44
  ctx.strokeStyle = '#E8C36B'; ctx.lineWidth = 7
  ctx.beginPath(); ctx.arc(faceCX, faceCY, faceR + 8, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()

  // Clip circle — always fill navy first so circle is NEVER black
  ctx.save()
  ctx.beginPath(); ctx.arc(faceCX, faceCY, faceR, 0, Math.PI * 2); ctx.clip()
  ctx.fillStyle = '#0D2FA3'
  ctx.fillRect(faceCX - faceR, faceCY - faceR, faceR * 2, faceR * 2)

  const initial = ticket.fullName.charAt(0).toUpperCase()
  const drawInitial = () => {
    ctx.font = 'bold 126px Georgia, serif'
    ctx.fillStyle = '#E8C36B'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(initial, faceCX, faceCY)
  }

  if (ticket.photoUrl && ticket.photoUrl.startsWith('data:image')) {
    console.log('[canvas] loading face, length:', ticket.photoUrl.length)
    try {
      const faceImg = await loadDataUrlImage(ticket.photoUrl)
      ctx.drawImage(faceImg, faceCX - faceR, faceCY - faceR, faceR * 2, faceR * 2)
      console.log('[canvas] face drawn ✓')
    } catch (err) {
      console.warn('[canvas] face failed, using initial:', err)
      drawInitial()
    }
  } else {
    console.log('[canvas] no face photo → initial:', initial)
    drawInitial()
  }
  ctx.restore()
  ctx.textBaseline = 'alphabetic'

  // ── 9. ATTENDEE NAME / BADGES ────────────────────────────────────────────
  const nameY = faceCY + faceR + 58

  // Name
  ctx.save()
  ctx.font = 'bold 50px Georgia, serif'
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.letterSpacing = '1px'
  const lastNameY = wrapText(ctx, ticket.fullName.toUpperCase(), W / 2, nameY + 10, W - 120, 60)
  ctx.restore()

  // ── "I WILL BE ATTENDING" gold pill — centred below name ──────────────────
  const iwbaPillW = 380, iwbaPillH = 52, iwbaPillR = 26
  const iwbaX = W / 2 - iwbaPillW / 2
  const iwbaY = lastNameY + 60

  ctx.save()
  // Gold gradient fill
  const iwbaGrad = ctx.createLinearGradient(iwbaX, 0, iwbaX + iwbaPillW, 0)
  iwbaGrad.addColorStop(0, '#FACC15')
  iwbaGrad.addColorStop(1, '#D4AF37')
  ctx.shadowColor = 'rgba(200,144,10,0.45)'; ctx.shadowBlur = 14
  roundRect(ctx, iwbaX, iwbaY, iwbaPillW, iwbaPillH, iwbaPillR)
  ctx.fillStyle = iwbaGrad; ctx.fill()
  ctx.shadowColor = 'transparent'

  // Star icon in a small gold circle on the left
  const starCX = iwbaX + 28, starCY = iwbaY + iwbaPillH / 2
  ctx.beginPath(); ctx.arc(starCX, starCY, 16, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fill()
  ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('⭐', starCX, starCY)

  // Badge text
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillStyle = '#071A5E'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.letterSpacing = '1.5px'
  ctx.fillText('I WILL BE ATTENDING', W / 2 + 14, iwbaY + iwbaPillH / 2)
  ctx.restore()

  // ── IN PERSON / VIRTUAL pill — centred below "I WILL BE ATTENDING" ───────
  const isPhysical = ticket.attendanceMode === 'physical'
  const mBW = 200, mBH = 46
  const mBX = W / 2 - mBW / 2
  const mBY = iwbaY + iwbaPillH + 16

  ctx.save()
  const modeBg = ctx.createLinearGradient(mBX, 0, mBX + mBW, 0)
  if (isPhysical) { modeBg.addColorStop(0,'#C8900A'); modeBg.addColorStop(1,'#E8C36B') }
  else            { modeBg.addColorStop(0,'#0D2FA3'); modeBg.addColorStop(1,'#1848CC') }
  roundRect(ctx, mBX, mBY, mBW, mBH, mBH / 2)
  ctx.fillStyle = modeBg; ctx.fill()
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillStyle = isPhysical ? '#071A5E' : '#FFFFFF'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
  ctx.fillText(isPhysical ? '📍 IN PERSON' : '🌐 VIRTUAL', W / 2, mBY + mBH / 2)
  ctx.restore()

  // ── 10. PERFORATED DIVIDER ────────────────────────────────────────────────
  const perfY = mBY + mBH + 50
  ctx.save()
  ctx.setLineDash([12, 10])
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(80, perfY); ctx.lineTo(W - 80, perfY); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // ── 11. QR CODE — bottom-right ────────────────────────────────────────────
  const QR  = 210
  const qrX = W - 80 - QR
  const qrY = perfY + 24

  const qrImg = await loadAnyImage(qrDataUrl)
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 12
  roundRect(ctx, qrX - 12, qrY - 12, QR + 24, QR + 24, 14)
  ctx.fillStyle = '#FFFFFF'; ctx.fill()
  ctx.restore()
  ctx.drawImage(qrImg, qrX, qrY, QR, QR)

  ctx.save()
  ctx.font = 'bold 15px "Courier New", monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.textAlign = 'center'
  ctx.fillText('SCAN TO VERIFY', qrX + QR / 2, qrY + QR + 28)
  ctx.restore()

  // ── 12. TICKET INFO — bottom-left ─────────────────────────────────────────
  const iX = 80
  const iY = qrY

  const drawRow = (label: string, value: string, y: number) => {
    ctx.save()
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillStyle = '#C9A86A'; ctx.textAlign = 'left'; ctx.letterSpacing = '3px'
    ctx.fillText(label, iX, y)
    ctx.font = 'bold 22px "Courier New", monospace'
    ctx.fillStyle = '#FFFFFF'; ctx.letterSpacing = '0px'
    ctx.fillText(value, iX, y + 32)
    ctx.restore()
    return y + 32
  }

  let iy = iY
  iy = drawRow('TICKET ID', ticket.ticketNumber, iy) + 26
  iy = drawRow('DATE',      eventDate,            iy) + 26
  drawRow('VENUE', eventVenuePhysical, iy)

  // ── 13. FOOTER ────────────────────────────────────────────────────────────
  const footerY = H - 30
  ctx.save()
  ctx.font = '17px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign = 'center'; ctx.letterSpacing = '0px'
  ctx.fillText(
    `Non-transferable  ·  Present QR at the gate`,
    W / 2, footerY,
  )
  ctx.restore()

  // ── 14. GOLD BOTTOM BAR ───────────────────────────────────────────────────
  ctx.fillStyle = goldGrad
  ctx.fillRect(0, H - 7, W, 7)
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props { ticket: TicketData; onReset: () => void }

const TicketPreview: React.FC<Props> = ({ ticket, onReset }) => {
  const canvasRef           = useRef<HTMLCanvasElement>(null)
  const [ready,  setReady]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [qrUrl,  setQrUrl]  = useState<string | null>(null)

  const verifyUrl = `https://rebuildtheyouth.org/verify?id=${ticket.ticketNumber}`

  // Generate QR once on mount
  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 440, margin: 1,
      color: { dark: '#071A5E', light: '#FFFFFF' },
    }).then(setQrUrl)
  }, [verifyUrl])

  // Draw canvas whenever QR is ready or ticket changes
  useEffect(() => {
    if (!canvasRef.current || !qrUrl) return
    setReady(false)
    drawTicket(canvasRef.current, ticket, qrUrl, logoAssetUrl)
      .then(() => { setReady(true); console.log('[ticket] canvas render complete ✓') })
      .catch(err => console.error('[ticket] render error:', err))
  }, [ticket, qrUrl])

  const handleDownload = () => {
    if (!canvasRef.current || !ready) return
    setSaving(true)
    try {
      const a = document.createElement('a')
      a.download = `RebuildHangout-${ticket.ticketNumber}.png`
      a.href     = canvasRef.current.toDataURL('image/png')
      a.click()
      console.log('[ticket] PNG download triggered ✓')
    } finally {
      setSaving(false)
    }
  }

  const ts = new Date(ticket.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <section id="ticket" aria-label="Your digital ticket"
      className="relative py-24 md:py-36 overflow-hidden bg-section-c grain">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{background:'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(200,144,10,0.07) 0%, transparent 65%)'}} />

      <Container>
        {/* Section heading */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          transition={{duration:0.7}} className="text-center mb-14">
          <p className="font-body font-bold uppercase mb-5"
            style={{fontSize:'0.7rem',letterSpacing:'0.3em',color:'#C9A86A'}}>
            All set
          </p>
          <h2 className="font-display font-bold text-white mb-3"
            style={{fontSize:'clamp(2rem,5vw,3.2rem)'}}>
            Your Ticket is{' '}
            <span className="italic" style={{color:'#E8C36B'}}>Ready</span>
          </h2>
          <p className="font-body text-sm text-white">Generated {ts}</p>
          <div className="gold-line w-12 mx-auto mt-6" aria-hidden="true" />
        </motion.div>

        {/* Canvas wrapper */}
        <motion.div
          initial={{opacity:0,scale:0.96,y:28}} animate={{opacity:1,scale:1,y:0}}
          transition={{duration:0.9,ease:[0.22,1,0.36,1],delay:0.15}}
          className="mx-auto" style={{maxWidth:'480px'}}>

          {/* Skeleton while rendering */}
          {!ready && (
            <div className="w-full rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{
                aspectRatio:`${W}/${H}`,
                background:'rgba(13,47,163,0.22)',
                border:'1px solid rgba(200,144,10,0.18)',
              }}>
              <motion.svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                animate={{rotate:360}} transition={{repeat:Infinity,duration:0.9,ease:'linear'}}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#C9A86A" strokeWidth="4"/>
                <path className="opacity-75" fill="#C9A86A" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </motion.svg>
              <p className="text-xs font-body" style={{color:'rgba(200,144,10,0.5)'}}>
                Drawing ticket…
              </p>
            </div>
          )}

          <canvas
            ref={canvasRef} width={W} height={H}
            role="img"
            aria-label={`Ticket for ${ticket.fullName} — ${ticket.ticketNumber}`}
            style={{
              display: ready ? 'block' : 'none',
              width:'100%', height:'auto',
              borderRadius:'14px',
              boxShadow:'0 0 60px rgba(200,144,10,0.15), 0 24px 48px rgba(7,26,94,0.6)',
            }}
          />

          {ready && (
            <p className="text-center font-body text-[11px] tracking-widest uppercase mt-4"
              style={{color:'rgba(200,144,10,0.5)'}}>
              {ticket.ticketNumber}
            </p>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          transition={{delay:0.65,duration:0.5}}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

          {/* Download PNG */}
          <button onClick={handleDownload} disabled={!ready || saving}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
              font-body font-bold text-sm transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:'linear-gradient(135deg,#C8900A 0%,#E8C36B 45%,#D4A017 100%)',
              color:'#071A5E',
              boxShadow:'0 4px 24px rgba(200,144,10,0.35)',
            }}>
            {saving ? (
              <>
                <motion.svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24"
                  animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:'linear'}}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </motion.svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Ticket (PNG)
              </>
            )}
          </button>

          {/* Register another */}
          <button onClick={onReset}
            className="inline-flex items-center justify-center px-7 py-4 rounded-full
              font-body font-bold text-sm text-white transition-all duration-300"
            style={{border:'1.5px solid rgba(255,255,255,0.28)',background:'transparent'}}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Register Another Person
          </button>
        </motion.div>

        <p className="text-center font-body text-xs mt-5"
          style={{color:'rgba(200,144,10,0.45)'}}>
          Download PNG · Share on WhatsApp Status · Scan QR at the gate
        </p>
      </Container>
    </section>
  )
}

export default TicketPreview
