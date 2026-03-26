'use client'

import { useState, useCallback, useMemo } from 'react'
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
   CONSTRUCTION EVIDENCE CATEGORIES — Pre-checked suggestions
   The sub doesn't stare at a blank form. The system knows
   construction. It suggests what matters.
   ═══════════════════════════════════════════════════════════════ */

interface CategorySuggestion {
  name: string
  description: string
  defaultChecked: boolean
  color: string
  icon: string // single-char emoji shorthand for visual grouping
}

const SUGGESTED_CATEGORIES: CategorySuggestion[] = [
  { name: 'Inspection Documentation', description: 'Third-party inspection reports, code compliance certifications', defaultChecked: true, color: '#F59E0B', icon: '◈' },
  { name: 'Material Certifications', description: 'Mill certs, material test reports, spec compliance sheets', defaultChecked: true, color: '#10B981', icon: '◇' },
  { name: 'Daily Progress Photos', description: 'Time-stamped photographic evidence of work completion', defaultChecked: true, color: '#A78BFA', icon: '◎' },
  { name: 'Test Results & Reports', description: 'Soil tests, concrete breaks, pressure tests, commissioning results', defaultChecked: true, color: '#06B6D4', icon: '◉' },
  { name: 'Weather Delay Records', description: 'Documented weather events affecting schedule or work conditions', defaultChecked: false, color: '#3B82F6', icon: '◊' },
  { name: 'Safety Compliance', description: 'OSHA documentation, safety meeting records, incident reports', defaultChecked: false, color: '#EF4444', icon: '⬥' },
  { name: 'RFI Responses', description: 'Request for information submissions and responses received', defaultChecked: false, color: '#8B5CF6', icon: '◈' },
  { name: 'Change Order Documentation', description: 'Change order requests, approvals, pricing, scope modifications', defaultChecked: false, color: '#F97316', icon: '◇' },
  { name: 'Commissioning Records', description: 'System startup documentation, performance verification, balancing reports', defaultChecked: false, color: '#14B8A6', icon: '◎' },
  { name: 'Warranty Documentation', description: 'Manufacturer warranties, extended warranties, warranty assignments', defaultChecked: false, color: '#EC4899', icon: '◉' },
  { name: 'Submittals', description: 'Product data, shop drawings, samples submitted for approval', defaultChecked: false, color: '#6366F1', icon: '◊' },
  { name: 'Permits & Approvals', description: 'Building permits, inspection sign-offs, regulatory approvals', defaultChecked: false, color: '#0EA5E9', icon: '⬥' },
]

/** Category → accent color for visual grouping */
const CATEGORY_COLORS: Record<string, string> = {}
for (const cat of SUGGESTED_CATEGORIES) {
  CATEGORY_COLORS[cat.name] = cat.color
}
// Legacy mappings for backward compatibility
CATEGORY_COLORS['Daily Log'] = '#7EB8F7'
CATEGORY_COLORS['Photo Documentation'] = '#A78BFA'
CATEGORY_COLORS['Inspection Report'] = '#F59E0B'
CATEGORY_COLORS['Material Certification'] = '#10B981'
CATEGORY_COLORS['Change Order'] = '#F97316'
CATEGORY_COLORS['RFI Response'] = '#06B6D4'
CATEGORY_COLORS['Submittal'] = '#8B5CF6'
CATEGORY_COLORS['Progress Report'] = '#3B82F6'
CATEGORY_COLORS['Test Result'] = '#14B8A6'
CATEGORY_COLORS['Permit'] = '#EC4899'
CATEGORY_COLORS['Other'] = '#6B7280'

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeOut },
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
    transition: { duration: 0.5, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.3 },
  },
}

const phaseTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
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

  // If no plan exists, show the 3-phase ceremony
  if (!plan) {
    return <CustodyCeremony projectId={projectId} onPlanCreated={setPlan} />
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

  return (
    <ActivePlanView
      projectId={projectId}
      plan={plan}
      evidenceItems={evidenceItems}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════
   THE CUSTODY CEREMONY — 3 Phases

   Phase 1: IDENTIFY — Name and scope the custody plan
   Phase 2: DEFINE   — Select evidence categories (pre-suggested)
   Phase 3: REVIEW   — See the full plan, activate & lock

   This is not a wizard. This is a ceremony.
   The same way a notary doesn't hand you a blank page.
   ═══════════════════════════════════════════════════════════════ */

type CeremonyPhase = 'identify' | 'define' | 'review'

interface SelectedCategory {
  name: string
  description: string
  milestone: string
  dueDate: string
  color: string
}

function CustodyCeremony({
  projectId,
  onPlanCreated,
}: {
  projectId: string
  onPlanCreated: (plan: CustodyPlan) => void
}) {
  const [phase, setPhase] = useState<CeremonyPhase>('identify')

  // Phase 1 state
  const [planName, setPlanName] = useState('')
  const [planDescription, setPlanDescription] = useState('')

  // Phase 2 state — pre-checked categories
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>(
    SUGGESTED_CATEGORIES
      .filter(c => c.defaultChecked)
      .map(c => ({
        name: c.name,
        description: c.description,
        milestone: '',
        dueDate: '',
        color: c.color,
      }))
  )
  const [customCategory, setCustomCategory] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  // Phase 3 state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const phaseNumber = phase === 'identify' ? 1 : phase === 'define' ? 2 : 3
  const phaseLabels = ['IDENTIFY', 'DEFINE', 'REVIEW & LOCK']

  const toggleCategory = useCallback((cat: CategorySuggestion) => {
    setSelectedCategories(prev => {
      const exists = prev.find(s => s.name === cat.name)
      if (exists) {
        return prev.filter(s => s.name !== cat.name)
      }
      return [...prev, {
        name: cat.name,
        description: cat.description,
        milestone: '',
        dueDate: '',
        color: cat.color,
      }]
    })
  }, [])

  const addCustomCategory = useCallback(() => {
    if (!customCategory.trim()) return
    setSelectedCategories(prev => [...prev, {
      name: customCategory.trim(),
      description: customDescription.trim() || customCategory.trim(),
      milestone: '',
      dueDate: '',
      color: '#6B7280',
    }])
    setCustomCategory('')
    setCustomDescription('')
  }, [customCategory, customDescription])

  const updateCategoryField = useCallback((name: string, field: 'milestone' | 'dueDate', value: string) => {
    setSelectedCategories(prev =>
      prev.map(c => c.name === name ? { ...c, [field]: value } : c)
    )
  }, [])

  const removeCategory = useCallback((name: string) => {
    setSelectedCategories(prev => prev.filter(c => c.name !== name))
  }, [])

  // The final act — create plan + requirements in one flow
  const handleEstablish = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      // Step 1: Create the plan
      const planRes = await fetch(`/api/projects/${projectId}/custody-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planName.trim(),
          description: planDescription.trim() || null,
        }),
      })
      const planData = await planRes.json()
      if (!planRes.ok) throw new Error(planData.error || 'Failed to create plan')

      const createdPlan = planData.plan

      // Step 2: Add all selected requirements
      for (let i = 0; i < selectedCategories.length; i++) {
        const cat = selectedCategories[i]
        const reqRes = await fetch(`/api/projects/${projectId}/requirements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            custodyPlanId: createdPlan.id,
            category: cat.name,
            description: cat.description,
            milestone: cat.milestone || null,
            dueDate: cat.dueDate || null,
            sortOrder: i + 1,
          }),
        })
        if (!reqRes.ok) {
          const reqData = await reqRes.json()
          console.warn(`Failed to add requirement ${cat.name}:`, reqData.error)
        }
      }

      // Step 3: Refetch the plan with requirements
      const refetch = await fetch(`/api/projects/${projectId}/custody-plan`)
      const refetchData = await refetch.json()
      if (refetchData.plan) {
        onPlanCreated(refetchData.plan)
      } else {
        onPlanCreated(createdPlan)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }, [projectId, planName, planDescription, selectedCategories, onPlanCreated])

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 20 }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '15%',
        width: 500, height: 500, transform: 'translateX(-50%)',
        borderRadius: '50%', background: 'rgba(126,184,247,0.012)',
        filter: 'blur(120px)', pointerEvents: 'none',
      }} />

      {/* Phase indicator — not a progress bar, a ceremony marker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, marginBottom: 48,
        }}
      >
        {phaseLabels.map((label, i) => {
          const isActive = i + 1 === phaseNumber
          const isPast = i + 1 < phaseNumber
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${isActive ? 'rgba(126,184,247,0.4)' : isPast ? 'rgba(16,185,129,0.3)' : 'rgba(200,212,228,0.08)'}`,
                background: isActive ? 'rgba(126,184,247,0.06)' : isPast ? 'rgba(16,185,129,0.04)' : 'transparent',
                transition: 'all 0.4s ease',
              }}>
                {isPast ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: isActive ? 'rgba(126,184,247,0.7)' : 'rgba(200,212,228,0.15)',
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.14em',
                color: isActive ? 'rgba(200,212,228,0.5)' : isPast ? 'rgba(16,185,129,0.4)' : 'rgba(200,212,228,0.12)',
                transition: 'color 0.3s',
              }}>
                {label}
              </span>
              {i < 2 && (
                <div style={{
                  width: 32, height: 1, marginLeft: 8,
                  background: isPast ? 'rgba(16,185,129,0.2)' : 'rgba(200,212,228,0.06)',
                  transition: 'background 0.4s',
                }} />
              )}
            </div>
          )
        })}
      </motion.div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === 'identify' && (
          <motion.div key="identify" {...phaseTransition}>
            <PhaseIdentify
              planName={planName}
              setPlanName={setPlanName}
              planDescription={planDescription}
              setPlanDescription={setPlanDescription}
              onNext={() => setPhase('define')}
            />
          </motion.div>
        )}

        {phase === 'define' && (
          <motion.div key="define" {...phaseTransition}>
            <PhaseDefine
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              addCustomCategory={addCustomCategory}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              customDescription={customDescription}
              setCustomDescription={setCustomDescription}
              updateCategoryField={updateCategoryField}
              removeCategory={removeCategory}
              onBack={() => setPhase('identify')}
              onNext={() => setPhase('review')}
            />
          </motion.div>
        )}

        {phase === 'review' && (
          <motion.div key="review" {...phaseTransition}>
            <PhaseReview
              planName={planName}
              planDescription={planDescription}
              selectedCategories={selectedCategories}
              submitting={submitting}
              error={error}
              onBack={() => setPhase('define')}
              onEstablish={handleEstablish}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 1: IDENTIFY
   "What project is this custody plan for?"
   ═══════════════════════════════════════════════════════════════ */

function PhaseIdentify({
  planName, setPlanName,
  planDescription, setPlanDescription,
  onNext,
}: {
  planName: string
  setPlanName: (v: string) => void
  planDescription: string
  setPlanDescription: (v: string) => void
  onNext: () => void
}) {
  return (
    <motion.div initial="hidden" animate="visible">
      {/* Decorative line */}
      <motion.div
        variants={fadeUp} custom={0}
        style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(126,184,247,0.4), transparent)',
          margin: '0 auto 32px',
        }}
      />

      <motion.h1
        variants={fadeUp} custom={1}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--color-pure)',
          letterSpacing: '-0.02em',
          textAlign: 'center', marginBottom: 12, lineHeight: 1.2,
        }}
      >
        Establish Custody Plan
      </motion.h1>

      <motion.p
        variants={fadeUp} custom={2}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.28)', letterSpacing: '0.06em',
          lineHeight: 1.9, textAlign: 'center',
          maxWidth: 480, margin: '0 auto 48px',
        }}
      >
        You are establishing a legal record. This plan declares what evidence
        will be custodied — before any dispute exists. Once activated, it is
        cryptographically locked forever.
      </motion.p>

      <motion.div
        variants={fadeUp} custom={3}
        className="glass-card"
        style={{ padding: '40px 36px 32px', position: 'relative' }}
      >
        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 32, height: 32,
          borderTop: '1px solid rgba(126,184,247,0.2)',
          borderLeft: '1px solid rgba(126,184,247,0.2)',
          borderRadius: '12px 0 0 0', pointerEvents: 'none',
        }} />

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Plan Name</label>
          <input
            type="text"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder="e.g. Harbor View Phase 1 Evidence Requirements"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 36 }}>
          <label style={labelStyle}>Scope of Custody</label>
          <textarea
            value={planDescription}
            onChange={e => setPlanDescription(e.target.value)}
            placeholder="Describe the scope — what work, what building, what phase..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.8 }}
          />
        </div>

        <button
          onClick={onNext}
          disabled={!planName.trim()}
          className="btn-seal"
          style={{
            width: '100%', justifyContent: 'center',
            borderRadius: 6, padding: '14px 28px',
            fontSize: 11, letterSpacing: '0.18em',
          }}
        >
          Define Evidence Requirements →
        </button>
      </motion.div>

      <motion.p
        variants={fadeUp} custom={4}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(200,212,228,0.12)', letterSpacing: '0.08em',
          textAlign: 'center', marginTop: 24,
        }}
      >
        SHA-256 CRYPTOGRAPHIC HASH ON ACTIVATION
      </motion.p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 2: DEFINE REQUIREMENTS
   Pre-suggested categories. The system knows construction.
   Check, uncheck, add custom. 90 seconds, not 10 minutes.
   ═══════════════════════════════════════════════════════════════ */

function PhaseDefine({
  selectedCategories, toggleCategory,
  addCustomCategory, customCategory, setCustomCategory,
  customDescription, setCustomDescription,
  updateCategoryField, removeCategory,
  onBack, onNext,
}: {
  selectedCategories: SelectedCategory[]
  toggleCategory: (cat: CategorySuggestion) => void
  addCustomCategory: () => void
  customCategory: string
  setCustomCategory: (v: string) => void
  customDescription: string
  setCustomDescription: (v: string) => void
  updateCategoryField: (name: string, field: 'milestone' | 'dueDate', value: string) => void
  removeCategory: (name: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const [showCustom, setShowCustom] = useState(false)
  const selectedNames = useMemo(() => new Set(selectedCategories.map(c => c.name)), [selectedCategories])

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.h2
        variants={fadeUp} custom={0}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(22px, 3vw, 32px)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--color-pure)',
          letterSpacing: '-0.02em', marginBottom: 8,
        }}
      >
        What evidence will you custody?
      </motion.h2>

      <motion.p
        variants={fadeUp} custom={1}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.25)', letterSpacing: '0.04em',
          lineHeight: 1.9, marginBottom: 32, maxWidth: 520,
        }}
      >
        Select the categories relevant to your project. You control what gets tracked.
        The prime contractor has no say in this list.
      </motion.p>

      {/* Suggested categories — checkbox grid */}
      <motion.div
        variants={fadeUp} custom={2}
        className="glass-card"
        style={{ padding: '24px 0', marginBottom: 16 }}
      >
        <div style={{
          padding: '0 28px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={sectionLabelStyle}>Evidence Categories</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(126,184,247,0.5)',
          }}>
            {selectedCategories.length} selected
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SUGGESTED_CATEGORIES.map((cat, i) => {
            const isSelected = selectedNames.has(cat.name)
            return (
              <motion.div
                key={cat.name}
                variants={slideInLeft}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 28px',
                  cursor: 'pointer',
                  borderBottom: i < SUGGESTED_CATEGORIES.length - 1 ? '1px solid rgba(200,212,228,0.03)' : 'none',
                  background: isSelected ? 'rgba(126,184,247,0.02)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(200,212,228,0.015)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? 'rgba(126,184,247,0.02)' : 'transparent'
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `1px solid ${isSelected ? cat.color : 'rgba(200,212,228,0.1)'}`,
                  background: isSelected ? `${cat.color}15` : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                    >
                      <path d="M2 5l2 2 4-4" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </div>

                {/* Category color bar */}
                <div style={{
                  width: 3, height: 28, borderRadius: 2, flexShrink: 0,
                  background: cat.color,
                  opacity: isSelected ? 0.6 : 0.15,
                  transition: 'opacity 0.2s',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: isSelected ? 'var(--color-shi)' : 'rgba(200,212,228,0.35)',
                    transition: 'color 0.2s',
                  }}>
                    {cat.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'rgba(200,212,228,0.15)',
                    lineHeight: 1.5, marginTop: 2,
                  }}>
                    {cat.description}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Add custom */}
        <div style={{ padding: '16px 28px 0', borderTop: '1px solid rgba(200,212,228,0.04)' }}>
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em',
                padding: '4px 0',
              }}
            >
              <PlusIcon /> Add custom category
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Category name"
                  style={{ ...inputStyle, flex: 1 }}
                  autoFocus
                />
                <button
                  onClick={addCustomCategory}
                  disabled={!customCategory.trim()}
                  className="btn-seal"
                  style={{ padding: '8px 16px', fontSize: 10, borderRadius: 4, flexShrink: 0 }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustom(false)}
                  className="btn-ghost"
                  style={{ padding: '8px 12px', borderRadius: 4, flexShrink: 0 }}
                >
                  <XIcon />
                </button>
              </div>
              <input
                type="text"
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                placeholder="Brief description of what this covers"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Selected categories — detail editing */}
      {selectedCategories.length > 0 && (
        <motion.div
          variants={fadeUp} custom={3}
          className="glass-card"
          style={{ padding: '24px 28px', marginBottom: 24 }}
        >
          <div style={{ ...sectionLabelStyle, marginBottom: 16 }}>
            Milestone & Due Date (Optional)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedCategories.map(cat => (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
              }}>
                <div style={{
                  width: 3, height: 20, borderRadius: 2, flexShrink: 0,
                  background: cat.color, opacity: 0.5,
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'rgba(200,212,228,0.4)', width: 160, flexShrink: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {cat.name}
                </span>
                <input
                  type="text"
                  value={cat.milestone}
                  onChange={e => updateCategoryField(cat.name, 'milestone', e.target.value)}
                  placeholder="Milestone"
                  style={{ ...inputStyle, padding: '6px 10px', fontSize: 11, flex: 1 }}
                />
                <input
                  type="date"
                  value={cat.dueDate}
                  onChange={e => updateCategoryField(cat.name, 'dueDate', e.target.value)}
                  style={{ ...inputStyle, padding: '6px 10px', fontSize: 11, width: 140, colorScheme: 'dark' }}
                />
                <button
                  onClick={() => removeCategory(cat.name)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(200,212,228,0.15)', padding: 4,
                  }}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        variants={fadeUp} custom={4}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <button onClick={onBack} className="btn-ghost" style={{ borderRadius: 6, padding: '10px 20px' }}>
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedCategories.length === 0}
          className="btn-seal"
          style={{
            borderRadius: 6, padding: '14px 28px',
            fontSize: 11, letterSpacing: '0.16em',
            opacity: selectedCategories.length === 0 ? 0.4 : 1,
          }}
        >
          Review & Lock →
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 3: REVIEW & LOCK
   Full plan summary. Every requirement listed.
   The final act. "Activate & Lock Plan Forever."
   ═══════════════════════════════════════════════════════════════ */

function PhaseReview({
  planName, planDescription, selectedCategories,
  submitting, error, onBack, onEstablish,
}: {
  planName: string
  planDescription: string
  selectedCategories: SelectedCategory[]
  submitting: boolean
  error: string | null
  onBack: () => void
  onEstablish: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.h2
        variants={fadeUp} custom={0}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(22px, 3vw, 32px)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--color-pure)',
          letterSpacing: '-0.02em', marginBottom: 8,
        }}
      >
        Review Your Custody Plan
      </motion.h2>

      <motion.p
        variants={fadeUp} custom={1}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(200,212,228,0.25)', letterSpacing: '0.04em',
          lineHeight: 1.9, marginBottom: 32, maxWidth: 520,
        }}
      >
        Verify everything below. After activation, this plan is sealed with a
        SHA-256 hash and cannot be modified. This is your pre-dispute record.
      </motion.p>

      {/* Plan summary card */}
      <motion.div
        variants={fadeUp} custom={2}
        className="glass-card"
        style={{ padding: '28px 32px', marginBottom: 16 }}
      >
        <div style={sectionLabelStyle}>Plan Details</div>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 18,
          color: 'var(--color-pure)', marginTop: 12, marginBottom: 6,
        }}>
          {planName}
        </div>
        {planDescription && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(200,212,228,0.3)', lineHeight: 1.8,
          }}>
            {planDescription}
          </div>
        )}
      </motion.div>

      {/* Requirements summary */}
      <motion.div
        variants={fadeUp} custom={3}
        className="glass-card"
        style={{ padding: '24px 0', marginBottom: 24 }}
      >
        <div style={{
          padding: '0 32px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={sectionLabelStyle}>Evidence Requirements</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 22,
            color: 'var(--color-pure)', letterSpacing: '-0.02em',
          }}>
            {selectedCategories.length}
          </span>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden" animate="visible"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {selectedCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              variants={slideInLeft}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 32px',
                borderBottom: i < selectedCategories.length - 1 ? '1px solid rgba(200,212,228,0.03)' : 'none',
              }}
            >
              <div style={{
                width: 3, height: 28, borderRadius: 2, flexShrink: 0,
                background: cat.color, opacity: 0.5,
              }} />
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(200,212,228,0.12)', width: 22, flexShrink: 0,
                textAlign: 'right',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 13,
                  color: 'var(--color-shi)',
                }}>
                  {cat.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'rgba(200,212,228,0.18)', marginTop: 2,
                }}>
                  {cat.description}
                </div>
              </div>
              {cat.milestone && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'rgba(200,212,228,0.2)', flexShrink: 0,
                }}>
                  {cat.milestone}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Confirmation checkbox — deliberate friction */}
      <motion.div
        variants={fadeUp} custom={4}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '16px 20px', marginBottom: 24,
          background: 'rgba(245,158,11,0.02)',
          border: '1px solid rgba(245,158,11,0.08)',
          borderRadius: 8, cursor: 'pointer',
        }}
        onClick={() => setConfirmed(!confirmed)}
      >
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
          border: `1px solid ${confirmed ? 'rgba(245,158,11,0.5)' : 'rgba(200,212,228,0.12)'}`,
          background: confirmed ? 'rgba(245,158,11,0.08)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {confirmed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M2 5l2 2 4-4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 12,
            color: 'rgba(200,212,228,0.5)', lineHeight: 1.7,
          }}>
            I understand this plan will be cryptographically sealed upon activation
            and cannot be modified. This creates a permanent, verifiable record of
            what I committed to custody.
          </div>
        </div>
      </motion.div>

      {error && <div style={{ ...errorStyle, marginBottom: 16 }}>{error}</div>}

      {/* Navigation */}
      <motion.div
        variants={fadeUp} custom={5}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <button onClick={onBack} disabled={submitting} className="btn-ghost" style={{ borderRadius: 6, padding: '10px 20px' }}>
          ← Edit Requirements
        </button>
        <button
          onClick={onEstablish}
          disabled={!confirmed || submitting}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 6,
            background: !confirmed ? 'rgba(200,212,228,0.04)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${!confirmed ? 'rgba(200,212,228,0.06)' : 'rgba(245,158,11,0.25)'}`,
            color: !confirmed ? 'rgba(200,212,228,0.2)' : '#F59E0B',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase' as const,
            cursor: !confirmed ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            if (confirmed && !submitting) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.14)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(245,158,11,0.1)'
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = !confirmed ? 'rgba(200,212,228,0.04)' : 'rgba(245,158,11,0.08)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <LockIcon />
          {submitting ? 'Establishing...' : 'Establish & Lock Plan'}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STATE 2 — DRAFT PLAN (post-creation, pre-activation)
   If the ceremony created the plan but user wants to add more
   requirements or activate from the draft view.
   ═══════════════════════════════════════════════════════════════ */

function DraftPlanView({
  projectId, plan, setPlan, loading, setLoading, error, setError,
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
  const [reqCategory, setReqCategory] = useState(SUGGESTED_CATEGORIES[0].name)
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
      setPlan({ ...plan, evidence_requirements: [...requirements, data.requirement] })
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
      if (refetchData.plan) setPlan(refetchData.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setShowActivateModal(false)
    }
  }, [projectId, plan.id, setPlan, setLoading, setError])

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Plan header */}
      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 400, fontStyle: 'italic',
            color: 'var(--color-pure)',
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2,
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

      {/* Requirements card */}
      <motion.div variants={fadeUp} custom={1} className="glass-card" style={{ padding: '28px 0', marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={sectionLabelStyle}>Evidence Requirements</div>
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
            style={{ padding: '6px 14px', fontSize: 10, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {showAddForm ? <><XIcon /> Cancel</> : <><PlusIcon /> Add Requirement</>}
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
                      {SUGGESTED_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Milestone</label>
                    <input type="text" value={reqMilestone} onChange={e => setReqMilestone(e.target.value)} placeholder="e.g. Foundation Complete" style={inputStyle} disabled={addingReq} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Description</label>
                  <input type="text" value={reqDescription} onChange={e => setReqDescription(e.target.value)} placeholder="What evidence is required?" style={inputStyle} disabled={addingReq} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Due Date (optional)</label>
                    <input type="date" value={reqDueDate} onChange={e => setReqDueDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} disabled={addingReq} />
                  </div>
                  <button onClick={handleAddRequirement} disabled={!reqDescription.trim() || addingReq} className="btn-seal" style={{ padding: '10px 24px', fontSize: 10, borderRadius: 4, flexShrink: 0 }}>
                    {addingReq ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requirements rows */}
        {requirements.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, margin: '0 auto 16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed rgba(200,212,228,0.1)',
            }}>
              <BlueprintIcon />
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontStyle: 'italic', color: 'rgba(200,212,228,0.25)', marginBottom: 6 }}>
              No requirements defined yet
            </p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column' }}>
            {requirements.sort((a, b) => a.sort_order - b.sort_order).map((req, i) => (
              <motion.div key={req.id} variants={slideInLeft} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '16px 32px',
                borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
              }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, flexShrink: 0, marginTop: 2, background: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.1)', opacity: 0.6 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.12)', width: 18, flexShrink: 0, textAlign: 'right', paddingTop: 3 }}>
                  {String(req.sort_order).padStart(2, '0')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.25)', opacity: 0.7 }}>{req.category}</span>
                    {req.milestone && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.18)' }}>{req.milestone}</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-shi)', lineHeight: 1.55 }}>{req.description}</div>
                  {req.due_date && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.18)', marginTop: 5 }}>Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ ...errorStyle, marginBottom: 20 }}>{error}</motion.div>}

      {/* Activate button */}
      <motion.div variants={fadeUp} custom={3} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.15)', letterSpacing: '0.06em' }}>
          {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} defined
        </span>
        <button
          onClick={() => setShowActivateModal(true)}
          disabled={requirements.length === 0 || loading}
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
          onMouseEnter={e => { if (requirements.length > 0) { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.14)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(245,158,11,0.1)' } }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = requirements.length === 0 ? 'rgba(200,212,228,0.04)' : 'rgba(245,158,11,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
        >
          <LockIcon /> {loading ? 'Activating...' : 'Activate & Lock Plan'}
        </button>
      </motion.div>

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
   ACTIVATE MODAL — Two-step confirmation
   ═══════════════════════════════════════════════════════════════ */

function ActivateModal({
  requirementCount, planName, onConfirm, onCancel, loading,
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,5,11,0.9)', backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        style={{
          background: 'var(--color-navy)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 12, padding: '36px 32px 28px', maxWidth: 480, width: '100%',
          position: 'relative', boxShadow: '0 0 60px rgba(245,158,11,0.04)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)' }} />

        {step === 1 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <WarningIcon />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-pure)' }}>Activate Custody Plan</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,158,11,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Irreversible Action</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(200,212,228,0.5)', lineHeight: 1.8, marginBottom: 12 }}>
              You are about to activate <strong style={{ color: 'var(--color-shi)' }}>{planName}</strong> with <strong style={{ color: 'var(--color-shi)' }}>{requirementCount}</strong> evidence requirement{requirementCount !== 1 ? 's' : ''}.
            </p>
            <div style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 6, padding: '14px 16px', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,158,11,0.6)', letterSpacing: '0.04em', lineHeight: 1.9, margin: 0 }}>
                The plan and all requirements will be cryptographically hashed with SHA-256 and locked permanently. No modifications can be made after activation.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onCancel} className="btn-ghost" style={{ borderRadius: 6, padding: '10px 20px' }}>Cancel</button>
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 6,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                  color: '#F59E0B', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const, cursor: 'pointer',
                }}
              >
                Proceed to Lock →
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} style={{
                width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 40px rgba(245,158,11,0.06)',
              }}>
                <LockIcon size={24} color="#F59E0B" />
              </motion.div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontStyle: 'italic', color: 'var(--color-pure)', marginBottom: 6 }}>Final Confirmation</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>This action cannot be undone</div>
            </div>
            <div style={{ background: 'rgba(200,212,228,0.02)', border: '1px solid rgba(200,212,228,0.06)', borderRadius: 6, padding: '12px 16px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Plan Hash Will Be Generated</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.15)' }}>SHA-256( plan + {requirementCount} requirements )</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} disabled={loading} className="btn-ghost" style={{ borderRadius: 6, padding: '10px 20px', flex: 1 }}>Back</button>
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
   Mission control. Vault door closed. Attorney/auditor facing.
   ═══════════════════════════════════════════════════════════════ */

function ActivePlanView({
  projectId, plan, evidenceItems,
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

  const evidenceMap: Record<string, EvidenceItem> = {}
  for (const item of evidenceItems) evidenceMap[item.id] = item

  const statusBadge = plan.status === 'active'
    ? { className: 'badge-sealed', label: 'Active' }
    : plan.status === 'completed'
    ? { className: 'badge-sealed', label: 'Completed' }
    : { className: 'badge-pending', label: 'Archived' }

  return (
    <motion.div initial="hidden" animate="visible">
      <div style={{
        position: 'absolute', left: '50%', top: '10%', width: 500, height: 500,
        transform: 'translateX(-50%)', borderRadius: '50%',
        background: percent === 100 ? 'rgba(16,185,129,0.01)' : 'rgba(126,184,247,0.01)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-pure)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>{plan.name}</h2>
          <span className={statusBadge.className} style={{ borderRadius: 2, flexShrink: 0 }}>{statusBadge.label}</span>
        </div>
        {plan.description && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(200,212,228,0.3)', letterSpacing: '0.04em', lineHeight: 1.9, margin: 0, maxWidth: 560 }}>{plan.description}</p>}
      </motion.div>

      {/* Crypto metadata */}
      <motion.div variants={fadeUp} custom={1} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(200,212,228,0.05)' }}>
        {plan.plan_hash && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={metaLabelStyle}>Plan Hash</span>
            <span className="hash-pill" style={{ fontSize: 10, padding: '3px 10px' }}>{plan.plan_hash.slice(0, 12)}...{plan.plan_hash.slice(-12)}</span>
          </div>
        )}
        {plan.activated_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={metaLabelStyle}>Activated</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.35)' }}>{new Date(plan.activated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-sealed)', boxShadow: '0 0 8px rgba(16,185,129,0.3)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(16,185,129,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Cryptographically Sealed</span>
        </div>
      </motion.div>

      {/* Completeness dashboard */}
      <motion.div variants={fadeUp} custom={2} className="glass-card" style={{
        padding: '40px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden',
        borderColor: percent === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(200,212,228,0.06)',
        ...(percent === 100 ? { boxShadow: '0 0 40px rgba(16,185,129,0.03)' } : {}),
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: percent === 100 ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.25), transparent)' : 'linear-gradient(90deg, transparent, rgba(126,184,247,0.12), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}><PlanProgressRing percent={percent} fulfilled={fulfilled} total={total} size={200} /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <StatCard label="Total Requirements" value={String(total)} />
              <StatCard label="Fulfilled" value={String(fulfilled)} color="var(--color-sealed)" glowColor="rgba(16,185,129,0.06)" />
              <StatCard label="Pending" value={String(pending)} color="var(--color-pending)" glowColor="rgba(245,158,11,0.04)" />
              <StatCard label="Overdue" value={String(overdue)} color={overdue > 0 ? 'var(--color-breach)' : 'rgba(200,212,228,0.2)'} glowColor={overdue > 0 ? 'rgba(239,68,68,0.04)' : undefined} pulse={overdue > 0} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Requirements list */}
      <motion.div variants={fadeUp} custom={3} className="glass-card" style={{ padding: '28px 0' }}>
        <div style={{ padding: '0 32px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={sectionLabelStyle}>Evidence Requirements</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-pure)', letterSpacing: '-0.02em', lineHeight: 1 }}>{total}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(200,212,228,0.04)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.5 }} style={{ height: '100%', borderRadius: 2, background: percent === 100 ? 'var(--color-sealed)' : 'var(--color-glow)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(200,212,228,0.3)' }}>{percent}%</span>
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column' }}>
          {requirements.map((req, i) => {
            const fulfilledEvidence = req.fulfilled_by ? evidenceMap[req.fulfilled_by] : null
            return (
              <motion.div key={req.id} variants={slideInLeft} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 32px',
                borderBottom: i < requirements.length - 1 ? '1px solid rgba(200,212,228,0.04)' : 'none',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: req.status === 'fulfilled' ? 'var(--color-sealed)' : req.status === 'overdue' ? 'var(--color-breach)' : 'rgba(200,212,228,0.08)',
                  boxShadow: req.status === 'fulfilled' ? '0 0 10px rgba(16,185,129,0.35)' : req.status === 'overdue' ? '0 0 10px rgba(239,68,68,0.35)' : 'none',
                  ...(req.status === 'overdue' ? { animation: 'plan-pulse-red 2s ease-in-out infinite' } : {}),
                }} />
                <div style={{ width: 3, height: 36, borderRadius: 2, flexShrink: 0, marginTop: 2, background: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.1)', opacity: req.status === 'fulfilled' ? 0.3 : 0.6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: CATEGORY_COLORS[req.category] || 'rgba(200,212,228,0.25)', opacity: req.status === 'fulfilled' ? 0.4 : 0.7 }}>{req.category}</span>
                    {req.milestone && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(200,212,228,0.15)' }}>{req.milestone}</span>}
                    <span style={{
                      marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 9,
                      letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                      ...(req.status === 'fulfilled' ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' } : req.status === 'overdue' ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' } : { background: 'rgba(200,212,228,0.03)', border: '1px solid rgba(200,212,228,0.06)', color: 'rgba(200,212,228,0.25)' }),
                    }}>{req.status}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: req.status === 'fulfilled' ? 'rgba(200,212,228,0.4)' : 'var(--color-shi)', lineHeight: 1.55 }}>{req.description}</div>
                  {req.due_date && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: req.status === 'overdue' ? 'rgba(239,68,68,0.5)' : 'rgba(200,212,228,0.18)', marginTop: 5 }}>Due: {new Date(req.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                  {fulfilledEvidence && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(16,185,129,0.55)' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span>{fulfilledEvidence.file_name}</span>
                      <span style={{ color: 'rgba(200,212,228,0.12)' }}>{req.fulfilled_at ? new Date(req.fulfilled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
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
   STAT CARD
   ═══════════════════════════════════════════════════════════════ */

function StatCard({ label, value, color, glowColor, pulse }: {
  label: string; value: string; color?: string; glowColor?: string; pulse?: boolean
}) {
  return (
    <div style={{ padding: '16px 20px', borderRadius: 8, background: glowColor || 'rgba(200,212,228,0.02)', border: '1px solid rgba(200,212,228,0.04)' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(200,212,228,0.3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: color || 'var(--color-pure)', letterSpacing: '-0.02em', lineHeight: 1, ...(pulse ? { animation: 'plan-pulse-red 2s ease-in-out infinite' } : {}) }}>{value}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   INLINE SVG ICONS
   ═══════════════════════════════════════════════════════════════ */

function PlusIcon() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
}

function XIcon() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
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
  textTransform: 'uppercase', color: 'rgba(200,212,228,0.28)', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(200,212,228,0.03)',
  border: '1px solid rgba(200,212,228,0.08)',
  borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
  color: 'var(--color-shi)', transition: 'border-color 0.2s, background 0.2s', outline: 'none',
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
