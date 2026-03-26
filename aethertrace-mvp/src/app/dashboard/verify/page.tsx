'use client'

import { useState } from 'react'

export default function VerifyPage() {
  const [hash, setHash] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!hash.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/verify/${hash.trim()}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error — could not reach verification endpoint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: 720 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        color: 'var(--color-pure, #DCF0FF)', marginBottom: 4,
      }}>
        Verify Evidence
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 32,
      }}>
        Check any evidence hash against the chain
      </p>

      <form onSubmit={handleVerify} style={{ marginBottom: 32 }}>
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.08em',
          textTransform: 'uppercase', display: 'block', marginBottom: 8,
        }}>
          EVIDENCE HASH (SHA-256)
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter a 64-character SHA-256 hash"
            style={{
              flex: 1,
              fontFamily: 'var(--font-mono)', fontSize: 14,
              padding: '14px 16px',
              background: 'rgba(200,212,228,0.03)',
              border: '1px solid rgba(200,212,228,0.08)',
              borderRadius: 8, color: '#DCF0FF',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.2)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.08)'}
          />
          <button
            type="submit"
            disabled={loading || !hash.trim()}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '14px 24px',
              background: loading ? 'rgba(200,212,228,0.05)' : 'rgba(200,212,228,0.08)',
              border: '1px solid rgba(200,212,228,0.12)',
              borderRadius: 8, color: '#DCF0FF',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      {error && (
        <div className="glass-card" style={{
          padding: '24px', borderLeft: '3px solid #EF4444',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: '#EF4444',
          }}>
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="glass-card" style={{
          padding: '24px',
          borderLeft: result.verified ? '3px solid #10B981' : '3px solid #EF4444',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 14,
            color: result.verified ? '#10B981' : '#EF4444',
            fontWeight: 600, marginBottom: 16,
          }}>
            {result.verified ? 'CHAIN INTEGRITY VERIFIED' : 'VERIFICATION FAILED'}
          </div>

          {result.evidence && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DetailRow label="File" value={result.evidence.file_name} />
              <DetailRow label="Content Hash" value={result.evidence.content_hash} mono />
              <DetailRow label="Chain Hash" value={result.evidence.chain_hash} mono />
              <DetailRow label="Chain Position" value={`#${result.evidence.chain_position}`} />
              <DetailRow label="Ingested" value={new Date(result.evidence.ingested_at).toLocaleString()} />
              <DetailRow label="Project" value={result.evidence.project_name || 'N/A'} />
              {result.evidence.previous_hash && (
                <DetailRow label="Previous Hash" value={result.evidence.previous_hash} mono />
              )}
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: 48, padding: '24px',
        borderTop: '1px solid rgba(200,212,228,0.06)',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.2)', lineHeight: 1.8,
        }}>
          Verification recomputes the SHA-256 chain hash from the evidence content, timestamp,
          and previous link. If the stored hash matches the recomputed hash, the evidence has not
          been altered since ingestion. This check is independent — no authentication required.
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.06em',
        textTransform: 'uppercase', minWidth: 120, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: mono ? 12 : 13,
        color: 'var(--color-shi, #B8D4EE)',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}
