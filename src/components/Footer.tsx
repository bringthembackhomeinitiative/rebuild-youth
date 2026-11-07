import React from 'react'
import Container from './ui/Container'
import { orgTagline, navLinks, footerContent } from '@/content/siteContent'

const socialLinks = [
  { label: 'Facebook', href: footerContent.socialFacebook, external: true },
  { label: 'X',        href: footerContent.socialTwitter,   external: true },
  { label: 'YouTube',  href: footerContent.socialYouTube,   external: true },
  { label: 'Email',    href: `mailto:${footerContent.contactEmail}`, external: false },
]

const Footer: React.FC = () => {
  const go = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const year = new Date().getFullYear()

  return (
    <footer role="contentinfo" aria-label="Site footer" style={{ background: '#040D2E' }}>

      {/* Gold top line */}
      <div className="h-px bg-gold-gradient" aria-hidden="true" />

      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-14">

          {/* ── Brand ── */}
          <div className="sm:col-span-1">
            <p className="font-display font-bold text-white text-xl mb-1">
              Rebuild{' '}
              <span className="italic" style={{ color: '#E8C36B' }}>the Youth</span>
            </p>
            {/* Section sub-label: gold bold */}
            <p
              className="font-body font-bold uppercase mb-5"
              style={{ fontSize: '0.6rem', letterSpacing: '0.28em', color: '#C9A86A' }}
            >
              Foundation
            </p>
            {/* Tagline: pure white */}
            <p className="font-body text-xs text-white leading-relaxed max-w-xs mb-6">
              {orgTagline}
            </p>
            <div className="gold-line" style={{ maxWidth: '40px' }} aria-hidden="true" />
          </div>

          {/* ── Navigation ── */}
          <nav aria-label="Footer navigation">
            {/* Column label: gold bold */}
            <p
              className="font-body font-bold uppercase mb-5"
              style={{ fontSize: '0.6rem', letterSpacing: '0.28em', color: '#C9A86A' }}
            >
              Navigate
            </p>
            <ul role="list" className="space-y-3">
              {navLinks.map(link => (
                <li key={link.href}>
                  {/* Nav links: pure white */}
                  <button
                    onClick={() => go(link.href)}
                    className="font-body text-sm text-white hover:text-gold-pale transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold-pale rounded"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contact + Social ── */}
          <div>
            {/* Column label: gold bold */}
            <p
              className="font-body font-bold uppercase mb-5"
              style={{ fontSize: '0.6rem', letterSpacing: '0.28em', color: '#C9A86A' }}
            >
              Contact
            </p>

            <a
              href={`mailto:${footerContent.contactEmail}`}
              className="font-body text-sm text-white hover:text-gold-pale transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gold-pale rounded"
            >
              {footerContent.contactEmail}
            </a>

            {/* WhatsApp contact — opens wa.me, never a tel: link */}
            <a
              href="https://wa.me/2348150804455"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp (opens in new tab)"
              className="font-body font-bold text-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-gold-pale rounded-full"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                padding: '9px 18px',
                background: '#25D366',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '9999px',
                boxShadow: '0 2px 10px rgba(37,211,102,0.30)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1ebe5d')}
              onMouseLeave={e => (e.currentTarget.style.background = '#25D366')}
            >
              {/* WhatsApp SVG icon */}
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="currentColor" aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat with Us
            </a>

            {/* Follow label: gold bold */}
            <p
              className="font-body font-bold uppercase mt-8 mb-4"
              style={{ fontSize: '0.6rem', letterSpacing: '0.28em', color: '#C9A86A' }}
            >
              Follow
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  aria-label={external ? `Follow us on ${label} (opens in new tab)` : 'Email us'}
                  className="font-body text-xs text-white hover:text-gold-pale px-3 py-1 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-gold-pale"
                  style={{ border: '1px solid rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,144,10,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="font-body text-xs text-white">
            © {year} Rebuild the Youth Foundation. All rights reserved.
          </p>
          <p className="font-body text-xs text-white">
            Organized by Rebuild the Youth Foundation
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
