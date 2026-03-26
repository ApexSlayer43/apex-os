import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('org_members')
    .select('role, org_id, organizations(id, name, contact_name, contact_role, company_type, trade, phone, plan, subscription_status, stripe_customer_id)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  const org = membership.organizations as any

  return (
    <div style={{ padding: '48px 40px', maxWidth: 720 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        color: 'var(--color-pure, #DCF0FF)', marginBottom: 4,
      }}>
        Settings
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 40,
      }}>
        Organization &amp; account
      </p>

      {/* Organization Profile */}
      <section className="glass-card" style={{ padding: '28px 24px', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          Organization
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SettingsRow label="Company Name" value={org?.name || '—'} />
          <SettingsRow label="Contact" value={org?.contact_name || '—'} />
          <SettingsRow label="Role" value={org?.contact_role || '—'} />
          <SettingsRow label="Company Type" value={org?.company_type || '—'} />
          <SettingsRow label="Trade" value={org?.trade || '—'} />
          <SettingsRow label="Phone" value={org?.phone || '—'} />
        </div>
      </section>

      {/* Subscription */}
      <section className="glass-card" style={{ padding: '28px 24px', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          Subscription
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SettingsRow label="Plan" value={(org?.plan || 'starter').toUpperCase()} />
          <SettingsRow label="Status" value={(org?.subscription_status || 'active').toUpperCase()} />
          {org?.stripe_customer_id && (
            <form action="/api/stripe/portal" method="POST" style={{ marginTop: 8 }}>
              <button type="submit" style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '10px 20px',
                background: 'rgba(200,212,228,0.06)',
                border: '1px solid rgba(200,212,228,0.1)',
                borderRadius: 6, color: '#B8D4EE',
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
                Manage Subscription
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Account */}
      <section className="glass-card" style={{ padding: '28px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          Account
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SettingsRow label="Email" value={user.email || '—'} />
          <SettingsRow label="User ID" value={user.id} mono />
          <SettingsRow label="Org ID" value={org?.id || '—'} mono />
        </div>
        <form action="/api/auth/signout" method="POST" style={{ marginTop: 24 }}>
          <button type="submit" style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '10px 20px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 6, color: '#EF4444',
            cursor: 'pointer', transition: 'background 0.15s',
          }}>
            Sign Out
          </button>
        </form>
      </section>
    </div>
  )
}

function SettingsRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: mono ? 11 : 13,
        color: 'var(--color-shi, #B8D4EE)',
        textAlign: 'right',
        maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value}
      </span>
    </div>
  )
}
