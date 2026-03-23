// SOURCE: 21st.dev — Features-8 Bento Grid
// DEPS: lucide-react, shadcn Card/CardContent
// STACK: React + Tailwind CSS v4 + TypeScript + shadcn tokens
// INSTALL: npx shadcn@latest add card && npm install lucide-react
// FILES:
//   /components/ui/card.tsx         ← shadcn Card (see dependency below)
//   /components/blocks/features-8.tsx ← this component (note: blocks/, not ui/)

// ─── PATH NOTE ────────────────────────────────────────────────────────────────
// The demo imports from "@/components/blocks/features-8" — NOT /components/ui/.
// "blocks/" is the shadcn convention for full-section composed components that
// use multiple UI primitives. "ui/" is reserved for atomic reusable primitives.
// If you want it in /ui/, rename the import path accordingly — no other change needed.

import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users } from 'lucide-react'

// ─── FEATURES SECTION ─────────────────────────────────────────────────────────
// A 6-column CSS grid bento layout with 5 feature cards across 3 responsive
// breakpoints. No JavaScript, no animation libraries — pure CSS grid + SVG.
//
// GRID LAYOUT (6 columns):
//
//  Mobile (< sm):    All cards: col-span-full (stacked 1 column)
//  Tablet (sm–lg):   Cards 2+3: sm:col-span-3 (50/50 split)
//                    Cards 1, 4, 5: col-span-full
//  Desktop (lg+):    Card 1:   lg:col-span-2
//                    Cards 2+3: lg:col-span-2 (three equal columns, row 1)
//                    Cards 4+5: lg:col-span-3 (two half columns, row 2)
//
//  Desktop visual:
//  ┌──────────┬──────────┬──────────┐
//  │  Card 1  │  Card 2  │  Card 3  │
//  │  (2/6)   │  (2/6)   │  (2/6)   │
//  ├──────────────────┬─────────────┤
//  │     Card 4       │   Card 5    │
//  │     (3/6)        │   (3/6)     │
//  └──────────────────┴─────────────┘

export function Features() {
    return (
        // bg-gray-50 light / transparent dark — section sits on page background in dark mode
        <section className="bg-gray-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
                <div className="relative">
                    {/* relative z-10: establishes stacking context for the grid cards */}
                    <div className="relative z-10 grid grid-cols-6 gap-3">

                        {/* ── CARD 1: Stat + Label ("100% Customizable") ──────────────── */}
                        {/* col-span-full on mobile, lg:col-span-2 on desktop             */}
                        {/* flex + m-auto centers content in the card regardless of height */}
                        <Card className="relative col-span-full flex overflow-hidden lg:col-span-2">
                            <CardContent className="relative m-auto size-fit pt-6">
                                {/* Stat block: "100%" centered over an organic SVG oval shape */}
                                <div className="relative flex h-24 w-56 items-center">

                                    {/* ── Decorative oval SVG ── */}
                                    {/* text-muted: the oval uses currentColor → renders in muted */}
                                    {/* absolute inset-0 size-full: fills the entire h-24 w-56 container */}
                                    {/* The SVG is a stylized oval/pill shape — purely decorative */}
                                    {/* PATTERN: use absolute SVG behind text for illustrated stats */}
                                    <svg className="text-muted absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                                            fill="currentColor"
                                        />
                                    </svg>

                                    {/* Stat text: z-10 implied by DOM order (renders above absolute SVG) */}
                                    {/* mx-auto: centers in the flex container */}
                                    {/* w-fit: shrinks to text width (needed with mx-auto on a block) */}
                                    <span className="mx-auto block w-fit text-5xl font-semibold">100%</span>
                                </div>

                                <h2 className="mt-6 text-center text-3xl font-semibold">Customizable</h2>
                            </CardContent>
                        </Card>

                        {/* ── CARD 2: Circular icon + "Secure by default" ─────────────── */}
                        {/* sm:col-span-3 = half width on tablet; lg:col-span-2 = 1/3 on desktop */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                            <CardContent className="pt-6">

                                {/* ── Double-ring circle ── */}
                                {/* relative + flex + aspect-square size-32 rounded-full border:  */}
                                {/* the circle itself is a bordered rounded div.                  */}
                                {/* before: pseudo-element creates the OUTER ring WITHOUT an extra */}
                                {/* wrapper div:                                                   */}
                                {/*   before:absolute before:-inset-2: expands 8px beyond the circle */}
                                {/*   before:rounded-full before:border: draws the outer ring        */}
                                {/* Result: inner ring (the div border) + outer ring (before border) */}
                                {/* Dark mode: dark:border-white/10 dark:before:border-white/5       */}
                                {/* — uses opacity variants so the ring is barely visible in dark    */}
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">

                                    {/* SVG illustration: concentric circle fingerprint-like pattern */}
                                    {/* Uses two paths:                                               */}
                                    {/* 1. text-zinc-400 dark:text-zinc-600 — full muted gray path    */}
                                    {/* 2. gradient fill via url(#paint0_linear_0_1) — transparent    */}
                                    {/*    at top fading to primary-600 at midpoint (y=72).           */}
                                    {/*    clipPath restricts the gradient fill to bottom 72px only.  */}
                                    {/* Effect: the bottom half of the icon reveals in primary color   */}
                                    {/* while the top half stays muted — a "charging up" visual.      */}
                                    <svg className="m-auto h-fit w-24" viewBox="0 0 212 143" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {/* Base layer: full icon in muted gray */}
                                        <path
                                            className="text-zinc-400 dark:text-zinc-600"
                                            d="M44.0209 55.3542C43.1945 54.7639 42.6916 54.0272 42.5121 53.1442C42.3327 52.2611 42.5995 51.345 43.3125 50.3958C50.632 40.3611 59.812 32.5694 70.8525 27.0208C81.8931 21.4722 93.668 18.6979 106.177 18.6979C118.691 18.6979 130.497 21.3849 141.594 26.7587C152.691 32.1326 161.958 39.8936 169.396 50.0417C170.222 51.1042 170.489 52.0486 170.196 52.875C169.904 53.7014 169.401 54.4097 168.688 55C167.979 55.5903 167.153 55.8571 166.208 55.8004C165.264 55.7437 164.438 55.2408 163.729 54.2917C157.236 45.0833 148.885 38.0307 138.675 33.1337C128.466 28.2368 117.633 25.786 106.177 25.7812C94.7257 25.7812 83.9827 28.2321 73.948 33.1337C63.9132 38.0354 55.5903 45.0881 48.9792 54.2917C48.2709 55.3542 47.4445 55.9444 46.5 56.0625C45.5556 56.1806 44.7292 55.9444 44.0209 55.3542Z..."
                                            fill="currentColor"
                                        />
                                        {/* Gradient overlay: same path but filled with linear gradient */}
                                        {/* Clipped by clip0_0_1 to show only the bottom 72px portion  */}
                                        <g clipPath="url(#clip0_0_1)">
                                            <path
                                                d="M44.0209 55.3542..."
                                                fill="url(#paint0_linear_0_1)"
                                            />
                                        </g>
                                        {/* Horizontal line at y=72: primary color accent rule */}
                                        {/* text-primary-600 dark:text-primary-500 — semantic color  */}
                                        <path className="text-primary-600 dark:text-primary-500" d="M3 72H209" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                        <defs>
                                            {/* Gradient: white/0 at top → primary color at y=72       */}
                                            {/* The "currentColor" trick: stopColor="currentColor"       */}
                                            {/* inherits the CSS color from className="text-primary-600" */}
                                            <linearGradient id="paint0_linear_0_1" x1="106.385" y1="1.34375" x2="106" y2="72" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="white" stopOpacity="0" />
                                                <stop className="text-primary-600 dark:text-primary-500" offset="1" stopColor="currentColor" />
                                            </linearGradient>
                                            {/* ClipPath: rect from x=41, 72px tall, 129px wide         */}
                                            {/* Confines gradient fill to lower portion of the icon     */}
                                            <clipPath id="clip0_0_1">
                                                <rect width="129" height="72" fill="white" transform="translate(41)" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="group-hover:text-secondary-950 text-lg font-medium transition dark:text-white">Secure by default</h2>
                                    <p className="text-foreground">Provident fugit and vero voluptate. magnam magni doloribus dolores voluptates a sapiente nisi.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── CARD 3: Analytics chart + "Faster than light" ──────────── */}
                        {/* Same responsive breakpoints as Card 2 (sm:3, lg:2)            */}
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                            <CardContent className="pt-6">
                                <div className="pt-6 lg:px-6">
                                    {/* Analytics card mockup SVG:                                  */}
                                    {/* Contains two layers:                                         */}
                                    {/* 1. Header row with download.app icon, "download" text,       */}
                                    {/*    and version numbers (rendered as SVG text paths)          */}
                                    {/* 2. Line chart with area fill                                 */}
                                    {/*                                                              */}
                                    {/* dark:text-muted-foreground: the entire SVG inherits this     */}
                                    {/* color as currentColor for non-explicit fill elements          */}
                                    {/*                                                              */}
                                    {/* CHART SVG ANATOMY:                                           */}
                                    {/* - Area fill path (fillRule="evenodd"): filled with           */}
                                    {/*   paint0_linear_0_106 gradient (primary/15 → transparent)   */}
                                    {/* - Line path (stroke="currentColor" text-primary-600):        */}
                                    {/*   the chart line in primary color                            */}
                                    {/* - clipPath: clips the header content to a 358×30 rect        */}
                                    <svg className="dark:text-muted-foreground w-full" viewBox="0 0 386 123" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="386" height="123" rx="10" />
                                        <g clipPath="url(#clip0_0_106)">
                                            {/* Download icon: filled circle + down arrow stroke */}
                                            <circle className="text-muted-foreground dark:text-muted" cx="29" cy="29" r="15" fill="currentColor" />
                                            <path d="M29 23V35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M35 29L29 35L23 29" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            {/* App name and version text paths (SVG-rendered text, */}
                                            {/* not <text> elements — stays crisp at all resolutions) */}
                                            <path d="M55.2373 32H58.7988..." fill="currentColor" />
                                            <path d="M268.324 34H269.906V21.3174H268.333..." fill="currentColor" />
                                        </g>
                                        {/* Area fill: fillRule="evenodd" clipRule="evenodd"           */}
                                        {/* The path manually traces the chart line + bottom edges.    */}
                                        {/* fillRule="evenodd" handles complex self-intersecting paths */}
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M3 123C3 123 14.3298 94.153 35.1282 88.0957..."
                                            fill="url(#paint0_linear_0_106)"
                                        />
                                        {/* Chart line: stroked path in primary color */}
                                        {/* strokeWidth="3" for visibility at full width */}
                                        <path
                                            className="text-primary-600 dark:text-primary-500"
                                            d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756..."
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <defs>
                                            {/* Area gradient: primary/15 at top → transparent at bottom */}
                                            {/* Tailwind v4 syntax: className on <stop> for currentColor */}
                                            <linearGradient id="paint0_linear_0_106" x1="3" y1="60" x2="3" y2="123" gradientUnits="userSpaceOnUse">
                                                <stop className="text-primary/15 dark:text-primary/35" stopColor="currentColor" />
                                                <stop className="text-transparent" offset="1" stopColor="currentColor" stopOpacity="0.103775" />
                                            </linearGradient>
                                            <clipPath id="clip0_0_106">
                                                <rect width="358" height="30" fill="white" transform="translate(14 14)" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>

                                <div className="relative z-10 mt-14 space-y-2 text-center">
                                    <h2 className="text-lg font-medium transition">Faster than light</h2>
                                    <p className="text-foreground">Provident fugit vero voluptate. magnam magni doloribus dolores voluptates inventore nisi.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── CARD 4: Shield icon + waveform chart ────────────────────── */}
                        {/* lg:col-span-3: half of the 6-column grid on desktop           */}
                        {/* Two-column card interior: sm:grid-cols-2                       */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                            <CardContent className="grid pt-6 sm:grid-cols-2">

                                {/* Left: icon + text stack */}
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    {/* Same double-ring circle pattern as Card 2 */}
                                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                                        {/* Shield icon from lucide — strokeWidth=1 for lightweight look */}
                                        <Shield className="m-auto size-5" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="group-hover:text-secondary-950 text-lg font-medium text-zinc-800 transition dark:text-white">Faster than light</h2>
                                        <p className="text-foreground">Provident fugit vero voluptate. Voluptates a sapiente inventore nisi.</p>
                                    </div>
                                </div>

                                {/* Right: waveform chart panel — bleeds to card edge */}
                                {/* BLEED PATTERN: -mb-6 -mr-6 mt-6                    */}
                                {/* CardContent has p-6 padding. Negative margins on   */}
                                {/* this inner div cancel the right and bottom padding, */}
                                {/* allowing this panel to extend edge-to-edge with    */}
                                {/* card's overflow-hidden clipping the overflow.       */}
                                {/* border-l border-t: only left and top borders —     */}
                                {/* right and bottom are hidden under overflow-hidden.  */}
                                {/* rounded-tl-(--radius): CSS var for border-radius on */}
                                {/* only the top-left corner (opposite of bleed corner) */}
                                <div className="rounded-tl-(--radius) relative -mb-6 -mr-6 mt-6 h-fit border-l border-t p-6 py-6 sm:ml-6">

                                    {/* Mock terminal chrome: three dots (macOS window controls) */}
                                    {/* absolute left-3 top-2: pinned to top-left of the panel  */}
                                    <div className="absolute left-3 top-2 flex gap-1">
                                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                                    </div>

                                    {/* Waveform SVG chart:                                      */}
                                    {/* sm:w-[150%]: extends 150% of its container width on sm+. */}
                                    {/* Combined with parent's overflow-hidden on the card,      */}
                                    {/* the chart extends off the right edge — creates a visual  */}
                                    {/* of data "going on" beyond the visible frame.             */}
                                    {/* The waveform has two paths: area fill + stroke line,     */}
                                    {/* same pattern as Card 3's analytics chart.                */}
                                    <svg className="w-full sm:w-[150%]" viewBox="0 0 366 231" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {/* Filled area under the waveform */}
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M0.148438 231V179.394L1.92188 180.322..."
                                            fill="url(#paint0_linear_0_705)"
                                        />
                                        {/* Waveform stroke line */}
                                        <path
                                            className="text-primary-600 dark:text-primary-500"
                                            d="M1 179.796L4.05663 172.195..."
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <defs>
                                            <linearGradient id="paint0_linear_0_705" x1="0.85108" y1="0.947876" x2="0.85108" y2="230.114" gradientUnits="userSpaceOnUse">
                                                <stop className="text-primary/15 dark:text-primary/35" stopColor="currentColor" />
                                                <stop className="text-transparent" offset="1" stopColor="currentColor" stopOpacity="0.01" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── CARD 5: Users icon + avatar column ──────────────────────── */}
                        {/* lg:col-span-3: the right half of row 2                        */}
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                            <CardContent className="grid h-full pt-6 sm:grid-cols-2">

                                {/* Left: icon + text stack — same pattern as Card 4 */}
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                                        <Users className="m-auto size-6" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium transition">Keep your loved ones safe</h2>
                                        <p className="text-foreground">Voluptate. magnam magni doloribus dolores voluptates a sapiente inventore nisi.</p>
                                    </div>
                                </div>

                                {/* Right: avatar list with centered divider line */}
                                {/* DIVIDER PATTERN:                                               */}
                                {/* before:bg-(--color-border) before:absolute before:inset-0     */}
                                {/* before:mx-auto before:w-px                                     */}
                                {/* This creates a 1px vertical line centered in the column:      */}
                                {/* - before:absolute before:inset-0: spans full height            */}
                                {/* - before:mx-auto: centers it horizontally within the column   */}
                                {/* - before:w-px: 1px wide                                       */}
                                {/* - before:bg-(--color-border): Tailwind v4 CSS variable syntax */}
                                {/*   for the design token --color-border                         */}
                                {/* sm:-my-6 sm:-mr-6: expands the column to card edges on sm+,  */}
                                {/* matching the bleed pattern (negative margin cancels padding).  */}
                                <div className="before:bg-(--color-border) relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-6 sm:-mr-6">
                                    <div className="relative flex h-full flex-col justify-center space-y-6 py-6">

                                        {/* Avatar rows: alternating left/right alignment on the divider line */}
                                        {/* LEFT-ALIGNED rows: start flush left of center line */}
                                        {/* RIGHT-ALIGNED rows: flex justify-end, w-[calc(50%+0.875rem)] */}
                                        {/* The 0.875rem offset (= 14px = half avatar size + gap)          */}
                                        {/* positions the avatar edge exactly on the center line.           */}

                                        {/* Row 1: right-aligned (label + avatar on right side) */}
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">Likeur</span>
                                            {/* ring-background + ring-4: creates a gap ring that matches */}
                                            {/* the page background color — visually separates avatar from */}
                                            {/* the divider line without needing a real border or gap.     */}
                                            {/* This works on ANY background because the ring COLOR matches */}
                                            {/* the background (it's not a transparent gap, it's a solid   */}
                                            {/* ring that paints over whatever is behind the avatar edge). */}
                                            <div className="ring-background size-7 ring-4">
                                                <img className="size-full rounded-full" src="https://avatars.githubusercontent.com/u/102558960?v=4" alt="" />
                                            </div>
                                        </div>

                                        {/* Row 2: left-aligned (avatar + label on left side) */}
                                        {/* ml-[calc(50%-1rem)]: shifts start to center line   */}
                                        {/* -1rem = half of size-8 (32px) avatar                */}
                                        <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                                            <div className="ring-background size-8 ring-4">
                                                <img className="size-full rounded-full" src="https://avatars.githubusercontent.com/u/47919550?v=4" alt="" />
                                            </div>
                                            <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">M. Irung</span>
                                        </div>

                                        {/* Row 3: right-aligned again (label + avatar) */}
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">B. Ng</span>
                                            <div className="ring-background size-7 ring-4">
                                                <img className="size-full rounded-full" src="https://avatars.githubusercontent.com/u/31113941?v=4" alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── DEPENDENCY: shadcn Card ──────────────────────────────────────────────────
// Install via: npx shadcn@latest add card
// Or manually create /components/ui/card.tsx:

/*
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardContent }
*/

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*
// Import from blocks/ (not ui/) — this is a composed section, not a primitive
import { Features } from "@/components/blocks/features-8"

export default function Page() {
  return (
    <main>
      <Features />
    </main>
  )
}
*/
