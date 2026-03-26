/**
 * POST /api/evidence/upload
 *
 * THE critical path of AetherTrace.
 * File -> SHA-256 -> Atomic Chain Link (via Postgres RPC) -> Storage -> Custody Event
 *
 * Invariants enforced:
 * - K2: Content-addressed integrity -- hash derived from file content
 * - L1: Chain ordering is explicit, deterministic, and ATOMIC (no race conditions)
 * - L3: Time is metadata with stated confidence
 * - I1: Evidence is immutable after ingestion
 * - A3: Deterministic -- same file always produces same content hash
 *
 * C1 FIX: The chain tip read-then-write is now atomic via Postgres RPC function
 * `append_evidence_item`. Two concurrent uploads can no longer fork the chain.
 *
 * Request: multipart/form-data
 *   - file: The evidence file (required)
 *   - projectId: UUID of the project (required)
 *   - requirementId: UUID of the evidence requirement (optional)
 *   - capturedAt: ISO 8601 timestamp when evidence was captured (optional)
 *   - timeConfidence: 'user-reported' | 'device-generated' | 'system-generated' (optional)
 *   - metadata: JSON string of additional metadata (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeContentHash, computeEventHash } from '@/lib/hash-chain'
import { uploadEvidenceFile, StorageError } from '@/lib/storage'
import { rateLimit } from '@/lib/rate-limit'
import { checkSubscription } from '@/lib/subscription'
import { sendSealConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // --- Rate limit (strict: 10 req/min) ---
    const limited = rateLimit(request, 'strict')
    if (limited) return limited

    // --- Auth check ---
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // --- Subscription guard (write operation — must be active) ---
    const subscription = await checkSubscription(supabase, user.id)
    if (!subscription.active) {
      const statusCode = 402
      return NextResponse.json(
        { error: subscription.error, code: 'SUBSCRIPTION_REQUIRED' },
        { status: statusCode }
      )
    }

    // --- Parse multipart form data ---
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null
    const requirementId = formData.get('requirementId') as string | null
    const capturedAt = formData.get('capturedAt') as string | null
    const timeConfidence = (formData.get('timeConfidence') as string) || 'system-generated'
    const note = formData.get('note') as string | null
    const metadataRaw = formData.get('metadata') as string | null

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, projectId' },
        { status: 400 }
      )
    }

    // Validate timeConfidence
    const validConfidences = ['user-reported', 'device-generated', 'system-generated']
    if (!validConfidences.includes(timeConfidence)) {
      return NextResponse.json(
        { error: `Invalid timeConfidence. Must be one of: ${validConfidences.join(', ')}` },
        { status: 400 }
      )
    }

    // Parse metadata
    let metadata: Record<string, unknown> = {}
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch {
        return NextResponse.json(
          { error: 'Invalid metadata JSON' },
          { status: 400 }
        )
      }
    }

    // --- Verify project exists AND user belongs to the project's org ---
    // Defense: RLS handles basic access, but we explicitly verify org membership
    // to prevent UUID guessing attacks where RLS might pass if misconfigured.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, org_id, name')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Explicit org membership check (belt + suspenders with RLS)
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      )
    }

    // --- Compute content hash (K2: identity from content) ---
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const contentHash = computeContentHash(fileBuffer)

    // --- Generate evidence item ID (needed for storage path) ---
    const evidenceId = crypto.randomUUID()

    // --- Upload to write-once storage (I1: immutable after ingestion) ---
    let uploadResult
    try {
      uploadResult = await uploadEvidenceFile(supabase, {
        orgId: project.org_id,
        projectId,
        evidenceId,
        file: fileBuffer,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
      })
    } catch (err) {
      if (err instanceof StorageError) {
        const statusCode = err.code === 'FILE_TOO_LARGE' ? 413
          : err.code === 'INVALID_TYPE' ? 415
          : err.code === 'FILE_EXISTS' ? 409
          : 500
        return NextResponse.json(
          { error: err.message, code: err.code },
          { status: statusCode }
        )
      }
      throw err
    }

    // --- C1 FIX: Atomic chain append via Postgres RPC ---
    // The RPC function `append_evidence_item` acquires FOR UPDATE lock on the
    // chain tip, computes chain_position + chain_hash + previous_hash, and
    // inserts — all atomically. No race condition possible.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: evidenceItem, error: insertError } = await supabase
      .rpc('append_evidence_item', {
        p_project_id: projectId,
        p_submitted_by: user.id,
        p_file_path: uploadResult.storagePath,
        p_file_name: file.name,
        p_file_type: file.type || 'application/octet-stream',
        p_file_size: uploadResult.fileSize,
        p_content_hash: contentHash,
        p_requirement_id: requirementId || null,
        p_note: note?.trim() || null,
        p_metadata: metadata,
        p_captured_at: capturedAt || new Date().toISOString(),
        p_time_confidence: timeConfidence,
        p_evidence_id: evidenceId,
      })
      .single() as { data: any; error: any }

    if (insertError) {
      console.error('Evidence insert failed:', insertError)
      return NextResponse.json(
        { error: 'Failed to record evidence item' },
        { status: 500 }
      )
    }

    // --- Create custody event: INGESTED (atomic via RPC) ---
    const eventData = {
      action: 'ingested',
      evidence_item_id: evidenceId,
      content_hash: contentHash,
      file_name: file.name,
      file_size: uploadResult.fileSize,
      submitted_by: user.id,
    }

    // event_hash is computed in Node.js (sorted-key JSON determinism)
    // chain linking is done atomically in Postgres
    const eventHash = computeEventHash(eventData)

    const { error: eventError } = await supabase
      .rpc('append_custody_event', {
        p_project_id: projectId,
        p_evidence_item_id: evidenceId,
        p_actor_id: user.id,
        p_event_type: 'ingested',
        p_event_data: eventData,
        p_event_hash: eventHash,
      })

    if (eventError) {
      console.error('Custody event insert failed:', eventError)
      // Evidence is saved -- custody event failure is logged but not fatal
      // The evidence is still immutable and verifiable
    }

    // Non-blocking: send seal confirmation email
    if (user.email) {
      sendSealConfirmation(
        user.email,
        file.name,
        project.name || projectId,
        evidenceItem.chain_position,
      ).catch(() => {})
    }

    // --- Return the evidence record ---
    return NextResponse.json({
      evidence: {
        id: evidenceItem.id,
        projectId: evidenceItem.project_id,
        fileName: evidenceItem.file_name,
        fileType: evidenceItem.file_type,
        fileSize: evidenceItem.file_size,
        contentHash: evidenceItem.content_hash,
        chainHash: evidenceItem.chain_hash,
        chainPosition: evidenceItem.chain_position,
        note: evidenceItem.note,
        ingestedAt: evidenceItem.ingested_at,
        capturedAt: evidenceItem.captured_at,
        timeConfidence: evidenceItem.time_confidence,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Evidence upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
