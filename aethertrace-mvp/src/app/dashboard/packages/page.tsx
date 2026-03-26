import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, organizations(name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  // Get all evidence packages for this org's projects
  const { data: packages } = await supabase
    .from('evidence_packages')
    .select(`
      id, created_at, package_hash, status,
      projects(id, name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '48px 40px', maxWidth: 960 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        color: 'var(--color-pure, #DCF0FF)', marginBottom: 4,
      }}>
        Evidence Packages
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 32,
      }}>
        Court-ready exports with chain verification
      </p>

      {(!packages || packages.length === 0) ? (
        <div className="glass-card" style={{
          padding: '64px 40px', textAlign: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 16, opacity: 0.3 }}>
            <path d="M28 4H12a4 4 0 00-4 4v32a4 4 0 004 4h24a4 4 0 004-4V16L28 4Z" stroke="rgba(200,212,228,0.4)" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M28 4v12h12" stroke="rgba(200,212,228,0.4)" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M18 28h12M18 34h8" stroke="rgba(200,212,228,0.4)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: 20,
            color: 'var(--color-shi, #B8D4EE)', marginBottom: 8,
          }}>
            No packages yet
          </h3>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'rgba(200,212,228,0.3)', maxWidth: 360, margin: '0 auto',
          }}>
            Export an evidence package from any project to create a court-ready bundle with chain verification.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {packages.map((pkg: any) => (
            <div key={pkg.id} className="glass-card" style={{
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: 'var(--color-shi, #B8D4EE)', fontWeight: 500,
                }}>
                  {(pkg.projects as any)?.name || 'Project'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'rgba(200,212,228,0.3)', marginTop: 4,
                }}>
                  {new Date(pkg.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(200,212,228,0.25)',
                maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {pkg.package_hash?.slice(0, 16)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
