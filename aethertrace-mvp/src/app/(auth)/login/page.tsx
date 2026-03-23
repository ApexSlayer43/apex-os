/**
 * Login Page — Trust Fortress style
 * Clean, institutional, zero friction.
 */

import { LoginForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">
            AetherTrace
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Evidence custody. Cryptographically enforced.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">Sign in</h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{' '}
          <a href="/signup" className="text-accent font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
