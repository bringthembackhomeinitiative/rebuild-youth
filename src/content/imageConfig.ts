// ============================================================
// Image Configuration — Rebuild the Youth Foundation
//
// HOW TO USE:
//   1. Copy your image files into the correct subfolder under
//      public/images/ (see folder guide below).
//   2. Set the path string for each slot below.
//   3. Save this file — the site will immediately use your images.
//
// PATH FORMAT:
//   All paths are relative to the public/ folder and must start
//   with a forward slash, e.g. "/images/hosts/dr-adefemi.jpg"
//   Vite serves everything in public/ at the root URL, so no
//   import statement is needed.
//
// SET TO null TO KEEP THE EXISTING FALLBACK:
//   Any slot left as null will continue showing the current
//   placeholder (initials for hosts, logo background for hero).
//   Nothing will break if a slot is null.
//
// SUPPORTED FORMATS:
//   JPG/JPEG, PNG, WebP, AVIF — all work in modern browsers.
//   WebP or AVIF give the best file size at equal quality.
//
// FOLDER GUIDE:
//   public/images/hosts/       →  Portrait photos (Dr. & Mrs. Adefemi)
//   public/images/hero/        →  Hero background or banner image
//   public/images/hangout/     →  Hangout 2026 event imagery
//   public/images/about/       →  About / youth empowerment photography
//   public/images/book/        →  Book cover(s) for the Book Library
// ============================================================

// ── HOSTS ──────────────────────────────────────────────────────────────────
// Portrait photos for Dr. and Mrs. Adefemi displayed in the Hosts section.
// Recommended size: at least 400×400px, ideally square or portrait crop.
export const hostImages = {
  /** Dr. Adefemi — Lead Host & Founder */
  drAdefemi:  '/images/hosts/dr-adefemi.jpg' as string | null,

  /** Mrs. Adefemi — Co-Host & Ministry Director */
  mrsAdefemi: '/images/hosts/mrs-adefemi.jpg' as string | null,
}

// ── HERO ───────────────────────────────────────────────────────────────────
// Optional background image for the hero section.
// If set, it replaces the current logo-crest background treatment.
// Recommended size: 1920×1080px minimum. Use a dark or richly coloured image
// so the navy overlay keeps text legible.
export const heroImages = {
  /**
   * Hero background — Rebuild the Youth Foundation Hangout 2026 imagery.
   * Supplied October 2026.
   */
  heroBanner: '/images/hero/hangout-2026-hero.jpg' as string | null,
}

// ── ABOUT / YOUTH EMPOWERMENT ──────────────────────────────────────────────
// Photography used in the About section to illustrate the foundation's work.
// These appear alongside the existing text — do not replace the text.
// Recommended size: 800×600px or wider landscape format.
export const aboutImages = {
  /** Primary editorial photograph for the About section */
  primary:    null as string | null,  // e.g. '/images/about/youth-gathering.jpg'

  /** Secondary / supporting image (optional) */
  secondary:  null as string | null,  // e.g. '/images/about/youth-empowerment.jpg'
}

// ── HANGOUT 2026 EVENT ─────────────────────────────────────────────────────
// Imagery for the Event Details section.
// These are illustrative — do not present them as documentation of past events
// unless they are genuine Rebuild the Youth Foundation photographs.
export const hangoutImages = {
  /** Main event image shown in the Event Details section */
  eventBanner: null as string | null, // e.g. '/images/hangout/hangout-2026.jpg'

  /** Physical attendance illustration */
  physical:    null as string | null, // e.g. '/images/hangout/in-person.jpg'

  /** Virtual attendance illustration */
  virtual:     null as string | null, // e.g. '/images/hangout/online.jpg'
}

// ── BOOK LIBRARY ───────────────────────────────────────────────────────────
// Book cover image and optional interior/preview images.
// The Book Library section does not yet exist in the codebase.
// These images are prepared here so they are ready when the section is built.
export const bookImages = {
  /** Front cover of the supplied book */
  cover:       null as string | null, // e.g. '/images/book/beyond-the-message-cover.jpg'

  /** Back cover (optional) */
  coverBack:   null as string | null, // e.g. '/images/book/beyond-the-message-back.jpg'

  /** Interior spread or preview image (optional) */
  interior:    null as string | null, // e.g. '/images/book/interior-preview.jpg'
}
