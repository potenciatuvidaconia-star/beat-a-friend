'use client'

import { useEffect, useState } from 'react'

interface Props {
  groupName: string
  apodoPrimero: string
  playerName: string
  points: number
  isMe: boolean
}

export default function TrofeoClient({ groupName, apodoPrimero, playerName, points, isMe }: Props) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number }[]>([])

  useEffect(() => {
    const colors = ['#FFBA00', '#00C46A', '#001F5B', '#ffffff', '#FFE066', '#CE1126']
    setConfetti(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
      }))
    )
  }, [])

  function share() {
    const text = `Gané la quiniela del Mundial 2026 como "${apodoPrimero}" en el grupo ${groupName} con ${points} puntos.\n#BeatAFriend #Mundial2026 #Campeón`
    if (navigator.share) {
      navigator.share({ title: 'Soy el Campeón', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Texto copiado — pégalo donde quieras')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #001040 0%, #001F5B 50%, #002D80 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflow: 'hidden', position: 'relative',
    }}>

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="animate-bounce"
          style={{
            position: 'absolute', width: 7, height: 7, borderRadius: 2, opacity: 0.7,
            left: `${c.x}%`,
            top: `${Math.random() * 50}%`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${1.2 + Math.random()}s`,
          }}
        />
      ))}

      {/* Trophy card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'linear-gradient(170deg, #FFBA00 0%, #E6A300 100%)',
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(255,186,0,.35), 0 8px 24px rgba(0,0,0,.3)',
        position: 'relative', zIndex: 10,
      }}>

        {/* Gold header */}
        <div style={{ textAlign: 'center', padding: '28px 24px 16px' }}>
          {/* Trophy icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,.25)', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4l3 6 7 1-5 5 1.5 7L20 20l-6.5 3 1.5-7-5-5 7-1 3-6z" fill="white"/>
              <path d="M15 32h10M20 26v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
            letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)',
          }}>
            Campeón de
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', marginTop: 2, letterSpacing: '-0.02em' }}>
            {groupName}
          </p>
        </div>

        {/* White body */}
        <div style={{ background: '#fff', margin: '0 12px 12px', borderRadius: 20, padding: '20px 20px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Con orgullo se corona a
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--bf-text)', marginTop: 6, letterSpacing: '-0.02em' }}>
              {playerName}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--bf-gold-dark)', marginTop: 2 }}>
              "{apodoPrimero}"
            </p>
          </div>

          <div style={{ background: 'var(--bf-gold-soft)', borderRadius: 14, padding: '14px' }}>
            <p style={{ fontSize: 11, color: 'var(--bf-text-3)' }}>Puntuación final</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 42, color: 'var(--bf-gold-dark)', lineHeight: 1.1 }}>{points}</p>
            <p style={{ fontSize: 11, color: 'var(--bf-text-3)' }}>puntos</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bf-divider)' }} />
            <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontFamily: 'monospace' }}>beat-a-friend.vercel.app</p>
            <div style={{ flex: 1, height: 1, background: 'var(--bf-divider)' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingBottom: 18 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,.65)', letterSpacing: '.06em' }}>
            El único que sabía de fútbol
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 10 }}>
        <button
          onClick={share}
          style={{
            width: '100%', padding: '16px', borderRadius: 18,
            background: 'var(--bf-gold)', color: 'var(--bf-text)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 0 var(--bf-gold-dark)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v10M5 6l4-4 4 4" stroke="var(--bf-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="var(--bf-text)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {isMe ? 'Compartir mi trofeo' : 'Compartir el trofeo'}
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
    </div>
  )
}
