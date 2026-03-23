/**
 * Evidence Uploader — Client component
 * Drag-and-drop or click to upload evidence files.
 * Shows upload progress, content hash after upload.
 */

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UploadedEvidence {
  id: string
  fileName: string
  contentHash: string
  chainHash: string
  chainPosition: number
}

export function EvidenceUploader({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUploaded, setLastUploaded] = useState<UploadedEvidence | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(file: File) {
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('timeConfidence', 'system-generated')

    try {
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setLastUploaded({
        id: data.evidence.id,
        fileName: data.evidence.fileName,
        contentHash: data.evidence.contentHash,
        chainHash: data.evidence.chainHash,
        chainPosition: data.evidence.chainPosition,
      })

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`bg-white border-2 border-dashed rounded-lg px-6 py-8 text-center cursor-pointer
          transition-colors ${
            dragOver ? 'border-accent bg-emerald-50/30' :
            uploading ? 'border-slate-200 bg-slate-50 cursor-wait' :
            'border-slate-300 hover:border-slate-400'
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <p className="text-sm text-slate-500">Hashing and uploading...</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 font-medium">
              Drop evidence file here, or click to select
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, images, text, CSV, JSON, ZIP — up to 50MB
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Success toast */}
      {lastUploaded && !error && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3">
          <p className="text-sm text-emerald-800 font-medium">
            Evidence captured: {lastUploaded.fileName}
          </p>
          <p className="text-xs font-mono text-emerald-600 mt-1">
            Chain position #{lastUploaded.chainPosition} &middot; Hash: {lastUploaded.chainHash.slice(0, 24)}...
          </p>
        </div>
      )}
    </div>
  )
}
