/**
 * Dashboard Layout
 * Sticky nav with ring mark + sign out.
 * No sidebar. Full-width shell.
 * Pure server component — zero client JS.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#02050B', position: 'relative', zIndex: 1 }}>
      <Nav email={user.email ?? ''} />
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}

function Nav({ email }: { email: string }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 64,
      background: 'rgba(2,5,11,0.96)',
      borderBottom: '1px solid rgba(22,48,88,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 52px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <NavMark />
      <NavRight email={email} />
    </nav>
  )
}

function NavMark() {
  return (
    <a href="/dashboard" style={{ textDecoration: 'none', display: 'block', lineHeight: 0 }}>
      <svg
        width="180"
        height="28"
        viewBox="-20 0 1100 330"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AetherTrace"
        role="img"
      >
        <defs>
          <filter id="fNav" x="-12%" y="-80%" width="124%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="fNavNode" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gNavRing" x1="40" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#7EB8F7" stopOpacity="0" />
            <stop offset="8%"   stopColor="#7EB8F7" stopOpacity="0.40" />
            <stop offset="28%"  stopColor="#C8DCFF" stopOpacity="0.70" />
            <stop offset="48%"  stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="52%"  stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="72%"  stopColor="#C8DCFF" stopOpacity="0.70" />
            <stop offset="92%"  stopColor="#7EB8F7" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#7EB8F7" stopOpacity="0" />
          </linearGradient>
          <clipPath id="cpNavBack">
            <rect x="-30" y="-10" width="1140" height="165" />
          </clipPath>
          <clipPath id="cpNavFront">
            <rect x="-30" y="155" width="1140" height="200" />
          </clipPath>
        </defs>
        <ellipse
          cx="520" cy="155" rx="440" ry="108"
          stroke="rgba(126,184,247,0.18)"
          strokeWidth="1.5"
          fill="none"
          transform="rotate(-12 520 155)"
          clipPath="url(#cpNavBack)"
        />
        <text
          x="520" y="202"
          textAnchor="middle"
          fontFamily="'Bebas Neue', Impact, sans-serif"
          fontSize="118"
          letterSpacing="8"
          fill="#FFFFFF"
        >
          AETHERTRACE
        </text>
        <ellipse
          cx="520" cy="155" rx="440" ry="108"
          stroke="url(#gNavRing)"
          strokeWidth="2"
          fill="none"
          transform="rotate(-12 520 155)"
          clipPath="url(#cpNavFront)"
          filter="url(#fNav)"
        />
        <circle cx="674" cy="227" r="18" fill="#7EB8F7" opacity="0.22" filter="url(#fNavNode)" />
        <circle cx="674" cy="227" r="4.5" fill="#7EB8F7" />
      </svg>
    </a>
  )
}

function NavRight({ email }: { email: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#284870',
        letterSpacing: '0.04em',
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {email}
      </span>
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="nav-signout"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
