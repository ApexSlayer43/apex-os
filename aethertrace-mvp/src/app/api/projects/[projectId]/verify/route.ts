/**
 * GET /api/projects/[projectId]/verify — Verify chain integrity + completeness
 *
 * This is the core verification endpoint. It:
 * 1. Fetches all evidence items for the project in chain order
 * 2. Recomputes every chain hash from genesis to tip (K3: independent verification)
 * 3. Checks custody plan completeness if one exists
 * 4. Returns a comprehensive verification report
 *
 * Invariants:
 * - K3: Any third party can recompute and verify
 * - G1: If verification cannot be guaranteed, fail closed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyChain, verifyCustodyChain, type ChainItem, type CustodyEventItem } from '@/lib/hash-chain'
import { verifyOrgMembership } from '@/lib/auth-guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Explicit org membership check (belt + suspenders with RLS)
  const membership = await verifyOrgMembership(supabase, user.id, projectId)
  if (!membership.authorized) {
    return NextResponse.json({ error: membership.error || 'Access denied' }, { status: 403 })
  }

  // --- Verify evidence chain ---
  const { data: rawItems, error: itemsError } = await supabase
    .from('evidence_items')
    .select('content_hash, ingested_at, chain_hash, chain_position, previous_hash')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: 'Failed to fetch evidence items' }, { status: 500 })
  }

  // Map DB rows to ChainItem format (handling GENESIS as null in DB)
  const chainItems: ChainItem[] = (rawItems || []).map(item => ({
    contentHash: item.content_hash,
    ingestedAt: item.ingested_at,
    chainHash: item.chain_hash,
    chainPosition: item.chain_position,
    previousHash: item.previous_hash || 'GENESIS',
  }))

  const evidenceVerification = verifyChain(chainItems)

  // --- Verify custody event chain ---
  const { data: rawEvents, error: eventsError } = await supabase
    .from('custody_events')
    .select('event_hash, created_at, chain_hash, chain_position, previous_hash')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  if (eventsError) {
    return NextResponse.json({ error: 'Failed to fetch custody events' }, { status: 500 })
  }

  const custodyItems: CustodyEventItem[] = (rawEvents || []).map(event => ({
    eventHash: event.event_hash,
    createdAt: event.created_at,
    chainHash: event.chain_hash,
    chainPosition: event.chain_position,
    previousHash: event.previous_hash || 'GENESIS',
  }))

  const custodyVerification = verifyCustodyChain(custodyItems)

  // --- Check custody plan completeness ---
  let planCompleteness = null
  const { data: plan } = await supabase
    .from('custody_plans')
    .select(`
      id, name, status,
      evidence_requirements (
        id, category, description, required, status, fulfilled_by
      )
    `)
    .eq('project_id', projectId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (plan && plan.evidence_requirements) {
    const reqs = plan.evidence_requirements
    const total = reqs.length
    const requiredReqs = reqs.filter((r: { required: boolean }) => r.required)
    const fulfilledRequired = requiredReqs.filter((r: { status: string }) => r.status === 'fulfilled')
    const fulfilledAll = reqs.filter((r: { status: string }) => r.status === 'fulfilled')

    planCompleteness = {
      planId: plan.id,
      planName: plan.name,
      totalRequirements: total,
      requiredCount: requiredReqs.length,
      fulfilledRequired: fulfilledRequired.length,
      fulfilledTotal: fulfilledAll.length,
      isComplete: fulfilledRequired.length === requiredReqs.length,
      percentage: requiredReqs.length > 0
        ? Math.round((fulfilledRequired.length / requiredReqs.length) * 100)
        : 100,
    }
  }

  // --- Build report ---
  const report = {
    projectId,
    verifiedAt: new Date().toISOString(),
    evidenceChain: {
      ...evidenceVerification,
      totalItems: chainItems.length,
    },
    custodyChain: {
      ...custodyVerification,
      totalEvents: custodyItems.length,
    },
    planCompleteness,
    overallValid: evidenceVerification.valid && custodyVerification.valid,
  }

  return NextResponse.json({ verification: report })
}
