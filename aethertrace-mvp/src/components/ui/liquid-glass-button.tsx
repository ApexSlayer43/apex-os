"use client"
// Vault Component 015 — LiquidButton (Glass Morphism CTA)
// Three-layer z-stack: box-shadow rim / SVG backdrop distortion / content

import * as React from "react"

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "glass" | "emerald" | "outline"
  asChild?: boolean
}

export function LiquidButton({
  children,
  className = "",
  size = "lg",
  variant = "glass",
  ...props
}: LiquidButtonProps) {
  const sizeClass = {
    sm:  "h-9 px-5 text-sm",
    md:  "h-11 px-7 text-sm",
    lg:  "h-12 px-8 text-base",
    xl:  "h-14 px-10 text-base",
  }[size]

  const variantClass = {
    glass:   "text-white border border-white/20",
    emerald: "text-white border border-emerald-500/40 bg-emerald-500/10",
    outline: "text-zinc-300 border border-zinc-700 hover:border-zinc-500",
  }[variant]

  return (
    <button
      className={`relative inline-flex items-center justify-center cursor-pointer rounded-full font-medium transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {/* Layer 1: Glass rim via box-shadow — no background, pure shadow treatment */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: [
            "inset 3px 3px 0.5px -3px rgba(255,255,255,0.09)",
            "inset -3px -3px 0.5px -3.5px rgba(255,255,255,0.85)",
            "inset 1px 1px 1px -0.5px rgba(255,255,255,0.6)",
            "inset -1px -1px 1px -0.5px rgba(255,255,255,0.6)",
            "inset 0 0 6px 6px rgba(255,255,255,0.12)",
            "inset 0 0 2px 2px rgba(255,255,255,0.06)",
            "0 0 12px rgba(0,0,0,0.15)",
          ].join(", ")
        }}
      />

      {/* Layer 2: Backdrop distortion — frosted glass effect */}
      <div
        className="absolute inset-0 rounded-full -z-10 overflow-hidden isolate"
        style={{ backdropFilter: 'url("#at-glass-filter") blur(8px)' }}
      />

      {/* Layer 3: Content */}
      <span className="relative z-10 pointer-events-none">{children}</span>

      {/* SVG Glass Filter — inline so it travels with the button */}
      <svg className="hidden absolute">
        <defs>
          <filter id="at-glass-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="50" xChannelSelector="R" yChannelSelector="B" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
            <feComposite in="finalBlur" in2="finalBlur" operator="over" />
          </filter>
        </defs>
      </svg>
    </button>
  )
}
