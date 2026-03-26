'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: easeOut },
  }),
}

/* ═══════════════════════════════════════════════════════════════
   ROLE OPTIONS
   ═══════════════════════════════════════════════════════════════ */

const ROLES = [
  'Owner',
  'Project Manager',
  'Superintendent',
  'Foreman',
  'Office Manager',
  'Other',
]

const COMPANY_TYPES = [
  'Subcontractor',
  'General Contractor',
  'Specialty Contractor',
  'Construction Manager',
  'Design-Build',
  'Other',
]

const TRADES = [
  'Mechanical (HVAC/Plumbing)',
  'Electrical',
  'Plumbing',
  'Fire Protection',
  'Structural Steel',
  'Concrete',
  'Excavation & Sitework',
  'Roofing',
  'Painting & Coatings',
  'Drywall & Framing',
  'Flooring',
  'Landscaping',
  'Solar / Renewable Energy',
  'Microgrid / Energy Storage',
  'Commissioning',
  'Controls & Automation',
  'General / Multi-Trade',
  'Other',
]

/* ═══════════════════════════════════════════════════════════════
   ONBOARDING CLIENT
   ═══════════════════════════════════════════════════════════════ */

export function OnboardingClient({
  orgName,
  userEmail,
}: {
  orgName: string
  userEmail: string
}) {
  const router = useRouter()
  const [contactName, setContactName] = useState('')
  const [contactRole, setContactRole] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [trade, setTrade] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = contactName.trim() && contactRole && companyType

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/organizations/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName.trim(),
          contactRole,
          companyType,
          trade: trade || null,
          phone: phone.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save profile')

      // Success — go to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, contactName, contactRole, companyType, trade, phone, router])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 520, width: '100%' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', left: '50%', top: '30%',
        width: 500, height: 500, transform: 'translateX(-50%)',
        borderRadius: '50%', background: 'rgba(126,184,247,0.012)',
        filter: 'blur(120px)', pointerEvents: 'none',
      }} />

      {/* Decorative line */}
      <motion.div
        variants={fadeUp} custom={0}
        style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(126,184,247,0.4), transparent)',
          margin: '0 auto 32px',
        }}
      />

      {/* Header */}
      <motion.div variants={fadeUp} custom={1} style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--color-pure)',
          letterSpacing: '-0.02em', lineHeight: 1.2,
          margin: 0,
        }}>
          Set Up Your Organization
        </h1>
      </motion.div>

      <motion.p
        variants={fadeUp} custom={2}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.28)', letterSpacing: '0.06em',
          lineHeight: 1.9, textAlign: 'center',
          maxWidth: 440, margin: '0 auto 40px',
        }}
      >
        This information identifies the custodian on every evidence package.
        It appears on court-ready exports and public verification records.
      </motion.p>

      {/* Org badge */}
      <motion.div
        variants={fadeUp} custom={3}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, marginBottom: 32,
        }}
      >
        <div style={{
          padding: '6px 14px', borderRadius: 4,
          background: 'rgba(126,184,247,0.04)',
          border: '1px solid rgba(126,184,247,0.12)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(126,184,247,0.5)', letterSpacing: '0.08em',
          }}>
            {orgName}
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(200,212,228,0.15)',
        }}>
          {userEmail}
        </span>
      </motion.div>

      {/* Form card */}
      <motion.div
        variants={fadeUp} custom={4}
        className="glass-card"
        style={{ padding: '36px 32px 28px', position: 'relative' }}
      >
        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 32, height: 32,
          borderTop: '1px solid rgba(126,184,247,0.2)',
          borderLeft: '1px solid rgba(126,184,247,0.2)',
          borderRadius: '12px 0 0 0', pointerEvents: 'none',
        }} />

        {/* Contact Name */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Your Full Name *</label>
          <input
            type="text"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            placeholder="e.g. Carlos Martinez"
            style={inputStyle}
            autoFocus
          />
          <div style={hintStyle}>Appears as custodian on evidence packages</div>
        </div>

        {/* Role */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Your Role *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setContactRole(role)}
                style={{
                  padding: '8px 16px', borderRadius: 4,
                  background: contactRole === role ? 'rgba(126,184,247,0.08)' : 'rgba(200,212,228,0.02)',
                  border: `1px solid ${contactRole === role ? 'rgba(126,184,247,0.3)' : 'rgba(200,212,228,0.08)'}`,
                  color: contactRole === role ? 'rgba(126,184,247,0.8)' : 'rgba(200,212,228,0.35)',
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Company Type */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Company Type *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COMPANY_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setCompanyType(type)}
                style={{
                  padding: '8px 16px', borderRadius: 4,
                  background: companyType === type ? 'rgba(126,184,247,0.08)' : 'rgba(200,212,228,0.02)',
                  border: `1px solid ${companyType === type ? 'rgba(126,184,247,0.3)' : 'rgba(200,212,228,0.08)'}`,
                  color: companyType === type ? 'rgba(126,184,247,0.8)' : 'rgba(200,212,228,0.35)',
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Trade */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Primary Trade</label>
          <select
            value={trade}
            onChange={e => setTrade(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select your trade (optional)</option>
            {TRADES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div style={hintStyle}>Used to suggest relevant evidence categories</div>
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(555) 000-0000"
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#EF4444', padding: '10px 14px',
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.12)',
            borderRadius: 6, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-seal"
          style={{
            width: '100%', justifyContent: 'center',
            borderRadius: 6, padding: '14px 28px',
            fontSize: 11, letterSpacing: '0.18em',
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {submitting ? 'Saving...' : 'Complete Setup → Create First Project'}
        </button>
      </motion.div>

      {/* Bottom text */}
      <motion.p
        variants={fadeUp} custom={5}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(200,212,228,0.12)', letterSpacing: '0.08em',
          textAlign: 'center', marginTop: 24,
        }}
      >
        NEUTRAL CUSTODY · INDEPENDENT OF ACCOUNTABILITY
      </motion.p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.28)', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(200,212,228,0.03)',
  border: '1px solid rgba(200,212,228,0.08)',
  borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
  color: 'var(--color-shi)', transition: 'border-color 0.2s', outline: 'none',
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 9,
  color: 'rgba(200,212,228,0.15)', letterSpacing: '0.04em',
  marginTop: 6,
}
