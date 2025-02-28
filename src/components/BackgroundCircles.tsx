import React from 'react'

interface DotBackgroundProps {
  className?: string
  dotColor?: string
  dotSize?: number
  spacing?: number
  opacity?: number
}

export default function DotBackground({ 
  className = '',
  dotColor = '#d0d0d0',
  dotSize = 1,
  spacing = 20,
  opacity = 0.4
}: DotBackgroundProps) {
  return (
    <div 
      className={`absolute inset-0 ${className}`} 
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity: opacity,
        pointerEvents: 'none'
      }}
    />
  )
}