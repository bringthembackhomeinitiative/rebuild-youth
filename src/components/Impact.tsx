import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { impactContent, aboutContent } from '@/content/siteContent'
import { fadeUp, fadeIn, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const Impact: React.FC = () => (
  <section
    id="impact"
    className="relative py-24 md:py-36 overflow-hidden bg-light-c"
    aria-labelledby="impact-heading"
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(213,177,106,0.07) 0%, transparent 60%)',
      }}
    />

    <Container>

      {/* ── Section label ── */}
      <motion.div
        variants={fadeIn} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="flex items-center gap-4 mb-14"
      >
        <div
          style={{ width: 1, height: '2.5rem', background: 'linear-gradient(180deg, transparent, #B07A08 30%, #C8900A 50%, #B07A08 70%, transparent)' }}
          aria-hidden="true"
        />
        {/* Section label: gold bold */}
        <p
          className="font-body font-bold uppercase"
          style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#B07A08' }}
        >
          {impactContent.sectionLabel}
        </p>
      </motion.div>

      {/* ── Heading ── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="max-w-2xl mb-16 md:mb-20"
      >
        <h2
          id="impact-heading"
          className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', color: '#172B4D' }}
        >
          {impactContent.heading}
        </h2>
        {/* Sub description: dark ink */}
        <p
          className="font-body mt-4 leading-relaxed"
          style={{ fontSize: '16px', color: '#283444' }}
        >
          {impactContent.subheading}
        </p>
        <div className="gold-line-dark mt-8" style={{ maxWidth: '60px' }} aria-hidden="true" />
      </motion.div>

      {/* ── Impact cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 md:mb-28"
        variants={staggerContainer} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {impactContent.items.map((item) => (
          <motion.article
            key={item.id}
            variants={staggerChild}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
            aria-label={item.title}
            className="relative rounded-2xl overflow-hidden p-8 flex flex-col gap-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(176,122,8,0.2)',
              boxShadow: '0 4px 24px rgba(23,43,77,0.08), 0 1px 4px rgba(23,43,77,0.06)',
            }}
          >
            <div className="gold-line-dark -mx-8 -mt-8 mb-0" aria-hidden="true" />

            {/* Large stat */}
            <div className="mt-4">
              <p
                className="font-display font-black leading-none"
                style={{
                  fontSize: 'clamp(3rem, 7vw, 4.5rem)',
                  background: 'linear-gradient(135deg, #B07A08 0%, #C8900A 50%, #D5B16A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                aria-label={`${item.stat} ${item.statLabel}`}
              >
                {item.stat}
              </p>
              {/* Stat label: gold bold */}
              <p
                className="font-body font-bold uppercase mt-1"
                style={{ fontSize: '0.65rem', letterSpacing: '0.22em', color: '#B07A08' }}
              >
                {item.statLabel}
              </p>
            </div>

            {/* Book title */}
            <div>
              <h3
                className="font-display font-bold leading-tight mb-2"
                style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#172B4D' }}
              >
                {item.title}
              </h3>
              <div className="gold-line-dark" style={{ maxWidth: '40px' }} aria-hidden="true" />
            </div>

            {/* Description: dark ink */}
            <p
              className="font-body leading-relaxed flex-grow"
              style={{ fontSize: '15px', color: '#283444' }}
            >
              {item.description}
            </p>

            <span
              className="inline-flex items-center gap-2 self-start font-body font-bold text-xs px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(176,122,8,0.08)',
                border: '1px solid rgba(176,122,8,0.25)',
                color: '#B07A08',
                letterSpacing: '0.04em',
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.note}
            </span>
          </motion.article>
        ))}
      </motion.div>

      {/* ── Co-founder statement ── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="relative rounded-2xl overflow-hidden p-10 md:p-14"
        style={{
          background: 'rgba(23,43,77,0.04)',
          border: '1px solid rgba(176,122,8,0.18)',
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: '3px', background: 'linear-gradient(180deg, transparent, #B07A08 30%, #C8900A 50%, #B07A08 70%, transparent)' }}
          aria-hidden="true"
        />

        <div className="pl-6 sm:pl-10">
          {/* Label: gold bold */}
          <p
            className="font-body font-bold uppercase mb-6"
            style={{ fontSize: '0.65rem', letterSpacing: '0.28em', color: '#B07A08' }}
          >
            Our Founders
          </p>

          <p
            className="font-display font-bold italic leading-snug text-balance"
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.9rem)',
              color: '#172B4D',
            }}
          >
            {aboutContent.coFounderStatement}
          </p>

          <div className="gold-line-dark mt-8" style={{ maxWidth: '48px' }} aria-hidden="true" />
        </div>
      </motion.div>

    </Container>
  </section>
)

export default Impact
