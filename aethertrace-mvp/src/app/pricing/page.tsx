/**
 * Pricing Page
 * $199/mo Standard (5 projects) and $499/mo Professional (unlimited).
 * No free tier. Payment before custody.
 * Trust Fortress: clean cards, no gimmicks, ROI calculation front and center.
 */

import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-primary tracking-tight">
            AetherTrace
          </Link>
          <Link href="/login" className="text-sm text-slate-500 hover:text-primary transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">
            Evidence custody pricing
          </h1>
          <p className="mt-3 text-slate-600 max-w-lg mx-auto">
            One lost $30K claim pays for 12+ years of AetherTrace at the Standard tier.
            The question isn&apos;t cost — it&apos;s how much you lose without proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Standard */}
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-primary">Standard</h2>
            <p className="text-sm text-slate-500 mt-1">For subcontractors protecting their work</p>

            <div className="mt-6">
              <span className="text-4xl font-semibold text-primary">$199</span>
              <span className="text-slate-500">/mo</span>
            </div>

            <ul className="mt-6 space-y-3">
              <PricingItem>Up to 5 active projects</PricingItem>
              <PricingItem>SHA-256 hash chain on every file</PricingItem>
              <PricingItem>Immutable chain-of-custody ledger</PricingItem>
              <PricingItem>Court-ready evidence packages</PricingItem>
              <PricingItem>Public verification URLs</PricingItem>
              <PricingItem>50MB per evidence file</PricingItem>
            </ul>

            <Link
              href="/signup"
              className="mt-8 block w-full text-center bg-primary text-white py-3 rounded-md
                text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Professional */}
          <div className="bg-white border-2 border-accent rounded-lg p-8 relative">
            <div className="absolute -top-3 right-6 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
              Most popular
            </div>
            <h2 className="text-lg font-semibold text-primary">Professional</h2>
            <p className="text-sm text-slate-500 mt-1">For firms managing multiple projects</p>

            <div className="mt-6">
              <span className="text-4xl font-semibold text-primary">$499</span>
              <span className="text-slate-500">/mo</span>
            </div>

            <ul className="mt-6 space-y-3">
              <PricingItem>Unlimited active projects</PricingItem>
              <PricingItem>Everything in Standard</PricingItem>
              <PricingItem>Priority evidence processing</PricingItem>
              <PricingItem>Team member access</PricingItem>
              <PricingItem>Bulk evidence upload</PricingItem>
              <PricingItem>Dedicated support</PricingItem>
            </ul>

            <Link
              href="/signup"
              className="mt-8 block w-full text-center bg-accent text-white py-3 rounded-md
                text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* ROI section */}
        <div className="mt-16 bg-white border border-slate-200 rounded-lg p-8 max-w-3xl mx-auto">
          <h3 className="text-base font-semibold text-primary mb-4">The math is simple</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold text-primary">$30K</div>
              <div className="text-xs text-slate-500 mt-1">Average disputed claim</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-primary">$2,388</div>
              <div className="text-xs text-slate-500 mt-1">Annual Standard cost</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-accent">12.5x</div>
              <div className="text-xs text-slate-500 mt-1">ROI on one prevented claim</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-600">
      <span className="text-accent mt-0.5 shrink-0">{'\u2713'}</span>
      {children}
    </li>
  )
}
