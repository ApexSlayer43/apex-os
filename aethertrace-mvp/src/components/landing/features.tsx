"use client"
// DRILL 2 — AetherTrace Features Bento Grid
// PRISM brief: Component 016 Features Bento Grid → 5 AetherTrace value props
// 6-column responsive bento: 3 equal thirds (top row) + 2 equal halves (bottom row)
// Design system: zinc-950 bg, emerald-500 accent, Inter + IBM Plex Mono
// No shadcn/card dep — raw div cards with identical visual treatment

export function LandingFeatures() {
  return (
    <section className="relative z-10 px-6 pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <p
            className="text-emerald-500 text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Protocol Architecture
          </p>
          <h2
            className="text-[#FAFAFA] font-semibold mb-4"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            One function. Absolute integrity.
          </h2>
          <p
            className="text-[#A1A1AA] text-base max-w-[540px] mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            AetherTrace performs one operation: prove that an event happened,
            when it happened, who produced it, and whether the record has been altered.
          </p>
        </div>

        {/* ── Bento Grid — 6-column responsive ──────────────────────────── */}
        {/* Row 1: [Card 1: 2/6] [Card 2: 2/6] [Card 3: 2/6] */}
        {/* Row 2: [Card 4: 3/6]               [Card 5: 3/6]  */}
        <div className="relative z-10 grid grid-cols-6 gap-3">

          {/* ── Card 1: 100% Immutable — SHA-256 stat card ─────────────── */}
          <div
            className="col-span-full lg:col-span-2 rounded-xl p-6 overflow-hidden relative"
            style={{
              background: "rgba(9, 9, 11, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Double-ring icon container */}
            <div
              className="relative flex items-center justify-center w-12 h-12 rounded-full mb-5"
              style={{ border: "1px solid rgba(16,185,129,0.25)" }}
            >
              {/* Outer ring via pseudo-like element */}
              <div
                className="absolute rounded-full"
                style={{
                  inset: "-8px",
                  border: "1px solid rgba(16,185,129,0.10)",
                }}
              />
              {/* Lock icon — stroke-based SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Large stat */}
            <p
              className="text-[#FAFAFA] font-semibold mb-1"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "2.5rem",
                lineHeight: 1,
              }}
            >
              0
            </p>
            <p
              className="text-[#71717A] text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Undetected Alterations
            </p>

            <h3
              className="text-[#FAFAFA] font-semibold text-lg mb-2"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              100% Immutable
            </h3>
            <p
              className="text-[#71717A] text-sm leading-relaxed"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              SHA-256 sealed on ingestion. The hash is the record.
              Any alteration — even a single bit — produces a different hash
              and breaks every chain link that follows.
            </p>

            {/* Emerald glow accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)",
              }}
            />
          </div>

          {/* ── Card 2: Tamper-Evident Chain ────────────────────────────── */}
          <div
            className="col-span-full sm:col-span-3 lg:col-span-2 rounded-xl p-6 overflow-hidden relative"
            style={{
              background: "rgba(9, 9, 11, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Chain link SVG illustration */}
            <div className="mb-5 flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-1"
                >
                  <div
                    className="rounded-sm"
                    style={{
                      width: i === 4 ? "16px" : "24px",
                      height: "16px",
                      background: i < 4
                        ? `rgba(16,185,129,${0.15 + i * 0.12})`
                        : "rgba(255,255,255,0.06)",
                      border: i < 4
                        ? "1px solid rgba(16,185,129,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  {i < 4 && (
                    <div
                      style={{
                        width: "8px",
                        height: "1px",
                        background: i < 3
                          ? "rgba(16,185,129,0.5)"
                          : "rgba(255,255,255,0.15)",
                      }}
                    />
                  )}
                </div>
              ))}
              {/* Break indicator */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <h3
              className="text-[#FAFAFA] font-semibold text-lg mb-2"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Tamper-Evident by Design
            </h3>
            <p
              className="text-[#71717A] text-sm leading-relaxed"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Every record is hashed with its predecessor.
              Alter anything — the break propagates forward through every
              subsequent link and becomes immediately detectable.
            </p>

            {/* Hash chain preview */}
            <div
              className="mt-5 rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["3a7f2c…e4d1", "9b1e5a…cc82", "f2d8b0…71af"].map((hash, i) => (
                <div key={hash} className="flex items-center gap-2 mb-1 last:mb-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.7)" }}
                  />
                  <span
                    className="text-[#52525B]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px" }}
                  >
                    {hash}
                  </span>
                  {i < 2 && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(82,82,91,0.5)" strokeWidth="2">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Card 3: Sub-second Sealing — Chain health chart ─────────── */}
          <div
            className="col-span-full sm:col-span-3 lg:col-span-2 rounded-xl overflow-hidden relative"
            style={{
              background: "rgba(9, 9, 11, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header content area */}
            <div className="p-6 pb-4">
              <h3
                className="text-[#FAFAFA] font-semibold text-lg mb-1"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Sub-second Sealing
              </h3>
              <p
                className="text-[#71717A] text-sm"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {"< 3ms from upload to sealed. No queue. No wait."}
              </p>
            </div>

            {/* Bleed panel — chart with terminal chrome */}
            <div
              className="relative mt-2 -mb-0 -mr-0 mx-4 mb-4 rounded-xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Three-dot terminal chrome */}
              <div className="absolute left-3 top-2 flex gap-1 z-10">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-2 h-2 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
              <div
                className="pt-7 pb-3 px-3"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(113,113,122,0.8)" }}
              >
                <span style={{ color: "rgba(16,185,129,0.8)" }}>AetherTrace Protocol</span>
                {"  v1.0"}
              </div>

              {/* Custody events sparkline — inline SVG */}
              <svg
                className="w-full"
                style={{ display: "block" }}
                viewBox="0 0 320 80"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chainFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d="M0 70 C20 65 40 50 60 55 C80 60 100 40 120 35 C140 30 160 45 180 30 C200 15 220 25 240 20 C260 15 280 25 320 18 L320 80 L0 80 Z"
                  fill="url(#chainFill)"
                />
                {/* Line */}
                <path
                  d="M0 70 C20 65 40 50 60 55 C80 60 100 40 120 35 C140 30 160 45 180 30 C200 15 220 25 240 20 C260 15 280 25 320 18"
                  fill="none"
                  stroke="rgba(16,185,129,0.8)"
                  strokeWidth="1.5"
                />
                {/* Event dots */}
                {[[60,55],[120,35],[180,30],[240,20],[320,18]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="rgba(16,185,129,0.9)" />
                ))}
              </svg>

              {/* Last sealed label */}
              <div className="px-3 pb-3 flex justify-between items-center">
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(113,113,122,0.6)" }}
                >
                  Last sealed: 4 min ago
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(16,185,129,0.7)" }}
                >
                  {"< 3ms"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Card 4: Defense-Grade Evidence Chain ────────────────────── */}
          <div
            className="col-span-full lg:col-span-3 rounded-xl p-6 overflow-hidden relative"
            style={{
              background: "rgba(9, 9, 11, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-start gap-6">
              <div className="flex-1">
                {/* Shield icon with double ring */}
                <div
                  className="relative flex items-center justify-center w-12 h-12 rounded-full mb-5"
                  style={{ border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{ inset: "-8px", border: "1px solid rgba(16,185,129,0.10)" }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>

                <h3
                  className="text-[#FAFAFA] font-semibold text-lg mb-2"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Defense-Grade Evidence Chain
                </h3>
                <p
                  className="text-[#71717A] text-sm leading-relaxed max-w-[280px]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Cryptographic architecture at every layer.
                  Built for DoD audit standards, construction disputes,
                  and every high-stakes custody scenario in between.
                </p>

                {/* Spec pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {["SHA-256", "Append-Only", "Independently Verifiable", "CMMC-Ready"].map((spec) => (
                    <span
                      key={spec}
                      className="px-2.5 py-1 rounded-md text-[10px]"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        color: "rgba(16,185,129,0.8)",
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Waveform SVG — constant verification activity */}
              <div className="hidden sm:flex flex-col justify-center flex-shrink-0">
                <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-40">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const heights = [20, 35, 15, 45, 25, 55, 20, 40, 30, 50, 15, 35,
                                     40, 25, 50, 20, 45, 30, 55, 25, 40, 20, 35, 15]
                    const h = heights[i] ?? 20
                    return (
                      <rect
                        key={i}
                        x={i * 5 + 1}
                        y={(80 - h) / 2}
                        width="3"
                        height={h}
                        rx="1.5"
                        fill={`rgba(16,185,129,${0.4 + (i % 3) * 0.2})`}
                      />
                    )
                  })}
                </svg>
                <p
                  className="text-center mt-2"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "8px",
                    color: "rgba(113,113,122,0.5)",
                  }}
                >
                  Chain Activity
                </p>
              </div>
            </div>
          </div>

          {/* ── Card 5: Independent Verification / Multi-Party Custody ───── */}
          <div
            className="col-span-full lg:col-span-3 rounded-xl p-6 overflow-hidden relative"
            style={{
              background: "rgba(9, 9, 11, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              className="text-[#FAFAFA] font-semibold text-lg mb-2"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Independent Verification
            </h3>
            <p
              className="text-[#71717A] text-sm leading-relaxed mb-6"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Public verification URL — no login, no account, no trust required.
              Anyone can verify the chain. Any third party. Any attorney.
              Any auditor. Any time.
            </p>

            {/* Three-party verification column — centered vertical line with avatars */}
            <div className="relative flex flex-col gap-5">
              {/* Vertical center line */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />

              {/* Party rows — alternating left/right */}
              {[
                { label: "Subcontractor", role: "Submits Evidence", side: "left", initials: "SC" },
                { label: "Prime Contractor", role: "Cannot Alter", side: "right", initials: "GC" },
                { label: "Third-Party Auditor", role: "Independently Verifies", side: "left", initials: "AU" },
              ].map(({ label, role, side, initials }) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 relative z-10 ${side === "right" ? "flex-row-reverse" : ""}`}
                  style={{ width: "calc(50% + 1.25rem)", marginLeft: side === "right" ? "auto" : undefined }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      border: "3px solid rgba(9,9,11,1)",
                      outline: "1px solid rgba(16,185,129,0.25)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: "rgba(16,185,129,0.9)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className={side === "right" ? "text-right" : ""}>
                    <p
                      className="text-[#FAFAFA] text-xs font-medium"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[#52525B] text-[10px]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification URL badge */}
            <div
              className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.7)" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  color: "rgba(113,113,122,0.7)",
                }}
              >
                aethertrace.io/verify/
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  color: "rgba(16,185,129,0.7)",
                }}
              >
                3a7f2c9e…
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
