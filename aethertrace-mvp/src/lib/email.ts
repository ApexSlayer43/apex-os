/**
 * Email notifications via Resend.
 *
 * Three transactional emails only:
 *   1. Welcome — after org creation (account activation)
 *   2. Seal confirmation — after evidence upload (201 success)
 *   3. Export ready — after evidence package ZIP generated
 *
 * Invariants:
 *   - Non-blocking: email failures never break the main operation
 *   - Graceful fallback: logs to console if RESEND_API_KEY is missing
 *   - No tracking pixels, no marketing content
 *   - From: AetherTrace <custody@aethertrace.com>
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = 'AetherTrace <custody@aethertrace.com>'

// Shared HTML wrapper — dark background, monospace, minimal
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#02050B;color:#B8D4EE;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;font-size:14px;line-height:1.7;">
<div style="max-width:560px;margin:0 auto;">
<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#486080;margin-bottom:24px;">AetherTrace Evidence Custody</div>
${body}
<div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(200,212,228,0.08);font-size:11px;color:#384860;">
This is an automated notification from AetherTrace. Do not reply to this email.
</div>
</div>
</body>
</html>`
}

async function send(to: string, subject: string, text: string, html: string): Promise<void> {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping email to ${to}: ${subject}`)
    return
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
      html,
    })
    if (error) {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, error)
    }
  } catch (err) {
    console.error(`[email] Unexpected error sending "${subject}" to ${to}:`, err)
  }
}

/**
 * Welcome email — sent after org creation (account activation).
 */
export async function sendWelcomeEmail(to: string, orgName: string): Promise<void> {
  const subject = 'Welcome to AetherTrace — Your evidence custody is now active'

  const text = `Welcome to AetherTrace.

Your organization "${orgName}" has been created. Your evidence custody is now active.

What happens next:
1. Create a project — each project maintains its own cryptographic chain.
2. Upload evidence — every file is hashed (SHA-256) and chained on ingestion.
3. Export when ready — court-ready evidence packages with full chain verification.

Your evidence. Your custody. Mathematically unalterable.

— AetherTrace Evidence Custody System`

  const html = wrap(`
<h1 style="font-size:20px;font-weight:400;color:#DCF0FF;margin:0 0 24px;">Your evidence custody is now active.</h1>
<p>Organization <strong style="color:#DCF0FF;">${escapeHtml(orgName)}</strong> has been created.</p>
<div style="margin:24px 0;padding:16px;background:rgba(200,212,228,0.04);border:1px solid rgba(200,212,228,0.08);border-radius:6px;">
<div style="font-size:12px;color:#486080;margin-bottom:8px;">NEXT STEPS</div>
<p style="margin:4px 0;">1. Create a project — each project maintains its own cryptographic chain.</p>
<p style="margin:4px 0;">2. Upload evidence — every file is hashed (SHA-256) and chained on ingestion.</p>
<p style="margin:4px 0;">3. Export when ready — court-ready packages with full chain verification.</p>
</div>
<p style="color:#486080;font-size:12px;">Your evidence. Your custody. Mathematically unalterable.</p>`)

  await send(to, subject, text, html)
}

/**
 * Seal confirmation — sent after evidence is successfully uploaded and chained.
 */
export async function sendSealConfirmation(
  to: string,
  fileName: string,
  projectName: string,
  chainPosition: number,
): Promise<void> {
  const subject = `Evidence sealed: ${fileName} — position #${chainPosition}`

  const text = `Evidence sealed.

File: ${fileName}
Project: ${projectName}
Chain position: #${chainPosition}

This item has been cryptographically hashed, timestamped, and chained. It cannot be altered without breaking the chain.

— AetherTrace Evidence Custody System`

  const html = wrap(`
<h1 style="font-size:20px;font-weight:400;color:#DCF0FF;margin:0 0 24px;">Evidence sealed.</h1>
<div style="margin:16px 0;padding:16px;background:rgba(200,212,228,0.04);border:1px solid rgba(200,212,228,0.08);border-radius:6px;">
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<tr><td style="padding:4px 12px 4px 0;color:#486080;">File</td><td style="color:#DCF0FF;">${escapeHtml(fileName)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#486080;">Project</td><td style="color:#DCF0FF;">${escapeHtml(projectName)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#486080;">Chain position</td><td style="color:#DCF0FF;">#${chainPosition}</td></tr>
</table>
</div>
<p style="color:#486080;font-size:12px;">This item has been cryptographically hashed, timestamped, and chained. It cannot be altered without breaking the chain.</p>`)

  await send(to, subject, text, html)
}

/**
 * Export ready — sent after evidence package ZIP is generated.
 */
export async function sendExportReady(
  to: string,
  projectName: string,
  itemCount: number,
): Promise<void> {
  const subject = `Evidence package ready: ${projectName} — ${itemCount} items, chain verified`

  const text = `Your evidence package is ready.

Project: ${projectName}
Items: ${itemCount}
Chain: Verified

The package includes a verification report, evidence manifest, custody log, and all original evidence files.

— AetherTrace Evidence Custody System`

  const html = wrap(`
<h1 style="font-size:20px;font-weight:400;color:#DCF0FF;margin:0 0 24px;">Your evidence package is ready.</h1>
<div style="margin:16px 0;padding:16px;background:rgba(200,212,228,0.04);border:1px solid rgba(200,212,228,0.08);border-radius:6px;">
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<tr><td style="padding:4px 12px 4px 0;color:#486080;">Project</td><td style="color:#DCF0FF;">${escapeHtml(projectName)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#486080;">Evidence items</td><td style="color:#DCF0FF;">${itemCount}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#486080;">Chain integrity</td><td style="color:#10B981;">VERIFIED</td></tr>
</table>
</div>
<p style="color:#486080;font-size:12px;">The package includes a verification report, evidence manifest, custody log, and all original evidence files.</p>`)

  await send(to, subject, text, html)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
