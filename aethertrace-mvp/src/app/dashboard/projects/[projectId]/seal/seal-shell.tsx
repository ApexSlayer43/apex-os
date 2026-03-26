'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SealChatBox } from '@/components/seal-chat-box'
import { SealedFeed } from './sealed-feed'

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

export function SealPageShell({ projectName, projectId, chainDepth, items }: {
  projectName: string
  projectId: string
  chainDepth: number
  items: SealedItem[]
}) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      padding: '0 24px',
    }}>
      {/* Centered content — vertically + horizontally */}
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Greeting */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 30, fontWeight: 400, color: '#DCF0FF',
            letterSpacing: '-0.02em', margin: 0, marginBottom: 4,
            textShadow: '0 0 60px rgba(200,212,228,0.06)',
          }}>
            {projectName}
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: chainDepth > 0 ? '#10B981' : 'rgba(200,212,228,0.2)',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(200,212,228,0.3)', letterSpacing: '0.06em',
            }}>
              {chainDepth > 0 ? `${chainDepth} item${chainDepth !== 1 ? 's' : ''} sealed` : 'No evidence yet'}
            </span>
          </div>
        </div>

        {/* Chat input */}
        <SealChatBox projectId={projectId} />

        {/* Quick actions row — like Claude's Write/Learn/Code chips */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 20,
        }}>
          <Link
            href="/dashboard/seal"
            className="project-link-hover"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.06em', color: 'rgba(200,212,228,0.25)',
              textDecoration: 'none',
              padding: '6px 14px',
              border: '1px solid rgba(200,212,228,0.06)',
              borderRadius: 20,
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            ← Projects
          </Link>

          {items.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.06em',
                color: showHistory ? 'rgba(200,212,228,0.5)' : 'rgba(200,212,228,0.25)',
                background: 'none', border: '1px solid rgba(200,212,228,0.06)',
                borderRadius: 20, padding: '6px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              {showHistory ? 'Hide history' : `History · ${items.length}`}
            </button>
          )}
        </div>
      </div>

      {/* History — slides in below when toggled */}
      {showHistory && items.length > 0 && (
        <div style={{
          width: '100%', maxWidth: 640,
          marginTop: 40, paddingBottom: 80,
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          <SealedFeed items={items} />
        </div>
      )}
    </div>
  )
}
