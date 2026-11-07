import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { whyContent } from '@/content/siteContent'

const WhyBeyond: React.FC = () => (
  <section id="why" className="relative py-24 md:py-40 overflow-hidden bg-light-b">
    <div className="gold-line-dark absolute top-0 inset-x-0" aria-hidden="true" />

    {/* Watermark */}
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
          opacity: 0.025,
          filter: 'brightness(0) saturate(0)',
          objectFit: 'contain',
        }}
      />
    </div>

    <Container className="relative z-10">
      <div className="max-w-4xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
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
            The Theme
          </p>
        </motion.div>

        {/* Oversized theme statement */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }}
          className="font-display font-bold leading-[0.92] mb-6 text-balance"
          style={{ fontSize: 'clamp(2.6rem, 8vw, 6rem)' }}
        >
          <span style={{ color: '#172B4D' }}>Why</span>{' '}
          <span className="italic" style={{ color: '#B07A08' }}>"Beyond</span>{' '}
          <span style={{ color: '#172B4D' }}>the</span>{' '}
          <span className="italic" style={{ color: '#B07A08' }}>Message?"</span>
        </motion.h2>

        {/* Intro paragraph: dark ink */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
          className="font-body leading-relaxed mb-16 max-w-2xl"
          style={{ fontSize: '16px', color: '#283444' }}
        >
          {whyContent.intro}
        </motion.p>

        {/* Pull quote */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mb-20 py-12"
        >
          <div className="gold-line-dark absolute top-0 inset-x-0" aria-hidden="true" />
          <div className="gold-line-dark absolute bottom-0 inset-x-0" aria-hidden="true" />

          <p
            className="font-display font-bold italic text-center"
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
              lineHeight: '1.25',
              color: '#172B4D',
            }}
          >
            {whyContent.pullQuote.replace(/"/g, '\u201C').replace(/"/g, '\u201D')}
          </p>
        </motion.div>

        {/* Points — vertical list */}
        <div className="space-y-0 divide-y" style={{ borderColor: 'rgba(23,43,77,0.08)' }}>
          {whyContent.points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group flex items-start gap-8 py-9 rounded-lg transition-colors duration-300"
              style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(213,177,106,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              {/* Number */}
              <span
                className="flex-shrink-0 font-display font-bold text-4xl sm:text-5xl leading-none mt-1"
                style={{ color: 'rgba(176,122,8,0.2)' }}
                aria-hidden="true"
              >
                0{i + 1}
              </span>
              <div className="flex-grow">
                {/* Point title: dark navy */}
                <h3
                  className="font-display font-bold mb-2"
                  style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#172B4D' }}
                >
                  {point.title}
                </h3>
                {/* Point body: dark ink */}
                <p
                  className="font-body leading-relaxed max-w-lg"
                  style={{ fontSize: '15px', color: '#283444' }}
                >
                  {point.body}
                </p>
              </div>
              {/* Hover accent */}
              <div className="flex-shrink-0 w-0 group-hover:w-8 overflow-hidden transition-all duration-500">
                <div
                  style={{ width: 1, height: '2.5rem', background: 'linear-gradient(180deg, transparent, #B07A08, transparent)' }}
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Container>
  </section>
)

export default WhyBeyond
