'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlanProgressRing } from './plan-progress-ring'

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
   REQUIREMENT CATEGORIES + ICONS
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

/** Category → accent color for visual grouping */
const CATEGORY_COLORS: Record<string, string> = {
  'Daily Log': '#7EB8F7',
  'Photo Documentation': '#A78BFA',
  'Inspection Report': '#F59E0B',
  'Safety Compliance': '#EF4444',
  'Material Certification': '#10B981',
  'Change Order': '#F97316',
  'RFI Response': '#06B6D4',
  'Submittal': '#8B5CF6',
  'Progress Report': '#3B82F6',
  'Test Result': '#14B8A6',
  'Permit': '#EC4899',
  'Other': '#6B7280',
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.3 },
  },
}

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
   STATE 1 — CREATE PLAN
   An invitation, not a form. Document-signing gravitas.
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
    <motion.div
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '20%',
        width: 400, height: 400, transform: 'translateX(-50%)',
        borderRadius: '50%', background: 'rgba(126,184,247,0.015)',
        filter: 'blur(120px)', pointerEvents: 'none',
      }} />

      {/* Decorative line */}
      <motion.div
        variants={fadeUp}
        custom={0}
        style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(126,184,247,0.4), transparent)',
          margin: '0 auto 32px',
        }}
      />

      {/* Main heading */}
      <motion.h1
        variants={fadeUp}
        custom={1}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--color-pure)',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: 12,
          lineHeight: 1.2,
        }}
      >
        Define Your Custody Plan
      </motion.h1>

      <motion.p
        variants={fadeUp}
        custom={2}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(200,212,228,0.28)',
          letterSpacing: '0.06em',
          lineHeight: 1.9,
          textAlign: 'center',
          maxWidth: 440,
          margin: '0 auto 48px',
        }}
      >
        Declare what will be custodied before the first piece of evidence is sealed.
        Once activated, this plan is cryptographically locked forever.
      </motion.p>

      {/* The form — document-signing feel */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="glass-card"
        style={{ padding: '40px 36px 32px', position: 'relative' }}
      >
        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 32, height: 32,
          borderTop: '1px solid rgba(126,184,247,0.2)',
          borderLeft: '1px solid rgba(126,184,247,0.2)',
          borderRadius: '12px 0 0 0',
          pointerEvents: 'none',
        }} />

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Plan Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Harbor View Phase 1 Evidence Requirements"
            style={inputStyle}
            disabled={submitting}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(126,184,247,0.3)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(200,212,228,0.08)'
            }}
          />
        </div>

        <div style={{ marginBottom: 36 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Define the scope and purpose of this custody plan..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.8 }}
            disabled={submitting}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(126,184,247,0.3)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(200,212,228,0.08)'
            }}
          />
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || submitting}
          className="btn-seal"
          style={{
            width: '100%',
            justifyContent: 'center',
            borderRadius: 6,
            padding: '14px 28px',
            fontSize: 11,
            letterSpacing: '0.18em',
          }}
        >
          {submitting ? 'Creating...' : 'Establish Custody Plan'}
        </button>
      </motion.div>

      {/* Bottom decorative text */}
      <motion.p
        variants={fadeUp}
        custom={4}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'rgba(200,212,228,0.12)',
          letterSpacing: '0.08em',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        SHA-256 CRYPTOGRAPHIC HASH ON ACTIVATION
      </motion.p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STATE 2 — DRAFT PLAN
   Blueprint-building mode. Each requirement is a promise.
   Activate button carries weight — arming a system.
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

      setPlan({
        ...plan,
        evidence_requirements: [...requirements, data.requirement],
      })
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
    <motion.div initial="hidden" animate="visible">
      {/* Plan header — editorial feel */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--color-pure)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {plan.name}
          </h2>
          <span className="badge-pending" style={{ borderRadius: 2, flexShrink: 0 }}>Draft</span>
        </div>
        {plan.description && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(200,212,228,0.3)', letterSpacing: '0.04em',
            lineHeight: 1.9, margin: 0, maxWidth: 560,
          }}>
            {plan.description}
          </p>
        )}
      </motion.div>

      {/* Requirements section */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="glass-card"
        style={{ padding: '28px 0', marginBottom: 20, position: 'relative' }}
      >
        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={sectionLabelStyle}>
              Evidence Requirements
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              color: 'var(--color-pure)', letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {requirements.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-ghost"
            style={{
              padding: '6px 14px', fontSize: 10, borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {showAddForm ? (
              <>
                <XIcon /> Cancel
              </>
            ) : (
              <>
                <PlusIcon /> Add Requirement
              </>
            )}
          </button>
        </div>

        {/* Add requirement form — slides in */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '20px 32px', marginBottom: 8,
                borderBottom: '1px solid rgba(200,212,228,0.06)',
                borderTop: '1px solid rgba(200,212,228,0.06)',
                background: 'rgba(200,212,228,0.015)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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
                <div style={{ marginBottom: 14 }}>
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
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
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
                    style={{ padding: '10px 24px', fontSize: 10, borderRadius: 4, flexShrink: 0 }}
                  >
                    {addingReq ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requirements rows */}
        {requirements.length === 0 ? (
          <motion.div
            variants={fadeUp}
            custom={0}
            style={{ padding: '48px 32px', textAlign: 'center' }}
          >
            {/* Empty state — blueprint metaphor */}
            <div style={{
              width: 48, height: 48, margin: '0 auto 16px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              border: '1px dashed rgba(200,212,228,0.1)',
            }}>
              <BlueprintIcon />
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 16,
              fontStyle: 'italic', color: 'rgba(200,212,228,0.25)',
              marginBottom: 6,
            }}>
              No requirements defined yet
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(200,212,228,0.15)', letterSpacing: '0.04em',
            }}>
              Add evidence requirements before activating the plan.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {requirements
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((req, i) => (
                <motion.div
                  key={req.id}
                  variants={slideInLeft}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '16px 32px',
                    borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,212,228,0.015)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {/* Category color bar */}
                  <div style={{
                    width: 3, height: 36, borderRadius: 2, flexShrink: 0, marginTop: 2,
                    background: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.1)',
                    opacity: 0.6,
                  }} />

                  {/* Sort number */}
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'rgba(200,212,228,0.12)', width: 18, flexShrink: 0,
                    textAlign: 'right', paddingTop: 3,
                  }}>
                    {String(req.sort_order).padStart(2, '0')}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        color: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.25)',
                        opacity: 0.7,
                      }}>
                        {req.category}
                      </span>
                      {req.milestone && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9,
                          color: 'rgba(200,212,228,0.18)',
                        }}>
                          {req.milestone}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)', fontSize: 13,
                      color: 'var(--color-shi)', lineHeight: 1.55,
                    }}>
                      {req.description}
                    </div>
                    {req.due_date && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: 'rgba(200,212,228,0.18)', marginTop: 5,
                      }}>
                        Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...errorStyle, marginBottom: 20 }}
        >
          {error}
        </motion.div>
      )}

      {/* Activate button — the HEAVY button */}
      <motion.div
        variants={fadeUp}
        custom={3}
        style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(200,212,228,0.15)', letterSpacing: '0.06em',
        }}>
          {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} defined
        </span>
        <button
          onClick={() => setShowActivateModal(true)}
          disabled={requirements.length === 0 || loading}
          className="plan-activate-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 6,
            background: requirements.length === 0 ? 'rgba(200,212,228,0.04)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${requirements.length === 0 ? 'rgba(200,212,228,0.06)' : 'rgba(245,158,11,0.25)'}`,
            color: requirements.length === 0 ? 'rgba(200,212,228,0.2)' : '#F59E0B',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase' as const,
            cursor: requirements.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            if (requirements.length > 0) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.14)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(245,158,11,0.1)'
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = requirements.length === 0 ? 'rgba(200,212,228,0.04)' : 'rgba(245,158,11,0.08)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <LockIcon />
          {loading ? 'Activating...' : 'Activate & Lock Plan'}
        </button>
      </motion.div>

      {/* Activation confirmation modal */}
      <AnimatePresence>
        {showActivateModal && (
          <ActivateModal
            requirementCount={requirements.length}
            planName={plan.name}
            onConfirm={handleActivate}
            onCancel={() => setShowActivateModal(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVATE MODAL — Two-step: click → hash preview → confirm
   This is an irreversible act. The design must communicate that.
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
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,5,11,0.9)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'var(--color-navy)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 12,
          padding: '36px 32px 28px',
          maxWidth: 480,
          width: '100%',
          position: 'relative',
          boxShadow: '0 0 60px rgba(245,158,11,0.04)',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 32, right: 32,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)',
        }} />

        {step === 1 ? (
          /* Step 1: Confirmation */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <WarningIcon />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                  color: 'var(--color-pure)',
                }}>
                  Activate Custody Plan
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'rgba(245,158,11,0.5)', letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                }}>
                  Irreversible Action
                </div>
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'rgba(200,212,228,0.5)', lineHeight: 1.8, marginBottom: 12,
            }}>
              You are about to activate{' '}
              <strong style={{ color: 'var(--color-shi)' }}>{planName}</strong> with{' '}
              <strong style={{ color: 'var(--color-shi)' }}>{requirementCount}</strong>{' '}
              evidence requirement{requirementCount !== 1 ? 's' : ''}.
            </p>

            <div style={{
              background: 'rgba(245,158,11,0.03)',
              border: '1px solid rgba(245,158,11,0.1)',
              borderRadius: 6, padding: '14px 16px', marginBottom: 28,
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(245,158,11,0.6)', letterSpacing: '0.04em',
                lineHeight: 1.9, margin: 0,
              }}>
                The plan and all requirements will be cryptographically hashed with SHA-256
                and locked permanently. No modifications can be made after activation.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={onCancel}
                className="btn-ghost"
                style={{ borderRadius: 6, padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 6,
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#F59E0B',
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.16)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.1)'
                }}
              >
                Proceed to Lock
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Final confirmation — the point of no return */
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 56, height: 56, margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  boxShadow: '0 0 40px rgba(245,158,11,0.06)',
                }}
              >
                <LockIcon size={24} color="#F59E0B" />
              </motion.div>

              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 20,
                fontStyle: 'italic', color: 'var(--color-pure)',
                marginBottom: 6,
              }}>
                Final Confirmation
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(200,212,228,0.2)', letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
              }}>
                This action cannot be undone
              </div>
            </div>

            {/* Visual hash preview placeholder */}
            <div style={{
              background: 'rgba(200,212,228,0.02)',
              border: '1px solid rgba(200,212,228,0.06)',
              borderRadius: 6, padding: '12px 16px', marginBottom: 24,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(200,212,228,0.2)', letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, marginBottom: 8,
              }}>
                Plan Hash Will Be Generated
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(200,212,228,0.15)', letterSpacing: '0.02em',
              }}>
                SHA-256( plan + {requirementCount} requirements )
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="btn-ghost"
                style={{ borderRadius: 6, padding: '10px 20px', flex: 1 }}
              >
                Back
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '12px 28px', borderRadius: 6,
                  background: loading ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.12)',
                  border: `1px solid ${loading ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.3)'}`,
                  color: loading ? 'rgba(245,158,11,0.4)' : '#F59E0B',
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.16em', textTransform: 'uppercase' as const,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(245,158,11,0.06)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.18)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(245,158,11,0.1)'
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = loading ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.12)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = loading ? 'none' : '0 0 30px rgba(245,158,11,0.06)'
                }}
              >
                <LockIcon size={14} color="currentColor" />
                {loading ? 'Hashing & Locking...' : 'Activate & Lock Forever'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STATE 3 — ACTIVE/LOCKED PLAN
   THE MONEY SHOT. Mission control. Vault door closed.
   Attorney/auditor facing. Read-only gravitas.
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
    <motion.div initial="hidden" animate="visible">
      {/* Ambient sealed glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '10%',
        width: 500, height: 500, transform: 'translateX(-50%)',
        borderRadius: '50%',
        background: percent === 100
          ? 'rgba(16,185,129,0.01)'
          : 'rgba(126,184,247,0.01)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      {/* Plan header — sealed authority */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--color-pure)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {plan.name}
          </h2>
          <span className={statusBadge.className} style={{ borderRadius: 2, flexShrink: 0 }}>
            {statusBadge.label}
          </span>
        </div>
        {plan.description && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(200,212,228,0.3)', letterSpacing: '0.04em',
            lineHeight: 1.9, margin: 0, maxWidth: 560,
          }}>
            {plan.description}
          </p>
        )}
      </motion.div>

      {/* Cryptographic metadata row */}
      <motion.div
        variants={fadeUp}
        custom={1}
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20,
          marginBottom: 32, paddingBottom: 24,
          borderBottom: '1px solid rgba(200,212,228,0.05)',
        }}
      >
        {plan.plan_hash && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={metaLabelStyle}>Plan Hash</span>
            <span className="hash-pill" style={{ fontSize: 10, padding: '3px 10px' }}>
              {plan.plan_hash.slice(0, 12)}...{plan.plan_hash.slice(-12)}
            </span>
          </div>
        )}
        {plan.activated_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={metaLabelStyle}>Activated</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(200,212,228,0.35)',
            }}>
              {new Date(plan.activated_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </span>
          </div>
        )}
        {/* Sealed indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginLeft: 'auto',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-sealed)',
            boxShadow: '0 0 8px rgba(16,185,129,0.3)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'rgba(16,185,129,0.5)', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
          }}>
            Cryptographically Sealed
          </span>
        </div>
      </motion.div>

      {/* Completeness dashboard — the centerpiece */}
      <motion.div
        variants={fadeUp}
        custom={2}
        className="glass-card"
        style={{
          padding: '40px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          borderColor: percent === 100
            ? 'rgba(16,185,129,0.15)'
            : 'rgba(200,212,228,0.06)',
          ...(percent === 100 ? {
            boxShadow: '0 0 40px rgba(16,185,129,0.03)',
          } : {}),
        }}
      >
        {/* Sealed vault border accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 1,
          background: percent === 100
            ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.25), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(126,184,247,0.12), transparent)',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 48,
          flexWrap: 'wrap',
        }}>
          {/* Progress ring */}
          <div style={{ flexShrink: 0 }}>
            <PlanProgressRing
              percent={percent}
              fulfilled={fulfilled}
              total={total}
              size={200}
            />
          </div>

          {/* Stats grid */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 20,
            }}>
              <StatCard
                label="Total Requirements"
                value={String(total)}
              />
              <StatCard
                label="Fulfilled"
                value={String(fulfilled)}
                color="var(--color-sealed)"
                glowColor="rgba(16,185,129,0.06)"
              />
              <StatCard
                label="Pending"
                value={String(pending)}
                color="var(--color-pending)"
                glowColor="rgba(245,158,11,0.04)"
              />
              <StatCard
                label="Overdue"
                value={String(overdue)}
                color={overdue > 0 ? 'var(--color-breach)' : 'rgba(200,212,228,0.2)'}
                glowColor={overdue > 0 ? 'rgba(239,68,68,0.04)' : undefined}
                pulse={overdue > 0}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evidence Requirements — read-only sealed list */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="glass-card"
        style={{ padding: '28px 0', position: 'relative' }}
      >
        <div style={{
          padding: '0 32px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={sectionLabelStyle}>Evidence Requirements</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              color: 'var(--color-pure)', letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {total}
            </span>
          </div>

          {/* Progress bar inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
            <div style={{
              flex: 1, height: 3, borderRadius: 2,
              background: 'rgba(200,212,228,0.04)', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                style={{
                  height: '100%', borderRadius: 2,
                  background: percent === 100 ? 'var(--color-sealed)' : 'var(--color-glow)',
                }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(200,212,228,0.3)',
            }}>
              {percent}%
            </span>
          </div>
        </div>

        {/* Requirements rows — read only with status */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {requirements.map((req, i) => {
            const fulfilledEvidence = req.fulfilled_by ? evidenceMap[req.fulfilled_by] : null
            return (
              <motion.div
                key={req.id}
                variants={slideInLeft}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '16px 32px',
                  borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
                }}
              >
                {/* Status indicator */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: req.status === 'fulfilled'
                    ? 'var(--color-sealed)'
                    : req.status === 'overdue'
                    ? 'var(--color-breach)'
                    : 'rgba(200,212,228,0.08)',
                  boxShadow: req.status === 'fulfilled'
                    ? '0 0 10px rgba(16,185,129,0.35)'
                    : req.status === 'overdue'
                    ? '0 0 10px rgba(239,68,68,0.35)'
                    : 'none',
                  transition: 'all 0.3s',
                  ...(req.status === 'overdue' ? {
                    animation: 'plan-pulse-red 2s ease-in-out infinite',
                  } : {}),
                }} />

                {/* Category color bar */}
                <div style={{
                  width: 3, height: 36, borderRadius: 2, flexShrink: 0, marginTop: 2,
                  background: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.1)',
                  opacity: req.status === 'fulfilled' ? 0.3 : 0.6,
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      color: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.25)',
                      opacity: req.status === 'fulfilled' ? 0.4 : 0.7,
                    }}>
                      {req.category}
                    </span>
                    {req.milestone && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        color: 'rgba(200,212,228,0.15)',
                      }}>
                        {req.milestone}
                      </span>
                    )}
                    {/* Status badge — right aligned */}
                    <span
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 2,
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                        ...(req.status === 'fulfilled' ? {
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#10B981',
                        } : req.status === 'overdue' ? {
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#EF4444',
                        } : {
                          background: 'rgba(200,212,228,0.03)',
                          border: '1px solid rgba(200,212,228,0.06)',
                          color: 'rgba(200,212,228,0.25)',
                        }),
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: req.status === 'fulfilled' ? 'rgba(200,212,228,0.4)' : 'var(--color-shi)',
                    lineHeight: 1.55,
                    textDecoration: req.status === 'fulfilled' ? 'none' : 'none',
                  }}>
                    {req.description}
                  </div>

                  {/* Due date */}
                  {req.due_date && (
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: req.status === 'overdue' ? 'rgba(239,68,68,0.5)' : 'rgba(200,212,228,0.18)',
                      marginTop: 5,
                    }}>
                      Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}

                  {/* Fulfilled evidence link */}
                  {fulfilledEvidence && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: 'rgba(16,185,129,0.55)',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{fulfilledEvidence.file_name}</span>
                      <span style={{ color: 'rgba(200,212,228,0.12)' }}>
                        {req.fulfilled_at ? new Date(req.fulfilled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STAT CARD — Compact metric display with optional glow + pulse
   ═══════════════════════════════════════════════════════════════ */

function StatCard({
  label,
  value,
  color,
  glowColor,
  pulse,
}: {
  label: string
  value: string
  color?: string
  glowColor?: string
  pulse?: boolean
}) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 8,
        background: glowColor || 'rgba(200,212,228,0.02)',
        border: '1px solid rgba(200,212,228,0.04)',
        position: 'relative',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase' as const, color: 'rgba(200,212,228,0.3)', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 36,
        color: color || 'var(--color-pure)',
        letterSpacing: '-0.02em', lineHeight: 1,
        ...(pulse ? { animation: 'plan-pulse-red 2s ease-in-out infinite' } : {}),
      }}>
        {value}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   INLINE SVG ICONS — Minimal, precise, no dependencies
   ═══════════════════════════════════════════════════════════════ */

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke={color} strokeWidth="1.2" />
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="9.5" r="1" fill={color} />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L15 14H1L8 1Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <line x1="8" y1="6" x2="8" y2="10" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.7" fill="#F59E0B" />
    </svg>
  )
}

function BlueprintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="1" stroke="rgba(200,212,228,0.15)" strokeWidth="1" />
      <line x1="7" y1="3" x2="7" y2="17" stroke="rgba(200,212,228,0.08)" strokeWidth="0.5" />
      <line x1="3" y1="7" x2="17" y2="7" stroke="rgba(200,212,228,0.08)" strokeWidth="0.5" />
      <line x1="3" y1="13" x2="17" y2="13" stroke="rgba(200,212,228,0.08)" strokeWidth="0.5" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.28)',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(200,212,228,0.03)',
  border: '1px solid rgba(200,212,228,0.08)',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)', fontSize: 12,
  color: 'var(--color-shi)',
  transition: 'border-color 0.2s, background 0.2s',
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  color: '#EF4444', padding: '10px 14px',
  background: 'rgba(239,68,68,0.04)',
  border: '1px solid rgba(239,68,68,0.12)',
  borderRadius: 6, marginBottom: 12,
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.24em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.3)',
}

const metaLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.18)',
}
