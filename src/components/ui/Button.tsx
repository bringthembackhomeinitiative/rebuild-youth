import React from 'react'
import { motion, type HTMLMotionProps, type TargetAndTransition } from 'framer-motion'
import { buttonTap, buttonHoverGold, buttonHoverGhost, buttonHoverOutline, EASE_SPRING } from '@/lib/animations'

type ButtonVariant = 'gold' | 'ghost' | 'outline-white'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

// Typed hover targets for each variant
const hoverMap: Record<ButtonVariant, TargetAndTransition> = {
  gold:            buttonHoverGold    as TargetAndTransition,
  ghost:           buttonHoverGhost   as TargetAndTransition,
  'outline-white': buttonHoverOutline as TargetAndTransition,
}

const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading

  const base = [
    'inline-flex items-center justify-center gap-2 font-body font-semibold',
    'rounded-full cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-3',
    isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
  ].join(' ')

  const variantClasses: Record<ButtonVariant, string> = {
    gold:            'bg-gold-gradient text-navy-deep shadow-gold focus-visible:outline-gold-pale',
    ghost:           'border border-gold/60 text-gold-pale bg-transparent focus-visible:outline-gold-pale',
    'outline-white': 'border border-white/40 text-white bg-transparent focus-visible:outline-white',
  }

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-7 py-3 text-base',
    lg: 'px-10 py-4 text-lg tracking-wide',
  }

  return (
    <motion.button
      {...props}
      disabled={isDisabled}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={isDisabled ? undefined : hoverMap[variant]}
      whileTap={isDisabled ? undefined : { scale: buttonTap.scale, transition: EASE_SPRING }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
    >
      {loading ? (
        <>
          <motion.svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </motion.svg>
          Processing…
        </>
      ) : children}
    </motion.button>
  )
}

export default Button
