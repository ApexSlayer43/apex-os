/**
 * AetherTrace Storage Tests — Write-Once Enforcement
 *
 * Tests for evidence file storage validation logic:
 * - StorageError class and error codes
 * - MIME type allowlist
 * - File size limit constant
 * - Magic byte verification
 * - Filename sanitization
 *
 * Supabase interactions are mocked — these tests verify
 * the pure validation logic and constants.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageError, uploadEvidenceFile, type UploadResult } from './storage'

// ─── Mock Supabase client ─────────────────────────────────────────────────────

function createMockSupabase(overrides: {
  listData?: { name: string }[] | null
  listError?: { message: string } | null
  uploadError?: { message: string } | null
} = {}) {
  return {
    storage: {
      from: () => ({
        list: vi.fn().mockResolvedValue({
          data: overrides.listData ?? null,
          error: overrides.listError ?? null,
        }),
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-path' },
          error: overrides.uploadError ?? null,
        }),
      }),
    },
  } as any
}

// ─── StorageError ─────────────────────────────────────────────────────────────

describe('StorageError', () => {
  it('creates error with FILE_TOO_LARGE code', () => {
    const err = new StorageError('too large', 'FILE_TOO_LARGE')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(StorageError)
    expect(err.message).toBe('too large')
    expect(err.code).toBe('FILE_TOO_LARGE')
    expect(err.name).toBe('StorageError')
  })

  it('creates error with FILE_EXISTS code', () => {
    const err = new StorageError('exists', 'FILE_EXISTS')
    expect(err.code).toBe('FILE_EXISTS')
  })

  it('creates error with UPLOAD_FAILED code', () => {
    const err = new StorageError('failed', 'UPLOAD_FAILED')
    expect(err.code).toBe('UPLOAD_FAILED')
  })

  it('creates error with INVALID_TYPE code', () => {
    const err = new StorageError('bad type', 'INVALID_TYPE')
    expect(err.code).toBe('INVALID_TYPE')
  })
})

// ─── MIME Type Allowlist ──────────────────────────────────────────────────────

describe('ALLOWED_MIME_TYPES (tested via uploadEvidenceFile rejection)', () => {
  const supabase = createMockSupabase()

  const baseParams = {
    orgId: 'org-1',
    projectId: 'proj-1',
    evidenceId: 'ev-1',
    file: Buffer.from('test'),
    filename: 'test.txt',
  }

  it('rejects disallowed MIME type: application/x-executable', async () => {
    await expect(
      uploadEvidenceFile(supabase, { ...baseParams, mimeType: 'application/x-executable' })
    ).rejects.toThrow(StorageError)

    try {
      await uploadEvidenceFile(supabase, { ...baseParams, mimeType: 'application/x-executable' })
    } catch (e) {
      expect((e as StorageError).code).toBe('INVALID_TYPE')
    }
  })

  it('rejects disallowed MIME type: text/html', async () => {
    await expect(
      uploadEvidenceFile(supabase, { ...baseParams, mimeType: 'text/html' })
    ).rejects.toThrow(StorageError)
  })

  const allowedTypes = [
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
  ]

  // For text-based types that skip magic byte check, verify they pass MIME validation
  it.each(['text/plain', 'text/csv', 'application/json', 'application/octet-stream'])(
    'accepts allowed MIME type: %s (text-based, skips magic bytes)',
    async (mimeType) => {
      const mockSupabase = createMockSupabase()
      const result = await uploadEvidenceFile(mockSupabase, {
        ...baseParams,
        mimeType,
      })
      expect(result.mimeType).toBe(mimeType)
    }
  )
})

// ─── MAX_FILE_SIZE ────────────────────────────────────────────────────────────

describe('MAX_FILE_SIZE (50MB limit)', () => {
  it('rejects file exceeding 50MB', async () => {
    const supabase = createMockSupabase()
    const oversizedBuffer = Buffer.alloc(50 * 1024 * 1024 + 1) // 50MB + 1 byte

    await expect(
      uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: oversizedBuffer,
        filename: 'huge.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toThrow(StorageError)

    try {
      await uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: oversizedBuffer,
        filename: 'huge.pdf',
        mimeType: 'application/pdf',
      })
    } catch (e) {
      expect((e as StorageError).code).toBe('FILE_TOO_LARGE')
    }
  })

  it('accepts file at exactly 50MB', async () => {
    // Build a valid PDF-headed buffer at exactly 50MB
    const buf = Buffer.alloc(50 * 1024 * 1024)
    // Write PDF magic bytes at start: %PDF
    buf[0] = 0x25; buf[1] = 0x50; buf[2] = 0x44; buf[3] = 0x46
    const supabase = createMockSupabase()

    const result = await uploadEvidenceFile(supabase, {
      orgId: 'org-1',
      projectId: 'proj-1',
      evidenceId: 'ev-1',
      file: buf,
      filename: 'exactly50mb.pdf',
      mimeType: 'application/pdf',
    })
    expect(result.fileSize).toBe(50 * 1024 * 1024)
  })
})

// ─── Magic Byte Verification ──────────────────────────────────────────────────

describe('File magic byte verification', () => {
  const supabase = createMockSupabase()

  const baseParams = {
    orgId: 'org-1',
    projectId: 'proj-1',
    evidenceId: 'ev-1',
    filename: 'test-file',
  }

  it('accepts JPEG with correct magic bytes (0xFF 0xD8 0xFF)', async () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: jpegBuffer,
      mimeType: 'image/jpeg',
    })
    expect(result.mimeType).toBe('image/jpeg')
  })

  it('rejects JPEG claim with wrong magic bytes', async () => {
    const fakeJpeg = Buffer.from([0x00, 0x00, 0x00, 0x00])
    await expect(
      uploadEvidenceFile(supabase, {
        ...baseParams,
        file: fakeJpeg,
        mimeType: 'image/jpeg',
      })
    ).rejects.toThrow(StorageError)

    try {
      await uploadEvidenceFile(supabase, {
        ...baseParams,
        file: fakeJpeg,
        mimeType: 'image/jpeg',
      })
    } catch (e) {
      expect((e as StorageError).code).toBe('INVALID_TYPE')
    }
  })

  it('accepts PNG with correct magic bytes (0x89 0x50 0x4E 0x47)', async () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: pngBuffer,
      mimeType: 'image/png',
    })
    expect(result.mimeType).toBe('image/png')
  })

  it('rejects PNG claim with wrong magic bytes', async () => {
    const fakePng = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]) // JPEG bytes
    await expect(
      uploadEvidenceFile(supabase, {
        ...baseParams,
        file: fakePng,
        mimeType: 'image/png',
      })
    ).rejects.toThrow(StorageError)
  })

  it('accepts PDF with correct magic bytes (%PDF = 0x25 0x50 0x44 0x46)', async () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: pdfBuffer,
      mimeType: 'application/pdf',
    })
    expect(result.mimeType).toBe('application/pdf')
  })

  it('rejects PDF claim with wrong magic bytes (disguised executable)', async () => {
    // MZ header (Windows executable)
    const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00])
    await expect(
      uploadEvidenceFile(supabase, {
        ...baseParams,
        file: exeBuffer,
        mimeType: 'application/pdf',
      })
    ).rejects.toThrow(StorageError)
  })

  it('accepts ZIP with correct magic bytes (PK)', async () => {
    const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: zipBuffer,
      mimeType: 'application/zip',
    })
    expect(result.mimeType).toBe('application/zip')
  })

  it('accepts WebP with RIFF header', async () => {
    const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: webpBuffer,
      mimeType: 'image/webp',
    })
    expect(result.mimeType).toBe('image/webp')
  })

  it('accepts TIFF little-endian (II)', async () => {
    const tiffBuffer = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x00, 0x00])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: tiffBuffer,
      mimeType: 'image/tiff',
    })
    expect(result.mimeType).toBe('image/tiff')
  })

  it('accepts TIFF big-endian (MM)', async () => {
    const tiffBuffer = Buffer.from([0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00])
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: tiffBuffer,
      mimeType: 'image/tiff',
    })
    expect(result.mimeType).toBe('image/tiff')
  })

  it('skips magic byte check for text/plain', async () => {
    const textBuffer = Buffer.from('Hello, this is plain text.')
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: textBuffer,
      mimeType: 'text/plain',
    })
    expect(result.mimeType).toBe('text/plain')
  })

  it('skips magic byte check for application/json', async () => {
    const jsonBuffer = Buffer.from('{"key": "value"}')
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: jsonBuffer,
      mimeType: 'application/json',
    })
    expect(result.mimeType).toBe('application/json')
  })
})

// ─── Filename Sanitization ────────────────────────────────────────────────────

describe('Filename sanitization', () => {
  const supabase = createMockSupabase()

  const baseParams = {
    orgId: 'org-1',
    projectId: 'proj-1',
    evidenceId: 'ev-1',
    mimeType: 'text/plain',
  }

  it('replaces spaces with underscores', async () => {
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: Buffer.from('test'),
      filename: 'my file name.txt',
    })
    expect(result.storagePath).toContain('my_file_name.txt')
  })

  it('replaces special characters with underscores', async () => {
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: Buffer.from('test'),
      filename: 'report@2026#v1!final.txt',
    })
    expect(result.storagePath).toContain('report_2026_v1_final.txt')
  })

  it('preserves dots, hyphens, and alphanumerics', async () => {
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: Buffer.from('test'),
      filename: 'report-v2.3.txt',
    })
    expect(result.storagePath).toContain('report-v2.3.txt')
  })

  it('replaces path traversal characters', async () => {
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: Buffer.from('test'),
      filename: '../../../etc/passwd',
    })
    // The ../ should be sanitized to __/__/__/
    expect(result.storagePath).not.toContain('../')
  })

  it('builds correct storage path: orgId/projectId/evidenceId/sanitizedFilename', async () => {
    const result = await uploadEvidenceFile(supabase, {
      ...baseParams,
      file: Buffer.from('test'),
      filename: 'evidence.txt',
    })
    expect(result.storagePath).toBe('org-1/proj-1/ev-1/evidence.txt')
  })
})

// ─── Write-Once Enforcement ───────────────────────────────────────────────────

describe('Write-once enforcement', () => {
  it('throws FILE_EXISTS when evidence already stored at path', async () => {
    const supabase = createMockSupabase({
      listData: [{ name: 'existing-file.pdf' }],
    })

    await expect(
      uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: Buffer.from('test'),
        filename: 'test.txt',
        mimeType: 'text/plain',
      })
    ).rejects.toThrow(StorageError)

    try {
      await uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: Buffer.from('test'),
        filename: 'test.txt',
        mimeType: 'text/plain',
      })
    } catch (e) {
      expect((e as StorageError).code).toBe('FILE_EXISTS')
    }
  })
})

// ─── Upload Failure Handling ──────────────────────────────────────────────────

describe('Upload failure handling', () => {
  it('throws UPLOAD_FAILED when Supabase upload errors', async () => {
    const supabase = createMockSupabase({
      uploadError: { message: 'Bucket quota exceeded' },
    })

    await expect(
      uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: Buffer.from('test'),
        filename: 'test.txt',
        mimeType: 'text/plain',
      })
    ).rejects.toThrow(StorageError)

    try {
      await uploadEvidenceFile(supabase, {
        orgId: 'org-1',
        projectId: 'proj-1',
        evidenceId: 'ev-1',
        file: Buffer.from('test'),
        filename: 'test.txt',
        mimeType: 'text/plain',
      })
    } catch (e) {
      expect((e as StorageError).code).toBe('UPLOAD_FAILED')
    }
  })
})
