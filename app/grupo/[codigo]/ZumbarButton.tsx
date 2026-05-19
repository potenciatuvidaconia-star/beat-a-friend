'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TAUNTS = [
  (n: string) => `🚨 AVISO OFICIAL: ${n} sigue en el último lugar. El grupo envía condolencias.`,
  (n: string) => `📉 Los datos confirman que ${n} no entiende el fútbol. Investigación en curso.`,
  (n: string) => `💀 ${n} ha sido oficialmente declarado "peligro para la quiniela". Retírensele el celular.`,
  (n: string) => `🔥 Alguien en este grupo apostaría por el árbitro ganando. Ese alguien es ${n}.`,
  (n: string) => `🚧 ${n} está en la ZONA DEL SÓTANO. Por favor no hacer contacto visual.`,
  (n: string) => `🏳️ ${n} ya no predice, reza. Y ni así.`,
  (n: string) => `📊 Estadísticas: ${n} tiene más fe que conocimiento futbolístico. Correlación: 0.`,
  (n: string) => `😂 ${n} predijo eso y lo subió. Valentía o ignorancia. El grupo debate.`,
  (n: string) => `🎯 ${n} lleva ${Math.floor(Math.random() * 5) + 3} predicciones seguidas malas. Nuevo récord del grupo.`,
]

interface Props {
  groupId: string
  userId: string
  lastPlaceName: string
  apodoUltimo: string
}

export default function ZumbarButton({ groupId, userId, lastPlaceName, apodoUltimo }: Props) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleZumbar() {
    if (loading || sent) return
    setLoading(true)
    const fn = TAUNTS[Math.floor(Math.random() * TAUNTS.length)]
    await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: userId,
      content: fn(lastPlaceName),
    })
    setLoading(false)
    setSent(true)
    setTimeout(() => setSent(false), 6000)
  }

  return (
    <button
      onClick={handleZumbar}
      disabled={loading || sent}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '14px 18px', borderRadius: 18, border: 'none',
        background: sent
          ? '#1A1A2E'
          : 'linear-gradient(135deg, #FF5C5C 0%, #E03E3E 100%)',
        color: sent ? 'rgba(255,255,255,.45)' : '#fff',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
        cursor: (loading || sent) ? 'default' : 'pointer',
        boxShadow: sent ? 'none' : '0 6px 20px rgba(255,92,92,.35)',
        transition: 'all .25s',
        letterSpacing: '.02em',
      }}
    >
      {sent ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l4 4 8-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          ¡Zumbazo enviado al sótano!
        </>
      ) : loading ? (
        <span>Enviando...</span>
      ) : (
        <>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M8.5 2C8.5 2 12 5 12 8.5a3.5 3.5 0 01-7 0C5 5 8.5 2 8.5 2z" fill="white"/>
            <path d="M8.5 14.5v-1.8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Sacar Pica a "{apodoUltimo}"
        </>
      )}
    </button>
  )
}
