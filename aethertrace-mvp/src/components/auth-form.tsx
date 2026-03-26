/**
 * Auth Forms — Login and Signup
 * Client components for Supabase auth.
 * Dark void + silver. Framer Motion transitions.
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(200,212,228,0.04)',
  border: '1px solid rgba(200,212,228,0.1)',
  borderRadius: 8,
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: '#B8D4EE',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  caretColor: '#C8D4E0',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#486080',
  marginBottom: 6,
}

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
    <motion.form onSubmit={handleSubmit} {...fadeIn}>
      {error && <ErrorBanner message={error} />}

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="email" style={labelStyle}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.25)'
            e.target.style.boxShadow = '0 0 16px rgba(200,212,228,0.04)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.25)'
            e.target.style.boxShadow = '0 0 16px rgba(200,212,228,0.04)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.01, boxShadow: '0 0 30px rgba(200,212,228,0.1)' } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#FFFFFF',
          color: '#02050B',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'opacity 0.2s',
          boxShadow: '0 0 20px rgba(200,212,228,0.06)',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </motion.button>
    </motion.form>
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

    if (authData.user && !authData.session) {
      setSuccess(true)
      setLoading(false)
      return
    }

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        style={{ textAlign: 'center', padding: '16px 0' }}
      >
        {/* Checkmark */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#10B981">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          color: '#DCF0FF',
          marginBottom: 12,
        }}>
          Check your email
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: '#486080',
          lineHeight: 1.7,
        }}>
          We sent a confirmation link to{' '}
          <strong style={{ color: '#B8D4EE' }}>{email}</strong>.
          Click it to activate your account.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.form onSubmit={handleSubmit} {...fadeIn}>
      {error && <ErrorBanner message={error} />}

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="orgName" style={labelStyle}>Company name</label>
        <input
          id="orgName"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          placeholder="Acme Construction LLC"
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.25)'
            e.target.style.boxShadow = '0 0 16px rgba(200,212,228,0.04)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="signupEmail" style={labelStyle}>Email</label>
        <input
          id="signupEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.25)'
            e.target.style.boxShadow = '0 0 16px rgba(200,212,228,0.04)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label htmlFor="signupPassword" style={labelStyle}>Password</label>
        <input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="Minimum 8 characters"
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.25)'
            e.target.style.boxShadow = '0 0 16px rgba(200,212,228,0.04)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200,212,228,0.1)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.01, boxShadow: '0 0 30px rgba(200,212,228,0.1)' } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#FFFFFF',
          color: '#02050B',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'opacity 0.2s',
          boxShadow: '0 0 20px rgba(200,212,228,0.06)',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </motion.button>
    </motion.form>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginBottom: 20,
        padding: '10px 14px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: '#EF4444',
        lineHeight: 1.5,
      }}
    >
      {message}
    </motion.div>
  )
}
