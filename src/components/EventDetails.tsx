import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import Button from './ui/Button'
import { eventDetails, eventDateISO } from '@/content/siteContent'
import { fadeUp, VIEWPORT_ONCE } from '@/lib/animations'
import type { AttendanceMode } from '@/types'

// ── Countdown ────────────────────────────────────────────────────────────────
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

// Compute calendar days remaining using Africa/Lagos (UTC+1).
// On Nov 4 evening → Dec 5 should show 31 calendar days remaining.
function getTimeLeft(): TimeLeft {
  const now    = Date.now()
  const target = new Date(eventDateISO).getTime()          // treated as local (WAT = UTC+1)
  const diff   = Math.max(0, target - now)

  if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  // Calendar-day count: compare date strings in Africa/Lagos timezone
  const fmt = (ts: number) => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(ts))

  const [nowD, nowM, nowY]    = fmt(now).split('/').map(Number)
  const [tgtD, tgtM, tgtY]    = fmt(target).split('/').map(Number)
  const nowDate = new Date(nowY, nowM - 1, nowD)
  const tgtDate = new Date(tgtY, tgtM - 1, tgtD)
  const calDays = Math.round((tgtDate.getTime() - nowDate.getTime()) / 86_400_000)

  return {
    days:    Math.max(0, calDays),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[3.5rem]">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="font-display font-bold text-white tabular-nums leading-none"
      style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
      aria-live="off"
    >
      {String(value).padStart(2, '0')}
    </motion.span>
    {/* Label: gold + bold */}
    <span
      className="font-body font-bold uppercase mt-1.5"
      style={{ fontSize: '0.6rem', letterSpacing: '0.22em', color: '#C9A86A' }}
    >
      {label}
    </span>
  </div>
)

const Separator: React.FC = () => (
  <span
    className="font-display font-bold text-white self-start mt-1"
    style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}
    aria-hidden="true"
  >
    :
  </span>
)

// ── Component ────────────────────────────────────────────────────────────────
interface Props { onSelectMode: (mode: AttendanceMode) => void }

const EventDetails: React.FC<Props> = ({ onSelectMode }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)
  const isOver = new Date(eventDateISO).getTime() <= Date.now()

  useEffect(() => {
    if (isOver) return
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1_000)
    return () => clearInterval(id)
  }, [isOver])

  const go = (mode: AttendanceMode) => {
    // App.handleSelectMode handles the scroll — don't double-fire it here
    onSelectMode(mode)
  }

  const items = [
    { ...eventDetails.physical, mode: 'physical' as AttendanceMode },
    { ...eventDetails.virtual,  mode: 'virtual'  as AttendanceMode },
  ]

  return (
    <section id="event" className="relative py-24 md:py-36 overflow-hidden bg-section-a grain">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 100% 60%, rgba(30,86,224,0.14) 0%, transparent 60%)' }}
      />

      <Container>

        {/* ── Heading row ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            {/* Section label: gold + bold */}
            <p
              className="font-body font-bold uppercase mb-4"
              style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#C9A86A' }}
            >
              The Event
            </p>
            <h2
              className="font-display font-bold text-white"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: '1.05' }}
            >
              Join Us in&nbsp;
              <span className="italic" style={{ color: '#E8C36B' }}>2026</span>
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={VIEWPORT_ONCE}
            transition={{ delay: 0.15 }}
            className="font-body font-normal max-w-sm md:text-right"
            style={{ color: '#E8E9FF', fontSize: '16px' }}
          >
            Choose how you want to experience Rebuild Hangout 2026.
          </motion.p>
        </div>

        {/* ── Countdown ── */}
        {!isOver && (
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="mb-16"
          >
            <div
              className="inline-flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-8 py-6 rounded-2xl"
              style={{
                background: 'rgba(13,47,163,0.3)',
                border: '1px solid rgba(200,144,10,0.2)',
                backdropFilter: 'blur(16px)',
              }}
              aria-label={`Countdown to Rebuild Hangout 2026: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`}
            >
              {/* "EVENT BEGINS IN" label: gold + bold */}
              <p
                className="font-body font-bold uppercase sm:mr-4 text-center sm:text-left"
                style={{ fontSize: '0.65rem', letterSpacing: '0.22em', color: '#C9A86A' }}
              >
                Program Commences 9am · Begins In
              </p>
              <div className="flex items-center gap-3 justify-center" aria-hidden="true">
                <CountdownUnit value={timeLeft.days}    label="Days"    />
                <Separator />
                <CountdownUnit value={timeLeft.hours}   label="Hours"   />
                <Separator />
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <Separator />
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Two attendance paths ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ background: 'rgba(200,144,10,0.1)', borderRadius: '1rem', overflow: 'hidden' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.heading}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={VIEWPORT_ONCE}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
              className="group relative p-10 md:p-12 flex flex-col gap-0"
              style={{ background: i === 0 ? '#0B2A8C' : '#071A5E' }}
            >
              {/* Hover brightening */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(30,86,224,0.2) 0%, transparent 65%)' }}
                aria-hidden="true"
              />

              {/* Card section label: gold + bold */}
              <p
                className="font-body font-bold uppercase mb-6 relative z-10"
                style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A86A' }}
              >
                {item.label}
              </p>

              <h3
                className="font-display font-bold text-white mb-8 relative z-10"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {item.heading}
              </h3>

              <ul
                className="space-y-4 mb-10 flex-grow relative z-10"
                aria-label={`${item.heading} details`}
              >
                {[
                  { label: 'Date',     value: item.date  },
                  { label: 'Time',     value: item.time  },
                  { label: 'Location', value: item.venue },
                ].map(row => (
                  <li key={row.label} className="flex items-baseline gap-4">
                    {/* Row labels: gold + bold */}
                    <span
                      className="font-body font-bold uppercase w-16 flex-shrink-0"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A86A' }}
                    >
                      {row.label}
                    </span>
                    <span className="gold-line-v h-3 mx-1 flex-shrink-0" aria-hidden="true" />
                    {/* Row values: pure white */}
                    <span className="font-body text-sm text-white">{row.value}</span>
                  </li>
                ))}
              </ul>

              {/* Description: #E8E9FF 16px */}
              <p
                className="font-body leading-relaxed mb-8 relative z-10"
                style={{ color: '#E8E9FF', fontSize: '16px' }}
              >
                {item.description}
              </p>

              <div className="relative z-10">
                <Button variant="ghost" size="md" onClick={() => go(item.mode)}>
                  {item.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default EventDetails
