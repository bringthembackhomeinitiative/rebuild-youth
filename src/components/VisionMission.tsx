import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { visionMission } from '@/content/siteContent'
import { fadeIn, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const VisionMission: React.FC = () => (
  <section
    id="vision"
    className="relative py-20 md:py-32 overflow-hidden"
    style={{ background: '#071A5E' }}
  >
    {/* Ambient glows */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 0% 50%, rgba(13,47,163,0.45) 0%, transparent 65%)',
      }}
    />
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 50% 50% at 100% 100%, rgba(13,47,163,0.3) 0%, transparent 60%)',
      }}
    />

    {/* Watermark logo */}
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      <img
        src="/rebuild-logo-watermark.avif"
        alt=""
        style={{
          width: '800px',
          maxWidth: '90vw',
          opacity: 0.04,
          filter: 'brightness(3) saturate(0)',
          objectFit: 'contain',
        }}
      />
    </div>

    <Container className="relative z-10">
      {/* ── Section label ── */}
      <motion.div
        variants={fadeIn} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mb-16 md:mb-20 flex flex-col items-center text-center"
      >
        {/* Section label: gold bold */}
        <p
          className="font-body font-bold uppercase mb-5"
          style={{ fontSize: '0.7rem', letterSpacing: '0.35em', color: '#C9A86A' }}
        >
          Our Foundation
        </p>
        <h2
          className="font-display font-bold text-white"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: '1' }}
        >
          Vision &amp;&nbsp;
          <span className="italic" style={{ color: '#E8C36B' }}>
            Mission
          </span>
        </h2>
        <div className="gold-line w-16 mt-6" aria-hidden="true" />
      </motion.div>

      {/* ── Two-column grid ── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px"
        style={{ borderColor: 'rgba(200,144,10,0.12)' }}
        variants={staggerContainer} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {[visionMission.vision, visionMission.mission].map((item, i) => (
          <motion.div
            key={item.heading}
            variants={staggerChild}
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
            className={`relative p-10 md:p-16 lg:p-20 ${
              i === 0 ? 'border-b lg:border-b-0 lg:border-r' : ''
            }`}
            style={{ borderColor: 'rgba(200,144,10,0.1)' }}
          >
            {/* Number watermark */}
            <div
              className="absolute top-6 right-8 font-display font-black text-9xl leading-none pointer-events-none select-none"
              style={{ color: 'rgba(200,144,10,0.05)' }}
              aria-hidden="true"
            >
              {i === 0 ? '01' : '02'}
            </div>

            {/* Card label: gold bold */}
            <p
              className="font-body font-bold uppercase mb-5"
              style={{ fontSize: '0.65rem', letterSpacing: '0.28em', color: '#C9A86A' }}
            >
              {i === 0 ? 'Vision' : 'Mission'}
            </p>

            {/* Heading */}
            <h3
              className="font-display font-bold text-white mb-5"
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                lineHeight: '1.1',
              }}
            >
              {item.heading}
            </h3>

            <div
              className="gold-line mb-8"
              style={{ width: '56px' }}
              aria-hidden="true"
            />

            {/* Body text: pure white */}
            <p className="font-body text-white leading-relaxed max-w-md" style={{ fontSize: '16px' }}>
              {item.body}
            </p>

            <div
              className="absolute bottom-0 left-0 w-12 h-px"
              style={{
                background:
                  'linear-gradient(90deg, rgba(200,144,10,0.4), transparent)',
              }}
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </motion.div>
    </Container>
  </section>
)

export default VisionMission
