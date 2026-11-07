// TicketPage — renders the ticket at /ticket
// Ticket data is passed via React Router location.state so the URL is bookmarkable
// and the browser Back button returns to the registration form at /.
import { useLocation, useNavigate } from 'react-router-dom'
import TicketPreview from '../components/TicketPreview'
import type { TicketData } from '../types'

export default function TicketPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const ticket   = location.state?.ticket as TicketData | undefined

  // No ticket data — show a graceful fallback (direct URL visit or stale refresh)
  if (!ticket) {
    return (
      <div
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#071A5E',
          color: '#fff',
          gap: '20px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            color: '#E8C36B',
            margin: 0,
          }}
        >
          No ticket found
        </h2>
        <p
          style={{
            fontSize: '1rem',
            opacity: 0.7,
            maxWidth: '360px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          It looks like you arrived here directly. Please complete the
          registration form to generate your ticket.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg,#C8900A 0%,#E8C36B 50%,#D4A017 100%)',
            color: '#071A5E',
            padding: '13px 36px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(200,144,10,0.35)',
          }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  const handleReset = () => {
    // Go back to home (the form) — creates a forward history entry so they can
    // press Back to get back to the ticket if they want.
    navigate('/')
  }

  return <TicketPreview ticket={ticket} onReset={handleReset} />
}
