/**
 * Project Detail Page
 * Shows evidence chain, upload interface, verification status.
 * Trust Fortress: chain hashes displayed in mono, verified states in emerald.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EvidenceUploader } from '@/components/evidence-uploader'
import { VerificationBadge } from '@/components/verification-badge'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id, name, description, status, created_at')
    .eq('id', projectId)
    .single()

  if (!project) redirect('/dashboard')

  // Fetch evidence items in chain order
  const { data: items } = await supabase
    .from('evidence_items')
    .select(`
      id, file_name, file_type, file_size, content_hash,
      chain_hash, chain_position, previous_hash,
      captured_at, time_confidence, ingested_at
    `)
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  // Fetch custody events
  const { data: events } = await supabase
    .from('custody_events')
    .select('id, event_type, actor_id, created_at, event_data')
    .eq('project_id', projectId)
    .order('chain_position', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-primary transition-colors">
              &larr; Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-semibold text-primary tracking-tight">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <VerificationBadge projectId={projectId} />
            <ExportButton projectId={projectId} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload section */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-primary mb-4">Capture evidence</h2>
          <EvidenceUploader projectId={projectId} />
        </div>

        {/* Evidence chain */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-primary mb-4">
            Evidence chain ({(items || []).length} items)
          </h2>

          {(items || []).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No evidence captured yet. Upload your first file above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(items || []).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-lg px-6 py-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{item.chain_position}
                        </span>
                        <h3 className="text-sm font-medium text-primary truncate">
                          {item.file_name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                        <div className="text-xs text-slate-500">
                          <span className="text-slate-400">Content hash: </span>
                          <span className="font-mono">{item.content_hash.slice(0, 16)}...</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="text-slate-400">Chain hash: </span>
                          <span className="font-mono">{item.chain_hash.slice(0, 16)}...</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="text-slate-400">Ingested: </span>
                          {new Date(item.ingested_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="text-slate-400">Size: </span>
                          {formatFileSize(item.file_size)}
                        </div>
                      </div>
                    </div>
                    {/* Chain link visualization */}
                    <div className="ml-4 flex flex-col items-center">
                      {idx > 0 && <div className="w-px h-3 bg-emerald-300" />}
                      <div className="w-3 h-3 rounded-full bg-verified border-2 border-emerald-200" />
                      {idx < (items || []).length - 1 && <div className="w-px h-3 bg-emerald-300" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custody log */}
        <div>
          <h2 className="text-base font-medium text-primary mb-4">
            Custody log ({(events || []).length} events)
          </h2>

          {(events || []).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg px-6 py-8 text-center">
              <p className="text-sm text-slate-500">No custody events recorded.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {(events || []).map(event => (
                <div key={event.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.event_type === 'ingested' ? 'bg-emerald-50 text-emerald-700' :
                      event.event_type === 'exported' ? 'bg-blue-50 text-blue-700' :
                      event.event_type === 'verified' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {event.event_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(event.event_data as Record<string, string>)?.file_name || ''}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ExportButton({ projectId }: { projectId: string }) {
  return (
    <form action={async () => {
      'use server'
      // Export is handled client-side via fetch to get the ZIP
    }}>
      <a
        href={`/api/projects/${projectId}/export`}
        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-1.5
          rounded-md text-sm font-medium text-primary hover:bg-slate-50 transition-colors"
      >
        Export package
      </a>
    </form>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
