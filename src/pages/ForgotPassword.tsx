import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [err, setErr]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!EMAIL_RE.test(email.trim())) {
      setErr('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      // redirectTo must be an allowed URL in Supabase Dashboard > Auth > URL Configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      // Always show the generic success message — never reveal whether the email exists.
      if (error) {
        console.error('[ForgotPassword]', error.message)
        // Surface only non-sensitive errors; for everything else show the generic message
        if (error.message.toLowerCase().includes('rate limit')) {
          setErr('Too many requests. Please wait a few minutes before trying again.')
          return
        }
      }
      setSent(true)
    } catch (ex) {
      console.error('[ForgotPassword] unexpected:', ex)
      setErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #0B2A8C 0%, #040D2E 60%)',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.22)',
          width: '100%',
          maxWidth: '440px',
          padding: 'clamp(28px, 6vw, 44px) clamp(20px, 6vw, 40px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2040', margin: '0 0 8px' }}>
            Forgot Your Password?
          </h1>
          {!sent && (
            <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.6 }}>
              Enter the email address associated with your account. We will send you a link to
              reset your password.
            </p>
          )}
        </div>

        {sent ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <p style={{ color: '#15803d', fontSize: '15px', fontWeight: 600, margin: '0 0 6px' }}>
                ✅ Reset link sent
              </p>
              <p style={{ color: '#166534', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                If an account exists with that email, a password reset link has been sent.
                Please check your inbox and spam folder.
              </p>
            </div>
            <Link
              to="/read-book"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '14px',
                color: '#8B4513',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="fp-email"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}
              >
                Email Address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErr('') }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1.5px solid #ccc',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '16px',  /* 16px prevents iOS zoom */
                  color: '#111',
                  background: '#fff',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#B07A08')}
                onBlur={e => (e.currentTarget.style.borderColor = '#ccc')}
              />
            </div>

            {err && (
              <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                background: loading || !email ? '#a0a0a0' : '#0F2040',
                color: '#fff',
                border: 'none',
                opacity: loading || !email ? 0.7 : 1,
                transition: 'background 0.2s',
                minHeight: '48px',  /* tappable on mobile */
              }}
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <Link
              to="/read-book"
              style={{
                textAlign: 'center',
                fontSize: '13px',
                color: '#8B4513',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}
