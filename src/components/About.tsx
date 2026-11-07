import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { aboutContent } from '@/content/siteContent'
import { fadeUp, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const About: React.FC = () => (
  <section id="about" className="relative py-24 md:py-36 overflow-hidden bg-light-a">
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 60% 40% at 0% 0%, rgba(213,177,106,0.06) 0%, transparent 55%)',
      }}
    />

    <Container>
      {/* ── Section label & heading ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mb-16 md:mb-20 max-w-3xl"
      >
        {/* Section label: gold bold */}
        <p
          className="font-body font-bold uppercase mb-5"
          style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#B07A08' }}
        >
          About the Foundation
        </p>
        <h2
          className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', color: '#172B4D' }}
        >
          {aboutContent.heading}
        </h2>
        <div
          className="gold-line-dark mt-8"
          style={{ maxWidth: '60px' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* ── Body paragraphs: dark ink ── */}
      <motion.div
        className="max-w-3xl space-y-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {aboutContent.paragraphs.map((para, i) => (
          <motion.p
            key={i}
            variants={staggerChild}
            className="font-body leading-relaxed"
            style={{ fontSize: '16px', color: '#283444' }}
          >
            {para}
          </motion.p>
        ))}
      </motion.div>

      {/* ── Pull quote ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mt-16 md:mt-20 relative py-10"
        style={{ borderTop: '1px solid rgba(176,122,8,0.18)', borderBottom: '1px solid rgba(176,122,8,0.18)' }}
      >
        <p
          className="font-display font-bold italic text-center"
          style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 2rem)',
            lineHeight: '1.3',
            color: '#172B4D',
          }}
        >
          {aboutContent.pullQuote}
        </p>
      </motion.div>
    </Container>
  </section>
)

export default About
