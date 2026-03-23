/**
 * Environment Variable Validation
 *
 * Fails LOUD at startup instead of silently crashing at runtime.
 * Called once from middleware on first request.
 */

const REQUIRED_SERVER_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STANDARD_PRICE_ID',
  'STRIPE_PROFESSIONAL_PRICE_ID',
] as const

let validated = false

export function validateEnvironment(): void {
  if (validated) return
  validated = true

  const missing = REQUIRED_SERVER_VARS.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error(
      `\n[AetherTrace] FATAL: Missing required environment variables:\n` +
      missing.map(k => `  - ${k}`).join('\n') +
      `\n\nCopy .env.local.example to .env.local and fill in all values.\n`
    )
    // Don't throw in production — log and let the specific route fail gracefully
    // This prevents the entire app from crashing if one optional service is down
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing env vars: ${missing.join(', ')}`)
    }
  }
}
