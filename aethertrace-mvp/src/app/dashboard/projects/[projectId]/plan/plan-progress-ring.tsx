'use client'

import { motion } from 'framer-motion'

/**
 * Plan Progress Ring — SVG arc-based completeness indicator.
 * Renders a large circular gauge with animated fill, center percentage,
 * and a subtle glow effect that intensifies with progress.
 *
 * Used in the Active/Locked plan view to communicate completeness
 * with the gravity of a mission-control readout.
 */

export function PlanProgressRing({
  percent,
  fulfilled,
  total,
  size = 220,
}: {
  percent: number
  fulfilled: number
  total: number
  size?: number
}) {
  const strokeWidth = 6
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  // Color shifts based on completeness
  const strokeColor =
    percent === 100
      ? 'var(--color-sealed)'
      : percent >= 50
      ? 'var(--color-glow)'
      : 'rgba(126,184,247,0.5)'

  const glowColor =
    percent === 100
      ? 'rgba(16,185,129,0.25)'
      : 'rgba(126,184,247,0.12)'

  const glowIntensity = Math.max(8, (percent / 100) * 30)

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: percent > 0 ? 0.6 : 0,
          transition: 'opacity 1s ease',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(200,212,228,0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Tick marks — 12 positions around the ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360
          const rad = (angle * Math.PI) / 180
          const innerR = radius - 10
          const outerR = radius + 2
          const x1 = size / 2 + innerR * Math.cos(rad)
          const y1 = size / 2 + innerR * Math.sin(rad)
          const x2 = size / 2 + outerR * Math.cos(rad)
          const y2 = size / 2 + outerR * Math.sin(rad)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(200,212,228,0.06)"
              strokeWidth={1}
            />
          )
        })}

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.25,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color:
              percent === 100
                ? 'var(--color-sealed)'
                : 'var(--color-pure)',
          }}
        >
          {percent}
          <span
            style={{
              fontSize: size * 0.09,
              color: 'rgba(200,212,228,0.3)',
              marginLeft: 1,
            }}
          >
            %
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'rgba(200,212,228,0.25)',
            letterSpacing: '0.08em',
            marginTop: 4,
          }}
        >
          {fulfilled}/{total} FULFILLED
        </motion.div>
      </div>
    </div>
  )
}
