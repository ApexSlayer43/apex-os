import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, organizations(name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')
  const orgId = (membership as any).org_id

  // Get all evidence packages for this org's projects
  const { data: packages } = await supabase
    .from('evidence_packages')
    .select(`
      id, created_at, package_hash, status, evidence_count,
      custody_event_count, plan_completeness, chain_valid,
      projects(id, name)
    `)
    .order('created_at', { ascending: false })

  // Get first project for CTA link
  const { data: firstProject } = await supabase
    .from('projects')
    .select('id, name')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const hasPackages = packages && packages.length > 0

  return (
    <div style={{ padding: '48px 40px', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
          color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0, marginBottom: 6,
          textShadow: '0 0 60px rgba(200,212,228,0.06)',
        }}>
          Evidence Packages
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.3)', letterSpacing: '0.08em',
          margin: 0,
        }}>
          COURT-READY EXPORTS WITH CHAIN VERIFICATION
        </p>
      </div>

      {!hasPackages ? (
        /* ═══ Empty State ═══ */
        <div className="glass-card" style={{
          padding: '48px 40px',
          borderLeft: '2px solid rgba(126,184,247,0.15)',
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 22, color: '#DCF0FF',
            marginBottom: 8,
          }}>
            No evidence packages yet
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'rgba(200,212,228,0.3)', lineHeight: 1.7,
            marginBottom: 28, maxWidth: 480,
          }}>
            When you export from a project, your court-ready package appears here.
          </p>

          {/* What a package contains */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            marginBottom: 32, paddingLeft: 4,
          }}>
            <PackageFeature label="ZIP bundle with all sealed evidence" />
            <PackageFeature label="Chain verification report (SHA-256)" />
            <PackageFeature label="Public verification URL for any third party" />
            <PackageFeature label="README written for non-technical attorneys" />
          </div>

          <div style={{
            padding: '16px 0', borderTop: '1px solid rgba(200,212,228,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'rgba(200,212,228,0.25)',
            }}>
              Packages are generated from inside a project.
            </span>
            {firstProject && (
              <Link href={`/dashboard/projects/${firstProject.id}`} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#B8D4EE', textDecoration: 'none',
                padding: '8px 16px', border: '1px solid rgba(200,212,228,0.1)',
                borderRadius: 6, transition: 'background 0.15s',
              }}>
                Go to {firstProject.name} →
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ═══ Populated State — Package Rows ═══ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {packages.map((pkg: any) => {
            const projectName = pkg.projects?.name || 'Project'
            const projectId = pkg.projects?.id
            const exportDate = new Date(pkg.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
            const shortHash = pkg.package_hash?.slice(0, 12) ?? '—'
            const chainValid = pkg.chain_valid

            return (
              <div key={pkg.id} className="glass-card" style={{
                padding: '20px 24px',
                borderLeft: chainValid
                  ? '2px solid rgba(16,185,129,0.3)'
                  : '2px solid rgba(239,68,68,0.3)',
              }}>
                {/* Top row: project name + chain status */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1Z" stroke="rgba(200,212,228,0.4)" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M9 1v5h5" stroke="rgba(200,212,228,0.4)" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 14,
                      color: '#B8D4EE', fontWeight: 500,
                    }}>
                      {projectName}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em',
                    color: chainValid ? '#10B981' : '#EF4444',
                    background: chainValid ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${chainValid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    padding: '3px 8px', borderRadius: 4,
                  }}>
                    {chainValid ? 'CHAIN VERIFIED' : 'CHAIN BROKEN'}
                  </div>
                </div>

                {/* Bottom row: metadata */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 24,
                  flexWrap: 'wrap',
                }}>
                  <MetaItem label="Exported" value={exportDate} />
                  <MetaItem label="Evidence" value={`${pkg.evidence_count ?? 0} items`} />
                  <MetaItem label="Events" value={`${pkg.custody_event_count ?? 0}`} />
                  {pkg.plan_completeness && (
                    <MetaItem label="Plan" value={pkg.plan_completeness} />
                  )}
                  <MetaItem label="Hash" value={`${shortHash}...`} mono />

                  {/* Actions — right-aligned */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {projectId && (
                      <Link href={`/dashboard/projects/${projectId}`} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'rgba(200,212,228,0.35)',
                        textDecoration: 'none', padding: '4px 10px',
                        border: '1px solid rgba(200,212,228,0.06)', borderRadius: 4,
                        transition: 'color 0.15s, border-color 0.15s',
                      }}>
                        View Project
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PackageFeature({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(126,184,247,0.4)',
        boxShadow: '0 0 8px rgba(126,184,247,0.2)',
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.45)', lineHeight: 1.5,
      }}>
        {label}
      </span>
    </div>
  )
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(200,212,228,0.2)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: mono ? 11 : 12,
        color: 'rgba(200,212,228,0.5)',
      }}>
        {value}
      </span>
    </div>
  )
}
