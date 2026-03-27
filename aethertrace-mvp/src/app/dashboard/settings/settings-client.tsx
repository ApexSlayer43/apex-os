'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OrgData = {
  id: string
  name: string
  contact_name: string | null
  contact_role: string | null
  company_type: string | null
  trade: string | null
  phone: string | null
  plan: string
  subscription_status: string
  stripe_customer_id: string | null
}

const PLAN_DETAILS: Record<string, { label: string; limit: string; price: string }> = {
  foundation: { label: 'Foundation', limit: 'Up to 2 active projects', price: '$99/mo' },
  standard: { label: 'Standard', limit: 'Up to 5 active projects', price: '$199/mo' },
  starter: { label: 'Standard', limit: 'Up to 5 active projects', price: '$199/mo' }, // legacy alias
  professional: { label: 'Professional', limit: 'Unlimited projects', price: '$499/mo' },
}

export function SettingsClient({ org, email, userId }: {
  org: OrgData; email: string; userId: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: org.name || '',
    contact_name: org.contact_name || '',
    contact_role: org.contact_role || '',
    company_type: org.company_type || '',
    trade: org.trade || '',
    phone: org.phone || '',
  })

  const planInfo = PLAN_DETAILS[org.plan] || PLAN_DETAILS.starter

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEditing(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: 720 }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
        color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0, marginBottom: 6,
      }}>
        Settings
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'rgba(200,212,228,0.3)', letterSpacing: '0.08em',
        margin: 0, marginBottom: 40,
      }}>
        ORGANIZATION & ACCOUNT
      </p>

      {/* ═══ Organization ═══ */}
      <section className="glass-card" style={{ padding: '28px 24px', marginBottom: 20 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
            textTransform: 'uppercase', margin: 0,
          }}>
            Organization
          </h2>
          <button
            onClick={() => {
              if (editing) handleSave()
              else setEditing(true)
            }}
            disabled={saving}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '5px 12px',
              background: editing ? 'rgba(16,185,129,0.08)' : 'rgba(200,212,228,0.04)',
              border: `1px solid ${editing ? 'rgba(16,185,129,0.2)' : 'rgba(200,212,228,0.08)'}`,
              borderRadius: 4,
              color: editing ? '#10B981' : 'rgba(200,212,228,0.35)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <EditableRow label="Company Name" field="name" value={form.name} editing={editing} onChange={(v) => setForm(f => ({ ...f, name: v }))} />
          <EditableRow label="Contact" field="contact_name" value={form.contact_name} editing={editing} onChange={(v) => setForm(f => ({ ...f, contact_name: v }))} />
          <EditableRow label="Role" field="contact_role" value={form.contact_role} editing={editing} onChange={(v) => setForm(f => ({ ...f, contact_role: v }))} />
          <EditableRow label="Company Type" field="company_type" value={form.company_type} editing={editing} onChange={(v) => setForm(f => ({ ...f, company_type: v }))} />
          <EditableRow label="Trade" field="trade" value={form.trade} editing={editing} onChange={(v) => setForm(f => ({ ...f, trade: v }))} />
          <EditableRow label="Phone" field="phone" value={form.phone} editing={editing} onChange={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="(555) 000-0000" />
        </div>

        {editing && (
          <button
            onClick={() => {
              setForm({
                name: org.name || '',
                contact_name: org.contact_name || '',
                contact_role: org.contact_role || '',
                company_type: org.company_type || '',
                trade: org.trade || '',
                phone: org.phone || '',
              })
              setEditing(false)
            }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '5px 12px', marginTop: 16,
              background: 'none', border: '1px solid rgba(200,212,228,0.06)',
              borderRadius: 4, color: 'rgba(200,212,228,0.25)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </section>

      {/* ═══ Subscription ═══ */}
      <section className="glass-card" style={{ padding: '28px 24px', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 20, margin: 0, marginBottom: 20,
        }}>
          Subscription
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SettingsRow label="Plan" value={planInfo.label.toUpperCase()} />
          <SettingsRow label="Status" value={(org.subscription_status || 'active').toUpperCase()} />
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(200,212,228,0.25)', marginTop: 4,
          }}>
            {planInfo.limit} · {planInfo.price}
          </div>
        </div>
        {org.stripe_customer_id && (
          <form action="/api/stripe/portal" method="POST" style={{ marginTop: 16 }}>
            <button type="submit" style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '8px 16px',
              background: 'rgba(200,212,228,0.06)',
              border: '1px solid rgba(200,212,228,0.1)',
              borderRadius: 6, color: '#B8D4EE', cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
              Manage Billing →
            </button>
          </form>
        )}
        {!org.stripe_customer_id && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(200,212,228,0.2)', marginTop: 12,
          }}>
            No billing account connected yet.
          </div>
        )}
      </section>

      {/* ═══ Account ═══ */}
      <section className="glass-card" style={{ padding: '28px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.4)', letterSpacing: '0.1em',
          textTransform: 'uppercase', margin: 0, marginBottom: 20,
        }}>
          Account
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SettingsRow label="Email" value={email} />
          <SettingsRow label="User ID" value={userId} mono />
          <SettingsRow label="Org ID" value={org.id} mono />
        </div>
        <form action="/api/auth/signout" method="POST" style={{ marginTop: 24 }}>
          <button type="submit" style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '8px 16px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.12)',
            borderRadius: 6, color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            Sign Out
          </button>
        </form>
      </section>
    </div>
  )
}

function EditableRow({ label, field, value, editing, onChange, placeholder }: {
  label: string; field: string; value: string; editing: boolean
  onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'rgba(200,212,228,0.35)', letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
          style={{
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: '#B8D4EE', textAlign: 'right',
            background: 'rgba(200,212,228,0.04)',
            border: '1px solid rgba(200,212,228,0.1)',
            borderRadius: 4, padding: '4px 10px',
            outline: 'none', maxWidth: 260,
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.2)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(200,212,228,0.1)'}
        />
      ) : (
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 13,
          color: '#B8D4EE', textAlign: 'right',
          maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {value || '—'}
        </span>
      )}
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
        color: '#B8D4EE', textAlign: 'right',
        maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value}
      </span>
    </div>
  )
}
