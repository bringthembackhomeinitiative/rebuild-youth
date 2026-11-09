import React from 'react'
import { motion } from 'framer-motion'
import Container from './ui/Container'
import { fadeUp, staggerContainer, staggerChild, VIEWPORT_ONCE } from '@/lib/animations'

const WHATSAPP_HREF = 'https://wa.me/2348150804455'
const GOLD = '#B07A08'
const NAVY = '#172B4D'

const cards = [
  {
    icon: '💛',
    title: 'Donations & Financial Support',
    body: 'Interested in making a financial contribution towards our mission? Reach out to our team for information on approved donation channels and how you can support our initiatives.',
  },
  {
    icon: '🤝',
    title: 'Partnerships & Sponsorships',
    body: 'We welcome individuals, organisations, businesses and institutions interested in partnering with us to create meaningful and lasting impact.',
  },
  {
    icon: '🌱',
    title: 'Material & Other Support',
    body: 'Support our mission through resources, professional skills, services, materials and other meaningful contributions that can help advance our work.',
  },
]

const SupportMission: React.FC = () => (
  <section
    id="support"
    aria-labelledby="support-heading"
    style={{ background: '#F8F6F1' }}
    className="py-24 md:py-36 overflow-hidden"
  >
    {/* subtle top accent line */}
    <div className="h-px bg-gold-gradient" aria-hidden="true" />

    <Container>
      {/* ── Section label + heading ── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="text-center mb-16"
      >
        <p
          className="font-body font-bold uppercase mb-4"
          style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: GOLD }}
        >
          Support Our Mission
        </p>
        <h2
          id="support-heading"
          className="font-display font-bold"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.08, color: NAVY }}
        >
          Be Part of the{' '}
          <span className="italic" style={{ color: GOLD }}>Change.</span>
        </h2>
        <p
          className="font-body mt-5 max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: '16px', color: '#3A4A5C' }}
        >
          Every contribution, partnership and act of support brings us closer to our vision
          of restoring lives and building futures. Whether you wish to support our initiatives
          financially, partner with us or contribute your resources and expertise, your
          willingness to make a difference matters.
        </p>
        <div className="gold-line-dark w-16 mx-auto mt-6" aria-hidden="true" />
      </motion.div>

      {/* ── Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        variants={staggerContainer} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {cards.map(({ icon, title, body }) => (
          <motion.div
            key={title}
            variants={staggerChild}
            className="rounded-2xl p-8 flex flex-col gap-4"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(176,122,8,0.15)',
              boxShadow: '0 4px 24px rgba(23,43,77,0.07)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(176,122,8,0.10)' }}
              aria-hidden="true"
            >
              {icon}
            </div>
            <h3
              className="font-display font-bold"
              style={{ fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', color: NAVY, lineHeight: 1.25 }}
            >
              {title}
            </h3>
            <p
              className="font-body leading-relaxed flex-1"
              style={{ fontSize: '15px', color: '#3A4A5C' }}
            >
              {body}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── CTA block ── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="rounded-2xl text-center px-6 py-14 md:py-16 mx-auto max-w-2xl"
        style={{
          background: NAVY,
          border: '1px solid rgba(176,122,8,0.3)',
          boxShadow: '0 8px 40px rgba(23,43,77,0.18)',
        }}
      >
        <p
          className="font-body font-bold uppercase mb-3"
          style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(232,195,107,0.8)' }}
        >
          Get in Touch
        </p>
        <h3
          className="font-display font-bold text-white mb-4"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', lineHeight: 1.1 }}
        >
          Ready to Make a Difference?
        </h3>
        <p
          className="font-body leading-relaxed mb-8 mx-auto max-w-lg"
          style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)' }}
        >
          We would love to hear from you. For donations, partnerships, sponsorships and other
          enquiries about supporting the foundation, kindly reach out to us through our
          official WhatsApp contact.
        </p>

        {/* WhatsApp CTA — reuses the exact same number as the footer */}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp (opens in new tab)"
          className="inline-flex items-center gap-2 font-body font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: '#25D366',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '9999px',
            fontSize: '15px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1ebe5d')}
          onMouseLeave={e => (e.currentTarget.style.background = '#25D366')}
        >
          {/* WhatsApp icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat with Us on WhatsApp
        </a>
      </motion.div>
    </Container>
  </section>
)

export default SupportMission
