/**
 * AetherTrace Intelligence API
 * Wraps Anthropic Claude to provide contextual responses
 * about sealed evidence and custody operations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, projectId } = await req.json()
  if (!message || !projectId) {
    return NextResponse.json({ error: 'Message and project ID required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Intelligence service not configured' }, { status: 503 })
  }

  // Fetch project context
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single()

  // Fetch recent evidence for context
  const { data: recentEvidence } = await supabase
    .from('evidence_items')
    .select('file_name, description, ingested_at, content_hash')
    .eq('project_id', projectId)
    .order('ingested_at', { ascending: false })
    .limit(10)

  const evidenceContext = (recentEvidence ?? []).map(e =>
    `- ${e.file_name}: ${e.description || 'No description'} (sealed ${new Date(e.ingested_at).toLocaleDateString()})`
  ).join('\n')

  const systemPrompt = `You are AetherTrace Intelligence — a neutral evidence custody assistant. You help construction professionals understand and manage their sealed evidence.

Project: ${project?.name || 'Unknown'}
Recent sealed evidence:
${evidenceContext || 'No evidence sealed yet.'}

Rules:
- You are a NEUTRAL trustee. Never interpret evidence or make judgments about disputes.
- Help users understand what has been sealed, when, and its chain integrity.
- Suggest what evidence should be sealed next based on construction best practices.
- Be concise and practical. These users are on jobsites.
- Never reveal hash values or internal system details unless asked.
- Refer to the sealing process simply — "sealed" not "cryptographically hashed."
- If asked about disputes or legal matters, remind the user you hold evidence, not opinions.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Intelligence] Anthropic error:', err)
      return NextResponse.json({ error: 'Intelligence service error' }, { status: 502 })
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text || 'No response.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Intelligence] Request failed:', err)
    return NextResponse.json({ error: 'Intelligence service unavailable' }, { status: 500 })
  }
}
