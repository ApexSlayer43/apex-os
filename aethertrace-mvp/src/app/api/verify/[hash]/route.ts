/**
 * GET /api/verify/[hash] — Public verification endpoint
 *
 * NO AUTHENTICATION REQUIRED.
 * Any third party can verify an evidence item's integrity by its chain hash.
 * This is the public URL that makes AetherTrace evidence court-ready.
 *
 * Invariant K3: Verification is independent — any third party can recompute.
 *
 * Returns: verification status, chain position, timestamps, and whether
 * the chain before and after this item is intact.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { computeChainHash, GENESIS } from '@/lib/hash-chain'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  // Rate limit public endpoint (120 req/min per IP)
  const limited = rateLimit(_request, 'public')
  if (limited) return limited

  const { hash } = await params

  if (!hash || hash.length !== 64) {
    return NextResponse.json(
      { error: 'Invalid hash. Must be a 64-character SHA-256 hex string.' },
      { status: 400 }
    )
  }

  // Use admin client — this is a public endpoint, no user auth
  const supabase = createAdminClient()

  // Find the evidence item by chain hash
  const { data: item, error } = await supabase
    .from('evidence_items')
    .select(`
      id, project_id, file_name, file_type, file_size,
      content_hash, chain_hash, chain_position, previous_hash,
      captured_at, time_confidence, ingested_at
    `)
    .eq('chain_hash', hash)
    .single()

  if (error || !item) {
    return NextResponse.json({
      verified: false,
      error: 'No evidence item found with this chain hash.',
      humanVerdict: 'This record does not match what was originally sealed.',
    }, { status: 404 })
  }

  // Recompute the chain hash to verify integrity (K3)
  const previousHash = item.previous_hash || GENESIS
  const recomputed = computeChainHash(
    item.content_hash,
    item.ingested_at,
    previousHash
  )

  const hashValid = recomputed === item.chain_hash

  // Check the surrounding chain for context
  // Get previous item (if exists)
  let previousValid = true
  if (item.chain_position > 1) {
    const { data: prevItem } = await supabase
      .from('evidence_items')
      .select('chain_hash')
      .eq('project_id', item.project_id)
      .eq('chain_position', item.chain_position - 1)
      .single()

    if (!prevItem || prevItem.chain_hash !== previousHash) {
      previousValid = false
    }
  }

  // Get next item (if exists) to confirm forward link
  let nextValid = true
  const { data: nextItem } = await supabase
    .from('evidence_items')
    .select('previous_hash')
    .eq('project_id', item.project_id)
    .eq('chain_position', item.chain_position + 1)
    .single()

  if (nextItem && nextItem.previous_hash !== item.chain_hash) {
    nextValid = false
  }

  return NextResponse.json({
    verified: hashValid && previousValid && nextValid,
    item: {
      fileName: item.file_name,
      fileType: item.file_type,
      fileSize: item.file_size,
      contentHash: item.content_hash,
      chainHash: item.chain_hash,
      chainPosition: item.chain_position,
      capturedAt: item.captured_at,
      timeConfidence: item.time_confidence,
      ingestedAt: item.ingested_at,
    },
    integrity: {
      hashValid,
      previousLinkValid: previousValid,
      nextLinkValid: nextValid,
      recomputedHash: recomputed,
    },
    humanVerdict: (hashValid && previousValid && nextValid)
      ? 'This evidence has not been altered since it was sealed.'
      : 'This record does not match what was originally sealed.',
    verifiedAt: new Date().toISOString(),
  })
}
