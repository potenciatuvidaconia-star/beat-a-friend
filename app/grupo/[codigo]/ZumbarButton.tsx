'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TAUNTS = [
  (n: string) => `🚨 AVISO OFICIAL: ${n} sigue en el último lugar. El grupo envía condolencias.`,
  (n: string) => `📉 Los datos confirman que ${n} no entiende el fútbol. Investigación en curso.`,
  (n: string) => `💀 ${n} ha sido declarado "peligro para la quiniela". Retírensele el celular.`,
  (n: string) => `🔥 Alguien apostaría por el árbitro ganando. Ese alguien es ${n}.`,
  (n: string) => `🚧 ${n} está en la ZONA DEL SÓTANO. Por favor no hacer contacto visual.`,
  (n: string) => `🏳️ ${n} ya no predice, reza. Y ni así le va bien.`,
  (n: string) => `📊 ${n}: más fe que conocimiento futbolístico. Correlación: 0.`,
  (n: string) => `😂 ${n} predijo eso y lo subió. Valentía o ignorancia. El grupo debate.`,
]

interface Props {
  groupId: string
  userId: string
  lastPlaceName: string
  apodoUltimo: string
  /** Si es true, renderiza como ícono pequeño inline (para la tarjeta del ranking) */
  inline?: boolean
}

export default function ZumbarButton({ groupId, userId, lastPlaceName, apodoUltimo, inline = false }: Props) {
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

  // ── Modo inline (ícono de rayo junto al score del último) ──
  if (inline) {
    return (
      <button
        onClick={handleZumbar}
        disabled={loading || sent}
        title={sent ? '¡Pica enviada!' : `Sacar pica a "${apodoUltimo}"`}
        className="zumbar-icon"
        style={{
          width: 30, height: 30, borderRadius: 7, border: 'none', flexShrink: 0,
          background: sent
            ? 'rgba(255,255,255,.07)'
            : 'linear-gradient(135deg, #FF5C5C 0%, #C02020 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: (loading || sent) ? 'default' : 'pointer',
          boxShadow: sent ? 'none' : '0 4px 14px rgba(255,60,60,.4)',
          transition: 'all .2s',
        }}
      >
        {sent ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 6.5l3.5 3.5 6.5-6" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : loading ? (
          <div className="spin" style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
        ) : (
          /* Rayo SVG */
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path d="M8 1L2 8.5h4.5L5 14l6.5-7.5H7L8 1z" fill="white"/>
          </svg>
        )}
      </button>
    )
  }

  // ── Modo bloque (botón ancho, para usarlo como fallback) ──
  return (
    <button
      onClick={handleZumbar}
      disabled={loading || sent}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '14px 18px', borderRadius: 14, border: 'none',
        background: sent
          ? 'rgba(255,255,255,.05)'
          : 'linear-gradient(135deg, #FF5C5C 0%, #C02020 100%)',
        color: sent ? 'rgba(255,255,255,.35)' : '#fff',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14,
        cursor: (loading || sent) ? 'default' : 'pointer',
        boxShadow: sent ? 'none' : '0 6px 24px rgba(255,60,60,.35)',
        transition: 'all .25s',
        letterSpacing: '.03em',
      }}
    >
      {sent ? '⚡ Pica enviada al sótano' : loading ? 'Enviando...' : `⚡ Sacar Pica a "${apodoUltimo}"`}
    </button>
  )
}
