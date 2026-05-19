'use client'

import { useRef } from 'react'

interface Props {
  groupName: string
  apodoUltimo: string
  premioCastigo: string | null
  playerName: string
  points: number
  isMe: boolean
}

export default function DiplomaClient({ groupName, apodoUltimo, premioCastigo, playerName, points, isMe }: Props) {
  const diplomaRef = useRef<HTMLDivElement>(null)

  function share() {
    const text = `Recibí el diploma oficial de "${apodoUltimo}" en la quiniela ${groupName} del Mundial 2026 con solo ${points} puntos.\n#BeatAFriend #Mundial2026`
    if (navigator.share) {
      navigator.share({ title: 'Mi Diploma de Vergüenza', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Texto copiado — pégalo en WhatsApp o Instagram')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bf-navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Diploma */}
      <div
        ref={diplomaRef}
        style={{ width: '100%', maxWidth: 360, background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}
      >
        {/* Header */}
        <div style={{ background: 'var(--bf-coral)', padding: '22px 24px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            Certificado Oficial de
          </p>
          <p style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1 }}>
            VERGÜENZA
          </p>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 6, fontFamily: 'var(--font-display)' }}>
            Mundial 2026 · Beat-a-Friend
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Shame icon — large X circle */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--bf-coral-soft)',
            margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M10 10l12 12M22 10L10 22" stroke="var(--bf-coral)" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>

          <div>
            <p style={{ fontSize: 11, color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Se certifica que
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--bf-text)', marginTop: 4, letterSpacing: '-0.02em' }}>
              {playerName}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--bf-coral)', marginTop: 2 }}>
              "{apodoUltimo}"
            </p>
          </div>

          <div style={{ background: 'var(--bf-coral-soft)', borderRadius: 16, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--bf-text-3)' }}>terminó en último lugar del grupo</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--bf-coral)', marginTop: 4 }}>{groupName}</p>
            <p style={{ fontSize: 12, color: 'var(--bf-text-3)', marginTop: 4 }}>con solo</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--bf-text)', lineHeight: 1.1 }}>{points}</p>
            <p style={{ fontSize: 12, color: 'var(--bf-text-3)' }}>puntos</p>
          </div>

          {premioCastigo && (
            <div style={{ border: '2px dashed var(--bf-coral)', borderRadius: 14, padding: '12px 16px' }}>
              <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Su castigo
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text)' }}>{premioCastigo}</p>
            </div>
          )}

          {/* Seal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bf-divider)' }} />
            <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontFamily: 'monospace' }}>beat-a-friend.vercel.app</p>
            <div style={{ flex: 1, height: 1, background: 'var(--bf-divider)' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'var(--bf-coral-soft)', padding: '10px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--bf-coral-dark)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Mundial 2026 · Diploma válido en todos los grupos de WhatsApp
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={share}
          style={{
            width: '100%', padding: '16px', borderRadius: 18,
            background: 'var(--bf-coral)', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v10M5 6l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {isMe ? 'Compartir mi vergüenza' : 'Compartir el diploma'}
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            width: '100%', padding: '12px', borderRadius: 18,
            background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
          }}
        >
          Volver al grupo
        </button>
      </div>

      {isMe && (
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, textAlign: 'center', marginTop: 16, maxWidth: 280 }}>
          La próxima vez estudia algo de fútbol antes de apostarlo todo.
        </p>
      )}
    </div>
  )
}
