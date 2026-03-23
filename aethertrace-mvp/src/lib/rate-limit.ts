/**
 * Rate Limiting — In-memory token bucket per IP
 *
 * For MVP this uses an in-memory Map. In production with multiple
 * Vercel serverless instances, upgrade to Vercel KV or Upstash Redis.
 *
 * Three tiers:
 * - STRICT:  10 req/min  — file uploads, auth attempts
 * - NORMAL:  60 req/min  — authenticated API calls
 * - PUBLIC: 120 req/min  — public verification endpoint
 */

import { NextRequest, NextResponse } from 'next/server'

interface TokenBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, TokenBucket>()

// Clean stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
const STALE_THRESHOLD = 10 * 60 * 1000

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > STALE_THRESHOLD) {
      buckets.delete(key)
    }
  }
}

export type RateLimitTier = 'strict' | 'normal' | 'public'

const TIER_CONFIG: Record<RateLimitTier, { maxTokens: number; refillRate: number }> = {
  strict:  { maxTokens: 10,  refillRate: 10 / 60 },   // 10 per minute
  normal:  { maxTokens: 60,  refillRate: 60 / 60 },   // 60 per minute
  public:  { maxTokens: 120, refillRate: 120 / 60 },   // 120 per minute
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check rate limit for a request. Returns null if allowed, or a 429 response if denied.
 *
 * Usage in an API route:
 *   const limited = rateLimit(request, 'strict')
 *   if (limited) return limited
 */
export function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'normal'
): NextResponse | null {
  cleanup()

  const ip = getClientIp(request)
  const key = `${tier}:${ip}`
  const config = TIER_CONFIG[tier]
  const now = Date.now()

  let bucket = buckets.get(key)

  if (!bucket) {
    bucket = { tokens: config.maxTokens - 1, lastRefill: now }
    buckets.set(key, bucket)
    return null // First request always passes
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000 // seconds
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + elapsed * config.refillRate)
  bucket.lastRefill = now

  if (bucket.tokens < 1) {
    const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate)
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxTokens.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  bucket.tokens -= 1
  return null
}
