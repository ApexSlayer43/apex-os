/**
 * Verification Badge — Client component
 * Calls the verify API and shows chain integrity status.
 * Emerald = intact. Red = broken. Loading state while checking.
 */

'use client'

import { useState, useEffect } from 'react'

interface VerificationResult {
  overallValid: boolean
  evidenceChain: { valid: boolean; totalItems: number }
  custodyChain: { valid: boolean; totalEvents: number }
}

export function VerificationBadge({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/projects/${projectId}/verify`)
        if (res.ok) {
          const data = await res.json()
          setResult(data.verification)
        }
      } catch {
        // Silently fail — badge is supplementary
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [projectId])

  if (loading) {
    return (
      <span className="text-xs text-slate-400 px-3 py-1 border border-slate-200 rounded-full">
        Verifying...
      </span>
    )
  }

  if (!result) return null

  if (result.overallValid) {
    return (
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
        Chain verified &middot; {result.evidenceChain.totalItems} items
      </span>
    )
  }

  return (
    <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
      Chain integrity issue detected
    </span>
  )
}
