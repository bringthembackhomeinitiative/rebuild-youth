import { useEffect, useState, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logoLight from '@/assets/logo-light.avif'

interface Props { onComplete: () => void }

const WelcomeSplash = ({ onComplete }: Props) => {
  const [out, setOut] = useState(false)
  // Force re-render when reduced-motion changes at runtime
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', forceUpdate)
    return () => mq.removeEventListener('change', forceUpdate)
  }, [])

  useEffect(() => {
    // If user prefers reduced motion, dismiss splash immediately
    if (prefersReduced) { onComplete(); return }

    const t1 = setTimeout(() => setOut(true),  3200)
    const t2 = setTimeout(() => onComplete(),   4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete, prefersReduced])

  const dismiss = () => { setOut(true); setTimeout(onComplete, 500) }

  // Respect reduced-motion — skip splash entirely
  if (prefersReduced) return null

  return (
    <AnimatePresence>
      {!out && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#071A5E' }}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome — The Rebuild Hangout 2026"
        >
          {/* Lighting */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 65% 25%, rgba(30,86,224,0.5) 0%, transparent 65%)' }} />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 50% 40% at 10% 85%, rgba(200,144,10,0.07) 0%, transparent 55%)' }} />

          {/* Gold bars top + bottom */}
          {(['top-0', 'bottom-0'] as const).map(pos => (
            <motion.div key={pos}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className={`absolute ${pos} inset-x-0 h-px origin-left bg-gold-gradient`}
              aria-hidden="true" />
          ))}

          {/* Skip button — always accessible */}
          <button
            onClick={dismiss}
            className="absolute top-5 right-5 font-body text-xs tracking-[0.18em] uppercase text-white/40 hover:text-white/80 transition-colors duration-200 px-4 py-2 rounded-full border border-white/10 hover:border-white/25 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold-pale z-10"
            aria-label="Skip intro"
          >
            Skip
          </button>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg">
            {/* Crest */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22,1,0.36,1] }}
              className="mb-7"
            >
              <div
                className="w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center"
                style={{
                  background: '#071A5E',
                  border: '2px solid rgba(200,144,10,0.7)',
                  boxShadow: '0 0 32px rgba(200,144,10,0.3)',
                }}
                aria-label="Rebuild the Youth Foundation logo"
              >
                <img src={logoLight} alt="Rebuild the Youth Foundation"
                  className="w-[88%] h-[88%] object-contain" />
              </div>
            </motion.div>

            {/* Welcome label */}
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="font-body text-[10px] tracking-[0.32em] uppercase text-white/45 mb-1">
              Welcome to
            </motion.p>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22,1,0.36,1] }}
              className="mb-4"
            >
              <p className="font-display font-bold text-white"
                style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)', lineHeight: '0.95' }}>
                The Rebuild
              </p>
              <p className="font-display font-black italic"
                style={{
                  fontSize: 'clamp(2.8rem, 12vw, 5rem)',
                  lineHeight: '0.95',
                  background: 'linear-gradient(135deg, #C8900A, #E8C36B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                Hangout
              </p>
            </motion.div>

            {/* Year */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="mb-6"
            >
              <span className="font-display font-bold text-white text-xl px-6 py-1.5"
                style={{
                  border: '1.5px solid rgba(200,144,10,0.7)',
                  borderRadius: '9999px',
                  background: 'rgba(200,144,10,0.1)',
                  letterSpacing: '0.1em',
                }}>
                2026
              </span>
            </motion.div>

            {/* Theme */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="font-display italic text-lg sm:text-xl text-white/60 mb-2"
            >
              Beyond the{' '}
              <span style={{ color: '#E8C36B' }}>Message</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className="font-body text-xs text-white/35">
              With Dr. Barnabas &amp; Mrs. Moyosola Adefemi
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="mt-10 w-36 h-px rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-hidden="true"
            >
              <motion.div
                initial={{ width: '0%' }} animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 1.5, ease: 'easeInOut' }}
                className="h-full bg-gold-gradient rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WelcomeSplash
