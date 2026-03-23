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

  // --- Pre-check: MIME type (label check) ---
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new StorageError(
      `MIME type "${mimeType}" is not allowed`,
      'INVALID_TYPE'
    )
  }

  // --- Pre-check: File magic bytes (content check) ---
  // Don't trust the client-reported MIME type alone. Verify the actual
  // file header matches an allowed format. This prevents uploading
  // executables disguised as PDFs, etc.
  const fileBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
  if (!verifyFileMagicBytes(fileBuffer, mimeType)) {
    throw new StorageError(
      `File content does not match declared MIME type "${mimeType}"`,
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

// ─── File Magic Byte Verification ─────────────────────────────────────────────

/**
 * Known file signatures (magic bytes).
 * We check the first few bytes of the file to verify the content
 * matches the declared MIME type. This prevents disguised uploads.
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
  'image/tiff': [[0x49, 0x49, 0x2A, 0x00], [0x4D, 0x4D, 0x00, 0x2A]], // Little-endian or Big-endian
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]], // PK headers
}

// Types where we can't easily verify magic bytes (text-based formats)
const SKIP_MAGIC_CHECK = new Set([
  'text/plain',
  'text/csv',
  'application/json',
  'application/octet-stream', // Generic binary — can't verify
])

/**
 * Verify that a file's actual content matches its declared MIME type
 * by checking magic bytes (file header signatures).
 *
 * Returns true if:
 *  - The MIME type is in the skip list (text formats, generic binary)
 *  - The file header matches a known signature for the declared type
 *
 * Returns false if:
 *  - The file claims to be a known binary type but the header doesn't match
 */
function verifyFileMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  // Skip check for text-based formats
  if (SKIP_MAGIC_CHECK.has(declaredMime)) return true

  const signatures = MAGIC_BYTES[declaredMime]
  if (!signatures) return true // Unknown type — allow (already passed MIME whitelist)

  // Check if any known signature matches the file header
  return signatures.some(sig =>
    sig.every((byte, i) => i < buffer.length && buffer[i] === byte)
  )
}
