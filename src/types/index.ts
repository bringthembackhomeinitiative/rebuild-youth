// ============================================================
// Shared TypeScript Types — Rebuild Hangout 2026
// TODO Phase 2: These interfaces align with the planned
// Supabase table schemas. See SUPABASE_INTEGRATION.md.
// ============================================================

export type AttendanceMode = 'physical' | 'virtual'

export interface RegistrationFormData {
  fullName: string
  email: string
  phone: string
  photo: File | null
  attendanceMode: AttendanceMode | null
}

export interface RegistrationFormErrors {
  fullName?: string
  email?: string
  phone?: string
  photo?: string
  attendanceMode?: string
}

export interface TicketData {
  /** Generated ticket number, format: RTYF-2026-XXXXX */
  ticketNumber: string
  fullName: string
  email: string
  phone: string
  /** base64 data-URL of the cropped face photo, or null if skipped */
  photoUrl: string | null
  attendanceMode: AttendanceMode
  /** ISO timestamp of when the ticket was generated (client-side) */
  generatedAt: string
  /** Whether user consented to receive event updates */
  consent: boolean
}

/**
 * AttendeeRecord — the shape that will be stored in Supabase in Phase 2.
 * TODO Phase 2: Map this to the `attendees` table.
 */
export interface AttendeeRecord extends TicketData {
  id: string
}

export interface NavLink {
  label: string
  href: string
}

export interface HostProfile {
  id: string
  name: string
  title: string
  initials: string
  bio: string
  /** Path to portrait image in public/images/hosts/ — null shows initials fallback */
  photo?: string | null
}

export interface EventInfo {
  label: string
  value: string
  icon: string
}

/** A row from the `registrations` table in Supabase (admin dashboard). */
export interface RegistrationRow {
  id: string
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
  ticket_type: string | null
  photo: string | null
  [key: string]: unknown
}
