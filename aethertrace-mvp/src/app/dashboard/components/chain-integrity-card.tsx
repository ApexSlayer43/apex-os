'use client'

import { GlowCard } from '@/components/ui/spotlight-card'
import { motion } from 'framer-motion'

export function ChainIntegrityCard({ totalItems, totalProjects }: {
  totalItems: number; totalProjects: number
}) {
  return (
    <GlowCard customSize={true} glowColor="silver" className="!aspect-auto !grid-rows-none !shadow-none">
      <div style={{ padding: '24px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <svg width="14" height="16" viewBox="0 0 20 22" fill="none">
            <path d="M10 1L1 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L10 1Z"
              stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.06)" strokeLinejoin="round" />
            <path d="M7 11l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(200,212,228,0.4)',
          }}>
            Chain Integrity
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 28, fontWeight: 400,
            color: '#10B981', lineHeight: 1, marginBottom: 8,
            textShadow: '0 0 30px rgba(16,185,129,0.15)',
          }}
        >
          Verified
        </motion.div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.25)', letterSpacing: '0.02em' }}>
          {totalItems} items · {totalProjects} projects
        </div>
      </div>
    </GlowCard>
  )
}
