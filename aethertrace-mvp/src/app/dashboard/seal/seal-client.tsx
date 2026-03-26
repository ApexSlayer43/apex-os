'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowUp, ChevronDown, X, FileText, Loader2 } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface AttachedFile {
  id: string
  file: File
  preview?: string
  type: string
}

export function SealPageClient({ projects, userName }: { projects: Project[]; userName: string }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] ?? null)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [sealing, setSealing] = useState(false)
  const [sealedMessages, setSealedMessages] = useState<{ text: string; time: string; project: string; files: number }[]>([])
  const [aiReply, setAiReply] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [message])

  // Close project picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowProjectPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles = Array.from(fileList).slice(0, 10 - files.length).map(file => ({
      id: String(Math.random()),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      type: file.type || 'application/octet-stream',
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id)
      if (f?.preview) URL.revokeObjectURL(f.preview)
      return prev.filter(x => x.id !== id)
    })
  }, [])

  const handleQuery = useCallback(async () => {
    if (!message.trim()) return
    setSealing(true)
    setAiReply(null)
    setAiLoading(true)

    const queryText = message
    setMessage('')

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          projectId: selectedProject?.id || projects[0]?.id || '',
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setAiReply(data.reply)
        setSealedMessages(prev => [{
          text: queryText,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          project: selectedProject?.name || 'All projects',
          files: 0,
        }, ...prev])
      } else if (data.error) {
        setAiReply(`Error: ${data.error}`)
      }
    } catch {
      setAiReply('Intelligence service unavailable. Check your connection.')
    }

    setAiLoading(false)
    setSealing(false)
    textareaRef.current?.focus()
  }, [message, selectedProject, projects])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }, [handleQuery])

  const canSend = message.trim() && !sealing

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-40px)] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-[30%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[rgba(126,184,247,0.015)] blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4">
        {/* Orbiting ring — the hero element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <OrbitingRing />
        </motion.div>

        {/* Welcome text */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 400,
            color: '#DCF0FF',
            letterSpacing: '-0.02em',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          Ask about your evidence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: 'rgba(200,212,228,0.3)',
            letterSpacing: '0.04em',
            marginBottom: 36,
            textAlign: 'center',
          }}
        >
          AI reconstruction from sealed evidence. Minutes, not months.
        </motion.p>

        {/* Chat input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <div style={{
            background: 'rgba(20,28,40,0.6)',
            border: '1px solid rgba(200,212,228,0.08)',
            borderRadius: 12,
            backdropFilter: 'blur(4px)',
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column' as const,
            outline: 'none',
          }}>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What happened on Harbor View last week?"
              disabled={sealing}
              className="flex-1 min-h-[90px] w-full p-4 bg-transparent text-[#B8D4EE] text-sm resize-none border-none outline-none placeholder:text-[rgba(200,212,228,0.2)] focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.7 }}
              rows={1}
            />

            {/* File previews */}
            {files.length > 0 && (
              <div className="overflow-x-auto border-t border-[rgba(200,212,228,0.06)] p-3">
                <div className="flex gap-3">
                  {files.map(file => (
                    <div key={file.id} className="relative group bg-[rgba(200,212,228,0.04)] border border-[rgba(200,212,228,0.08)] rounded-lg w-[110px] h-[90px] flex-shrink-0 overflow-hidden">
                      {file.preview ? (
                        <img src={file.preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-2">
                          <FileText className="h-5 w-5 text-[rgba(200,212,228,0.3)] mb-1" />
                          <span className="text-[8px] text-[rgba(200,212,228,0.25)] truncate max-w-full" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {file.file.name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom toolbar — clean: attach + AI label + seal */}
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div style={{ width: 32 }} /> {/* spacer */}

              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10, letterSpacing: '0.06em',
                color: 'rgba(200,212,228,0.15)',
              }}>
                AetherTrace Intelligence
              </span>

              <button
                onClick={handleQuery}
                disabled={!canSend}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                  canSend
                    ? 'bg-[rgba(200,212,228,0.12)] hover:bg-[rgba(200,212,228,0.2)] text-[#C8D4E0]'
                    : 'bg-[rgba(200,212,228,0.04)] text-[rgba(200,212,228,0.15)] cursor-not-allowed'
                }`}
                title="Ask Intelligence"
              >
                {sealing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Pill buttons below chat box — project selector + history toggle */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {/* Project picker pill */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="h-8 px-4 flex items-center gap-2 rounded-full border border-[rgba(200,212,228,0.1)] bg-[rgba(200,212,228,0.03)] text-[rgba(200,212,228,0.4)] hover:text-[rgba(200,212,228,0.6)] hover:border-[rgba(200,212,228,0.2)] transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.04em' }}
              >
                <span className="truncate max-w-[180px]">{selectedProject?.name ?? 'All projects'}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showProjectPicker ? 'rotate-180' : ''}`} />
              </button>

              {showProjectPicker && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[rgba(12,18,28,0.95)] border border-[rgba(200,212,228,0.1)] rounded-lg shadow-xl backdrop-blur-sm z-20 p-1.5 max-h-[240px] overflow-y-auto">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-[rgba(200,212,228,0.06)] text-[#B8D4EE]'
                          : 'text-[rgba(200,212,228,0.4)] hover:bg-[rgba(200,212,228,0.04)] hover:text-[#B8D4EE]'
                      }`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}
                      onClick={() => { setSelectedProject(project); setShowProjectPicker(false) }}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* History pill */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`h-8 px-4 flex items-center gap-1.5 rounded-full border transition-colors ${
                showHistory
                  ? 'border-[rgba(200,212,228,0.2)] bg-[rgba(200,212,228,0.06)] text-[rgba(200,212,228,0.5)]'
                  : 'border-[rgba(200,212,228,0.1)] bg-[rgba(200,212,228,0.03)] text-[rgba(200,212,228,0.3)] hover:text-[rgba(200,212,228,0.5)] hover:border-[rgba(200,212,228,0.2)]'
              }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}
            >
              Query history
            </button>
          </div>
        </motion.div>

        {/* AI Intelligence reply */}
        <AnimatePresence>
          {(aiLoading || aiReply) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mt-5"
            >
              <div className="bg-[rgba(126,184,247,0.03)] border border-[rgba(126,184,247,0.08)] rounded-lg px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#7EB8F7]" style={{ animation: aiLoading ? 'nodePulse 1s ease-in-out infinite' : 'none' }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(126,184,247,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    AetherTrace Intelligence
                  </span>
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-[rgba(200,212,228,0.3)]" />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'rgba(200,212,228,0.3)' }}>Analyzing...</span>
                  </div>
                ) : (
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'rgba(200,212,228,0.5)', lineHeight: 1.7 }}>
                    {aiReply}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Query history panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl mt-6"
            >
              {sealedMessages.length === 0 ? (
                <div className="text-center py-6">
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'rgba(200,212,228,0.2)' }}>
                    No evidence sealed this session yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sealedMessages.map((msg, i) => (
                    <div key={i} className="bg-[rgba(200,212,228,0.03)] border border-[rgba(200,212,228,0.06)] rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(200,212,228,0.25)', letterSpacing: '0.06em' }}>
                          {msg.project}
                        </span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(200,212,228,0.2)' }}>
                          {msg.time} · {msg.files > 0 ? `${msg.files} file${msg.files > 1 ? 's' : ''}` : 'text only'}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'rgba(200,212,228,0.4)', lineHeight: 1.6 }}>
                        {msg.text || '(files only)'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { handleFileSelect(e.target.files); if (e.target) e.target.value = '' }}
      />
    </div>
  )
}

function OrbitingRing() {
  return (
    <div style={{ position: 'relative', width: 320, height: 200 }}>
      {/* Inline keyframes — ensures they load regardless of CSS purging */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbitRing {
          0% { transform: translate(136.9px, -29.1px); }
          2.5% { transform: translate(137.6px, -17.7px); }
          5% { transform: translate(134.9px, -5.9px); }
          7.5% { transform: translate(128.8px, 6.0px); }
          10% { transform: translate(119.6px, 17.8px); }
          12.5% { transform: translate(107.4px, 29.2px); }
          15% { transform: translate(92.6px, 39.9px); }
          17.5% { transform: translate(75.5px, 49.5px); }
          20% { transform: translate(56.6px, 58.0px); }
          22.5% { transform: translate(36.2px, 65.0px); }
          25% { transform: translate(15.0px, 70.4px); }
          27.5% { transform: translate(-6.6px, 74.1px); }
          30% { transform: translate(-28.1px, 76.0px); }
          32.5% { transform: translate(-48.8px, 76.0px); }
          35% { transform: translate(-68.4px, 74.1px); }
          37.5% { transform: translate(-86.2px, 70.4px); }
          40% { transform: translate(-102.0px, 64.9px); }
          42.5% { transform: translate(-115.2px, 57.9px); }
          45% { transform: translate(-125.6px, 49.4px); }
          47.5% { transform: translate(-132.9px, 39.8px); }
          50% { transform: translate(-136.9px, 29.1px); }
          52.5% { transform: translate(-137.6px, 17.7px); }
          55% { transform: translate(-134.9px, 5.9px); }
          57.5% { transform: translate(-128.8px, -6.0px); }
          60% { transform: translate(-119.6px, -17.8px); }
          62.5% { transform: translate(-107.4px, -29.2px); }
          65% { transform: translate(-92.6px, -39.9px); }
          67.5% { transform: translate(-75.5px, -49.5px); }
          70% { transform: translate(-56.6px, -58.0px); }
          72.5% { transform: translate(-36.2px, -65.0px); }
          75% { transform: translate(-15.0px, -70.4px); }
          77.5% { transform: translate(6.6px, -74.1px); }
          80% { transform: translate(28.1px, -76.0px); }
          82.5% { transform: translate(48.8px, -76.0px); }
          85% { transform: translate(68.4px, -74.1px); }
          87.5% { transform: translate(86.2px, -70.4px); }
          90% { transform: translate(102.0px, -64.9px); }
          92.5% { transform: translate(115.2px, -57.9px); }
          95% { transform: translate(125.6px, -49.4px); }
          97.5% { transform: translate(132.9px, -39.8px); }
          100% { transform: translate(136.9px, -29.1px); }
        }
        @keyframes orbitGlow {
          0%,100% { opacity: 0.15; }
          50%     { opacity: 0.35; }
        }
      `}} />

      {/* The static ring — SVG */}
      <svg
        width="320" height="200"
        viewBox="0 0 320 200" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="fOrbit" x="-12%" y="-60%" width="124%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="gOrbit" x1="20" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C8D4E0" stopOpacity="0" />
            <stop offset="12%" stopColor="#C8D4E0" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#DCF0FF" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#DCF0FF" stopOpacity="0.6" />
            <stop offset="88%" stopColor="#C8D4E0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8D4E0" stopOpacity="0" />
          </linearGradient>
          <clipPath id="cpOrbitF"><rect x="0" y="100" width="320" height="100" /></clipPath>
          <clipPath id="cpOrbitB"><rect x="0" y="0" width="320" height="100" /></clipPath>
        </defs>
        {/* Ring back half — dim */}
        <ellipse cx="160" cy="100" rx="140" ry="72" stroke="rgba(200,212,228,0.08)" strokeWidth="1.2" fill="none" transform="rotate(-12 160 100)" clipPath="url(#cpOrbitB)" />
        {/* Ring front half — glowing silver */}
        <ellipse cx="160" cy="100" rx="140" ry="72" stroke="url(#gOrbit)" strokeWidth="1.8" fill="none" transform="rotate(-12 160 100)" clipPath="url(#cpOrbitF)" filter="url(#fOrbit)" />
      </svg>

      {/* Orbiting node — CSS animated, positioned from center */}
      <div style={{
        position: 'absolute',
        left: 160, top: 100,
        width: 0, height: 0,
        animation: 'orbitRing 10s linear infinite',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          left: -12, top: -12,
          width: 24, height: 24,
          borderRadius: '50%',
          background: '#7EB8F7',
          animation: 'orbitGlow 4s ease-in-out infinite',
        }} />
        {/* Core dot */}
        <div style={{
          position: 'absolute',
          left: -4, top: -4,
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#7EB8F7',
        }} />
      </div>
    </div>
  )
}
