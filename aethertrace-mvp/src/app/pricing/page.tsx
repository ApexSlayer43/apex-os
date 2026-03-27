/**
 * Pricing Page
 * Three tiers. No free plan. Payment before custody.
 * Foundation $99/mo (2 projects) — entry ramp for Tier 2 subs
 * Standard $199/mo (5 projects) — core market
 * Professional $499/mo (unlimited) — multi-project firms
 */

import Link from 'next/link'

const TIERS = [
  {
    name: 'Foundation',
    price: 99,
    description: 'Start with one project. Prove the value.',
    limit: '2 active projects',
    features: [
      'SHA-256 hash chain on every file',
      'Immutable chain-of-custody ledger',
      'Court-ready evidence packages',
      'Public verification URLs',
      'Custody plan with requirements',
      '50MB per evidence file',
    ],
    cta: 'Start Custody',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: 199,
    description: 'For subcontractors protecting their work.',
    limit: '5 active projects',
    features: [
      'Everything in Foundation',
      'AetherTrace Intelligence queries',
      'Evidence requirement tagging',
      'Completeness dashboard',
      'Email notifications on seal events',
      'Priority evidence processing',
    ],
    cta: 'Start Custody',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Professional',
    price: 499,
    description: 'For firms managing multiple projects.',
    limit: 'Unlimited projects',
    features: [
      'Everything in Standard',
      'Unlimited active projects',
      'Team member access (coming soon)',
      'Bulk evidence upload',
      'Dedicated support',
      'Custom evidence categories',
    ],
    cta: 'Start Custody',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-void, #040D21)',
      color: '#DCF0FF',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(200,212,228,0.06)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 20,
          color: '#DCF0FF', textDecoration: 'none', letterSpacing: '0.06em',
        }}>
          AETHERTRACE
        </Link>
        <Link href="/login" style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.35)', textDecoration: 'none',
          letterSpacing: '0.06em',
        }}>
          Sign in
        </Link>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{
            fontFamily: 'var(--font-serif, "Instrument Serif")',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400, color: '#DCF0FF',
            letterSpacing: '-0.02em', marginBottom: 12,
          }}>
            Evidence Custody Pricing
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'rgba(200,212,228,0.35)', lineHeight: 1.7,
            maxWidth: 500, margin: '0 auto',
          }}>
            One lost $30K claim pays for years of AetherTrace.
            The question isn&apos;t cost — it&apos;s how much you lose without proof.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16, maxWidth: 960, margin: '0 auto 64px',
        }}>
          {TIERS.map((tier) => (
            <div key={tier.name} className="glass-card" style={{
              padding: '32px 28px',
              position: 'relative',
              borderColor: tier.highlighted ? 'rgba(126,184,247,0.2)' : undefined,
            }}>
              {tier.badge && (
                <div style={{
                  position: 'absolute', top: -10, right: 20,
                  fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'rgba(126,184,247,0.12)',
                  border: '1px solid rgba(126,184,247,0.2)',
                  color: '#7EB8F7', padding: '3px 10px', borderRadius: 4,
                }}>
                  {tier.badge}
                </div>
              )}

              <h2 style={{
                fontFamily: 'var(--font-sans)', fontSize: 16,
                fontWeight: 500, color: '#B8D4EE', marginBottom: 4,
              }}>
                {tier.name}
              </h2>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(200,212,228,0.3)', marginBottom: 20,
              }}>
                {tier.description}
              </p>

              <div style={{ marginBottom: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 48,
                  color: '#DCF0FF', letterSpacing: '-0.02em',
                }}>
                  ${tier.price}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'rgba(200,212,228,0.25)', marginLeft: 4,
                }}>
                  /mo
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
                marginBottom: 24,
              }}>
                {tier.limit.toUpperCase()}
              </div>

              <ul style={{
                listStyle: 'none', padding: 0, margin: '0 0 28px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {tier.features.map((f) => (
                  <li key={f} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'rgba(200,212,228,0.4)', lineHeight: 1.5,
                  }}>
                    <span style={{ color: 'rgba(126,184,247,0.5)', marginTop: 1, flexShrink: 0 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" style={{
                display: 'block', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '12px 0',
                background: tier.highlighted ? 'rgba(126,184,247,0.1)' : 'rgba(200,212,228,0.04)',
                border: `1px solid ${tier.highlighted ? 'rgba(126,184,247,0.2)' : 'rgba(200,212,228,0.08)'}`,
                borderRadius: 8, color: tier.highlighted ? '#B8D4EE' : 'rgba(200,212,228,0.4)',
                textDecoration: 'none', transition: 'background 0.15s',
              }}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* ROI section */}
        <div className="glass-card" style={{
          padding: '32px', maxWidth: 640, margin: '0 auto',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: 18,
            color: '#DCF0FF', marginBottom: 24, fontWeight: 400,
          }}>
            The math is simple
          </h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 32,
                color: '#DCF0FF',
              }}>
                $30K
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
                marginTop: 4,
              }}>
                AVG DISPUTED CLAIM
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 32,
                color: '#DCF0FF',
              }}>
                $1,188
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
                marginTop: 4,
              }}>
                ANNUAL FOUNDATION COST
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 32,
                color: '#10B981',
              }}>
                25x
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
                marginTop: 4,
              }}>
                ROI ON ONE CLAIM
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
