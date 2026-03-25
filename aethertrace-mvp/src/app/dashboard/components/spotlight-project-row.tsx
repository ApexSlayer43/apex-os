'use client'

import { GlowCard } from '@/components/ui/spotlight-card'
import Link from 'next/link'

type ProjectWithStats = {
  id: string
  name: string
  status: 'active' | 'archived'
  created_at: string
  itemsSealed: number
  lastSealed: string | null
}

export function SpotlightProjectRow({ project }: { project: ProjectWithStats }) {
  const isArchived = project.status === 'archived'
  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const lastSealedRelative = project.lastSealed ? formatRelative(project.lastSealed) : '—'

  // Recency-based accent
  const recency = getRecency(project.lastSealed)
  const accentBorder = recency === 'recent'
    ? '2px solid rgba(16,185,129,0.3)'
    : recency === 'stale'
      ? '2px solid rgba(245,158,11,0.2)'
      : '2px solid transparent'

  return (
    <GlowCard customSize={true} glowColor="silver" className="!aspect-auto !grid-rows-none !shadow-none !p-0 !gap-0">
      <Link
        href={`/dashboard/projects/${project.id}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', minHeight: 64,
          textDecoration: 'none',
          opacity: isArchived ? 0.4 : 1,
          position: 'relative', zIndex: 2,
          borderLeft: accentBorder,
          borderRadius: 'inherit',
        }}
      >
        {/* Left: name + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <svg width="14" height="12" viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M0 2C0 .9.9 0 2 0h4l2 2h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H2C.9 14 0 13.1 0 12V2Z" fill={isArchived ? '#486080' : '#C8D4E0'} opacity={isArchived ? 0.2 : 0.35} />
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: isArchived ? '#486080' : '#B8D4EE', marginBottom: 3, letterSpacing: '-0.01em' }}>
              {project.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.2)', letterSpacing: '0.06em' }}>
              Created {createdDate}
            </div>
          </div>
        </div>

        {/* Center: sealed count */}
        <div style={{ textAlign: 'center', minWidth: 60 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: isArchived ? '#284870' : '#C8D4E0' }}>
            {project.itemsSealed}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(200,212,228,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            sealed
          </div>
        </div>

        {/* Right: relative time */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isArchived ? '#284870' : 'rgba(200,212,228,0.35)', minWidth: 80, textAlign: 'right' }}>
          {lastSealedRelative}
        </div>
      </Link>
    </GlowCard>
  )
}

function getRecency(lastSealed: string | null): 'recent' | 'stale' | 'normal' {
  if (!lastSealed) return 'stale'
  const diffMs = Date.now() - new Date(lastSealed).getTime()
  const diffDays = diffMs / 86_400_000
  if (diffDays < 1) return 'recent'
  if (diffDays > 7) return 'stale'
  return 'normal'
}

function formatRelative(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHrs = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffMin < 2)    return 'Just now'
  if (diffMin < 60)   return `${diffMin}m ago`
  if (diffHrs < 24)   return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)   return `${diffDays} days ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
