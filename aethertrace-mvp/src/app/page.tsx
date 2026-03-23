/**
 * Landing Page — AetherTrace
 * Trust Fortress: institutional, zero decoration, the product speaks.
 */

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-primary tracking-tight">AetherTrace</h1>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-slate-500 hover:text-primary transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-white px-4 py-1.5 rounded-md text-sm font-medium
                hover:bg-slate-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-semibold text-primary tracking-tight leading-tight">
          Prove what happened.
          <br />
          When it happened.
          <br />
          Whether the record was altered.
        </h2>
        <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto">
          AetherTrace is cryptographically enforced evidence custody.
          Every file gets a SHA-256 hash, an immutable timestamp, and a
          tamper-evident chain. No one — including us — can modify your evidence.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-primary text-white px-6 py-3 rounded-md text-sm font-medium
              hover:bg-slate-700 transition-colors"
          >
            Start capturing evidence
          </Link>
          <Link
            href="/pricing"
            className="bg-white border border-slate-200 text-primary px-6 py-3 rounded-md text-sm font-medium
              hover:bg-slate-50 transition-colors"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl font-semibold text-primary text-center mb-12">
            How AetherTrace works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Upload evidence"
              description="Documents, photos, logs, notes — any file becomes cryptographically sealed the moment you upload it."
            />
            <Step
              number="2"
              title="Chain is built"
              description="SHA-256 content hash, immutable timestamp, and a chain link to every previous item. Tamper with one, and the entire chain breaks."
            />
            <Step
              number="3"
              title="Verify independently"
              description="Anyone with a chain hash can verify integrity. No account needed. Court-ready evidence packages export in one click."
            />
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h3 className="text-xl font-semibold text-primary mb-4">
          The structural flaw in construction
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          The party that performs the work controls the evidence of that work&apos;s quality.
          When disputes arise — and they always do — the subcontractor has no independent
          proof. AetherTrace fixes this by making custody independent of accountability.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 max-w-lg mx-auto text-left">
          <div className="bg-slate-50 rounded-lg px-5 py-4">
            <div className="text-2xl font-semibold text-primary">$5-12B</div>
            <div className="text-xs text-slate-500 mt-1">Annual US construction dispute costs</div>
          </div>
          <div className="bg-slate-50 rounded-lg px-5 py-4">
            <div className="text-2xl font-semibold text-primary">$30K</div>
            <div className="text-xs text-slate-500 mt-1">Average claim a sub loses without proof</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400">
          AetherTrace — Cryptographically enforced evidence custody
        </div>
      </footer>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold
        flex items-center justify-center mx-auto mb-3">
        {number}
      </div>
      <h4 className="text-sm font-semibold text-primary mb-2">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  )
}
