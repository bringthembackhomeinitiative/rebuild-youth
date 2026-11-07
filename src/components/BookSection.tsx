import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from './ui/Container'
import { fadeUp, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const BookSection: React.FC = () => {
  const [showBack, setShowBack] = useState(false)

  return (
    <section
      id="book"
      className="relative py-24 md:py-36 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 20% 80%, rgba(30,86,224,0.18) 0%, transparent 55%), linear-gradient(175deg, #071A5E 0%, #0B2A8C 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 90% 10%, rgba(200,144,10,0.08) 0%, transparent 55%)',
        }}
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Book cover display ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="flex justify-center"
          >
            <div className="relative" style={{ width: 'min(320px, 85vw)' }}>

              {/* Glow beneath cover */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(200,144,10,0.35)' }}
                aria-hidden="true"
              />

              {/* Cover flip container */}
              <div
                className="relative cursor-pointer select-none"
                style={{ perspective: '1200px' }}
                onMouseEnter={() => setShowBack(true)}
                onMouseLeave={() => setShowBack(false)}
                onClick={() => setShowBack(v => !v)}
                aria-label="Book cover — hover or tap to see back cover"
                role="img"
              >
                <AnimatePresence mode="wait">
                  {!showBack ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -8, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 8, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <img
                        src="/images/book/book-cover.jpg"
                        alt="Why Harm Your Body? — Front Cover"
                        draggable={false}
                        style={{
                          width: '100%',
                          display: 'block',
                          borderRadius: '6px',
                          /* Sharp rendering — no browser blur */
                          imageRendering: 'crisp-edges',
                          boxShadow:
                            '0 4px 8px rgba(0,0,0,0.3), 8px 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,144,10,0.4)',
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 8, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -8, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <img
                        src="/images/book/book-back-cover.jpg"
                        alt="Why Harm Your Body? — Back Cover"
                        draggable={false}
                        style={{
                          width: '100%',
                          display: 'block',
                          borderRadius: '6px',
                          imageRendering: 'crisp-edges',
                          boxShadow:
                            '0 4px 8px rgba(0,0,0,0.3), 8px 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,144,10,0.4)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover hint badge */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: showBack ? 0 : 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute -bottom-10 left-0 right-0 flex justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <span
                    className="font-body font-bold uppercase text-center"
                    style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#C9A86A' }}
                  >
                    Hover to see back cover
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── Book info ── */}
          <motion.div
            className="flex flex-col gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            {/* Section label */}
            <motion.p
              variants={staggerChild}
              className="font-body font-bold uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#C9A86A' }}
            >
              Published Book
            </motion.p>

            {/* Title */}
            <motion.h2
              variants={staggerChild}
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}
            >
              WHY HARM{' '}
              <span className="italic" style={{ color: '#E8C36B' }}>YOUR</span>
              {' '}BODY?
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={staggerChild}
              className="font-display italic"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#C9A86A' }}
            >
              Take Responsibility in Addressing Unhealthy Habits<br />
              That Negatively Affect Your Health
            </motion.p>

            <div className="gold-line" style={{ maxWidth: '60px' }} aria-hidden="true" />

            {/* Description */}
            <motion.p
              variants={staggerChild}
              className="font-body leading-relaxed"
              style={{ color: '#E8E9FF', fontSize: '16px', maxWidth: '480px' }}
            >
              A Medicovangelism Initiative by <strong className="text-white">Dr. Barnabas &amp; Mrs. Moyosola Adefemi</strong>.
              Written for young and great minds, this book is a bold call to pause, reflect, and reclaim ownership
              of your physical and spiritual well-being — addressing mental health, physical health, and social health
              with evidence-based insights and Christian perspective.
            </motion.p>

            {/* Key topics */}
            <motion.div
              variants={staggerChild}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {[
                { icon: '🧠', label: 'Mental Health' },
                { icon: '💪', label: 'Physical Health' },
                { icon: '🤝', label: 'Social Health' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(200,144,10,0.08)',
                    border: '1px solid rgba(200,144,10,0.25)',
                  }}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span
                    className="font-body font-bold uppercase"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#C9A86A' }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Metadata */}
            <motion.div
              variants={staggerChild}
              className="flex flex-wrap gap-x-6 gap-y-1"
            >
              {[
                { label: 'Authors', value: 'Dr. Barnabas & Mrs. Moyosola Adefemi' },
                { label: 'ISBN', value: '978-978-777-909-5' },
                { label: 'Copyright', value: '© 2025' },
              ].map(m => (
                <p key={m.label} className="font-body text-sm">
                  <span
                    className="font-bold uppercase"
                    style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: '#C9A86A' }}
                  >
                    {m.label}:{' '}
                  </span>
                  <span className="text-white">{m.value}</span>
                </p>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              variants={staggerChild}
              className="flex flex-wrap gap-4 pt-2"
            >
              {/* Read Now — secure in-browser reader */}
              <a
                href="/read-book"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-body font-bold text-sm transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold-pale"
                style={{
                  background: 'linear-gradient(135deg, #C8900A 0%, #E8C36B 45%, #D4A017 100%)',
                  color: '#071A5E',
                  boxShadow: '0 4px 24px rgba(200,144,10,0.35)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    '0 6px 36px rgba(200,144,10,0.55)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    '0 4px 24px rgba(200,144,10,0.35)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = ''
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                Read Now — Free
              </a>

              {/* View cover */}
              <a
                href="/images/book/book-cover.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-body font-bold text-sm text-white transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold-pale"
                style={{
                  border: '1.5px solid rgba(200,144,10,0.5)',
                  background: 'rgba(200,144,10,0.06)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,144,10,0.14)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,144,10,0.8)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,144,10,0.06)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,144,10,0.5)'
                }}
              >
                View Full Cover
              </a>
            </motion.div>

            {/* Note */}
            <motion.p
              variants={staggerChild}
              className="font-body text-xs"
              style={{ color: '#C9A86A' }}
            >
              200+ hard copies already distributed free to young people across Nigeria.
            </motion.p>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

export default BookSection
