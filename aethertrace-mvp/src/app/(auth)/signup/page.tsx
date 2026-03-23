/**
 * Signup Page — Trust Fortress style
 */

import { SignupForm } from '@/components/auth-form'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">
            AetherTrace
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Evidence custody. Cryptographically enforced.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">Create account</h2>
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="text-accent font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
