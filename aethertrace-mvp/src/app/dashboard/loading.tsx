/**
 * Dashboard Loading State
 * Skeleton with pulsing animation — covers all dashboard sub-routes
 */

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-10 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div
          className="h-8 w-48 rounded"
          style={{ background: 'var(--color-navy2)' }}
        />
        <div
          className="h-4 w-72 rounded"
          style={{ background: 'var(--color-navy)' }}
        />
      </div>

      {/* Stat cards skeleton row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border p-5 space-y-3"
            style={{
              background: 'var(--color-navy)',
              borderColor: 'var(--color-rim)',
            }}
          >
            <div
              className="h-3 w-20 rounded"
              style={{ background: 'var(--color-navy2)' }}
            />
            <div
              className="h-7 w-16 rounded"
              style={{ background: 'var(--color-navy2)' }}
            />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div
        className="rounded-lg border p-6 space-y-4"
        style={{
          background: 'var(--color-navy)',
          borderColor: 'var(--color-rim)',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div
              className="h-4 w-4 rounded-sm shrink-0"
              style={{ background: 'var(--color-navy2)' }}
            />
            <div
              className="h-4 rounded flex-1"
              style={{
                background: 'var(--color-navy2)',
                maxWidth: `${70 - i * 10}%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Pulsing indicator */}
      <div className="flex items-center justify-center pt-4 gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"
          style={{ background: 'var(--color-glow)', opacity: 0.4 }}
        />
        <span
          className="text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-slo)',
            fontSize: 11,
          }}
        >
          loading custody data...
        </span>
      </div>
    </div>
  )
}
