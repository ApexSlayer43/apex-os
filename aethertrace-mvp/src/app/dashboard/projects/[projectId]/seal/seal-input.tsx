'use client'

/**
 * Seal Input — The Chat Box
 * Text area + file attach + requirement tag + Seal button.
 * Feels like Claude's input: one box, one action.
 *
 * Requirement tagging: fetches the active custody plan's unfulfilled
 * requirements and presents a dropdown to tag evidence to a specific
 * requirement during upload. The API already accepts requirementId.
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Requirement {
  id: string
  category: string
  description: string
  status: string
  milestone: string | null
  sort_order: number
}

export function SealInput({ projectId }: { projectId: string }) {
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sealing, setSealing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [selectedRequirement, setSelectedRequirement] = useState<string>('')
  const [loadingReqs, setLoadingReqs] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Fetch unfulfilled requirements from the active custody plan
  useEffect(() => {
    async function fetchRequirements() {
      setLoadingReqs(true)
      try {
        const res = await fetch(`/api/projects/${projectId}/custody-plan`)
        if (!res.ok) return

        const data = await res.json()
        if (!data.plan || !data.plan.evidence_requirements) return

        // Only show pending (unfulfilled) requirements from active plans
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

  async function handleSeal() {
    if (!file) {
      setError('Attach a file to seal.')
      return
    }

    setSealing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('timeConfidence', 'system-generated')
    if (note.trim()) {
      formData.append('note', note.trim())
    }
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

      // On success: if a requirement was tagged, fulfill it via PATCH
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
      }

      // Clear inputs and refresh
      setNote('')
      setFile(null)
      setSelectedRequirement('')
      if (fileRef.current) fileRef.current.value = ''

      // Refresh requirements list (fulfilled one removed from pending)
      setRequirements(prev => prev.filter(r => r.id !== selectedRequirement))

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seal failed')
    } finally {
      setSealing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl + Enter to seal
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSeal()
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) setFile(droppedFile)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  return (
    <div
      className="seal-input-wrap"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        background: 'rgba(200,212,228,0.03)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(200,212,228,0.08)'}`,
        borderRadius: 12,
        padding: '12px 16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Text area */}
      <textarea
        ref={textRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What happened? Describe the evidence..."
        disabled={sealing}
        rows={2}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: '#B8D4EE',
          lineHeight: 1.6,
          caretColor: '#C8D4E0',
          opacity: sealing ? 0.5 : 1,
        }}
      />

      {/* Requirement selector — only visible when plan has unfulfilled requirements */}
      {requirements.length > 0 && (
        <div style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid rgba(200,212,228,0.04)',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
              disabled={sealing || loadingReqs}
              style={{
                flex: 1,
                background: 'rgba(200,212,228,0.04)',
                border: '1px solid rgba(200,212,228,0.08)',
                borderRadius: 6,
                padding: '5px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: selectedRequirement ? '#B8D4EE' : '#486080',
                cursor: sealing ? 'wait' : 'pointer',
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
          </label>
        </div>
      )}

      {/* Bottom bar: file + seal button */}
      <div className="seal-bottom-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid rgba(200,212,228,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={sealing}
            style={{
              background: 'none',
              border: 'none',
              cursor: sealing ? 'wait' : 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#486080',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#C8D4E0' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#486080' }}
          >
            {/* Paperclip icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 7.5L7.5 13.5C6.12 14.88 3.88 14.88 2.5 13.5C1.12 12.12 1.12 9.88 2.5 8.5L9.5 1.5C10.33 0.67 11.67 0.67 12.5 1.5C13.33 2.33 13.33 3.67 12.5 4.5L6.5 10.5C6.22 10.78 5.78 10.78 5.5 10.5C5.22 10.22 5.22 9.78 5.5 9.5L10.5 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.04em',
            }}>
              Attach
            </span>
          </button>

          <input
            ref={fileRef}
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
            style={{ display: 'none' }}
            disabled={sealing}
          />

          {/* Selected file chip */}
          {file && (
            <div className="seal-file-chip" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              background: 'rgba(200,212,228,0.06)',
              border: '1px solid rgba(200,212,228,0.1)',
              borderRadius: 6,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="8" height="8" rx="1" stroke="#486080" strokeWidth="0.8" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#B8D4EE',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#486080', fontSize: 12, padding: 0, lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Seal button */}
        <button
          type="button"
          onClick={handleSeal}
          disabled={sealing || !file}
          style={{
            background: (!file || sealing) ? 'rgba(200,212,228,0.04)' : '#FFFFFF',
            color: (!file || sealing) ? '#284870' : '#02050B',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.04em',
            cursor: (!file || sealing) ? 'default' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: file && !sealing ? '0 0 20px rgba(200,212,228,0.08)' : 'none',
          }}
        >
          {sealing ? 'Sealing...' : 'Seal'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#EF4444',
          padding: '6px 0',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
