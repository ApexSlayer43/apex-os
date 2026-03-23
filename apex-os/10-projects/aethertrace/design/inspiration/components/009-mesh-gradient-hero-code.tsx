// SOURCE: 21st.dev — Hero Section with Smooth BG Shader (MeshGradient)
// DEPS: @paper-design/shaders-react
// STACK: React + Tailwind + TypeScript + WebGL mesh gradient
// INSTALL: npm install @paper-design/shaders-react

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  title?: string;
  highlightText?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  // ── Gradient controls ──────────────────────────────────────
  colors?: string[];       // 3–6 hex colors blended in the mesh
  distortion?: number;     // 0–2: how much the mesh deforms (0=smooth, 2=chaotic)
  swirl?: number;          // 0–1: rotational swirling amount
  speed?: number;          // animation speed multiplier (0=frozen, 1=fast)
  offsetX?: number;        // horizontal offset of gradient origin
  // ── Style overrides ────────────────────────────────────────
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  maxWidth?: string;
  veilOpacity?: string;    // e.g. "bg-white/20 dark:bg-black/25" — legibility veil
  fontFamily?: string;
  fontWeight?: number;
}

export function HeroSection({
  title = "Intelligent AI Agents for",
  highlightText = "Smart Brands",
  description = "Transform your brand and evolve it through AI-driven brand guidelines and always up-to-date core components.",
  buttonText = "Join Waitlist",
  onButtonClick,
  colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-white/20 dark:bg-black/25",
  fontFamily = "Satoshi, sans-serif",
  fontWeight = 500,
}: HeroSectionProps) {
  // ── SSR guard ──────────────────────────────────────────────────────────────
  // MeshGradient uses WebGL — must not render on server (window is undefined)
  // mounted gate prevents hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setMounted(true);
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section
      className={`relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center ${className}`}
    >
      {/* ── WebGL mesh gradient — fixed to viewport, behind all content ── */}
      <div className="fixed inset-0 w-screen h-screen">
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}      // 0 = no grain overlay in the gradient itself
              grainOverlay={0}    // 0 = no full-screen grain layer
              speed={speed}
              offsetX={offsetX}
            />
            {/* Legibility veil — thin white/black overlay to tone down gradient brightness */}
            <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
          </>
        )}
      </div>

      {/* ── Foreground content ─────────────────────────────────────────────── */}
      <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full`}>
        <div className="text-center">
          <h1
            className={`font-bold text-foreground text-balance text-4xl sm:text-5xl md:text-6xl xl:text-[80px] leading-tight xl:leading-[1.1] mb-6 lg:text-7xl ${titleClassName}`}
            style={{ fontFamily, fontWeight }}
          >
            {title}{" "}
            <span className="text-primary">{highlightText}</span>
          </h1>

          <p
            className={`text-lg sm:text-xl text-white text-pretty max-w-2xl mx-auto leading-relaxed mb-10 px-4 ${descriptionClassName}`}
          >
            {description}
          </p>

          {/* Thick-border pill CTA */}
          <button
            onClick={onButtonClick}
            className={`px-6 py-4 sm:px-8 sm:py-6 rounded-full border-4 bg-[rgba(63,63,63,1)] border-card text-sm sm:text-base text-white hover:bg-[rgba(63,63,63,0.9)] transition-colors ${buttonClassName}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*
// Default (pastel teal/peach palette, moderate animation)
<HeroSection />

// Custom content
<HeroSection
  title="Your Evidence."
  highlightText="Cryptographically Sealed."
  description="AetherTrace transforms raw events into mathematically unalterable records — before disputes begin."
  buttonText="Request Access"
/>

// Dark palette — charcoal/indigo/electric
<HeroSection
  colors={["#0a0a0f", "#1a1a3e", "#2d1b69", "#0d2137", "#1e3a5f", "#0f1729"]}
  distortion={0.5}
  swirl={0.3}
  speed={0.2}
  veilOpacity="bg-black/40"
/>

// High energy / chaotic
<HeroSection
  distortion={1.8}
  swirl={0.9}
  speed={1.5}
  colors={["#ff2d55", "#ff6b00", "#ffcc00", "#00c7ff", "#5856d6", "#ff375f"]}
/>

// Slow, meditative
<HeroSection
  distortion={0.3}
  swirl={0.1}
  speed={0.1}
  colors={["#1a1a2e", "#16213e", "#0f3460", "#533483", "#2c003e", "#000000"]}
  veilOpacity="bg-black/50"
/>

// AetherTrace palette — dark steel + electric teal
<HeroSection
  colors={["#060b14", "#0d1f35", "#0a2540", "#1a3a5c", "#0e7c7b", "#14b8b7"]}
  distortion={0.6}
  swirl={0.4}
  speed={0.25}
  veilOpacity="bg-black/35"
  title="Evidence Custody."
  highlightText="Mathematically Enforced."
/>
*/
