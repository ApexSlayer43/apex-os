/**
 * Environment Variable Validation
 *
 * Fails LOUD at startup instead of silently crashing at runtime.
 * Called once from middleware on first request.
 */

/** Vars required for the app to boot (auth session refresh) */
const CRITICAL_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

/** Vars required for specific features — warn but don't block */
const FEATURE_VARS = [
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

  const missingCritical = CRITICAL_VARS.filter(key => !process.env[key])
  const missingFeature = FEATURE_VARS.filter(key => !process.env[key])

  if (missingFeature.length > 0) {
    console.warn(
      `\n[AetherTrace] WARNING: Missing optional environment variables:\n` +
      missingFeature.map(k => `  - ${k}`).join('\n') +
      `\n\nSome features (Stripe, admin) will not work until these are set.\n`
    )
  }

  if (missingCritical.length > 0) {
    console.error(
      `\n[AetherTrace] FATAL: Missing required environment variables:\n` +
      missingCritical.map(k => `  - ${k}`).join('\n') +
      `\n\nCopy .env.local.example to .env.local and fill in all values.\n`
    )
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing env vars: ${missingCritical.join(', ')}`)
    }
  }
}
