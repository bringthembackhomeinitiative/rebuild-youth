// send-book-verification — Supabase Edge Function
// Sends a 6-digit email verification code via Brevo API.
//
// Required secret → Supabase Dashboard > Edge Functions > Secrets:
//   BREVO_API_KEY   ← your Brevo v3 API key (never hardcoded here)
//
// Verified Brevo sender: Rebuild The Youth Foundation <bringthembackhomeinitiative@gmail.com>
//
// Returns { success: true }            → Brevo accepted (HTTP 201)
// Returns { success: false, reason }   → failure; client shows real error message

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SENDER_NAME  = 'Rebuild The Youth Foundation'
const SENDER_EMAIL = 'bringthembackhomeinitiative@gmail.com'

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

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const respond = (payload: Record<string, unknown>) =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  try {
    let body: Record<string, string> = {}
    try { body = await req.json() } catch { /* ignore malformed body */ }

    const { email = '', name = 'Reader', code = '' } = body
    console.log('[send-book-verification] Request:', { email, name, code })

    // ── Guard: API key ────────────────────────────────────────────────────
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    if (!BREVO_API_KEY) {
      console.error('[send-book-verification] BREVO_API_KEY not set in secrets')
      return respond({ success: false, reason: 'Email service not configured. Please contact support.' })
    }
    if (!email || !code) {
      return respond({ success: false, reason: 'Missing email or code.' })
    }

    // ── HTML template ─────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f5">
<div style="font-family:Arial,sans-serif;max-width:480px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8">
  <div style="background:#071A5E;padding:28px 32px;text-align:center">
    <h1 style="color:#E8C36B;margin:0;font-size:20px">Why Harm Your Body?</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">Secure Reader — Email Verification</p>
  </div>
  <div style="padding:32px">
    <p style="font-size:15px;color:#111;margin:0 0 12px">Hi <strong>${name}</strong>,</p>
    <p style="color:#555;line-height:1.7;margin:0 0 24px">
      Use the code below to verify your email and access the secure book reader.
      This code expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:#F9F6EE;border:1.5px solid #D4AF37;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px">Your Verification Code</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:700;color:#071A5E;letter-spacing:10px">${code}</p>
    </div>
    <p style="color:#888;font-size:12px;line-height:1.6;margin:0">
      If you did not request this, please ignore this email.<br>
      This code is valid for 10 minutes only.
    </p>
  </div>
  <div style="background:#f9f9f9;padding:14px 32px;text-align:center;border-top:1px solid #eee">
    <p style="font-size:11px;color:#aaa;margin:0">© 2026 Rebuild The Youth Foundation</p>
  </div>
</div>
</body></html>`

    // ── Send ──────────────────────────────────────────────────────────────
    console.log(`[send-book-verification] Sending to: ${email} via Brevo`)
    const result = await brevoSend(BREVO_API_KEY, email, `Your verification code: ${code}`, html)
    console.log(`[send-book-verification] Brevo HTTP ${result.status}:`, JSON.stringify(result.body))

    if (result.ok) {
      console.log(`[send-book-verification] ✅ Verification email sent to: ${email}`)
      return respond({ success: true })
    }

    const brevoErr = (result.body as Record<string, unknown>)
    const reason = (brevoErr.message as string) || (brevoErr.error as string) || `Brevo HTTP ${result.status}`
    console.error(`[send-book-verification] ❌ Failed: ${reason}`)
    return respond({ success: false, reason, detail: result.body })

  } catch (err) {
    console.error('[send-book-verification] Unhandled error:', err)
    return respond({ success: false, reason: `Server error: ${String(err)}` })
  }
})
