'use client'

import { GlowCard } from '@/components/ui/spotlight-card'

export function SpotlightStat({ label, value, sub, valueFont, valueSize }: {
  label: string
  value: string
  sub: string
  valueFont?: 'display' | 'serif'
  valueSize?: number
}) {
  const font = valueFont === 'serif' ? "'Instrument Serif', Georgia, serif" : 'var(--font-display)'

  return (
    <GlowCard customSize={true} glowColor="silver" className="!aspect-auto !grid-rows-none !shadow-none">
      <div style={{ padding: '24px 28px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(200,212,228,0.4)', marginBottom: 12,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: font,
          fontSize: valueSize ?? 44,
          color: '#FFFFFF',
          lineHeight: 1, marginBottom: 6,
          letterSpacing: valueFont === 'serif' ? '-0.01em' : '1px',
          textShadow: '0 0 40px rgba(200,212,228,0.06)',
        }}>
          {value}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.35)', letterSpacing: '0.02em',
        }}>
          {sub}
        </div>
      </div>
    </GlowCard>
  )
}
