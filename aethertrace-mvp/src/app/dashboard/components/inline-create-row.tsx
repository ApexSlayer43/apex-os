'use client'

import { useRef, useState, useTransition } from 'react'
import { createProject } from '../actions'

export function InlineCreateRow({ orgId }: { orgId: string }) {
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
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '0 52px', height: 80,
      background: '#04090F',
      borderLeft: '2px solid rgba(126,184,247,0.12)',
      borderTop: '1px dashed rgba(22,48,88,0.3)',
      gap: 20,
    }}>
      <svg width="15" height="13" viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M0 2C0 .9.9 0 2 0h4l2 2h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H2C.9 14 0 13.1 0 12V2Z" fill="#7EB8F7" opacity="0.14" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Name new project…"
        disabled={isPending}
        maxLength={120}
        autoComplete="off"
        spellCheck={false}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 14,
          color: value ? '#B8D4EE' : '#163058',
          caretColor: '#7EB8F7',
          opacity: isPending ? 0.5 : 1,
          transition: 'color 0.15s', letterSpacing: '0.01em',
        }}
        onFocus={(e) => { e.target.style.color = value ? '#B8D4EE' : '#284870' }}
        onBlur={(e) => { if (!value) e.target.style.color = '#163058' }}
      />
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 8,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: error ? '#EF4444' : '#163058', flexShrink: 0,
        transition: 'color 0.15s',
      }}>
        {error ?? (isPending ? 'Creating…' : '↵ to seal')}
      </div>
    </div>
  )
}
