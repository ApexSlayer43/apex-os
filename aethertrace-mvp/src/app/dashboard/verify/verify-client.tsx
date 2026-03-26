'use client'

import { useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  evidence_count: number
  last_verified?: string
  chain_status?: 'intact' | 'broken' | 'empty'
}

export function VerifyClient({ projects }: { projects: Project[] }) {
  const [hash, setHash] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [verifyingProject, setVerifyingProject] = useState<string | null>(null)
  const [projectResults, setProjectResults] = useState<Record<string, any>>({})

  async function handleManualVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!hash.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/verify/${hash.trim()}`)
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Verification failed')
      else setResult(data)
    } catch {
      setError('Network error — could not reach verification endpoint')
    } finally {
      setLoading(false)
    }
  }

  async function handleProjectVerify(projectId: string) {
    setVerifyingProject(projectId)
    try {
      const res = await fetch(`/api/projects/${projectId}/verify`)
      const data = await res.json()
      setProjectResults(prev => ({ ...prev, [projectId]: data }))
    } catch {
      setProjectResults(prev => ({ ...prev, [projectId]: { error: true } }))
    } finally {
      setVerifyingProject(null)
    }
  }

  const hasProjects = projects.length > 0

  return (
    <div style={{ padding: '48px 40px', maxWidth: 800 }}>
      {/* Header */}
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
        color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0, marginBottom: 6,
      }}>
        Evidence Integrity
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', margin: 0, marginBottom: 36,
      }}>
        Is your evidence untouched? Check here.
      </p>

      {/* ═══ Mode 1: Project Chain Status Cards ═══ */}
      {hasProjects && (
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
            color: 'rgba(200,212,228,0.25)', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            YOUR PROJECTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.map(project => {
              const pr = projectResults[project.id]
              const isVerifying = verifyingProject === project.id
              const evidenceValid = pr?.evidenceChain?.valid
              const custodyValid = pr?.custodyChain?.valid
              const allValid = pr && !pr.error && evidenceValid !== false && custodyValid !== false
              const hasFailed = pr && (pr.error || evidenceValid === false || custodyValid === false)
              const isEmpty = project.evidence_count === 0

              return (
                <div key={project.id} className="glass-card" style={{
                  padding: '20px 24px',
                  borderLeft: pr
                    ? (hasFailed ? '2px solid rgba(239,68,68,0.3)' : '2px solid rgba(16,185,129,0.3)')
                    : '2px solid rgba(200,212,228,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-sans)', fontSize: 15,
                        color: '#B8D4EE', fontWeight: 500, marginBottom: 4,
                      }}>
                        {project.name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'rgba(200,212,228,0.3)',
                      }}>
                        {isEmpty ? (
                          'No evidence sealed yet'
                        ) : pr ? (
                          allValid ? (
                            <span style={{ color: 'rgba(16,185,129,0.7)' }}>
                              All {project.evidence_count} items verified · Chain intact
                            </span>
                          ) : hasFailed ? (
                            <span style={{ color: 'rgba(239,68,68,0.7)' }}>
                              Chain integrity issue detected
                            </span>
                          ) : null
                        ) : (
                          `${project.evidence_count} items sealed`
                        )}
                      </div>

                      {/* Success detail */}
                      {pr && allValid && !isEmpty && (
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'rgba(200,212,228,0.25)', marginTop: 6,
                        }}>
                          Every piece of evidence is exactly as it was when you sealed it.
                          <br />Nothing has been added, removed, or altered.
                        </div>
                      )}

                      {/* Failure detail */}
                      {pr && hasFailed && (
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'rgba(239,68,68,0.5)', marginTop: 6,
                        }}>
                          Something changed after sealing. Review the chain to identify which item
                          and when the discrepancy was detected.
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {!isEmpty && !pr && (
                        <button
                          onClick={() => handleProjectVerify(project.id)}
                          disabled={isVerifying}
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                            textTransform: 'uppercase', padding: '8px 16px',
                            background: 'rgba(200,212,228,0.06)',
                            border: '1px solid rgba(200,212,228,0.1)',
                            borderRadius: 6, color: '#B8D4EE', cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          {isVerifying ? 'Checking...' : 'Verify Chain'}
                        </button>
                      )}
                      {pr && allValid && (
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                          color: '#10B981', padding: '4px 10px',
                          background: 'rgba(16,185,129,0.06)',
                          border: '1px solid rgba(16,185,129,0.15)',
                          borderRadius: 4,
                        }}>
                          INTACT
                        </div>
                      )}
                      {pr && hasFailed && (
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                          color: '#EF4444', padding: '4px 10px',
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          borderRadius: 4,
                        }}>
                          ISSUE FOUND
                        </div>
                      )}
                      <Link href={`/dashboard/projects/${project.id}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                        textTransform: 'uppercase', padding: '8px 12px',
                        color: 'rgba(200,212,228,0.3)', textDecoration: 'none',
                        border: '1px solid rgba(200,212,228,0.06)',
                        borderRadius: 6, transition: 'color 0.15s',
                      }}>
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasProjects && (
        <div className="glass-card" style={{
          padding: '40px', marginBottom: 40,
          borderLeft: '2px solid rgba(126,184,247,0.15)',
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 20,
            color: '#DCF0FF', marginBottom: 8,
          }}>
            Nothing to verify yet.
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'rgba(200,212,228,0.3)', marginBottom: 20,
          }}>
            Once you seal evidence to a project, its integrity status appears here automatically.
          </p>
          <Link href="/dashboard" style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#B8D4EE', textDecoration: 'none',
            padding: '8px 16px', border: '1px solid rgba(200,212,228,0.1)',
            borderRadius: 6,
          }}>
            Go to Dashboard →
          </Link>
        </div>
      )}

      {/* ═══ Mode 2: Manual Verification ═══ */}
      <div style={{ borderTop: '1px solid rgba(200,212,228,0.06)', paddingTop: 32 }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
            color: 'rgba(200,212,228,0.25)', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{
            transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>
            ▸
          </span>
          Manual Verification
        </button>

        {showAdvanced && (
          <div style={{ marginTop: 20 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(200,212,228,0.3)', marginBottom: 16,
            }}>
              Have a verification code from an evidence package?
              Paste it below to confirm the record is untouched.
            </p>

            <form onSubmit={handleManualVerify} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Paste verification code here"
                  style={{
                    flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13,
                    padding: '12px 16px',
                    background: 'rgba(200,212,228,0.03)',
                    border: '1px solid rgba(200,212,228,0.08)',
                    borderRadius: 8, color: '#DCF0FF', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.2)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.08)'}
                />
                <button type="submit" disabled={loading || !hash.trim()} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '12px 20px',
                  background: 'rgba(200,212,228,0.08)',
                  border: '1px solid rgba(200,212,228,0.12)',
                  borderRadius: 8, color: '#DCF0FF', cursor: 'pointer',
                }}>
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(200,212,228,0.2)', marginTop: 8,
              }}>
                This is the same check an attorney or auditor would run. No account required.
              </div>
            </form>

            {/* Manual verify result — pass */}
            {result && result.verified && (
              <div className="glass-card" style={{
                padding: '24px', borderLeft: '2px solid rgba(16,185,129,0.3)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 16,
                  color: '#10B981', fontWeight: 500, marginBottom: 12,
                }}>
                  Evidence verified
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'rgba(200,212,228,0.4)', marginBottom: 16,
                }}>
                  This record has not been altered since it was sealed.
                </p>
                {result.evidence && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <MetaRow label="Sealed on" value={new Date(result.evidence.ingested_at).toLocaleString()} />
                    <MetaRow label="File" value={result.evidence.file_name} />
                    <MetaRow label="Chain position" value={`#${result.evidence.chain_position}`} />
                    {result.evidence.project_name && (
                      <MetaRow label="Project" value={result.evidence.project_name} />
                    )}
                  </div>
                )}
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'rgba(200,212,228,0.25)', marginTop: 16,
                }}>
                  The content, timestamp, and chain link all match.
                  This evidence is exactly as it was at the moment of custody.
                </p>
              </div>
            )}

            {/* Manual verify result — fail */}
            {result && !result.verified && (
              <div className="glass-card" style={{
                padding: '24px', borderLeft: '2px solid rgba(239,68,68,0.3)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 16,
                  color: '#EF4444', fontWeight: 500, marginBottom: 12,
                }}>
                  Verification failed
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'rgba(200,212,228,0.4)', marginBottom: 12,
                }}>
                  This record does not match what was originally sealed.
                  The evidence may have been altered after custody.
                </p>
              </div>
            )}

            {/* Manual verify error */}
            {error && (
              <div className="glass-card" style={{
                padding: '20px', borderLeft: '2px solid rgba(239,68,68,0.3)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(239,68,68,0.7)',
                }}>
                  {error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ How It Works (expandable) ═══ */}
      <div style={{ borderTop: '1px solid rgba(200,212,228,0.06)', paddingTop: 24, marginTop: 32 }}>
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
            color: 'rgba(200,212,228,0.2)', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{
            transform: showHowItWorks ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>
            ▸
          </span>
          How verification works
        </button>

        {showHowItWorks && (
          <div style={{
            marginTop: 16, padding: '20px 24px',
            background: 'rgba(200,212,228,0.02)',
            borderRadius: 8, border: '1px solid rgba(200,212,228,0.04)',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(200,212,228,0.35)', lineHeight: 1.8, margin: 0,
            }}>
              When evidence is sealed, AetherTrace creates a unique fingerprint from three things:
            </p>
            <div style={{
              padding: '12px 0 12px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(200,212,228,0.3)', lineHeight: 2,
            }}>
              1. The evidence itself (the file you uploaded)<br />
              2. The exact time it was sealed<br />
              3. The previous item in the chain
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(200,212,228,0.35)', lineHeight: 1.8, margin: '0 0 12px',
            }}>
              If anyone changes the evidence — even one pixel of a photo or one
              character in a document — the fingerprint changes and this check fails.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(200,212,228,0.4)', lineHeight: 1.8, margin: '0 0 12px',
              fontWeight: 500,
            }}>
              The fact that it passed means: nobody touched it.
              Not you. Not AetherTrace. Not anyone.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'rgba(200,212,228,0.2)', lineHeight: 1.8, margin: 0,
            }}>
              AetherTrace uses SHA-256 cryptographic hashing — the same standard used by
              banks, governments, and secure systems worldwide. Your evidence chain works like
              a stack of sealed envelopes. Each envelope&apos;s seal includes the seal of the one
              below it. Break any seal, and every envelope above it fails verification.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
        textTransform: 'uppercase', minWidth: 110, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.5)', wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}
