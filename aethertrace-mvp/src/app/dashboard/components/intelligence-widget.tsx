'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function IntelligenceWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId: '' }),
      })

      const data = await res.json()
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.error || 'No response received.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Connection error. Please try again.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AetherTrace Intelligence"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid rgba(126,184,247,0.25)',
          background: 'rgba(2,5,11,0.85)',
          color: '#7EB8F7',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          boxShadow: '0 0 20px rgba(126,184,247,0.15), 0 0 40px rgba(126,184,247,0.05)',
          transition: 'all 0.2s',
          animation: !open ? 'intelligence-pulse 3s ease-in-out infinite' : undefined,
        }}
      >
        {open ? '\u00D7' : '\u2728'}
      </button>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes intelligence-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(126,184,247,0.15), 0 0 40px rgba(126,184,247,0.05); }
          50% { box-shadow: 0 0 24px rgba(126,184,247,0.3), 0 0 48px rgba(126,184,247,0.12); }
        }
      `}</style>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 84,
              right: 24,
              zIndex: 50,
              width: 380,
              height: 500,
              borderRadius: 12,
              border: '1px solid rgba(126,184,247,0.1)',
              background: 'rgba(2,5,11,0.92)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 1px rgba(126,184,247,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(200,212,228,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#7EB8F7',
                    boxShadow: '0 0 8px rgba(126,184,247,0.5)',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(200,212,228,0.5)',
                  }}
                >
                  AetherTrace Intelligence
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close intelligence panel"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(200,212,228,0.3)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                    opacity: 0.3,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{'\u2728'}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'rgba(200,212,228,0.5)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Ask anything about your evidence
                  </span>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#7EB8F7',
                          display: 'inline-block',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          color: 'rgba(126,184,247,0.5)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Intelligence
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      ...(msg.role === 'user'
                        ? {
                            background: 'rgba(126,184,247,0.1)',
                            border: '1px solid rgba(126,184,247,0.15)',
                            color: '#B8D4EE',
                            borderBottomRightRadius: 2,
                          }
                        : {
                            background: 'rgba(200,212,228,0.04)',
                            border: '1px solid rgba(200,212,228,0.06)',
                            color: 'rgba(200,212,228,0.7)',
                            borderBottomLeftRadius: 2,
                          }),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#7EB8F7',
                      display: 'inline-block',
                      animation: 'intelligence-pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'rgba(126,184,247,0.4)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Thinking...
                  </span>
                </div>
              )}
            </div>

            {/* Input area */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(200,212,228,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask anything..."
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: '#B8D4EE',
                    background: 'rgba(200,212,228,0.04)',
                    border: '1px solid rgba(200,212,228,0.08)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(126,184,247,0.25)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(200,212,228,0.08)')}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '8px 12px',
                    background: input.trim() && !loading ? 'rgba(126,184,247,0.1)' : 'rgba(200,212,228,0.03)',
                    border: `1px solid ${input.trim() && !loading ? 'rgba(126,184,247,0.2)' : 'rgba(200,212,228,0.06)'}`,
                    borderRadius: 6,
                    color: input.trim() && !loading ? '#7EB8F7' : 'rgba(200,212,228,0.2)',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
