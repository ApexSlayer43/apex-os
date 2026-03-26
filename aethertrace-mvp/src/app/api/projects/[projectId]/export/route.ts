/**
 * POST /api/projects/[projectId]/export — Generate court-ready evidence package
 *
 * Produces a ZIP containing:
 *   1. verification-report.json — Full chain verification + metadata
 *   2. evidence-manifest.json — All items with hashes, timestamps, chain positions
 *   3. custody-log.json — Complete custody event chain
 *   4. All evidence files (downloaded from storage)
 *
 * Creates an 'exported' custody event when package is generated.
 * Only org owners can export (per RLS policies).
 *
 * FORGE invariant: the package must be understandable by a non-technical attorney.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyChain, verifyCustodyChain, GENESIS, computeEventHash } from '@/lib/hash-chain'
import type { ChainItem, CustodyEventItem } from '@/lib/hash-chain'
import { verifyOrgMembership } from '@/lib/auth-guard'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Explicit org membership + owner role check (per FORGE: only org owner can export)
  const membership = await verifyOrgMembership(supabase, user.id, projectId)
  if (!membership.authorized) {
    return NextResponse.json({ error: membership.error || 'Access denied' }, { status: 403 })
  }
  if (membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only org owners can export evidence packages' }, { status: 403 })
  }

  // --- Fetch project ---
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('id, org_id, name, description, status, created_at')
    .eq('id', projectId)
    .single()

  if (projError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // --- Fetch all evidence items in chain order ---
  const { data: items, error: itemsError } = await supabase
    .from('evidence_items')
    .select('*')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 })
  }

  // --- Fetch all custody events in chain order ---
  const { data: events, error: eventsError } = await supabase
    .from('custody_events')
    .select('*')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  if (eventsError) {
    return NextResponse.json({ error: 'Failed to fetch custody events' }, { status: 500 })
  }

  // --- Verify both chains ---
  const chainItems: ChainItem[] = (items || []).map(item => ({
    contentHash: item.content_hash,
    ingestedAt: item.ingested_at,
    chainHash: item.chain_hash,
    chainPosition: item.chain_position,
    previousHash: item.previous_hash || GENESIS,
  }))

  const custodyItems: CustodyEventItem[] = (events || []).map(event => ({
    eventHash: event.event_hash,
    createdAt: event.created_at,
    chainHash: event.chain_hash,
    chainPosition: event.chain_position,
    previousHash: event.previous_hash || GENESIS,
  }))

  const evidenceVerification = verifyChain(chainItems)
  const custodyVerification = verifyCustodyChain(custodyItems)

  // --- Fetch custody plan completeness ---
  let planData = null
  const { data: plan } = await supabase
    .from('custody_plans')
    .select(`
      id, name, status, activated_at,
      evidence_requirements (
        id, category, description, required, status, fulfilled_by, fulfilled_at, sort_order
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (plan) {
    planData = plan
  }

  // --- Build verification report ---
  const now = new Date().toISOString()
  const verificationReport = {
    _notice: 'AetherTrace Evidence Package — Cryptographically Verified Chain of Custody',
    _instructions: 'This package contains cryptographically chained evidence. Each item\'s chain_hash can be independently verified by computing SHA-256(content_hash + ingested_at + previous_hash). The first item\'s previous_hash is "GENESIS".',
    generatedAt: now,
    generatedBy: 'AetherTrace Evidence Custody System',
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.created_at,
    },
    verification: {
      evidenceChain: {
        valid: evidenceVerification.valid,
        itemsVerified: evidenceVerification.itemsVerified,
        totalItems: chainItems.length,
        brokenAt: evidenceVerification.brokenAt || null,
      },
      custodyChain: {
        valid: custodyVerification.valid,
        eventsVerified: custodyVerification.itemsVerified,
        totalEvents: custodyItems.length,
        brokenAt: custodyVerification.brokenAt || null,
      },
      overallIntegrity: evidenceVerification.valid && custodyVerification.valid,
    },
    custodyPlan: planData ? {
      name: planData.name,
      status: planData.status,
      requirements: planData.evidence_requirements,
    } : null,
    verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://aethertrace.com'}/api/verify/`,
  }

  // --- Build evidence manifest ---
  const manifest = (items || []).map(item => ({
    id: item.id,
    fileName: item.file_name,
    fileType: item.file_type,
    fileSize: item.file_size,
    contentHash: item.content_hash,
    chainHash: item.chain_hash,
    chainPosition: item.chain_position,
    previousHash: item.previous_hash || 'GENESIS',
    capturedAt: item.captured_at,
    timeConfidence: item.time_confidence,
    ingestedAt: item.ingested_at,
    verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://aethertrace.com'}/api/verify/${item.chain_hash}`,
  }))

  // --- Build custody log ---
  const custodyLog = (events || []).map(event => ({
    id: event.id,
    eventType: event.event_type,
    evidenceItemId: event.evidence_item_id,
    actorId: event.actor_id,
    eventHash: event.event_hash,
    chainHash: event.chain_hash,
    chainPosition: event.chain_position,
    previousHash: event.previous_hash || 'GENESIS',
    eventData: event.event_data,
    createdAt: event.created_at,
  }))

  // --- Create ZIP archive ---
  const archive = archiver('zip', { zlib: { level: 9 } })
  const passThrough = new PassThrough()
  archive.pipe(passThrough)

  // Add JSON reports
  archive.append(JSON.stringify(verificationReport, null, 2), {
    name: 'verification-report.json',
  })
  archive.append(JSON.stringify(manifest, null, 2), {
    name: 'evidence-manifest.json',
  })
  archive.append(JSON.stringify(custodyLog, null, 2), {
    name: 'custody-log.json',
  })

  // Add a human-readable README
  const readme = `AETHERTRACE EVIDENCE PACKAGE
============================
Project: ${project.name}
Generated: ${now}
Evidence Items: ${(items || []).length}
Custody Events: ${(events || []).length}
Chain Integrity: ${evidenceVerification.valid && custodyVerification.valid ? 'VERIFIED' : 'BROKEN'}

HOW TO VERIFY
-------------
Each evidence item has a chain_hash computed as:
  SHA-256(content_hash + ingested_at + previous_hash)

The first item's previous_hash is the string "GENESIS".

To verify any individual item, visit:
  ${process.env.NEXT_PUBLIC_APP_URL || 'https://aethertrace.com'}/api/verify/{chain_hash}

FILES IN THIS PACKAGE
---------------------
- verification-report.json : Full verification report with chain status
- evidence-manifest.json   : All evidence items with hashes and timestamps
- custody-log.json         : Complete chain of custody event log
- evidence/                : Original evidence files
- README.txt               : This file

This package was generated by AetherTrace Evidence Custody System.
AetherTrace cannot modify evidence after ingestion.
`
  archive.append(readme, { name: 'README.txt' })

  // Download and add each evidence file
  for (const item of items || []) {
    try {
      const { data: fileData } = await supabase.storage
        .from('evidence-files')
        .download(item.file_path)

      if (fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        archive.append(buffer, {
          name: `evidence/${item.chain_position.toString().padStart(4, '0')}_${item.file_name}`,
        })
      }
    } catch (err) {
      console.error(`Failed to download evidence file ${item.id}:`, err)
      // Continue — include what we can
    }
  }

  await archive.finalize()

  // --- C1 FIX: Record the export as a custody event via atomic RPC ---
  // Previously did a separate SELECT + INSERT which could race with concurrent events.
  // Now uses append_custody_event RPC for atomic chain linking.
  const eventData = {
    action: 'exported',
    project_id: projectId,
    items_count: (items || []).length,
    events_count: (events || []).length,
    chain_valid: evidenceVerification.valid && custodyVerification.valid,
    exported_by: user.id,
  }

  const eventHash = computeEventHash(eventData)

  await supabase.rpc('append_custody_event', {
    p_project_id: projectId,
    p_evidence_item_id: null,
    p_actor_id: user.id,
    p_event_type: 'exported',
    p_event_data: eventData,
    p_event_hash: eventHash,
  })

  // --- Also record in evidence_packages table ---
  // Schema: project_id, generated_by, package_hash, file_path, evidence_count,
  //         custody_event_count, plan_completeness, chain_valid, generated_at
  await supabase
    .from('evidence_packages')
    .insert({
      project_id: projectId,
      generated_by: user.id,
      package_hash: eventChainHash,
      file_path: `exports/${projectId}/${now}`,
      evidence_count: (items || []).length,
      custody_event_count: (events || []).length,
      plan_completeness: planData ? `${planData.evidence_requirements?.filter((r: { required: boolean; status: string }) => r.required && r.status === 'fulfilled').length || 0}/${planData.evidence_requirements?.filter((r: { required: boolean }) => r.required).length || 0}` : null,
      chain_valid: evidenceVerification.valid && custodyVerification.valid,
      generated_at: now,
    })

  // --- Stream the ZIP response ---
  const chunks: Uint8Array[] = []
  for await (const chunk of passThrough) {
    chunks.push(chunk as Uint8Array)
  }
  const zipBuffer = Buffer.concat(chunks)

  const safeName = project.name.replace(/[^a-zA-Z0-9-_]/g, '_')

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="AetherTrace_${safeName}_${new Date().toISOString().split('T')[0]}.zip"`,
      'Content-Length': zipBuffer.length.toString(),
    },
  })
}
