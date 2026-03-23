/**
 * Evidence File Storage — Write-Once Enforcement
 *
 * Invariant I1: Evidence is immutable after ingestion.
 * Invariant I2: No actor (including AetherTrace) can modify stored evidence.
 *
 * Path convention: {org_id}/{project_id}/{evidence_id}/{original_filename}
 * This ensures unique paths and prevents overwrites.
 *
 * Defense-in-depth:
 *   1. Storage bucket has NO update/delete policies (migration 003)
 *   2. Application layer checks for existing file before upload
 *   3. Path includes evidence_id — guarantees uniqueness per item
 */

import { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'evidence-files'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB — matches bucket config

export interface UploadResult {
  storagePath: string
  fileSize: number
  mimeType: string
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: 'FILE_TOO_LARGE' | 'FILE_EXISTS' | 'UPLOAD_FAILED' | 'INVALID_TYPE'
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/octet-stream',
])

/**
 * Upload evidence file to write-once storage.
 *
 * Path: {orgId}/{projectId}/{evidenceId}/{filename}
 *
 * Pre-checks:
 *   - File size within 50MB limit
 *   - MIME type in allowed list
 *   - No existing file at path (write-once)
 *
 * @throws StorageError if any pre-check fails or upload errors
 */
export async function uploadEvidenceFile(
  supabase: SupabaseClient,
  params: {
    orgId: string
    projectId: string
    evidenceId: string
    file: File | Buffer
    filename: string
    mimeType: string
  }
): Promise<UploadResult> {
  const { orgId, projectId, evidenceId, file, filename, mimeType } = params

  // --- Pre-check: file size ---
  const fileSize = file instanceof File ? file.size : file.length
  if (fileSize > MAX_FILE_SIZE) {
    throw new StorageError(
      `File size ${fileSize} exceeds maximum ${MAX_FILE_SIZE} bytes`,
      'FILE_TOO_LARGE'
    )
  }

  // --- Pre-check: MIME type ---
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new StorageError(
      `MIME type "${mimeType}" is not allowed`,
      'INVALID_TYPE'
    )
  }

  // --- Build storage path ---
  // Sanitize filename: replace non-alphanumeric (except dots, hyphens) with underscores
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-]/g, '_')
  const storagePath = `${orgId}/${projectId}/${evidenceId}/${sanitized}`

  // --- Write-once check: verify path doesn't already exist ---
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(`${orgId}/${projectId}/${evidenceId}`, { limit: 1 })

  if (existing && existing.length > 0) {
    throw new StorageError(
      `Evidence file already exists for item ${evidenceId}. Write-once policy prohibits overwrite.`,
      'FILE_EXISTS'
    )
  }

  // --- Upload ---
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false, // Explicit: never overwrite
    })

  if (error) {
    throw new StorageError(
      `Upload failed: ${error.message}`,
      'UPLOAD_FAILED'
    )
  }

  return {
    storagePath,
    fileSize,
    mimeType,
  }
}

/**
 * Generate a time-limited signed URL for downloading evidence.
 * Default expiry: 1 hour (3600 seconds).
 *
 * Used in evidence package export and dashboard downloads.
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'Unknown error'}`)
  }

  return data.signedUrl
}
