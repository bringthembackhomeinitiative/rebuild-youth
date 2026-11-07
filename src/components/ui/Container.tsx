import React from 'react'

interface ContainerProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  narrow?: boolean
}

const Container: React.FC<ContainerProps> = ({
  className = '',
  style,
  children,
  narrow = false,
}) => (
  <div
    style={style}
    className={`mx-auto w-full px-5 sm:px-8 md:px-12 ${
      narrow ? 'max-w-3xl' : 'max-w-7xl'
    } ${className}`}
  >
    {children}
  </div>
)

export default Container
