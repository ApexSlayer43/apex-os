/**
 * 404 Not Found Page
 * Dark brand aesthetic — matches AetherTrace design system
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(126,184,247,0.03)_0%,_transparent_60%)]" />

      <div className="relative z-10 text-center max-w-md">
        {/* Error code */}
        <p
          className="text-[rgba(126,184,247,0.3)] text-sm tracking-[0.3em] uppercase mb-6"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          404 · not found
        </p>

        {/* Heading */}
        <h1
          className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Page not found
        </h1>

        {/* Body */}
        <p
          className="text-sm leading-relaxed mb-10"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-slo)',
            fontSize: 12,
          }}
        >
          The requested resource does not exist in the custody chain.
          <br />
          Verify the URL or return to the dashboard.
        </p>

        {/* Link back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm
            border transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-mono)',
            borderColor: 'var(--color-rim)',
            color: 'var(--color-glow)',
            background: 'rgba(126,184,247,0.05)',
          }}
        >
          <span>&larr;</span>
          <span>Return to dashboard</span>
        </Link>
      </div>
    </div>
  )
}
