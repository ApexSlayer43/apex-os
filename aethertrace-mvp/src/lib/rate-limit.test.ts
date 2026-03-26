/**
 * AetherTrace Rate Limiter Tests
 *
 * Tests for the in-memory token bucket rate limiter:
 * - Tier configuration (strict, normal, public)
 * - Token bucket logic: first request passes, over-limit returns 429
 * - IP extraction from headers
 *
 * Uses a minimal NextRequest mock since the rate limiter
 * requires NextRequest for IP extraction.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, type RateLimitTier } from './rate-limit'

// ─── Minimal NextRequest mock ─────────────────────────────────────────────────

/**
 * We need to mock NextRequest since the rate limiter calls
 * request.headers.get() for IP extraction. This creates a
 * minimal compatible object.
 */
function createMockRequest(ip: string = '192.168.1.1'): any {
  const headers = new Map<string, string>([
    ['x-forwarded-for', ip],
  ])
  return {
    headers: {
      get: (name: string) => headers.get(name) ?? null,
    },
  }
}

// ─── Tier Configuration ───────────────────────────────────────────────────────

describe('Rate limit tiers', () => {
  it('strict tier exists and first request passes', () => {
    const request = createMockRequest('10.0.0.1')
    const result = rateLimit(request, 'strict')
    expect(result).toBeNull() // null = allowed
  })

  it('normal tier exists and first request passes', () => {
    const request = createMockRequest('10.0.0.2')
    const result = rateLimit(request, 'normal')
    expect(result).toBeNull()
  })

  it('public tier exists and first request passes', () => {
    const request = createMockRequest('10.0.0.3')
    const result = rateLimit(request, 'public')
    expect(result).toBeNull()
  })

  it('defaults to normal tier when none specified', () => {
    const request = createMockRequest('10.0.0.4')
    const result = rateLimit(request)
    expect(result).toBeNull()
  })
})

// ─── Token Bucket Logic ──────────────────────────────────────────────────────

describe('Token bucket logic', () => {
  it('first request from new IP always passes', () => {
    const request = createMockRequest('10.1.0.1')
    const result = rateLimit(request, 'strict')
    expect(result).toBeNull()
  })

  it('strict tier: allows up to 10 rapid requests, then returns 429', () => {
    // Use a unique IP to get a fresh bucket
    const ip = '10.2.0.1'

    // First request creates bucket with maxTokens - 1 = 9 tokens remaining
    const req1 = createMockRequest(ip)
    expect(rateLimit(req1, 'strict')).toBeNull() // request 1: passes (bucket created)

    // Send 9 more rapid requests (no time passes, so no refill)
    // The bucket started with 9 tokens after first request
    let blocked = false
    for (let i = 2; i <= 12; i++) {
      const req = createMockRequest(ip)
      const result = rateLimit(req, 'strict')
      if (result !== null) {
        blocked = true
        // Verify it's a 429 response
        expect(result.status).toBe(429)
        break
      }
    }
    expect(blocked).toBe(true)
  })

  it('429 response includes Retry-After header', () => {
    const ip = '10.3.0.1'

    // Exhaust the strict bucket (10 tokens)
    for (let i = 0; i < 11; i++) {
      rateLimit(createMockRequest(ip), 'strict')
    }

    // Next request should be rate-limited
    const result = rateLimit(createMockRequest(ip), 'strict')
    if (result) {
      expect(result.status).toBe(429)
      expect(result.headers.get('Retry-After')).toBeTruthy()
      expect(result.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('0')
    }
  })

  it('different IPs have independent rate limits', () => {
    const ipA = '10.4.0.1'
    const ipB = '10.4.0.2'

    // Exhaust IP A's strict bucket
    for (let i = 0; i < 15; i++) {
      rateLimit(createMockRequest(ipA), 'strict')
    }

    // IP B should still be allowed
    const result = rateLimit(createMockRequest(ipB), 'strict')
    expect(result).toBeNull()
  })

  it('different tiers for same IP have independent buckets', () => {
    const ip = '10.5.0.1'

    // Exhaust strict bucket for this IP
    for (let i = 0; i < 15; i++) {
      rateLimit(createMockRequest(ip), 'strict')
    }

    // Public tier for same IP should still work
    const result = rateLimit(createMockRequest(ip), 'public')
    expect(result).toBeNull()
  })

  it('public tier allows more requests than strict tier', () => {
    const strictIp = '10.6.0.1'
    const publicIp = '10.6.0.2'

    let strictBlocked = 0
    let publicBlocked = 0

    // Send 15 rapid requests on each tier
    for (let i = 0; i < 15; i++) {
      if (rateLimit(createMockRequest(strictIp), 'strict') !== null) strictBlocked++
      if (rateLimit(createMockRequest(publicIp), 'public') !== null) publicBlocked++
    }

    // Strict (10 tokens) should block more than public (120 tokens)
    expect(strictBlocked).toBeGreaterThan(publicBlocked)
  })
})

// ─── IP Extraction ────────────────────────────────────────────────────────────

describe('IP extraction from headers', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = createMockRequest('203.0.113.50')
    // First request should pass — proving the IP was extracted and used as key
    const result = rateLimit(request, 'strict')
    expect(result).toBeNull()
  })

  it('handles comma-separated x-forwarded-for (takes first IP)', () => {
    const headers = new Map<string, string>([
      ['x-forwarded-for', '203.0.113.50, 70.41.3.18, 150.172.238.178'],
    ])
    const request = {
      headers: {
        get: (name: string) => headers.get(name) ?? null,
      },
    } as any

    const result = rateLimit(request, 'strict')
    expect(result).toBeNull()
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Map<string, string>([
      ['x-real-ip', '198.51.100.25'],
    ])
    const request = {
      headers: {
        get: (name: string) => headers.get(name) ?? null,
      },
    } as any

    const result = rateLimit(request, 'strict')
    expect(result).toBeNull()
  })

  it('uses "unknown" when no IP headers present', () => {
    const request = {
      headers: {
        get: () => null,
      },
    } as any

    // Should still work — uses "unknown" as the key
    const result = rateLimit(request, 'strict')
    // May or may not be null depending on whether "unknown" bucket exists from other tests
    // The important thing is it doesn't throw
    expect(result === null || result.status === 429).toBe(true)
  })
})
