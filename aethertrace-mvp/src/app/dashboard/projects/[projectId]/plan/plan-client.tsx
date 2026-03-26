'use client'

import { useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Requirement {
  id: string
  category: string
  description: string
  milestone: string | null
  due_date: string | null
  required: boolean
  status: 'pending' | 'fulfilled' | 'overdue'
  fulfilled_by: string | null
  fulfilled_at: string | null
  sort_order: number
  metadata: Record<string, unknown>
}

interface CustodyPlan {
  id: string
  project_id: string
  created_by: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  plan_hash: string | null
  activated_at: string | null
  completed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  evidence_requirements: Requirement[]
}

interface EvidenceItem {
  id: string
  file_name: string
  ingested_at: string
}

/* ═══════════════════════════════════════════════════════════════
   REQUIREMENT CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  'Daily Log',
  'Photo Documentation',
  'Inspection Report',
  'Safety Compliance',
  'Material Certification',
  'Change Order',
  'RFI Response',
  'Submittal',
  'Progress Report',
  'Test Result',
  'Permit',
  'Other',
]

/* ═══════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function PlanClient({
  projectId,
  initialPlan,
  evidenceItems,
}: {
  projectId: string
  initialPlan: CustodyPlan | null
  evidenceItems: EvidenceItem[]
}) {
  const [plan, setPlan] = useState<CustodyPlan | null>(initialPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!plan) {
    return <CreatePlanForm projectId={projectId} onCreated={setPlan} />
  }

  if (plan.status === 'draft') {
    return (
      <DraftPlanView
        projectId={projectId}
        plan={plan}
        setPlan={setPlan}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
      />
    )
  }

  // active, completed, or archived
  return (
    <ActivePlanView
      projectId={projectId}
      plan={plan}
      evidenceItems={evidenceItems}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════
   CREATE PLAN FORM — No plan exists yet
   ═══════════════════════════════════════════════════════════════ */

function CreatePlanForm({
  projectId,
  onCreated,
}: {
  projectId: string
  onCreated: (plan: CustodyPlan) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/custody-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create plan')
      onCreated(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }, [name, description, projectId, onCreated])

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={eyeStyle}>Create Custody Plan</div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.3)',
          letterSpacing: '0.04em', lineHeight: 1.8, marginTop: 12,
        }}>
          Define what evidence this project requires. Once activated, the plan is cryptographically
          locked and cannot be altered.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card" style={{ padding: '28px 28px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Plan Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Harbor View Phase 1 Evidence Requirements"
            style={inputStyle}
            disabled={submitting}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Define the scope and purpose of this custody plan..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            disabled={submitting}
          />
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || submitting}
          className="btn-seal"
          style={{ width: '100%', justifyContent: 'center', borderRadius: 4 }}
        >
          {submitting ? 'Creating...' : 'Create Custody Plan'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DRAFT PLAN VIEW — Editable requirements + activate button
   ═══════════════════════════════════════════════════════════════ */

function DraftPlanView({
  projectId,
  plan,
  setPlan,
  loading,
  setLoading,
  error,
  setError,
}: {
  projectId: string
  plan: CustodyPlan
  setPlan: (plan: CustodyPlan) => void
  loading: boolean
  setLoading: (v: boolean) => void
  error: string | null
  setError: (v: string | null) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)

  // Add requirement form state
  const [reqCategory, setReqCategory] = useState(CATEGORIES[0])
  const [reqDescription, setReqDescription] = useState('')
  const [reqMilestone, setReqMilestone] = useState('')
  const [reqDueDate, setReqDueDate] = useState('')
  const [addingReq, setAddingReq] = useState(false)

  const requirements = plan.evidence_requirements || []

  const handleAddRequirement = useCallback(async () => {
    if (!reqDescription.trim()) return
    setAddingReq(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custodyPlanId: plan.id,
          category: reqCategory,
          description: reqDescription.trim(),
          milestone: reqMilestone.trim() || null,
          dueDate: reqDueDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add requirement')

      // Append the new requirement to the plan
      setPlan({
        ...plan,
        evidence_requirements: [...requirements, data.requirement],
      })
      // Reset form
      setReqDescription('')
      setReqMilestone('')
      setReqDueDate('')
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setAddingReq(false)
    }
  }, [reqCategory, reqDescription, reqMilestone, reqDueDate, projectId, plan, requirements, setPlan, setError])

  const handleActivate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/custody-plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, status: 'active' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to activate plan')

      // Refetch the full plan with requirements
      const refetch = await fetch(`/api/projects/${projectId}/custody-plan`)
      const refetchData = await refetch.json()
      if (refetchData.plan) {
        setPlan(refetchData.plan)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setShowActivateModal(false)
    }
  }, [projectId, plan.id, setPlan, setLoading, setError])

  return (
    <div>
      {/* Plan header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400,
            color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0,
          }}>
            {plan.name}
          </h2>
          <span className="badge-pending" style={{ borderRadius: 2 }}>Draft</span>
        </div>
        {plan.description && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.35)',
            letterSpacing: '0.04em', lineHeight: 1.8, margin: 0,
          }}>
            {plan.description}
          </p>
        )}
      </div>

      {/* Requirements list */}
      <div className="glass-card" style={{ padding: '24px 0', marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', marginBottom: 16,
        }}>
          <div style={sectionLabelStyle}>
            Evidence Requirements ({requirements.length})
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-ghost"
            style={{ padding: '5px 12px', fontSize: 10, borderRadius: 4 }}
          >
            {showAddForm ? 'Cancel' : '+ Add Requirement'}
          </button>
        </div>

        {/* Add requirement form */}
        {showAddForm && (
          <div style={{
            padding: '16px 28px', marginBottom: 12,
            borderBottom: '1px solid rgba(200,212,228,0.06)',
            background: 'rgba(200,212,228,0.02)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={reqCategory}
                  onChange={e => setReqCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  disabled={addingReq}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Milestone</label>
                <input
                  type="text"
                  value={reqMilestone}
                  onChange={e => setReqMilestone(e.target.value)}
                  placeholder="e.g. Foundation Complete"
                  style={inputStyle}
                  disabled={addingReq}
                />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                value={reqDescription}
                onChange={e => setReqDescription(e.target.value)}
                placeholder="What evidence is required?"
                style={inputStyle}
                disabled={addingReq}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Due Date (optional)</label>
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={e => setReqDueDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  disabled={addingReq}
                />
              </div>
              <button
                onClick={handleAddRequirement}
                disabled={!reqDescription.trim() || addingReq}
                className="btn-seal"
                style={{ padding: '8px 20px', fontSize: 10, borderRadius: 4, marginTop: 18 }}
              >
                {addingReq ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Requirements rows */}
        {requirements.length === 0 ? (
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'rgba(200,212,228,0.2)', letterSpacing: '0.04em',
            }}>
              No requirements defined yet. Add evidence requirements before activating.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {requirements
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((req, i) => (
                <div key={req.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 28px',
                  borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
                }}>
                  {/* Sort number */}
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.15)',
                    width: 20, flexShrink: 0, textAlign: 'right', paddingTop: 2,
                  }}>
                    {req.sort_order}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'rgba(200,212,228,0.25)',
                        background: 'rgba(200,212,228,0.04)', padding: '1px 6px',
                        borderRadius: 2,
                      }}>
                        {req.category}
                      </span>
                      {req.milestone && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9,
                          color: 'rgba(200,212,228,0.2)',
                        }}>
                          {req.milestone}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)', fontSize: 13,
                      color: '#B8D4EE', lineHeight: 1.5,
                    }}>
                      {req.description}
                    </div>
                    {req.due_date && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: 'rgba(200,212,228,0.2)', marginTop: 4,
                      }}>
                        Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div style={{ ...errorStyle, marginBottom: 16 }}>{error}</div>}

      {/* Activate button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={() => setShowActivateModal(true)}
          disabled={requirements.length === 0 || loading}
          className="btn-seal"
          style={{ borderRadius: 4, padding: '10px 28px' }}
        >
          {loading ? 'Activating...' : 'Activate Plan'}
        </button>
      </div>

      {/* Activation confirmation modal */}
      {showActivateModal && (
        <ActivateModal
          requirementCount={requirements.length}
          planName={plan.name}
          onConfirm={handleActivate}
          onCancel={() => setShowActivateModal(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVATE MODAL — Confirmation before locking
   ═══════════════════════════════════════════════════════════════ */

function ActivateModal({
  requirementCount,
  planName,
  onConfirm,
  onCancel,
  loading,
}: {
  requirementCount: number
  planName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(2,5,11,0.85)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#06101E',
        border: '1px solid rgba(200,212,228,0.1)',
        borderRadius: 8,
        padding: '32px 28px 24px',
        maxWidth: 440,
        width: '100%',
      }}>
        {/* Warning icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L15 14H1L8 1Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
            <line x1="8" y1="6" x2="8" y2="10" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="12" r="0.7" fill="#F59E0B" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
            color: '#DCF0FF',
          }}>
            Activate Custody Plan
          </span>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(200,212,228,0.5)',
          lineHeight: 1.7, marginBottom: 8,
        }}>
          You are about to activate <strong style={{ color: '#B8D4EE' }}>{planName}</strong> with{' '}
          <strong style={{ color: '#B8D4EE' }}>{requirementCount}</strong> evidence requirement{requirementCount !== 1 ? 's' : ''}.
        </p>

        <div style={{
          background: 'rgba(245,158,11,0.04)',
          border: '1px solid rgba(245,158,11,0.12)',
          borderRadius: 4, padding: '12px 14px', marginBottom: 24,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,158,11,0.7)',
            letterSpacing: '0.04em', lineHeight: 1.8, margin: 0,
          }}>
            This action is irreversible. The plan and its requirements will be cryptographically
            hashed and locked. No requirements can be added, removed, or modified after activation.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-ghost"
            style={{ borderRadius: 4 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-seal"
            style={{ borderRadius: 4, padding: '8px 24px' }}
          >
            {loading ? 'Hashing & Locking...' : 'Activate & Lock'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE PLAN VIEW — Locked plan with completeness dashboard
   ═══════════════════════════════════════════════════════════════ */

function ActivePlanView({
  projectId,
  plan,
  evidenceItems,
}: {
  projectId: string
  plan: CustodyPlan
  evidenceItems: EvidenceItem[]
}) {
  const requirements = (plan.evidence_requirements || []).sort((a, b) => a.sort_order - b.sort_order)
  const total = requirements.length
  const fulfilled = requirements.filter(r => r.status === 'fulfilled').length
  const pending = requirements.filter(r => r.status === 'pending').length
  const overdue = requirements.filter(r => r.status === 'overdue').length
  const percent = total > 0 ? Math.round((fulfilled / total) * 100) : 0

  // Build evidence lookup
  const evidenceMap: Record<string, EvidenceItem> = {}
  for (const item of evidenceItems) {
    evidenceMap[item.id] = item
  }

  const statusBadge = plan.status === 'active'
    ? { className: 'badge-sealed', label: 'Active' }
    : plan.status === 'completed'
    ? { className: 'badge-sealed', label: 'Completed' }
    : { className: 'badge-pending', label: 'Archived' }

  return (
    <div>
      {/* Plan header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400,
            color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0,
          }}>
            {plan.name}
          </h2>
          <span className={statusBadge.className} style={{ borderRadius: 2 }}>{statusBadge.label}</span>
        </div>
        {plan.description && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.35)',
            letterSpacing: '0.04em', lineHeight: 1.8, margin: 0,
          }}>
            {plan.description}
          </p>
        )}
      </div>

      {/* Plan hash + timestamp */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
        marginBottom: 28, paddingBottom: 20,
        borderBottom: '1px solid rgba(200,212,228,0.06)',
      }}>
        {plan.plan_hash && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={metaLabelStyle}>Plan Hash</span>
            <span className="hash-pill">
              {plan.plan_hash.slice(0, 8)}...{plan.plan_hash.slice(-8)}
            </span>
          </div>
        )}
        {plan.activated_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={metaLabelStyle}>Activated</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.3)',
            }}>
              {new Date(plan.activated_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Completeness dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard label="Completeness" value={`${percent}%`} />
        <StatCard label="Fulfilled" value={String(fulfilled)} color="var(--color-sealed)" />
        <StatCard label="Pending" value={String(pending)} color="var(--color-pending)" />
        <StatCard label="Overdue" value={String(overdue)} color={overdue > 0 ? 'var(--color-breach)' : 'rgba(200,212,228,0.3)'} />
      </div>

      {/* Progress bar */}
      <div className="glass-card" style={{ padding: '20px 28px', marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <span style={sectionLabelStyle}>Progress</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.4)',
          }}>
            {fulfilled} of {total} requirements fulfilled
          </span>
        </div>
        <div style={{
          height: 6, borderRadius: 3,
          background: 'rgba(200,212,228,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${percent}%`,
            background: percent === 100
              ? 'var(--color-sealed)'
              : 'var(--color-glow)',
            transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: percent > 0
              ? `0 0 12px ${percent === 100 ? 'rgba(16,185,129,0.3)' : 'rgba(126,184,247,0.2)'}`
              : 'none',
          }} />
        </div>
      </div>

      {/* Requirements list — read only */}
      <div className="glass-card" style={{ padding: '24px 0' }}>
        <div style={{ padding: '0 28px', marginBottom: 16 }}>
          <div style={sectionLabelStyle}>
            Evidence Requirements ({total})
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {requirements.map((req, i) => {
            const fulfilledEvidence = req.fulfilled_by ? evidenceMap[req.fulfilled_by] : null
            return (
              <div key={req.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 28px',
                borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
              }}>
                {/* Status indicator */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                  background: req.status === 'fulfilled'
                    ? 'var(--color-sealed)'
                    : req.status === 'overdue'
                    ? 'var(--color-breach)'
                    : 'rgba(200,212,228,0.12)',
                  boxShadow: req.status === 'fulfilled'
                    ? '0 0 8px rgba(16,185,129,0.3)'
                    : req.status === 'overdue'
                    ? '0 0 8px rgba(239,68,68,0.3)'
                    : 'none',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'rgba(200,212,228,0.25)',
                      background: 'rgba(200,212,228,0.04)', padding: '1px 6px',
                      borderRadius: 2,
                    }}>
                      {req.category}
                    </span>
                    {req.milestone && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        color: 'rgba(200,212,228,0.2)',
                      }}>
                        {req.milestone}
                      </span>
                    )}
                    <span
                      className={req.status === 'fulfilled' ? 'badge-sealed' : req.status === 'overdue' ? '' : 'badge-pending'}
                      style={{
                        borderRadius: 2, marginLeft: 'auto',
                        ...(req.status === 'overdue' ? {
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444',
                          fontFamily: 'var(--font-mono)', fontSize: 9,
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                        } : {}),
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: req.status === 'fulfilled' ? 'rgba(200,212,228,0.5)' : '#B8D4EE',
                    lineHeight: 1.5,
                  }}>
                    {req.description}
                  </div>

                  {/* Due date */}
                  {req.due_date && (
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: req.status === 'overdue' ? 'rgba(239,68,68,0.5)' : 'rgba(200,212,228,0.2)',
                      marginTop: 4,
                    }}>
                      Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}

                  {/* Fulfilled evidence link */}
                  {fulfilledEvidence && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'rgba(16,185,129,0.6)',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {fulfilledEvidence.file_name}
                      <span style={{ color: 'rgba(200,212,228,0.15)' }}>
                        {req.fulfilled_at ? new Date(req.fulfilled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD — Matches dashboard pattern
   ═══════════════════════════════════════════════════════════════ */

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'rgba(200,212,228,0.35)', marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        color: color || '#DCF0FF', letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */

const eyeStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.28em',
  textTransform: 'uppercase', color: 'var(--color-glow)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.3)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(200,212,228,0.04)',
  border: '1px solid rgba(200,212,228,0.08)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)', fontSize: 12,
  color: '#B8D4EE',
  transition: 'border-color 0.15s',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  color: '#EF4444', padding: '8px 12px',
  background: 'rgba(239,68,68,0.06)',
  border: '1px solid rgba(239,68,68,0.15)',
  borderRadius: 4, marginBottom: 12,
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.24em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.35)',
}

const metaLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.2)',
}
