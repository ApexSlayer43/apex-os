'use client'

import { useRef, useCallback } from 'react'

/**
 * GlowCard — Mouse-tracking silver border glow
 * Wraps any content in a glass card that glows where the cursor is.
 * Pure CSS + mouse events. No three.js. No dependencies.
 */
export function GlowCard({
  children,
  className = '',
  as: Tag = 'div',
  ...rest
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'a' | 'article'
} & React.HTMLAttributes<HTMLElement>) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--glow-x', `${x}px`)
    card.style.setProperty('--glow-y', `${y}px`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.removeProperty('--glow-x')
    card.style.removeProperty('--glow-y')
  }, [])

  return (
    <Tag
      ref={cardRef as any}
      className={`glow-card glass-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div className="glow-card-border" />
      {children}
    </Tag>
  )
}
