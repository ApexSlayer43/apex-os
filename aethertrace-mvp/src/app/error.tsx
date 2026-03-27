/**
 * Global Error Boundary
 * Dark brand aesthetic — 'use client' required by Next.js
 */

'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AetherTrace Error]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Subtle radial glow — red-shifted for error state */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.03)_0%,_transparent_60%)]" />

      <div className="relative z-10 text-center max-w-md">
        {/* Error label */}
        <p
          className="text-sm tracking-[0.3em] uppercase mb-6"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'rgba(239,68,68,0.5)',
          }}
        >
          error · exception
        </p>

        {/* Heading */}
        <h1
          className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Something went wrong
        </h1>

        {/* Error message */}
        <div
          className="rounded-lg px-4 py-3 mb-8 text-left text-xs leading-relaxed border"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-slo)',
            background: 'rgba(239,68,68,0.04)',
            borderColor: 'rgba(239,68,68,0.12)',
          }}
        >
          <span style={{ color: 'rgba(239,68,68,0.6)' }}>msg:</span>{' '}
          {error.message || 'An unexpected error occurred.'}
          {error.digest && (
            <>
              <br />
              <span style={{ color: 'rgba(239,68,68,0.6)' }}>digest:</span>{' '}
              {error.digest}
            </>
          )}
        </div>

        {/* Retry button */}
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm
            border transition-colors duration-200 cursor-pointer
            hover:bg-[rgba(126,184,247,0.1)]"
          style={{
            fontFamily: 'var(--font-mono)',
            borderColor: 'var(--color-rim)',
            color: 'var(--color-glow)',
            background: 'rgba(126,184,247,0.05)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          <span>Try again</span>
        </button>
      </div>
    </div>
  )
}
