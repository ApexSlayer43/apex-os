/**
 * Dashboard Layout — Dark Void Sidebar Shell
 * Fixed 220px sidebar + flex-1 main content
 * Matches approved AetherTrace brand: dark void, glow accents
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderOpen, LogOut, Shield } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen" style={{ background: '#02050B' }}>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        style={{
          width: 220,
          background: '#02050B',
          borderRight: '1px solid rgba(22,48,88,0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Mark */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(22,48,88,0.25)',
        }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: '6px',
              color: '#FFFFFF',
              lineHeight: 1,
              textShadow: '0 0 20px rgba(126,184,247,0.15)',
            }}>
              AETHERTRACE
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 8,
              letterSpacing: '4px',
              color: 'rgba(90,120,160,0.52)',
              marginTop: 4,
              textTransform: 'uppercase',
            }}>
              Neutral Evidence Trustee
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <NavSection label="Overview">
            <NavLink href="/dashboard" icon={<LayoutDashboard size={13} />} label="Dashboard" />
            <NavLink href="/dashboard" icon={<FolderOpen size={13} />} label="Projects" />
          </NavSection>

          <NavSection label="Protocol">
            <NavLink href="/dashboard" icon={<Shield size={13} />} label="Chain Status" />
          </NavSection>
        </nav>

        {/* User footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(22,48,88,0.25)',
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: '#486080',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user.email}
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#486080',
                padding: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7EB8F7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#486080')}
            >
              <LogOut size={10} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main
        style={{
          marginLeft: 220,
          flex: 1,
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 8,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#284870',
        padding: '0 10px 6px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {children}
      </div>
    </div>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        textDecoration: 'none',
        borderRadius: 3,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: active ? '#7EB8F7' : '#486080',
        background: active ? 'rgba(126,184,247,0.07)' : 'transparent',
        borderLeft: active ? '2px solid #7EB8F7' : '2px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </Link>
  )
}
