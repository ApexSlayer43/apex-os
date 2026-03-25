'use client'

import { useState } from 'react'
import Link from 'next/link'

const RAIL_WIDTH = 52
const EXPANDED_WIDTH = 240

export function DashboardShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — always visible rail, expands to show labels */}
      <div style={{
        width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH,
        flexShrink: 0,
        transition: 'width 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        borderRight: '1px solid rgba(200,212,228,0.06)',
        background: 'rgba(6,16,30,0.4)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Mini ring mark — always visible at top */}
        <div style={{
          padding: '16px 0 0', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <MiniRingMark />
        </div>
        {/* Divider — separates brand from nav */}
        <div style={{ height: 1, background: 'rgba(200,212,228,0.06)', margin: '14px 12px 10px' }} />

        {/* Nav items */}
        <div style={{ flex: 1, padding: '0 6px' }}>
          <RailLink href="/dashboard" icon="grid" label="Dashboard" expanded={expanded} active />
          <RailLink href="/dashboard" icon="shield" label="Seal Evidence" expanded={expanded} />
          <RailLink href="/dashboard" icon="file" label="Packages" expanded={expanded} />
          <RailLink href="/dashboard" icon="eye" label="Verification" expanded={expanded} />
          <div style={{ height: 1, background: 'rgba(200,212,228,0.06)', margin: '10px 8px' }} />
          <RailLink href="/dashboard" icon="settings" label="Settings" expanded={expanded} />
        </div>

        {/* Toggle button — above user */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,212,228,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width={expanded ? "5" : "4"} height="16" rx="1" stroke="rgba(200,212,228,0.4)" strokeWidth="1.2" fill={expanded ? "rgba(200,212,228,0.06)" : "none"} />
              <rect x={expanded ? "8" : "7"} y="1" width={expanded ? "9" : "10"} height="16" rx="1" stroke="rgba(200,212,228,0.25)" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        {/* Bottom — user avatar/initials */}
        <div style={{
          padding: expanded ? '12px 14px' : '12px 0',
          borderTop: '1px solid rgba(200,212,228,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: expanded ? 'flex-start' : 'center',
          gap: 6, overflow: 'hidden',
        }}>
          {expanded ? (
            <>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.04em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                width: '100%',
              }}>
                {email}
              </div>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 10,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(200,212,228,0.2)', padding: 0,
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#C8D4E0'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(200,212,228,0.2)'}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid rgba(200,212,228,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
              color: 'rgba(200,212,228,0.4)', textTransform: 'uppercase',
            }}>
              {email.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function RailLink({ href, icon, label, expanded, active }: {
  href: string; icon: string; label: string; expanded: boolean; active?: boolean
}) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center',
      gap: 10,
      padding: expanded ? '8px 12px' : '8px 0',
      justifyContent: expanded ? 'flex-start' : 'center',
      borderRadius: 6,
      textDecoration: 'none',
      background: active ? 'rgba(200,212,228,0.04)' : 'transparent',
      transition: 'background 0.15s',
      marginBottom: 2,
      minHeight: 36,
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = active ? 'rgba(200,212,228,0.06)' : 'rgba(200,212,228,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = active ? 'rgba(200,212,228,0.04)' : 'transparent'}
    >
      <div style={{ flexShrink: 0, width: 18, display: 'flex', justifyContent: 'center' }}>
        <NavIcon name={icon} active={active} />
      </div>
      {expanded && (
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 13,
          color: active ? '#B8D4EE' : 'rgba(200,212,228,0.35)',
          fontWeight: active ? 500 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          {label}
        </span>
      )}
    </Link>
  )
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const c = active ? 'rgba(200,212,228,0.5)' : 'rgba(200,212,228,0.2)'
  switch (name) {
    case 'grid': return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/></svg>
    case 'shield': return <svg width="16" height="16" viewBox="0 0 16 18" fill="none"><path d="M8 1L1 4v5c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V4L8 1Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>
    case 'file': return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 1v5h5" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>
    case 'eye': return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.2"/></svg>
    case 'settings': return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>
    default: return null
  }
}

function MiniRingMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="fMini" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="fMiniNode" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Ring */}
      <ellipse cx="50" cy="50" rx="38" ry="22" stroke="rgba(200,212,228,0.15)" strokeWidth="1" fill="none" transform="rotate(-12 50 50)" />
      {/* Front glow arc */}
      <ellipse cx="50" cy="50" rx="38" ry="22" stroke="rgba(200,212,228,0.3)" strokeWidth="1.5" fill="none" transform="rotate(-12 50 50)" filter="url(#fMini)"
        strokeDasharray="40 80" strokeDashoffset="-20" />
      {/* Custody node */}
      <circle cx="72" cy="58" r="5" fill="#7EB8F7" opacity="0.2" filter="url(#fMiniNode)" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
      <circle cx="72" cy="58" r="2" fill="#7EB8F7" />
    </svg>
  )
}
