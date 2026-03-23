/**
 * Public Verification Page
 * No login required. Anyone with a chain hash can verify evidence integrity.
 * This is the court-ready URL attorneys use.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { computeChainHash, GENESIS } from '@/lib/hash-chain'

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash } = await params

  if (!hash || hash.length !== 64) {
    return <InvalidHash />
  }

  const supabase = createAdminClient()

  const { data: item } = await supabase
    .from('evidence_items')
    .select(`
      id, file_name, file_type, file_size, content_hash,
      chain_hash, chain_position, previous_hash,
      captured_at, time_confidence, ingested_at
    `)
    .eq('chain_hash', hash)
    .single()

  if (!item) {
    return <NotFound hash={hash} />
  }

  // Recompute chain hash (K3: independent verification)
  const previousHash = item.previous_hash || GENESIS
  const recomputed = computeChainHash(item.content_hash, item.ingested_at, previousHash)
  const isValid = recomputed === item.chain_hash

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">AetherTrace</h1>
          <p className="text-sm text-slate-500 mt-1">Independent Evidence Verification</p>
        </div>

        {/* Verification result */}
        <div className={`border rounded-lg p-8 ${
          isValid
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-red-50/50 border-red-200'
        }`}>
          <div className="text-center mb-6">
            <div className={`text-4xl mb-2 ${isValid ? 'text-verified' : 'text-error'}`}>
              {isValid ? '\u2713' : '\u2717'}
            </div>
            <h2 className={`text-lg font-semibold ${
              isValid ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {isValid ? 'Evidence Integrity Verified' : 'Integrity Check Failed'}
            </h2>
            <p className={`text-sm mt-1 ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>
              {isValid
                ? 'This evidence item has not been altered since ingestion.'
                : 'The chain hash does not match. This evidence may have been tampered with.'}
            </p>
          </div>

          {/* Evidence details */}
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            <Detail label="File" value={item.file_name} />
            <Detail label="Type" value={item.file_type} />
            <Detail label="Size" value={formatSize(item.file_size)} />
            <Detail label="Chain position" value={`#${item.chain_position}`} />
            <Detail label="Captured" value={new Date(item.captured_at).toLocaleString()} />
            <Detail
              label="Time confidence"
              value={item.time_confidence}
            />
            <Detail label="Ingested" value={new Date(item.ingested_at).toLocaleString()} />
            <Detail label="Content hash" value={item.content_hash} mono />
            <Detail label="Chain hash" value={item.chain_hash} mono />
            <Detail label="Previous hash" value={previousHash} mono />
            <Detail label="Recomputed hash" value={recomputed} mono />
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-primary mb-2">How verification works</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Each evidence item&apos;s chain hash is computed as SHA-256(content_hash + ingested_at + previous_hash).
            The first item in any chain uses &ldquo;GENESIS&rdquo; as its previous hash.
            This creates a tamper-evident chain where altering any single item invalidates
            all subsequent hashes. AetherTrace cannot modify evidence after ingestion.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Verified at {new Date().toLocaleString()} &middot; AetherTrace Evidence Custody
        </p>
      </div>
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-4 py-3 flex justify-between items-start gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={`text-xs text-primary text-right break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function InvalidHash() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary mb-2">Invalid Hash</h1>
        <p className="text-sm text-slate-500">A valid SHA-256 hash (64 hex characters) is required.</p>
      </div>
    </div>
  )
}

function NotFound({ hash }: { hash: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-primary mb-2">Not Found</h1>
        <p className="text-sm text-slate-500 mb-4">
          No evidence item matches this chain hash.
        </p>
        <p className="text-xs font-mono text-slate-400 break-all">{hash}</p>
      </div>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
