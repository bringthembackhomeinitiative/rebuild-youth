// ============================================================
// Registration Service — Rebuild Hangout 2026
// MOCK IMPLEMENTATION — Phase 1
//
// TODO Phase 2: Replace this entire module with real Supabase
// calls. The function signatures and return types are designed
// to stay stable — only the implementation changes.
//
// Planned Supabase schema (attendees table):
//   id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
//   ticket_number text UNIQUE NOT NULL
//   full_name     text NOT NULL
//   email         text NOT NULL
//   phone         text NOT NULL
//   photo_url     text
//   attendance    text CHECK (attendance IN ('physical','virtual'))
//   created_at    timestamptz DEFAULT now()
//
// See SUPABASE_INTEGRATION.md for full integration plan.
// ============================================================

import type { RegistrationFormData, TicketData } from '@/types'

/**
 * Generates a random ticket number in the format RTYF-2026-XXXXXX
 */
function generateTicketNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `RTYF-2026-${suffix}`
}

/**
 * Registers an attendee.
 *
 * MOCK: Currently resolves with a locally-generated ticket.
 * No data is persisted to any database.
 *
 * TODO Phase 2: Replace body with:
 *   const { data, error } = await supabase.from('attendees').insert({...})
 *   if (error) throw error
 *   return mapSupabaseRowToTicketData(data[0])
 */
export async function registerAttendee(
  formData: RegistrationFormData
): Promise<TicketData> {
  if (!formData.attendanceMode) {
    throw new Error('Attendance mode is required')
  }

  // Simulate network delay (remove in Phase 2)
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const photoUrl = formData.photo
    ? URL.createObjectURL(formData.photo)
    : null

  const ticket: TicketData = {
    ticketNumber: generateTicketNumber(),
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    photoUrl,
    attendanceMode: formData.attendanceMode,
    generatedAt: new Date().toISOString(),
    consent: false,
  }

  // Log to console for development visibility
  console.log('[MOCK] Ticket generated (not saved to database):', ticket)

  return ticket
}
