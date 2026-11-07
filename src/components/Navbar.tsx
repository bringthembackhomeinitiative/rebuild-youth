import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { navLinks } from '@/content/siteContent';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState('about');

  // Strip '#' prefix and scroll to the section
  const scrollTo = (href: string) => {
    const id = href.replace(/^#/, '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
    setActiveId(id);
  };

  // Active-section tracking on scroll
  useEffect(() => {
    const onScroll = () => {
      for (const l of navLinks) {
        const id = l.href.replace(/^#/, '');
        const sec = document.getElementById(id);
        if (sec) {
          const r = sec.getBoundingClientRect();
          if (r.top <= 150 && r.bottom >= 150) setActiveId(id);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="bg-[#FFFEF9] border-b border-black/10">
        <div className="max-w-7xl mx-auto px-5 h-16 sm:h-[72px] flex items-center justify-between">

          {/* Logo + name */}
          <button
            onClick={() => scrollTo('#about')}
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B78A0F] rounded"
          >
            <img
              src={logo}
              alt="Rebuild The Youth Foundation logo"
              className="w-10 h-10 rounded-full object-cover bg-white border border-black/10"
            />
            <span className="font-extrabold text-[#0F2040] text-[15px] leading-tight text-left">
              Rebuild The Youth<br />Foundation
            </span>
          </button>

          {/* Desktop nav */}
          <ul className="hidden lg:flex gap-8">
            {navLinks.map(l => {
              const id = l.href.replace(/^#/, '');
              return (
                <li key={l.href}>
                  <button
                    onClick={() => scrollTo(l.href)}
                    className={`text-[13px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                      activeId === id
                        ? 'text-[#B78A0F]'
                        : 'text-[#0F2040]/70 hover:text-[#0F2040]'
                    }`}
                  >
                    {l.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(v => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-[#0F2040] transition-transform duration-200 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#0F2040] transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#0F2040] transition-transform duration-200 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-black/10 px-5 py-6 flex flex-col gap-4 shadow-lg">
            {navLinks.map(l => {
              const id = l.href.replace(/^#/, '');
              return (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className={`text-left text-[16px] font-bold uppercase tracking-widest py-2 transition-colors duration-150 ${
                    activeId === id ? 'text-[#B78A0F]' : 'text-[#0F2040]'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            <button
              onClick={() => scrollTo('#register')}
              className="mt-2 bg-[#0F2040] text-white rounded-full py-3 font-bold"
            >
              Reserve Spot
            </button>
          </div>
        )}
      </div>

      {/* ── Marquee strip ─────────────────────────────────────────────────────
          Fix: overflow-hidden on the track, width:100% + box-sizing:border-box
          so it never exceeds viewport. The inner runner uses width:max-content
          so text is never clipped mid-word. Two identical copies create the
          seamless loop (translateX(-50%) = exactly one copy width).         */}
      <div
        style={{
          background: '#0F2040',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',          /* ← clips at exact viewport edge */
          width: '100%',
          boxSizing: 'border-box',
        }}
        aria-hidden="true"
      >
        {/* Runner: two identical copies side-by-side → animate -50% = one copy */}
        <div className="marquee-runner">
          {/* Copy 1 */}
          <span className="marquee-item">
            REBUILD THE YOUTH HANGOUT 2026&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 12px' }}>✦</span>
            &nbsp;PRESENTS HER MAIDEN EDITION&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 12px' }}>✦</span>
            &nbsp;DECEMBER 5 · FMC OWO · ARD LOUNGE&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 20px' }}>✦</span>
          </span>
          {/* Copy 2 — identical, stitches the loop */}
          <span className="marquee-item">
            REBUILD THE YOUTH HANGOUT 2026&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 12px' }}>✦</span>
            &nbsp;PRESENTS HER MAIDEN EDITION&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 12px' }}>✦</span>
            &nbsp;DECEMBER 5 · FMC OWO · ARD LOUNGE&nbsp;
            <span style={{ color: '#E8C36B', margin: '0 20px' }}>✦</span>
          </span>
        </div>
      </div>

      <style>{`
        .marquee-runner {
          display: flex;           /* single row */
          width: max-content;      /* exactly fits both copies */
          white-space: nowrap;
          will-change: transform;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-item {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #FFFFFF;
          padding: 0 8px;          /* small inner pad so first char is never at edge */
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-runner { animation: none; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
