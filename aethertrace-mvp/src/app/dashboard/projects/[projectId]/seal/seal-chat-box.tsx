'use client'

/**
 * Seal Chat Box — per-project version with requirement tagging.
 *
 * Wraps ClaudeChatInput and adds a requirement selector that fetches
 * unfulfilled requirements from the active custody plan. When evidence
 * is sealed with a requirement tag, the requirement is automatically
 * marked as fulfilled via PATCH.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClaudeChatInput, type FileWithPreview, type PastedContent } from '@/components/ui/claude-style-ai-input'

interface Requirement {
  id: string
  category: string
  description: string
  status: string
  milestone: string | null
  sort_order: number
}

export function SealChatBox({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [selectedRequirement, setSelectedRequirement] = useState<string>('')
  const [loadingReqs, setLoadingReqs] = useState(false)

  // Fetch unfulfilled requirements from the active custody plan
  useEffect(() => {
    async function fetchRequirements() {
      setLoadingReqs(true)
      try {
        const res = await fetch(`/api/projects/${projectId}/custody-plan`)
        if (!res.ok) return

        const data = await res.json()
        if (!data.plan || !data.plan.evidence_requirements) return

        const unfulfilled = (data.plan.evidence_requirements as Requirement[])
          .filter((r: Requirement) => r.status === 'pending')
          .sort((a: Requirement, b: Requirement) => a.sort_order - b.sort_order)

        setRequirements(unfulfilled)
      } catch {
        // Silent fail — requirements are optional
      } finally {
        setLoadingReqs(false)
      }
    }

    fetchRequirements()
  }, [projectId])

  async function handleSeal(message: string, files: FileWithPreview[], pastedContent: PastedContent[]) {
    // Use the first file if available
    const file = files[0]?.file
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('timeConfidence', 'system-generated')

    // Combine message + pasted content as note
    const note = [message, ...pastedContent.map(p => p.content)].filter(Boolean).join('\n\n')
    if (note.trim()) formData.append('note', note.trim())

    // Tag to requirement if selected
    if (selectedRequirement) {
      formData.append('requirementId', selectedRequirement)
    }

    try {
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Seal failed')
      }

      // Fulfill the requirement via PATCH if one was tagged
      if (selectedRequirement) {
        const uploadData = await res.clone().json()
        const evidenceId = uploadData.evidence?.id
        if (evidenceId) {
          await fetch(`/api/projects/${projectId}/requirements`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requirementId: selectedRequirement,
              evidenceItemId: evidenceId,
            }),
          })
        }

        // Remove fulfilled requirement from dropdown
        setRequirements(prev => prev.filter(r => r.id !== selectedRequirement))
        setSelectedRequirement('')
      }

      router.refresh()
    } catch (err) {
      console.error('Seal failed:', err)
      alert(err instanceof Error ? err.message : 'Seal failed')
    }
  }

  return (
    <div>
      <ClaudeChatInput
        onSendMessage={handleSeal}
        placeholder="What happened? Describe the evidence..."
        maxFiles={10}
        maxFileSize={50 * 1024 * 1024}
      />

      {/* Requirement selector — shows below the chat input when plan has unfulfilled requirements */}
      {requirements.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 10,
          padding: '0 4px',
        }}>
          {/* Tag icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path
              d="M1.5 7.914V2.5A1 1 0 012.5 1.5h5.414a1 1 0 01.707.293l4.086 4.086a1 1 0 010 1.414l-5.414 5.414a1 1 0 01-1.414 0L1.793 8.621A1 1 0 011.5 7.914z"
              stroke="#486080"
              strokeWidth="0.8"
            />
            <circle cx="4.5" cy="4.5" r="0.75" fill="#486080" />
          </svg>
          <select
            value={selectedRequirement}
            onChange={(e) => setSelectedRequirement(e.target.value)}
            disabled={loadingReqs}
            style={{
              flex: 1,
              background: 'rgba(200,212,228,0.04)',
              border: '1px solid rgba(200,212,228,0.08)',
              borderRadius: 6,
              padding: '5px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: selectedRequirement ? '#B8D4EE' : '#486080',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="">Tag to requirement (optional)</option>
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.category}{req.milestone ? ` / ${req.milestone}` : ''} — {req.description}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
