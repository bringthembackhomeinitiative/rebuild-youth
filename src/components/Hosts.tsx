import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { hosts } from '@/content/siteContent'
import { fadeUp, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const Hosts: React.FC = () => (
  <section id="hosts" className="relative py-24 md:py-36 overflow-hidden bg-light-a">
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 55% 45% at 100% 0%, rgba(213,177,106,0.08) 0%, transparent 55%)',
      }}
    />

    <Container>
      {/* ── Heading ── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="text-center mb-20"
      >
        {/* Section label: gold bold */}
        <p
          className="font-body font-bold uppercase mb-5"
          style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#B07A08' }}
        >
          Co-Founders &amp; Hosts
        </p>
        <h2
          className="font-display font-bold"
          style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: '1.05', color: '#172B4D' }}
        >
          Dr. Barnabas Adefemi&nbsp;
          <span className="block sm:inline font-normal" style={{ color: 'rgba(23,43,77,0.4)' }}>&amp;</span>
          &nbsp;<span className="italic" style={{ color: '#B07A08' }}>Mrs. Moyosola Adefemi</span>
        </h2>
        {/* Sub-description: dark ink, readable */}
        <p
          className="font-body mt-4 max-w-lg mx-auto leading-relaxed"
          style={{ fontSize: '16px', color: '#283444' }}
        >
          Co-founders of Rebuild the Youth Foundation and the voices guiding us
          <span className="italic" style={{ color: '#B07A08' }}> Beyond the Message</span> in 2026.
        </p>
        <div className="gold-line-dark w-16 mx-auto mt-6" aria-hidden="true" />
      </motion.div>

      {/* ── Founder pair ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 max-w-4xl mx-auto"
        variants={staggerContainer} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {hosts.map((host) => (
          <motion.article
            key={host.id}
            variants={staggerChild}
            aria-label={`Co-founder: ${host.name}`}
            className="flex flex-col items-center text-center"
          >
            {/* ── Portrait frame ── */}
            <div
              className="relative mb-8 group"
              style={{ width: 200, height: 200 }}
            >
              <div
                className="absolute inset-0 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-105"
                style={{
                  background: '#FFFFFF',
                  border: '3px solid rgba(176,122,8,0.65)',
                  boxShadow:
                    '0 0 0 6px rgba(176,122,8,0.08), 0 12px 40px rgba(23,43,77,0.15), 0 4px 12px rgba(176,122,8,0.12)',
                }}
              >
                {host.photo ? (
                  <img
                    src={host.photo}
                    alt={`Portrait of ${host.name}`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: '#F8F6F0' }}
                    aria-label={`${host.name} — portrait to be supplied`}
                  >
                    <span
                      className="font-display font-bold select-none"
                      style={{
                        fontSize: '3.5rem',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #B07A08 0%, #C8900A 50%, #D5B16A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                      aria-hidden="true"
                    >
                      {host.initials}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                style={{ background: 'rgba(176,122,8,0.2)' }}
                aria-hidden="true"
              />
            </div>

            {/* Name */}
            <h3
              className="font-display font-bold mb-1 text-balance"
              style={{ fontSize: 'clamp(1.15rem, 2.8vw, 1.65rem)', color: '#172B4D' }}
            >
              {host.name}
            </h3>

            {/* Role label: gold bold */}
            <p
              className="font-body font-bold mb-6"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#B07A08',
              }}
            >
              {host.title}
            </p>

            <div className="gold-line-dark w-10 mb-6 mx-auto" aria-hidden="true" />

            {/* Bio: dark ink fully readable */}
            <div className="space-y-4 text-left sm:text-center">
              {host.bio.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="font-body leading-relaxed max-w-sm mx-auto"
                  style={{ fontSize: '15px', color: '#283444' }}
                >
                  {para.trim()}
                </p>
              ))}
            </div>
          </motion.article>
        ))}
      </motion.div>

      {/* ── Consultation line ── */}
      <motion.p
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="text-center font-body mt-16"
        style={{ fontSize: '15px', color: '#283444' }}
      >
        For consultation, contact us at{' '}
        <a
          href="mailto:bringthembackhomeinitiative@gmail.com"
          className="font-bold underline underline-offset-2"
          style={{ color: '#B07A08' }}
        >
          bringthembackhomeinitiative@gmail.com
        </a>
      </motion.p>

    </Container>
  </section>
)

export default Hosts
