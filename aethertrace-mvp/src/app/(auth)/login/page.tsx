/**
 * Login Page — 21st.dev panel structure
 * Pill inputs, arrow submit, Google SSO, animated transitions
 * Wired to Supabase auth
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep('password')
  }

  const handleSignIn = async (e: React.FormEvent) => {
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

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="flex w-full flex-col min-h-screen bg-[#02050B] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(126,184,247,0.03)_0%,_transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          {/* Brand mark */}
          <div className="mb-12" style={{ overflow: 'visible', padding: '20px 0' }}>
            <AuthRingMark />
          </div>

          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="text-[2rem] font-light tracking-tight text-white"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                      Sign in to custody
                    </h1>
                    <p className="text-sm text-white/40"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                      Evidence custody. Cryptographically enforced.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Google sign-in */}
                    <button
                      onClick={handleGoogleSignIn}
                      className="backdrop-blur-sm w-full flex items-center justify-center gap-2.5
                        bg-white/5 hover:bg-white/10 text-white border border-white/10
                        rounded-full py-3.5 px-4 transition-colors text-sm"
                    >
                      <span className="text-base font-medium">G</span>
                      <span>Sign in with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-white/30 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>or</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Email input with labeled submit */}
                    <form onSubmit={handleEmailSubmit}>
                      <div className="space-y-2">
                        <label
                          className="block text-left text-white/25 text-[9px] tracking-[0.14em] uppercase pl-5"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent text-white border border-white/10
                              rounded-full py-3.5 px-5 pr-36 focus:outline-none focus:border-white/30
                              text-sm placeholder:text-white/25 transition-colors"
                          />
                          <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/70 h-9
                              flex items-center justify-center gap-1.5 rounded-full bg-white/8
                              hover:bg-white/15 hover:text-white transition-all px-4 text-[10px] tracking-[0.1em] uppercase"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            Continue
                            <span className="text-xs">→</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <p className="text-sm text-white/30 pt-6"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                    No account?{' '}
                    <Link href="/signup" className="text-[#7EB8F7] hover:text-white/70 transition-colors underline underline-offset-4 decoration-[#7EB8F7]/30">
                      Create one
                    </Link>
                  </p>

                  {/* Trust bar */}
                  <div className="flex items-center justify-center gap-4 pt-8"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span className="text-[9px] tracking-[0.08em] text-white/12 uppercase">SHA-256 Encryption</span>
                    <span className="text-white/6">·</span>
                    <span className="text-[9px] tracking-[0.08em] text-white/12 uppercase">Immutable Chain</span>
                    <span className="text-white/6">·</span>
                    <span className="text-[9px] tracking-[0.08em] text-white/12 uppercase">Your Evidence, Your Custody</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="text-[2rem] font-light tracking-tight text-white"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                      Enter your password
                    </h1>
                    <p className="text-sm text-white/40"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                      {email}
                    </p>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-full py-2.5 px-4 border border-red-500/20 bg-red-500/5 text-red-400 text-xs"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password input */}
                  <form onSubmit={handleSignIn}>
                    <div className="relative mb-5">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoFocus
                        className="w-full bg-transparent text-white border border-white/10
                          rounded-full py-3.5 px-5 focus:outline-none focus:border-white/30
                          text-sm placeholder:text-white/25 transition-colors text-center"
                      />
                    </div>

                    <div className="flex w-full gap-3">
                      <motion.button
                        type="button"
                        onClick={() => { setStep('email'); setError(null); setPassword('') }}
                        className="rounded-full bg-white text-black font-medium px-6 py-3
                          hover:bg-white/90 transition-colors w-[30%] text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={loading || !password}
                        className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 text-sm ${
                          password && !loading
                            ? 'bg-white text-black border-transparent hover:bg-white/90 cursor-pointer'
                            : 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'
                        }`}
                        whileHover={password && !loading ? { scale: 1.02 } : {}}
                        whileTap={password && !loading ? { scale: 0.98 } : {}}
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </motion.button>
                    </div>
                  </form>

                  <p className="text-xs text-white/25 pt-4"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
                    No account?{' '}
                    <Link href="/signup" className="text-[#7EB8F7] hover:text-white/60 transition-colors">
                      Create one
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthRingMark() {
  return (
    <div style={{ width: 340, margin: '0 auto' }}>
      <svg
        width="100%"
        viewBox="-20 0 1080 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <filter id="fAg" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fANode" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="gAr" x1="40" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(126,184,247,0)" />
            <stop offset="8%" stopColor="rgba(126,184,247,0.4)" />
            <stop offset="28%" stopColor="rgba(200,220,255,0.7)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="72%" stopColor="rgba(200,220,255,0.7)" />
            <stop offset="92%" stopColor="rgba(126,184,247,0.4)" />
            <stop offset="100%" stopColor="rgba(126,184,247,0)" />
          </linearGradient>
          <clipPath id="cpAf"><rect x="-20" y="155" width="1080" height="225" /></clipPath>
          <clipPath id="cpAb"><rect x="-20" y="0" width="1080" height="155" /></clipPath>
        </defs>

        {/* Wordmark */}
        <text
          x="520" y="200" textAnchor="middle"
          fontFamily="'Bebas Neue', sans-serif"
          fontSize="118" letterSpacing="8"
          fill="#FFFFFF"
          style={{ filter: 'drop-shadow(0 0 30px rgba(200,220,255,0.08))' }}
        >AETHERTRACE</text>

        {/* Ring back */}
        <ellipse
          cx="520" cy="155" rx="440" ry="108"
          stroke="rgba(126,184,247,0.18)" strokeWidth="1.5" fill="none"
          transform="rotate(-12 520 155)" clipPath="url(#cpAb)"
        />

        {/* Ring front */}
        <ellipse
          cx="520" cy="155" rx="440" ry="108"
          stroke="url(#gAr)" strokeWidth="2" fill="none"
          transform="rotate(-12 520 155)"
          clipPath="url(#cpAf)"
          filter="url(#fAg)"
        />

        {/* Custody node */}
        <circle cx="674" cy="227" r="20" fill="#7EB8F7" filter="url(#fANode)" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
        <circle cx="674" cy="227" r="5" fill="#7EB8F7" />
      </svg>
    </div>
  )
}
