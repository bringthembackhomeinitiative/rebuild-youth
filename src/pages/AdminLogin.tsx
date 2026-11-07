import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// NOTE: VITE_ env vars are bundled into the client and are NOT secret.
// This is a lightweight client-side gate, not real security.
// For production-grade admin auth, use Supabase Auth + row-level security.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

const AUTH_KEY = 'rtyf_admin_auth'
const FAILS_KEY = 'rtyf_admin_fails'
const BLOCK_KEY = 'rtyf_admin_blocked_until'
const MAX_ATTEMPTS = 3
const BLOCK_MS = 5 * 60 * 1000 // 5 minutes

const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [blockedUntil, setBlockedUntil] = useState(() =>
    Number(localStorage.getItem(BLOCK_KEY) || 0),
  )
  const [now, setNow] = useState(Date.now())

  // Already authed? Bounce to the dashboard.
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === 'true') navigate('/admin', { replace: true })
  }, [navigate])

  // Live countdown while blocked.
  useEffect(() => {
    if (now >= blockedUntil) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [now, blockedUntil])

  const isBlocked = now < blockedUntil
  const remainingMs = Math.max(0, blockedUntil - now)
  const remainingMin = Math.floor(remainingMs / 60000)
  const remainingSec = Math.floor((remainingMs % 60000) / 1000)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')

    if (isBlocked) {
      setErr(`Too many failed attempts. Try again in ${remainingMin}m ${remainingSec}s.`)
      return
    }

    const ok =
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD

    if (ok) {
      localStorage.removeItem(FAILS_KEY)
      localStorage.removeItem(BLOCK_KEY)
      setBlockedUntil(0)
      localStorage.setItem(AUTH_KEY, 'true')
      navigate('/admin', { replace: true })
      return
    }

    const fails = Number(localStorage.getItem(FAILS_KEY) || 0) + 1
    if (fails >= MAX_ATTEMPTS) {
      const until = Date.now() + BLOCK_MS
      localStorage.setItem(BLOCK_KEY, String(until))
      localStorage.setItem(FAILS_KEY, '0')
      setBlockedUntil(until)
      setNow(Date.now())
      setErr('Too many failed attempts. Account locked for 5 minutes.')
    } else {
      localStorage.setItem(FAILS_KEY, String(fails))
      setErr(`Invalid credentials. ${MAX_ATTEMPTS - fails} attempt(s) remaining.`)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0B2A8C 0%, #040D2E 60%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <p
            className="font-body font-bold uppercase mb-3"
            style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#C9A86A' }}
          >
            Rebuild The Youth Foundation
          </p>
          <h1 className="font-display font-bold text-white text-3xl mb-2">Admin Login</h1>
          <div className="gold-line w-12 mx-auto" aria-hidden="true" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,144,10,0.25)' }}
        >
          <label className="block mb-5">
            <span
              className="font-body text-xs uppercase tracking-widest mb-2 block"
              style={{ color: '#C9A86A' }}
            >
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); setErr('') }}
              disabled={isBlocked}
              placeholder="admin@rebuild.com"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-white bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C8900A]/40 placeholder-white/40"
            />
          </label>

          <label className="block mb-6">
            <span
              className="font-body text-xs uppercase tracking-widest mb-2 block"
              style={{ color: '#C9A86A' }}
            >
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setErr('') }}
              disabled={isBlocked}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-white bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C8900A]/40 placeholder-white/40"
            />
          </label>

          {err && (
            <p
              role="alert"
              className="font-body text-sm mb-5"
              style={{ color: isBlocked ? '#E8C36B' : '#F87171' }}
            >
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={isBlocked || !email || !password}
            className="w-full py-3.5 rounded-full font-body font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg,#C8900A 0%,#E8C36B 45%,#D4A017 100%)',
              color: '#071A5E',
              boxShadow: '0 4px 24px rgba(200,144,10,0.35)',
            }}
          >
            {isBlocked ? 'Locked' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-4 py-2.5 font-body text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Back to site
          </button>
        </form>

        {isBlocked && (
          <p
            className="text-center font-body text-xs mt-5"
            style={{ color: 'rgba(200,144,10,0.7)' }}
          >
            Locked — try again in {remainingMin}m {remainingSec}s
          </p>
        )}
      </motion.div>
    </main>
  )
}

export default AdminLogin
