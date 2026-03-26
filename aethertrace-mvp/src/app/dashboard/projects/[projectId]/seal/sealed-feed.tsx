'use client'

/**
 * Sealed Feed — Evidence items displayed as a chat feed
 * Iceberg principle: shows note + file + timestamp + green badge.
 * Click to expand: verification URL, file details.
 * Click "Show proof" for the crypto layer.
 */

import { useState } from 'react'

interface SealedItem {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  note: string | null
  contentHash: string
  ingestedAt: string
  verificationUrl: string
}

export function SealedFeed({ items }: { items: SealedItem[] }) {
  if (items.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '60px 32px',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 20 }}>
          <rect x="4" y="4" width="24" height="24" rx="4" stroke="rgba(200,212,228,0.15)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M16 12V20M12 16H20" stroke="rgba(200,212,228,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          color: '#486080',
          marginBottom: 8,
        }}>
          No evidence yet
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#284870',
          lineHeight: 1.7,
          maxWidth: 320,
        }}>
          Drop your first piece of evidence below. Photo, document, daily log — whatever proves the work was done.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function FeedItem({ item }: { item: SealedItem }) {
  const [expanded, setExpanded] = useState(false)
  const [showProof, setShowProof] = useState(false)

  const timeStr = formatTime(item.ingestedAt)
  const sizeStr = formatSize(item.fileSize)

  return (
    <div
      style={{
        padding: '16px 20px',
        background: expanded ? 'rgba(200,212,228,0.02)' : 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        if (!expanded) e.currentTarget.style.background = 'rgba(200,212,228,0.015)'
      }}
      onMouseLeave={(e) => {
        if (!expanded) e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Sealed badge (green dot) */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#10B981',
          flexShrink: 0,
          marginTop: 6,
          boxShadow: '0 0 6px rgba(16,185,129,0.3)',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Note (if present) */}
          {item.note && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: '#B8D4EE',
              lineHeight: 1.5,
              marginBottom: 8,
              wordWrap: 'break-word',
            }}>
              {item.note}
            </p>
          )}

          {/* File chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(200,212,228,0.04)',
            border: '1px solid rgba(200,212,228,0.08)',
            borderRadius: 6,
          }}>
            <FileIcon type={item.fileType} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#7AAAC8',
              maxWidth: 240,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.fileName}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#284870',
            }}>
              {sizeStr}
            </span>
          </div>
        </div>

        {/* Timestamp + Sealed */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#486080',
            marginBottom: 4,
          }}>
            {timeStr}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#10B981',
          }}>
            Sealed ✓
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          marginTop: 14,
          marginLeft: 22,
          padding: '14px 16px',
          background: 'rgba(200,212,228,0.02)',
          border: '1px solid rgba(200,212,228,0.06)',
          borderRadius: 6,
        }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <DetailRow label="File" value={item.fileName} />
            <DetailRow label="Type" value={item.fileType} />
            <DetailRow label="Size" value={sizeStr} />
            <DetailRow label="Sealed at" value={new Date(item.ingestedAt).toLocaleString()} />
          </div>

          {/* Verification link */}
          <div style={{ marginTop: 12 }}>
            <a
              href={item.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#7EB8F7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                transition: 'color 0.15s',
              }}
            >
              Verify independently →
            </a>
          </div>

          {/* Show proof toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowProof(!showProof)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: '#284870',
              padding: '8px 0 0',
              transition: 'color 0.15s',
            }}
          >
            {showProof ? '▾ Hide proof' : '▸ Show cryptographic proof'}
          </button>

          {showProof && (
            <div style={{
              marginTop: 8,
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#486080',
              lineHeight: 1.8,
              wordBreak: 'break-all',
            }}>
              <div>SHA-256: {item.contentHash}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#284870',
        marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#7AAAC8',
      }}>
        {value}
      </div>
    </div>
  )
}

function FileIcon({ type }: { type: string }) {
  const isImage = type.startsWith('image/')
  const isPdf = type === 'application/pdf'

  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {isImage ? (
        <path d="M2 2h8v8H2z M4 6l2 2 2-2" stroke="#486080" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : isPdf ? (
        <path d="M3 1h4l3 3v7H3V1z" stroke="#486080" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3 1h4l3 3v7H3V1z M6 1v3h3" stroke="#486080" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function formatTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHrs = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 2) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHrs < 24) return diffHrs === 1 ? '1 hour ago' : `${diffHrs}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
