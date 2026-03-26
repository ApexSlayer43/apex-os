/**
 * Project Layout — Passthrough
 * The seal page handles its own layout. No wrapping UI.
 */

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
