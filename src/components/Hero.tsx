import { useState, useEffect } from 'react'

// ── Countdown (Africa/Lagos calendar days) ────────────────────────────────────
const TARGET_ISO = '2026-12-05T09:00:00'

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(): TimeLeft {
  const now    = Date.now()
  const target = new Date(TARGET_ISO).getTime()
  const diff   = Math.max(0, target - now)

  if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const fmt = (ts: number) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(ts))

  const [nD, nM, nY] = fmt(now).split('/').map(Number)
  const [tD, tM, tY] = fmt(target).split('/').map(Number)
  const calDays = Math.round(
    (new Date(tY, tM - 1, tD).getTime() - new Date(nY, nM - 1, nD).getTime()) / 86_400_000,
  )

  return {
    days:    Math.max(0, calDays),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

// ── Countdown unit ────────────────────────────────────────────────────────────
function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '48px' }}>
      <span style={{
        fontFamily: 'Georgia, serif',
        fontWeight: 800,
        /* Slightly smaller on desktop so the whole card fits in one viewport */
        fontSize: 'clamp(1.35rem, 3.2vw, 1.9rem)',
        color: '#0F2040',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{
        fontSize: '0.52rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#B07A08',
        marginTop: '4px',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)
  const isOver = new Date(TARGET_ISO).getTime() <= Date.now()

  useEffect(() => {
    if (isOver) return
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [isOver])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section
      aria-label="Hero — Rebuild The Youth Hangout 2026"
      style={{
        position: 'relative',
        /* Let the section grow with content rather than forcing 100svh —
           keeps the countdown visible without scrolling on most screens.   */
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        /* FIX: clip the background image at viewport edges */
        overflow: 'hidden',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        /* navbar (64px) + ticker (44px) = 108px of fixed overlay.
           pt-[120px] on mobile, 140px on md+ gives clear gap on all screens. */
        paddingTop: 'clamp(120px, 12vw, 140px)',
        paddingBottom: '48px',
      }}
    >
      {/* ── Background image ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/hero/hangout-2026-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── FIX: Lighter overlay — was 0.72/0.52 (too dark & blurry)
              Now a gentle bottom-fade so text reads clearly without
              swamping the image or introducing blur.                   */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            /* very subtle vignette top → transparent */
            'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.22) 100%)',
          ].join(', '),
        }}
      />

      {/* ── Centered content card ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          /* FIX: no overflow, no wider than viewport */
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          /* FIX: enough horizontal padding so card never touches edge on 375px */
          padding: '0 clamp(12px, 4vw, 24px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 253, 248, 0.98)',
            borderRadius: '20px',
            /* FIX: tighter padding on desktop so countdown is above fold */
            padding: 'clamp(22px, 3.5vw, 44px) clamp(20px, 5vw, 56px)',
            /* FIX: wider card — was 720px, now 980px max */
            width: '92%',
            maxWidth: '980px',
            boxShadow: '0 20px 60px rgba(7,26,94,0.28), 0 4px 16px rgba(0,0,0,0.12)',
            textAlign: 'center',
            border: '1px solid rgba(176,122,8,0.20)',
            boxSizing: 'border-box',
          }}
        >
          {/* ── Main title ────────────────────────────────────────────── */}
          {/* fontWeight 900 + no text-shadow = crisp, sharp rendering */}
          <h1 style={{
            margin: '0 0 10px',
            lineHeight: 1.04,
            /* Pulled back slightly (3.2→2.8) to make room for bigger theme line */
            fontSize: 'clamp(1.65rem, 4.8vw, 2.8rem)',
            fontWeight: 900,
            color: '#0F2040',
            letterSpacing: '-0.01em',
            textShadow: 'none',
          }}>
            Rebuild The Youth{' '}
            <span style={{ color: '#B07A08', fontStyle: 'italic' }}>Hangout</span>{' '}
            <span style={{ color: '#0F2040' }}>2026</span>
          </h1>

          {/* ── Theme — 2× bigger than before ────────────────────────── */}
          {/* Before: clamp(0.95rem, 2.2vw, 1.2rem) ≈ 15–19 px           */}
          {/* After:  clamp(1.9rem, 4.4vw, 2.4rem)  ≈ 30–38 px  (2×)    */}
          <p style={{
            margin: '0 0 10px',
            fontSize: 'clamp(1.9rem, 4.4vw, 2.4rem)',
            fontStyle: 'italic',
            color: '#B07A08',
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            "Beyond the Message"
          </p>

          {/* ── Date / venue ──────────────────────────────────────────── */}
          <p style={{
            margin: '0 0 16px',
            fontSize: 'clamp(0.68rem, 1.4vw, 0.82rem)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0F2040',
            opacity: 0.65,
          }}>
            December 5, 2026 &nbsp;·&nbsp; 9:00 AM &nbsp;·&nbsp; FMC OWO, ARD LOUNGE
          </p>

          {/* ── Gold divider ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div style={{
              width: '48px',
              height: '3px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #C8900A, #E8C36B, #C8900A)',
            }} />
          </div>

          {/* ── Subtitle ──────────────────────────────────────────────── */}
          <p style={{
            margin: '0 0 22px',
            fontSize: 'clamp(0.85rem, 1.6vw, 0.96rem)',
            color: '#0F2040',
            opacity: 0.72,
            lineHeight: 1.6,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Join us for a life-changing gathering of young leaders, innovators, and faith-driven changemakers. Rebuilding the next generation together.
          </p>

          {/* ── CTA Buttons ───────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '22px',
          }}>
            <button
              onClick={() => scrollTo('register')}
              style={{
                background: '#0F2040',
                color: '#fff',
                padding: '12px 30px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(15,32,64,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,32,64,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,32,64,0.35)'
              }}
            >
              Reserve Your Spot
            </button>
            <button
              onClick={() => scrollTo('about')}
              style={{
                background: '#fff',
                color: '#0F2040',
                padding: '12px 30px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)',
                border: '1.5px solid rgba(15,32,64,0.2)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f4f1ec' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Learn More
            </button>
          </div>

          {/* ── Countdown ─────────────────────────────────────────────── */}
          {!isOver ? (
            <div style={{
              background: 'rgba(15,32,64,0.06)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#B07A08',
              }}>
                Program Commences 9am · Begins In
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <Unit value={timeLeft.days}    label="Days"    />
                <span style={{ color: '#B07A08', fontWeight: 800, fontSize: '1.3rem', marginTop: '2px' }}>:</span>
                <Unit value={timeLeft.hours}   label="Hours"   />
                <span style={{ color: '#B07A08', fontWeight: 800, fontSize: '1.3rem', marginTop: '2px' }}>:</span>
                <Unit value={timeLeft.minutes} label="Minutes" />
                <span style={{ color: '#B07A08', fontWeight: 800, fontSize: '1.3rem', marginTop: '2px' }}>:</span>
                <Unit value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(15,32,64,0.06)',
              borderRadius: '12px',
              padding: '14px 24px',
              display: 'inline-block',
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#B07A08', fontSize: '0.9rem' }}>
                🎉 The event is today!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
