// ============================================================
// Shared Animation Variants — Rebuild Hangout 2026
// All Framer Motion variants live here so components stay lean.
// Import only what you need; tree-shaking removes the rest.
// ============================================================

import type { Variants, Transition } from 'framer-motion'

// ── EASING ──────────────────────────────────────────────────
/** Smooth deceleration — feels premium, not mechanical */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
/** Natural spring for lift effects */
export const EASE_SPRING: Transition = {
  type: 'spring', stiffness: 320, damping: 28, mass: 0.8,
}

// ── VIEWPORT DEFAULTS ───────────────────────────────────────
/** Standard viewport config — triggers once, 80px pre-margin */
export const VIEWPORT_ONCE = { once: true, margin: '-80px 0px' }

// ── FADE VARIANTS ───────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
}

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
}

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
}

/** Use on a container to stagger its children */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

/** Child of staggerContainer */
export const staggerChild: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_EXPO } },
}

// ── CARD HOVER ───────────────────────────────────────────────
export const cardHover: Variants = {
  rest:  { y: 0,  boxShadow: '0 4px 16px rgba(7,26,94,0.15)' },
  hover: { y: -4, boxShadow: '0 16px 40px rgba(7,26,94,0.3)', transition: EASE_SPRING },
}

// ── BUTTON ───────────────────────────────────────────────────
export const buttonTap = { scale: 0.96 }
export const buttonHoverGold = {
  scale: 1.03,
  boxShadow: '0 6px 28px rgba(200,144,10,0.45)',
  transition: EASE_SPRING,
}
export const buttonHoverGhost = {
  scale: 1.03,
  backgroundColor: 'rgba(200,144,10,0.08)',
  transition: EASE_SPRING,
}
export const buttonHoverOutline = {
  scale: 1.03,
  backgroundColor: 'rgba(255,255,255,0.08)',
  transition: EASE_SPRING,
}

// ── SCALE REVEAL ─────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
}

// ── GOLD LINE EXPAND ─────────────────────────────────────────
export const lineExpand: Variants = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
}
