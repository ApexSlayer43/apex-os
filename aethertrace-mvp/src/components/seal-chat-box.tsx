'use client'

import { useRouter } from 'next/navigation'
import { ClaudeChatInput, type FileWithPreview, type PastedContent } from '@/components/ui/claude-style-ai-input'

export function SealChatBox({ projectId }: { projectId: string }) {
  const router = useRouter()

  async function handleSeal(message: string, files: FileWithPreview[], pastedContent: PastedContent[]) {
    const file = files[0]?.file
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('timeConfidence', 'system-generated')

    const note = [message, ...pastedContent.map(p => p.content)].filter(Boolean).join('\n\n')
    if (note.trim()) formData.append('note', note.trim())

    try {
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Seal failed')
      }

      router.refresh()
    } catch (err) {
      console.error('Seal failed:', err)
      alert(err instanceof Error ? err.message : 'Seal failed')
    }
  }

  return (
    <ClaudeChatInput
      onSendMessage={handleSeal}
      placeholder="What happened? Describe the evidence..."
      maxFiles={10}
      maxFileSize={50 * 1024 * 1024}
    />
  )
}
