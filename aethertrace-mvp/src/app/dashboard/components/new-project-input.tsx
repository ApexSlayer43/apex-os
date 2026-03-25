'use client'

import { useRef, useState, useTransition } from 'react'
import { createProject } from '../actions'

export function NewProjectInput({ orgId }: { orgId: string }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const name = value.trim()
    if (!name) return
    setError(null)
    setValue('')
    startTransition(async () => {
      const result = await createProject(orgId, name)
      if (!result.success) {
        setError(result.error)
        setValue(name)
        inputRef.current?.focus()
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, marginTop: 4 }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="New project name…"
        disabled={isPending}
        maxLength={120}
        autoComplete="off"
        spellCheck={false}
        style={{
          background: 'transparent', border: 'none',
          borderBottom: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(22,48,88,0.5)'}`,
          padding: '8px 0',
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 18,
          color: value ? '#B8D4EE' : '#486080',
          width: 220, outline: 'none', letterSpacing: '0.01em',
          transition: 'border-color 0.2s, color 0.2s',
          opacity: isPending ? 0.5 : 1, caretColor: '#7EB8F7',
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderBottomColor = '#7EB8F7'
          e.target.style.color = '#DCF0FF'
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderBottomColor = 'rgba(22,48,88,0.5)'
          if (!value) e.target.style.color = '#486080'
        }}
      />
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 8,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: error ? '#EF4444' : '#284870', transition: 'color 0.15s',
      }}>
        {error ?? (isPending ? 'Creating…' : 'Press ↵ Enter to create')}
      </div>
    </div>
  )
}
