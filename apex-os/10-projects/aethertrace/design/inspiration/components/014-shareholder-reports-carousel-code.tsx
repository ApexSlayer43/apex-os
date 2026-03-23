// SOURCE: 21st.dev — ShareholderReports Horizontal Scroll Carousel
// DEPS: lucide-react, @/lib/utils (cn)
// STACK: React + Tailwind CSS + TypeScript + shadcn CSS tokens
// INSTALL: npm install lucide-react
// FILES:  /components/ShareholderReports.tsx  (this file)

// ─── SETUP NOTES ──────────────────────────────────────────────────────────────
// Uses shadcn CSS design tokens throughout (text-foreground, bg-card, etc.)
// Requires shadcn project initialized for token availability:
//   npx shadcn@latest init
//
// scrollbar-hide requires tailwind-scrollbar-hide plugin:
//   npm install tailwind-scrollbar-hide
//   plugins: [require('tailwind-scrollbar-hide')]
//
// No Framer Motion dependency — all animation via CSS transitions only.

"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Report {
  id: number
  title: string
  period: string
  year: string
  coverImage: string  // URL string — external or local asset
  isNew?: boolean     // shows the "NEW" badge when true
  fileSize?: string   // e.g. "4.2 MB"
  pages?: number
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

// Sample data — replace with API fetch or CMS data in production.
// All fields are optional except id, title, period, year, coverImage.
const REPORTS: Report[] = [
  {
    id: 1,
    title: "Annual Report",
    period: "FY 2023-24",
    year: "2024",
    coverImage: "/reports/annual-2024.jpg",
    isNew: true,
    fileSize: "8.4 MB",
    pages: 156,
  },
  {
    id: 2,
    title: "Integrated Annual Report",
    period: "FY 2022-23",
    year: "2023",
    coverImage: "/reports/annual-2023.jpg",
    fileSize: "6.2 MB",
    pages: 134,
  },
  {
    id: 3,
    title: "Q3 Results",
    period: "Q3 FY 2023-24",
    year: "2024",
    coverImage: "/reports/q3-2024.jpg",
    isNew: true,
    fileSize: "2.1 MB",
    pages: 42,
  },
  {
    id: 4,
    title: "Sustainability Report",
    period: "FY 2022-23",
    year: "2023",
    coverImage: "/reports/sustainability-2023.jpg",
    fileSize: "4.7 MB",
    pages: 88,
  },
  {
    id: 5,
    title: "Annual Report",
    period: "FY 2021-22",
    year: "2022",
    coverImage: "/reports/annual-2022.jpg",
    fileSize: "5.9 MB",
    pages: 128,
  },
  {
    id: 6,
    title: "Annual Report",
    period: "FY 2020-21",
    year: "2021",
    coverImage: "/reports/annual-2021.jpg",
    fileSize: "5.1 MB",
    pages: 118,
  },
]

// ─── REPORT CARD ──────────────────────────────────────────────────────────────
// Individual card — 240px mobile, 280px sm+, flex-shrink-0 prevents collapsing.
// group class on outer div enables group-hover: targeting on children.
//
// Card anatomy:
// ┌─────────────────────────┐
// │  [cover image]          │
// │  [gradient overlay]     │  ← bg-gradient-to-t darkens bottom for badge
// │  [isNew badge]          │  ← absolute, top-right, only if isNew
// │  [download icon hover]  │  ← opacity-0 → group-hover:opacity-100
// ├─────────────────────────┤
// │  [title]                │
// │  [period · fileSize]    │  ← muted metadata row
// └─────────────────────────┘

interface ReportCardProps {
  report: Report
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  return (
    // Outer container: fixed width, flex-shrink-0 so it doesn't compress in flex row.
    // group enables group-hover: class variants for children.
    // cursor-pointer + transition-transform for the lift-on-hover effect.
    <div
      className={cn(
        "group relative flex flex-shrink-0 flex-col overflow-hidden rounded-xl",
        "w-[240px] sm:w-[280px]",  // responsive card width — mobile narrower
        "bg-card border border-border",
        "cursor-pointer transition-all duration-300",
        // The lift effect: translate up 4px + stronger shadow on hover.
        // Both are applied via group-hover: on a wrapper — see below.
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20",
      )}
    >
      {/* ── Image Container ── */}
      {/* overflow-hidden clips the gradient overlay and any image transform */}
      {/* aspect-[3/4] maintains portrait orientation regardless of image source */}
      <div className="relative overflow-hidden aspect-[3/4]">
        {/* Cover image — object-cover fills container, transition-transform for zoom effect */}
        <img
          src={report.coverImage}
          alt={`${report.title} ${report.period}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ── Gradient overlay ── */}
        {/* bg-gradient-to-t from black/50 to transparent: darkens the bottom */}
        {/* of the card image so overlaid elements are legible. */}
        {/* pointer-events-none: overlay never intercepts click events */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* ── isNew badge ── */}
        {/* Positioned top-right. Only renders when isNew is true. */}
        {/* bg-primary text-primary-foreground: uses shadcn's accent color token. */}
        {/* rounded-full for pill shape. */}
        {report.isNew && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground tracking-wide">
              NEW
            </span>
          </div>
        )}

        {/* ── Download icon (hover reveal) ── */}
        {/* opacity-0 → group-hover:opacity-100: only appears when card is hovered. */}
        {/* GPU-composited opacity transition: no reflow on show/hide. */}
        {/* Positioned bottom-right above the gradient. */}
        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      {/* Padding within the card below the image for text content. */}
      <div className="flex flex-col gap-1 p-3">
        {/* Title — primary text color, medium weight, truncated to single line */}
        <p className="truncate text-sm font-medium text-foreground">
          {report.title}
        </p>

        {/* Metadata row — muted color, period · filesize */}
        <p className="text-xs text-muted-foreground">
          {report.period}
          {report.fileSize && (
            <span className="ml-1 before:content-['·'] before:mr-1">{report.fileSize}</span>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── SHAREHOLDER REPORTS ──────────────────────────────────────────────────────
// Orchestrating section component. Manages scroll state and navigation.
//
// ARCHITECTURE DECISIONS:
// 1. React.forwardRef — the section element is forwarded so a parent can
//    programmatically scroll to this section (useful in single-page layouts
//    where a nav link jumps to the reports section).
//
// 2. Two refs:
//    - forwarded ref: the outermost <section> (for parent access)
//    - scrollContainerRef: the inner scroll container (for scroll math)
//
// 3. canScrollLeft / canScrollRight state: drives arrow button opacity and
//    disabled prop. Computed by reading scrollLeft, scrollWidth, clientWidth.
//
// 4. Scroll event listener: updates canScrollLeft/canScrollRight after each
//    scroll event. Cleanup in the useEffect return prevents memory leaks.
//
// 5. CSS snap scrolling — no JS scroll position management. Browser handles
//    the snap physics. JS only handles the "scroll by one page" trigger.

interface ShareholderReportsProps {
  reports?: Report[]
  title?: string
  subtitle?: string
  className?: string
}

const ShareholderReports = React.forwardRef<
  HTMLElement,  // the forwarded ref type — HTMLElement for <section>
  ShareholderReportsProps
>(
  (
    {
      reports = REPORTS,
      title = "Reports & Presentations",
      subtitle = "Download our latest investor reports and financial presentations",
      className,
    },
    ref
  ) => {
    // Inner scroll container ref — used for scroll math and event listening.
    // Separate from the forwarded ref (which is on the <section>).
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Scroll state — drives nav button visibility and disabled states.
    // Initial state: canScrollLeft = false (we start at position 0),
    // canScrollRight = true (assume there's content to scroll to).
    // These flip as the user scrolls.
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    // checkScrollability: reads the scroll container's current scroll position
    // and dimensions, updates the boolean states.
    //
    // The -1 precision offset on scrollRight check:
    //   scrollLeft + clientWidth >= scrollWidth - 1
    // This accounts for sub-pixel rendering differences — scrollWidth is often
    // 1px larger than the exact sum when fully scrolled right. Without -1,
    // the right arrow stays enabled even when scrolled to the last card.
    const checkScrollability = useCallback(() => {
      const container = scrollContainerRef.current
      if (!container) return

      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft + container.clientWidth < container.scrollWidth - 1
      )
    }, [])

    // Attach scroll listener on mount. checkScrollability fires after each
    // scroll event, keeping the arrow states in sync.
    // { passive: true }: scroll listeners marked passive can't call
    // preventDefault — browser optimization for smoother scrolling.
    useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      // Run once on mount to set initial state (may already be partially scrolled
      // if the component re-mounts with preserved scroll position).
      checkScrollability()

      container.addEventListener("scroll", checkScrollability, { passive: true })
      return () => container.removeEventListener("scroll", checkScrollability)
    }, [checkScrollability])

    // scroll: moves the container by 80% of its visible width in the given direction.
    // container.clientWidth * 0.8 — why 80% not 100%?
    // At 100%, the last visible card gets cut off on the left edge after scrolling.
    // 80% keeps one card partially visible as a visual continuity cue — the user
    // sees they have more cards, scroll didn't teleport them to an unknown position.
    // behavior: "smooth" uses the browser's native smooth scroll.
    const scroll = useCallback((direction: "left" | "right") => {
      const container = scrollContainerRef.current
      if (!container) return

      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }, [])

    return (
      // Forwarded ref on the outermost section — allows parent to call
      // sectionRef.current?.scrollIntoView() for anchor navigation.
      <section ref={ref} className={cn("w-full py-12", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Section Header ── */}
          {/* Standard heading + subtitle + nav arrow layout. */}
          {/* Nav arrows are hidden on mobile (hidden sm:flex) — touch scroll is */}
          {/* the primary interaction on mobile; arrows are for pointer devices. */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* ── Navigation Arrows ── */}
            {/* hidden on mobile, flex on sm+ — touch users scroll natively */}
            {/* Arrows are always present in DOM (no conditional render) — */}
            {/* this prevents layout shifts when scrollability changes. */}
            {/* disabled:opacity-30 + disabled:cursor-not-allowed give clear */}
            {/* feedback that an arrow is at the scroll boundary. */}
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "border border-border bg-card text-foreground",
                  "transition-all duration-200",
                  "hover:bg-muted hover:border-foreground/20",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "border border-border bg-card text-foreground",
                  "transition-all duration-200",
                  "hover:bg-muted hover:border-foreground/20",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Scroll Container ── */}
          {/* The div that receives the scrollContainerRef and manages overflow. */}
          {/*                                                                    */}
          {/* overflow-x-auto — enables horizontal scrolling                    */}
          {/* scrollbar-hide — hides the scrollbar (requires plugin) while      */}
          {/*   keeping scroll interaction functional                            */}
          {/* snap-x snap-mandatory — activates CSS scroll snap on the X axis.  */}
          {/*   "mandatory" means scroll always snaps (not optional). The snap  */}
          {/*   points are on individual cards (snap-start below).              */}
          {/* -mx-4 px-4 — negative horizontal margin + matching padding:       */}
          {/*   allows the card row to visually bleed to the screen edge on    */}
          {/*   mobile while keeping padding for the first card's spacing.     */}
          <div
            ref={scrollContainerRef}
            className={cn(
              "flex gap-4 overflow-x-auto",
              "scrollbar-hide",
              "snap-x snap-mandatory",
              "-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
              // padding-right at end of row ensures last card doesn't sit flush
              // against the edge — "pb-4" handles shadow clipping on cards
              "pb-4",
            )}
          >
            {reports.map((report) => (
              // snap-start: each card is a snap point — scroll snaps to the
              // left edge of each card. Used on the wrapper, not the card itself,
              // to keep the snap anchor consistent even if card dimensions change.
              <div key={report.id} className="snap-start">
                <ReportCard report={report} />
              </div>
            ))}
          </div>

          {/* ── Mobile scroll hint ── */}
          {/* Shown only on mobile where arrows are hidden. */}
          {/* Fades out after first scroll (not implemented here — CSS only). */}
          <p className="mt-3 text-center text-xs text-muted-foreground sm:hidden">
            Swipe to explore
          </p>

        </div>
      </section>
    )
  }
)

// displayName required when using forwardRef — appears in React DevTools
// and error messages. Without it, the component shows as "ForwardRef" which
// makes debugging harder.
ShareholderReports.displayName = "ShareholderReports"

export { ShareholderReports }
export type { Report, ShareholderReportsProps }

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*

// Basic usage — uses built-in REPORTS data
<ShareholderReports />

// Custom reports from API
<ShareholderReports reports={apiReports} />

// With ref for anchor navigation
const reportsRef = useRef<HTMLElement>(null)

<button onClick={() => reportsRef.current?.scrollIntoView({ behavior: "smooth" })}>
  View Reports
</button>

<ShareholderReports ref={reportsRef} />

// With custom heading
<ShareholderReports
  title="Evidence Archive"
  subtitle="Certified custody packages available for download"
/>

// AetherTrace: Evidence Package Archive section
<ShareholderReports
  title="Custody Packages"
  subtitle="Exported evidence packages — each hash-verified and court-ready"
  reports={evidencePackages.map(pkg => ({
    id: pkg.id,
    title: pkg.projectName,
    period: pkg.dateRange,
    year: pkg.year,
    coverImage: pkg.thumbnailUrl,
    isNew: pkg.exportedWithin7Days,
    fileSize: pkg.bundleSize,
    pages: pkg.itemCount,
  }))}
/>

*/
