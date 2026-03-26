import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function IntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ padding: '48px 40px', maxWidth: 800 }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400,
        color: '#DCF0FF', letterSpacing: '-0.02em', margin: 0, marginBottom: 6,
      }}>
        AetherTrace Intelligence
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'rgba(200,212,228,0.3)', letterSpacing: '0.08em',
        margin: 0, marginBottom: 40,
      }}>
        AI-POWERED EVIDENCE RECONSTRUCTION
      </p>

      <div className="glass-card" style={{
        padding: '48px 40px', textAlign: 'center',
        borderLeft: '2px solid rgba(126,184,247,0.15)',
      }}>
        <div style={{
          width: 48, height: 48, margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.3,
        }}>
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1Z" stroke="rgba(200,212,228,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M12.5 1l.5 1.5L14.5 3l-1.5.5-.5 1.5-.5-1.5L10.5 3l1.5-.5.5-1.5Z" stroke="rgba(200,212,228,0.5)" strokeWidth="0.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 20,
          color: '#DCF0FF', marginBottom: 12,
        }}>
          Coming Soon
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'rgba(200,212,228,0.3)', lineHeight: 1.7,
          maxWidth: 440, margin: '0 auto 24px',
        }}>
          Ask questions about your evidence across all projects.
          Reconstruct timelines. Build narratives from your chain.
          Every answer traceable to a hash and timestamp.
        </p>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          alignItems: 'flex-start', maxWidth: 360, margin: '0 auto',
        }}>
          <QueryExample text="Show me all inspection photos from March" />
          <QueryExample text="What evidence do I have for the foundation dispute?" />
          <QueryExample text="Reconstruct the timeline for microgrid phase 2" />
          <QueryExample text="Which requirements are still unfulfilled?" />
        </div>
      </div>
    </div>
  )
}

function QueryExample({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-mono)', fontSize: 11,
      color: 'rgba(200,212,228,0.25)', fontStyle: 'italic',
    }}>
      <span style={{ color: 'rgba(126,184,247,0.4)' }}>&#8250;</span>
      {text}
    </div>
  )
}
