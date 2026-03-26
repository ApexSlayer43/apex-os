/**
 * Project Page — Redirects to Seal
 * The seal page IS the project experience.
 */

import { redirect } from 'next/navigation'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  redirect(`/dashboard/projects/${projectId}/seal`)
}
