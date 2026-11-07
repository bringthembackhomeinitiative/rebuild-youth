// send-ticket-email — Supabase Edge Function
// Sends TWO emails on every event registration via Brevo API:
//   1. Applicant confirmation → the exact email the user entered in the form
//   2. Admin notification     → bringthembackhomeinitiative@gmail.com
//
// Required secret → Supabase Dashboard > Edge Functions > Secrets:
//   BREVO_API_KEY   ← your Brevo v3 API key (never hardcoded here)
//
// Verified Brevo sender: Rebuild The Youth Foundation <bringthembackhomeinitiative@gmail.com>
//
// ALWAYS returns HTTP 200 so a failed email never blocks ticket generation.
// The response JSON contains { applicant_email: { ok, status }, admin_email: { ok, status } }
// so the client can log which one failed without blocking the user.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SENDER_NAME  = 'Rebuild The Youth Foundation'
const SENDER_EMAIL = 'bringthembackhomeinitiative@gmail.com'
const ADMIN_EMAIL  = 'bringthembackhomeinitiative@gmail.com'

// ── Brevo send helper ─────────────────────────────────────────────────────────
async function brevoSend(
  apiKey: string,
  to: string,
  subject: string,
  htmlContent: string,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email: to }],
      subject,
      htmlContent,
    }),
  })
  const body = await res.json().catch(() => ({}))
  return { ok: res.status === 201, status: res.status, body }
}

// ── HTML templates ────────────────────────────────────────────────────────────

function applicantConfirmationHtml(
  name: string, ticketId: string, ticketType: string, eventDate: string, venue: string,
): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f5">
<div style="font-family:Arial,sans-serif;max-width:580px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8">
  <div style="background:#071A5E;padding:32px;text-align:center">
    <h1 style="color:#E8C36B;margin:0 0 8px;font-size:22px">The Rebuild Hangout 2026</h1>
    <p style="color:rgba(255,255,255,0.8);margin:0;font-size:13px">Beyond the Message</p>
  </div>
  <div style="padding:32px">
    <p style="font-size:16px;color:#111;margin:0 0 8px">Hi <strong>${name}</strong>,</p>
    <p style="color:#555;line-height:1.7;margin:0 0 24px">
      Your registration for The Rebuild Hangout 2026 is <strong style="color:#071A5E">confirmed</strong>!
    </p>
    <div style="background:#F9F6EE;border:1.5px solid #D4AF37;border-radius:10px;padding:24px;margin:0 0 24px">
      <h3 style="margin:0 0 16px;color:#071A5E;font-size:14px;text-transform:uppercase;letter-spacing:1px">Your Ticket</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:7px 0;color:#888;width:42%">Full Name</td><td style="color:#111;font-weight:600">${name}</td></tr>
        <tr><td style="padding:7px 0;color:#888">Ticket Number</td><td style="font-family:monospace;color:#071A5E;font-weight:700;font-size:15px">${ticketId}</td></tr>
        <tr><td style="padding:7px 0;color:#888">Event</td><td style="color:#111">The Rebuild Hangout 2026</td></tr>
        <tr><td style="padding:7px 0;color:#888">Date</td><td style="color:#111">${eventDate}</td></tr>
        <tr><td style="padding:7px 0;color:#888">Attendance</td><td style="color:#111">${ticketType}</td></tr>
        <tr><td style="padding:7px 0;color:#888">Venue</td><td style="color:#111">${venue}</td></tr>
      </table>
    </div>
    <p style="color:#555;line-height:1.7;margin:0 0 8px">
      Present your <strong>Ticket Number</strong> or QR code at the gate. This ticket is non-transferable.
    </p>
    <p style="color:#555;line-height:1.7;margin:0">
      See you there! 🎉<br><strong style="color:#071A5E">Rebuild The Youth Foundation</strong>
    </p>
  </div>
  <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
    <p style="font-size:11px;color:#aaa;margin:0">
      © 2026 Rebuild The Youth Foundation · Non-transferable ·
      <a href="mailto:${ADMIN_EMAIL}" style="color:#aaa">${ADMIN_EMAIL}</a>
    </p>
  </div>
</div>
</body></html>`
}

function adminNotificationHtml(
  name: string, applicantEmail: string, phone: string, ticketId: string, ticketType: string,
): string {
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f0f0f0">
<div style="font-family:Arial,sans-serif;max-width:500px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0">
  <div style="background:#111;padding:20px 28px">
    <h2 style="color:#D4AF37;margin:0 0 4px;font-size:17px">🎫 New Registration — Hangout 2026</h2>
    <p style="color:#888;margin:0;font-size:12px">${now} (WAT)</p>
  </div>
  <div style="padding:24px 28px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 0;color:#888;width:38%">Full Name</td>
        <td style="color:#111;font-weight:600">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 0;color:#888">Email</td>
        <td style="color:#111">${applicantEmail}</td>
      </tr>
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 0;color:#888">Phone</td>
        <td style="color:#111">${phone || '—'}</td>
      </tr>
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 0;color:#888">Ticket Number</td>
        <td style="font-family:monospace;color:#071A5E;font-weight:700">${ticketId}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#888">Ticket Type</td>
        <td style="color:#111">${ticketType}</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:12px 16px;background:#f9f6ee;border-radius:8px;border-left:3px solid #D4AF37">
      <p style="margin:0;font-size:12px;color:#666">
        <strong>The Rebuild Hangout 2026 — Beyond the Message</strong><br>
        December 5, 2026 · 9:00 AM · FMC OWO, ARD LOUNGE
      </p>
    </div>
  </div>
</div>
</body></html>`
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const ok200 = (payload: Record<string, unknown>) =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  try {
    let body: Record<string, string> = {}
    try { body = await req.json() } catch { /* ignore malformed body */ }

    const {
      email       = '',   // ← applicant's own email from the registration form
      name        = 'Attendee',
      ticket_id   = '',
      phone       = '',
      ticket_type = 'In Person',
      event_date  = 'December 5, 2026',
      event_venue = 'FMC OWO, ARD LOUNGE',
    } = body

    console.log('[send-ticket-email] Received:', { email, name, ticket_id, phone, ticket_type })

    // ── Guard: API key ────────────────────────────────────────────────────
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    if (!BREVO_API_KEY) {
      console.error('[send-ticket-email] BREVO_API_KEY not set in secrets')
      return ok200({ success: false, reason: 'BREVO_API_KEY not configured' })
    }
    if (!email) {
      console.warn('[send-ticket-email] No applicant email in payload')
      return ok200({ success: false, reason: 'No applicant email provided' })
    }

    // ── 1. Applicant confirmation → applicant's own email ─────────────────
    console.log(`[send-ticket-email] Sending applicant confirmation to: ${email}`)
    const applicantResult = await brevoSend(
      BREVO_API_KEY,
      email,                                    // ← applicant's email, NOT the admin email
      `Your ticket is confirmed — ${ticket_id}`,
      applicantConfirmationHtml(name, ticket_id, ticket_type, event_date, event_venue),
    )
    if (applicantResult.ok) {
      console.log(`[send-ticket-email] ✅ Applicant email sent: success to ${email}`)
    } else {
      console.error(
        `[send-ticket-email] ❌ Applicant email sent to ${email}: failed —`,
        JSON.stringify(applicantResult.body),
      )
    }

    // ── 2. Admin notification → foundation inbox ──────────────────────────
    console.log(`[send-ticket-email] Sending admin notification to: ${ADMIN_EMAIL}`)
    const adminResult = await brevoSend(
      BREVO_API_KEY,
      ADMIN_EMAIL,
      `New Registration — ${name} (${ticket_id})`,
      adminNotificationHtml(name, email, phone, ticket_id, ticket_type),
    )
    if (adminResult.ok) {
      console.log('[send-ticket-email] ✅ Admin email sent: success')
    } else {
      console.error(
        '[send-ticket-email] ❌ Admin email sent: failed —',
        JSON.stringify(adminResult.body),
      )
    }

    // Always 200 — ticket must show even if emails fail
    return ok200({
      success:         applicantResult.ok || adminResult.ok,
      applicant_email: { ok: applicantResult.ok, status: applicantResult.status, to: email },
      admin_email:     { ok: adminResult.ok,     status: adminResult.status },
    })

  } catch (err) {
    console.error('[send-ticket-email] Unhandled error:', err)
    return ok200({ success: false, reason: `Unhandled error: ${String(err)}` })
  }
})
