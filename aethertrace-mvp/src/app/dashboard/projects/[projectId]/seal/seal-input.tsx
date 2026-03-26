'use client'

/**
 * Seal Input — The Chat Box
 * Text area + file attach + Seal button.
 * Feels like Claude's input: one box, one action.
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function SealInput({ projectId }: { projectId: string }) {
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sealing, setSealing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

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

    try {
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Seal failed')
      }

      // Success — clear inputs and refresh
      setNote('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
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
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        background: 'rgba(200,212,228,0.03)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(200,212,228,0.08)'}`,
        borderRadius: 12,
        padding: '12px 16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onFocus={() => {
        // Handled inline for simplicity
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

      {/* Bottom bar: file + seal button */}
      <div style={{
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
            <div style={{
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
