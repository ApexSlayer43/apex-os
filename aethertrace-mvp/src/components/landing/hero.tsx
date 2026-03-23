"use client"
// DRILL 1 — AetherTrace Landing Hero
// PRISM brief: Component 015 WebGL Chromatic Shader + LiquidButton
// Design system: zinc-950 bg, emerald-500 accent, Inter 600 headings, IBM Plex Mono labels
// Copy from: AETHERTRACE-UI-PROMPT.md (exact — no changes to voice)

import Link from "next/link"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Shield } from "lucide-react"

export function LandingHero() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B]">

      {/* ── Vault 015: WebGL Chromatic Shader — full-screen atmospheric background */}
      {/* distortion=0.035: slightly lower than default — atmospheric, not aggressive */}
      {/* speed=0.008: slightly slower — communicates permanence, not urgency */}
      <WebGLShader
        distortion={0.035}
        speed={0.008}
        xScale={1.0}
        yScale={0.45}
        className="fixed top-0 left-0 w-full h-full block"
      />

      {/* ── Emerald radial glow — the signature AetherTrace atmospheric effect */}
      {/* Sits above the WebGL shader, below all content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.12), transparent)"
        }}
      />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-[1200px] mx-auto w-full">
        {/* Logo + Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L2 7v6l8 5 8-5V7L10 2z" />
            </svg>
          </span>
          <span
            className="text-[#FAFAFA] font-semibold tracking-tight"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px" }}
          >
            AetherTrace
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Sign in
          </Link>
          <Link href="/signup">
            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black transition-all duration-200 hover:-translate-y-0.5">
              Protect your work
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Content ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-[860px] mx-auto text-center">

          {/* Eyebrow — monospace, emerald, uppercase */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {/* Pulsing chain-intact indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p
              className="text-emerald-500 text-xs tracking-widest uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Evidence Custody for Subcontractors
            </p>
          </div>

          {/* Primary headline — the real pain statement */}
          <h1
            className="text-[#FAFAFA] font-semibold leading-tight mb-6"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              letterSpacing: "-0.025em",
            }}
          >
            You did the work.
            <br />
            You took the photos.
            <br />
            <span className="text-[#A1A1AA]">You still lost the claim.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-[#A1A1AA] text-lg leading-relaxed max-w-[620px] mx-auto mb-10"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            AetherTrace locks every document, photo, and inspection report into a
            cryptographic chain the moment you upload it. Timestamped. Hash-sealed.
            Independently verifiable. No one can alter it. Not even us.
          </p>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <LiquidButton variant="emerald" size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Lock down your evidence
              </LiquidButton>
            </Link>
            <Link href="/pricing">
              <LiquidButton variant="outline" size="lg">
                See the math
              </LiquidButton>
            </Link>
          </div>

          {/* Chain stats — silent social proof */}
          <div className="flex items-center justify-center gap-8 mt-14">
            {[
              { value: "SHA-256", label: "Hash Algorithm" },
              { value: "< 3ms",   label: "Seal Time" },
              { value: "100%",    label: "Tamper-Evident" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-[#FAFAFA] font-semibold text-xl"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {value}
                </p>
                <p
                  className="text-[#71717A] text-xs tracking-widest uppercase mt-1"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Pain Quote Card ─────────────────────────────────────────────────── */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-[720px] mx-auto">
          <div
            className="rounded-xl p-8"
            style={{
              background: "rgba(24, 24, 27, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <blockquote
              className="text-[#A1A1AA] italic text-base leading-relaxed mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              "I had every photo, every daily report. But when the prime disputed the punchlist,
              my phone timestamps weren't enough. I couldn't prove the photos weren't taken after the fact."
            </blockquote>
            <cite
              className="not-italic text-[#71717A] text-xs tracking-wide"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              — Mechanical subcontractor, $42K disputed claim, 2024
            </cite>
          </div>
        </div>
      </section>

    </div>
  )
}
