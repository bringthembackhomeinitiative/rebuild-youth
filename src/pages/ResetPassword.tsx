import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

// Eye icons (inline, no extra dep)
const EyeOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [done, setDone]                 = useState(false)
  const [err, setErr]                   = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [linkInvalid, setLinkInvalid]   = useState(false)

  // Supabase sends the user back with an access_token in the URL hash.
  // onAuthStateChange fires with PASSWORD_RECOVERY when the token is valid.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // If after 5 seconds no PASSWORD_RECOVERY event, the link is invalid/expired
    const timeout = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setLinkInvalid(true)
        return prev
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setErr('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error('[ResetPassword]', error.message)
        if (
          error.message.toLowerCase().includes('expired') ||
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('jwt')
        ) {
          setLinkInvalid(true)
          return
        }
        setErr(error.message)
        return
      }
      setDone(true)
    } catch (ex) {
      console.error('[ResetPassword] unexpected:', ex)
      setErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1.5px solid #ccc',
    borderRadius: '8px',
    padding: '12px 48px 12px 14px',
    fontSize: '16px',  /* prevents iOS zoom */
    color: '#111',
    background: '#fff',
    outline: 'none',
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
        {/* ── Invalid / expired link ── */}
        {linkInvalid && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2040', margin: '0 0 12px' }}>
              Link Expired or Invalid
            </h1>
            <p style={{ fontSize: '14px', color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>
              This password reset link has expired or has already been used. Please request a new
              one.
            </p>
            <Link
              to="/forgot-password"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: '#0F2040',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '16px',
              }}
            >
              Request New Link
            </Link>
            <br />
            <Link to="/read-book" style={{ fontSize: '13px', color: '#8B4513', textDecoration: 'underline' }}>
              ← Back to Login
            </Link>
          </div>
        )}

        {/* ── Waiting for Supabase session (token processing) ── */}
        {!linkInvalid && !sessionReady && !done && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔐</div>
            <p style={{ fontSize: '15px', color: '#555' }}>Verifying your reset link…</p>
          </div>
        )}

        {/* ── Success ── */}
        {done && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2040', margin: '0 0 12px' }}>
              Password Updated
            </h1>
            <p style={{ fontSize: '14px', color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>
              Your password has been changed successfully. You can now log in with your new
              password.
            </p>
            <button
              onClick={() => navigate('/read-book')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                background: '#0F2040',
                color: '#fff',
                border: 'none',
                minHeight: '48px',
              }}
            >
              Go to Login →
            </button>
          </div>
        )}

        {/* ── Reset form ── */}
        {!linkInvalid && sessionReady && !done && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔑</div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2040', margin: '0 0 8px' }}>
                Set New Password
              </h1>
              <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.6 }}>
                Choose a strong password with at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* New password */}
              <div>
                <label
                  htmlFor="rp-pw"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}
                >
                  New Password <span style={{ fontWeight: 400, color: '#888' }}>(min 8 chars)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="rp-pw"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErr('') }}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#B07A08')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#ccc')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPw ? <EyeOpen /> : <EyeOff />}
                  </button>
                </div>
                {/* Strength indicator */}
                {password.length > 0 && (
                  <p style={{ fontSize: '12px', margin: '4px 0 0', color: password.length < 8 ? '#dc2626' : '#16a34a' }}>
                    {password.length < 8 ? `${8 - password.length} more character(s) needed` : '✓ Strong enough'}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="rp-confirm"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="rp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErr('') }}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#B07A08')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#ccc')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showConfirm ? <EyeOpen /> : <EyeOff />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm.length > 0 && (
                  <p style={{ fontSize: '12px', margin: '4px 0 0', color: password !== confirm ? '#dc2626' : '#16a34a' }}>
                    {password !== confirm ? '✗ Passwords do not match' : '✓ Passwords match'}
                  </p>
                )}
              </div>

              {err && (
                <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || password.length < 8 || password !== confirm}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading || password.length < 8 || password !== confirm ? 'not-allowed' : 'pointer',
                  background: loading || password.length < 8 || password !== confirm ? '#a0a0a0' : '#0F2040',
                  color: '#fff',
                  border: 'none',
                  opacity: loading || password.length < 8 || password !== confirm ? 0.7 : 1,
                  minHeight: '48px',
                }}
              >
                {loading ? 'Updating…' : 'Update Password'}
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
          </>
        )}
      </div>
    </main>
  )
}
