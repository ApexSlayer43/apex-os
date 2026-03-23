// SOURCE: 21st.dev — Spline Scene + Spotlight Card
// DEPS: @splinetool/react-spline, @splinetool/runtime, framer-motion
// STACK: React + Tailwind + TypeScript + Spline + shadcn/ui
// INSTALL: npm install @splinetool/react-spline @splinetool/runtime framer-motion

// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: /components/ui/spline-scene.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import { Suspense, lazy } from 'react';

// Lazy import — keeps the heavy Spline runtime out of the initial JS bundle
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;       // Spline scene URL: "https://prod.spline.design/{id}/scene.splinecode"
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
          {/* Add .loader CSS to globals.css if needed:
              .loader {
                width: 24px; height: 24px;
                border: 2px solid rgba(255,255,255,0.2);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }
              @keyframes spin { to { transform: rotate(360deg); } }
          */}
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: /components/ui/spotlight-static.tsx  (Aceternity variant — CSS animation)
// ─────────────────────────────────────────────────────────────────────────────
// REQUIRES in tailwind.config.js:
// animation: { spotlight: "spotlight 2s ease .75s 1 forwards" }
// keyframes: { spotlight: { "0%": { opacity: 0, scale: 0.9 }, "100%": { opacity: 1, scale: 1 } } }

import { cn } from '@/lib/utils';

type SpotlightStaticProps = {
  className?: string;
  fill?: string;
};

export const SpotlightStatic = ({ className, fill }: SpotlightStaticProps) => {
  return (
    <svg
      className={cn(
        'animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || 'white'}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: /components/ui/spotlight-interactive.tsx  (ibelick variant — mouse tracking)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion';

type SpotlightInteractiveProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function SpotlightInteractive({
  className,
  size = 200,
  springOptions = { bounce: 0 },
}: SpotlightInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  // Auto-set parent to position:relative and overflow:hidden
  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;
    parentElement.addEventListener('mousemove', handleMouseMove);
    parentElement.addEventListener('mouseenter', () => setIsHovered(true));
    parentElement.addEventListener('mouseleave', () => setIsHovered(false));
    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', () => setIsHovered(true));
      parentElement.removeEventListener('mouseleave', () => setIsHovered(false));
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-xl transition-opacity duration-200',
        'from-zinc-50 via-zinc-100 to-zinc-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
      }}
    />
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: DEMO — /components/blocks/spline-scene-demo.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { SplineScene } from '@/components/ui/spline-scene';
import { SpotlightStatic } from '@/components/ui/spotlight-static';
import { Card } from '@/components/ui/card';

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
      {/* Static spotlight — fires CSS animation once on mount */}
      <SpotlightStatic
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex h-full">
        {/* Left: text content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
        </div>

        {/* Right: Spline 3D scene */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
