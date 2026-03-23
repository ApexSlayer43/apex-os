/**
 * Auth Forms — Login and Signup
 * Client components for Supabase auth.
 * Trust Fortress style: clean inputs, minimal decoration, clear states.
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2.5 px-4 rounded-md text-sm font-medium
          hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { org_name: orgName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If email confirmation is required
    if (authData.user && !authData.session) {
      setSuccess(true)
      setLoading(false)
      return
    }

    // If auto-confirmed, create org
    if (authData.session) {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName }),
      })

      if (!res.ok) {
        console.error('Org creation failed after signup')
      }

      router.push('/dashboard')
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-accent text-lg font-medium mb-2">Check your email</div>
        <p className="text-sm text-slate-600">
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 mb-1">
          Company name
        </label>
        <input
          id="orgName"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
          placeholder="Acme Construction LLC"
        />
      </div>

      <div>
        <label htmlFor="signupEmail" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="signupEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="signupPassword" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            placeholder:text-slate-400"
          placeholder="Minimum 8 characters"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2.5 px-4 rounded-md text-sm font-medium
          hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
