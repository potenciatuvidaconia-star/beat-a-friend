'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PLATFORM_YAPPY = process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? '507-XXXX-XXXX'

interface Group {
  id: string
  name: string
  code: string
  mode: string
}

export default function UnirseClient({ group, userId }: { group: Group; userId: string }) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setJoining(true)
    const supabase = createClient()
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      status: 'active',
      payment_status: 'pending',
    })
    setJoined(true)
    setJoining(false)
  }

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bf-bg)' }}>
        {/* Top stripe */}
        <div style={{ background: 'var(--bf-green)', padding: '32px 24px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,.25)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 14l7 7 13-13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>
              Ya estás dentro
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 6 }}>
              Ahora envía $1 por Yappy para confirmar tu lugar
            </p>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 420, margin: '0 auto', padding: '20px 20px 40px', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment instructions */}
          <div style={{
            background: 'var(--bf-card)', borderRadius: 'var(--bf-r-lg)',
            border: '1px solid var(--bf-border)', overflow: 'hidden',
          }}>
            <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '12px 16px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#7B5800' }}>
                Instrucciones de pago Yappy
              </p>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Número', value: PLATFORM_YAPPY },
                { label: 'Monto', value: '$1.00', green: true },
                { label: 'Comentario', value: group.code, mono: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                  <span style={{ color: 'var(--bf-text-3)' }}>{row.label}</span>
                  <span style={{ fontFamily: row.mono ? 'monospace' : undefined, fontWeight: 700, color: row.green ? 'var(--bf-green)' : 'var(--bf-text)', fontSize: row.mono ? 15 : undefined }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bf-card-soft)', borderTop: '1px solid var(--bf-border)', padding: '10px 16px' }}>
              <p style={{ fontSize: 12, color: 'var(--bf-text-3)' }}>
                Pon el código <strong style={{ fontFamily: 'monospace', color: 'var(--bf-text)' }}>{group.code}</strong>{' '}
                en el comentario para que te identifiquemos.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/grupo/${group.code}`)}
            className="btn btn-primary"
          >
            Ir al grupo →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bf-bg)' }}>
      {/* Top stripe */}
      <div className="stripe-navy" style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)',
            marginBottom: 10,
          }}>
            Invitación al grupo
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,.6)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Te invitan a
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.02em', marginTop: 4 }}>
            {group.name}
          </p>
          <div style={{ marginTop: 10 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999,
              background: group.mode === 'pro' ? 'rgba(255,92,92,.22)' : 'rgba(0,196,106,.18)',
              color: group.mode === 'pro' ? '#FF8080' : 'var(--bf-green)',
            }}>
              {group.mode === 'basic' ? 'Quiniela Básica' : 'Quiniela Pro'} · Mundial 2026
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 420, margin: '0 auto', padding: '20px 20px 40px', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* How it works */}
        <div style={{ background: 'var(--bf-card)', borderRadius: 'var(--bf-r-lg)', border: '1px solid var(--bf-border)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bf-divider)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Cómo funciona</p>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { num: '1', text: 'Entras gratis y predices de inmediato', color: 'var(--bf-green)' },
              { num: '2', text: 'Envías $1 por Yappy para confirmar tu lugar', color: 'var(--bf-gold)' },
              { num: '3', text: 'El que más puntos acumule gana', color: 'var(--bf-navy)' },
              { num: '4', text: 'El último se lleva el diploma de vergüenza', color: 'var(--bf-coral)' },
            ].map(item => (
              <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#fff',
                }}>
                  {item.num}
                </div>
                <p style={{ fontSize: 14, color: 'var(--bf-text-2)', lineHeight: 1.45, paddingTop: 3 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn btn-primary"
        >
          {joining ? 'Uniéndome...' : 'Entrar al grupo →'}
        </button>
      </div>
    </div>
  )
}
