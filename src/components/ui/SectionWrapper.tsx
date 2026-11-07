import React from 'react'
import { motion } from 'framer-motion'

interface SectionWrapperProps {
  id?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  /** Whether to animate this section in on scroll */
  animate?: boolean
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  className = '',
  style,
  children,
  animate = true,
}) => {
  if (!animate) {
    return (
      <section
        id={id}
        style={style}
        className={`relative py-20 md:py-28 overflow-hidden ${className}`}
      >
        {children}
      </section>
    )
  }

  return (
    <motion.section
      id={id}
      style={style}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`relative py-20 md:py-28 overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  )
}

export default SectionWrapper
