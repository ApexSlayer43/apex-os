// SOURCE: 21st.dev — Hero Section 5 (Full-Page Hero + Scroll Nav + Infinite Slider)
// DEPS: motion, framer-motion, lucide-react, @radix-ui/react-slot, class-variance-authority, react-use-measure
// STACK: React + Tailwind + TypeScript + motion/react + shadcn/ui
// INSTALL: npm install motion framer-motion lucide-react @radix-ui/react-slot class-variance-authority react-use-measure

'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useScroll, motion } from 'motion/react';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: Full hero page (header + hero section + logo bar)
// ─────────────────────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">

        {/* Hero Section */}
        <section>
          <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
            {/* Foreground text content — above the video */}
            <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                  Build 10x Faster with NS
                </h1>
                <p className="mt-8 max-w-2xl text-balance text-lg">
                  Highly customizable components for building modern websites and applications you mean it.
                </p>
                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  {/* Primary CTA — pill shape with icon */}
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full pl-5 pr-3 text-base"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Start Building</span>
                      <ChevronRight className="ml-1" />
                    </Link>
                  </Button>
                  {/* Secondary CTA — ghost pill */}
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Request a demo</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Background video — absolute, fills section, behind text */}
            {/* invert: appears dark on light bg, light on dark bg automatically */}
            <div className="aspect-[2/3] absolute inset-1 overflow-hidden rounded-3xl border border-black/10 sm:aspect-video lg:rounded-[3rem] dark:border-white/5">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover opacity-50 invert dark:opacity-35 dark:invert-0 dark:lg:opacity-75"
                src="https://ik.imagekit.io/lrigu76hy/tailark/dna-video.mp4?updatedAt=1745736251477"
              />
            </div>
          </div>
        </section>

        {/* Social Proof Logo Bar */}
        <section className="bg-background pb-2">
          <div className="group relative m-auto max-w-7xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              {/* Label — right-aligned, bordered right on desktop */}
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Powering the best teams</p>
              </div>

              {/* Slider container with blur edge fade */}
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex">
                    <img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy Logo" height="20" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/laravel.svg" alt="Laravel Logo" height="16" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-7 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lilly.svg" alt="Lilly Logo" height="28" width="auto" />
                  </div>
                  <div className="flex">
                    <img className="mx-auto h-6 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI Logo" height="24" width="auto" />
                  </div>
                </InfiniteSlider>

                {/* Gradient fades (color) — hides logos at edges */}
                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>

                {/* Progressive blur (blur) — layered backdrop-filter blur at edges */}
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-AWARE FIXED NAV
// ─────────────────────────────────────────────────────────────────────────────
const menuItems = [
  { name: 'Features', href: '#link' },
  { name: 'Solution', href: '#link' },
  { name: 'Pricing', href: '#link' },
  { name: 'About', href: '#link' },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollYProgress } = useScroll();

  // Subscribe to scroll progress — activate frosted glass at 5% scroll
  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <header>
      {/* data-state="active" drives CSS group-data selectors for mobile menu */}
      <nav
        data-state={menuState && 'active'}
        className="group fixed z-20 w-full pt-2"
      >
        {/* Frosted glass pill appears on scroll */}
        <div
          className={cn(
            'mx-auto max-w-7xl rounded-3xl px-6 transition-all duration-300 lg:px-12',
            scrolled && 'bg-background/50 backdrop-blur-2xl'
          )}
        >
          <motion.div
            className={cn(
              'relative flex flex-wrap items-center justify-between gap-6 py-3 duration-200 lg:gap-0 lg:py-6',
              scrolled && 'lg:py-4'  // Compact padding when scrolled
            )}
          >
            {/* Logo + hamburger row */}
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </Link>

              {/* Hamburger — CSS icon swap via group-data-[state=active] */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                {/* Menu icon: visible when closed, rotates/fades out when open */}
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                {/* X icon: hidden when closed, rotates/fades in when open */}
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              {/* Desktop nav links */}
              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile menu panel + desktop auth buttons */}
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              {/* Mobile-only nav links (desktop hides via lg:hidden) */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm">
                  <Link href="#"><span>Login</span></Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="#"><span>Sign Up</span></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INFINITE SLIDER COMPONENT
// /components/ui/infinite-slider.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 'use client';
// import { cn } from '@/lib/utils';
// import { useMotionValue, animate, motion } from 'framer-motion';
// import { useState, useEffect } from 'react';
// import useMeasure from 'react-use-measure';
//
// type InfiniteSliderProps = {
//   children: React.ReactNode;
//   gap?: number;
//   duration?: number;
//   durationOnHover?: number;
//   direction?: 'horizontal' | 'vertical';
//   reverse?: boolean;
//   className?: string;
// };
//
// export function InfiniteSlider({
//   children, gap = 16, duration = 25, durationOnHover,
//   direction = 'horizontal', reverse = false, className,
// }: InfiniteSliderProps) {
//   const [currentDuration, setCurrentDuration] = useState(duration);
//   const [ref, { width, height }] = useMeasure();
//   const translation = useMotionValue(0);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [key, setKey] = useState(0);
//
//   useEffect(() => {
//     let controls;
//     const size = direction === 'horizontal' ? width : height;
//     const contentSize = size + gap;
//     const from = reverse ? -contentSize / 2 : 0;
//     const to = reverse ? 0 : -contentSize / 2;
//
//     if (isTransitioning) {
//       controls = animate(translation, [translation.get(), to], {
//         ease: 'linear',
//         duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
//         onComplete: () => { setIsTransitioning(false); setKey((k) => k + 1); },
//       });
//     } else {
//       controls = animate(translation, [from, to], {
//         ease: 'linear', duration: currentDuration,
//         repeat: Infinity, repeatType: 'loop', repeatDelay: 0,
//         onRepeat: () => { translation.set(from); },
//       });
//     }
//     return controls?.stop;
//   }, [key, translation, currentDuration, width, height, gap, isTransitioning, direction, reverse]);
//
//   const hoverProps = durationOnHover ? {
//     onHoverStart: () => { setIsTransitioning(true); setCurrentDuration(durationOnHover); },
//     onHoverEnd: () => { setIsTransitioning(true); setCurrentDuration(duration); },
//   } : {};
//
//   return (
//     <div className={cn('overflow-hidden', className)}>
//       <motion.div
//         className='flex w-max'
//         style={{ ...(direction === 'horizontal' ? { x: translation } : { y: translation }), gap: `${gap}px`, flexDirection: direction === 'horizontal' ? 'row' : 'column' }}
//         ref={ref} {...hoverProps}
//       >
//         {children}{children}
//       </motion.div>
//     </div>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESSIVE BLUR COMPONENT
// /components/ui/progressive-blur.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 'use client';
// import { cn } from '@/lib/utils';
// import { HTMLMotionProps, motion } from 'motion/react';
//
// export const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };
//
// export type ProgressiveBlurProps = {
//   direction?: keyof typeof GRADIENT_ANGLES;
//   blurLayers?: number;
//   className?: string;
//   blurIntensity?: number;
// } & HTMLMotionProps<'div'>;
//
// export function ProgressiveBlur({
//   direction = 'bottom', blurLayers = 8, className, blurIntensity = 0.25, ...props
// }: ProgressiveBlurProps) {
//   const layers = Math.max(blurLayers, 2);
//   const segmentSize = 1 / (blurLayers + 1);
//   return (
//     <div className={cn('relative', className)}>
//       {Array.from({ length: layers }).map((_, index) => {
//         const angle = GRADIENT_ANGLES[direction];
//         const gradientStops = [index * segmentSize, (index+1)*segmentSize, (index+2)*segmentSize, (index+3)*segmentSize]
//           .map((pos, posIndex) => `rgba(255,255,255,${posIndex===1||posIndex===2?1:0}) ${pos*100}%`);
//         const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;
//         return (
//           <motion.div key={index} className='pointer-events-none absolute inset-0 rounded-[inherit]'
//             style={{ maskImage: gradient, WebkitMaskImage: gradient, backdropFilter: `blur(${index * blurIntensity}px)` }}
//             {...props} />
//         );
//       })}
//     </div>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// LOGO (inline SVG with linearGradient)
// ─────────────────────────────────────────────────────────────────────────────
const Logo = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 78 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-5 w-auto', className)}>
      <path d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z" fill="url(#logo-gradient)" />
      <path d="M27.06 7.054V12.239..." fill="currentColor" />
      <defs>
        <linearGradient id="logo-gradient" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEMO USAGE
// ─────────────────────────────────────────────────────────────────────────────
// import { HeroSection } from "@/components/blocks/hero-section-5";
// export function Demo() { return <HeroSection />; }
