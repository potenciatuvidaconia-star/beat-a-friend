import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDeadline } from '@/lib/utils'
import ShareButton from './ShareButton'

export default async function GrupoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', codigo)
    .single()

  if (!group) redirect('/dashboard')

  const { data: membership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.status === 'banned') {
    redirect(`/unirse/${codigo}`)
  }

  const { data: members } = await supabase
    .from('group_members')
    .select('*, profiles(display_name, avatar_url)')
    .eq('group_id', group.id)
    .neq('status', 'banned')
    .order('points', { ascending: false })

  const total = members?.length ?? 0
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unirse/${codigo}`

  const platformYappy = process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? '507-XXXX-XXXX'
  const apodoPrimero: string = group.apodo_primero ?? 'El Profeta'
  const apodoUltimo: string = group.apodo_ultimo ?? 'El Ciego'
  const premioCastigo: string | null = group.premio_castigo ?? null

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bf-bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bf-navy)', padding: '14px 20px 18px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {group.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999,
                  background: group.mode === 'pro' ? 'rgba(255,92,92,.25)' : 'rgba(0,196,106,.2)',
                  color: group.mode === 'pro' ? '#FF8080' : 'var(--bf-green)',
                }}>
                  {group.mode === 'basic' ? 'Básica' : 'Pro'}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-display)' }}>
                  {total} jugadores
                </span>
              </div>
            </div>
            <ShareButton code={codigo} inviteUrl={inviteUrl} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Warning banner — unpaid with deadline */}
        {membership.status === 'warned' && membership.warning_deadline && (
          <div style={{ background: 'var(--bf-coral-soft)', border: '1.5px solid var(--bf-coral)', borderRadius: 'var(--bf-r-md)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bf-coral)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-coral-dark)', fontSize: 14 }}>Pago pendiente</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--bf-text-2)' }}>
              No hemos recibido tu $1 de Yappy. Tienes{' '}
              <strong>{formatDeadline(membership.warning_deadline)}</strong> o serás removido.
            </p>
            <div style={{ marginTop: 10, background: '#fff', borderRadius: 'var(--bf-r-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Número Yappy', value: platformYappy },
                { label: 'Monto', value: '$1.00', green: true },
                { label: 'Comentario', value: codigo, mono: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--bf-text-3)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.green ? 'var(--bf-green)' : 'var(--bf-text)', fontFamily: row.mono ? 'monospace' : undefined }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soft payment reminder */}
        {membership.payment_status === 'pending' && membership.status !== 'warned' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--bf-r-md)', padding: '12px 14px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#7B5800' }}>
              Recuerda enviar tu $1 por Yappy
            </p>
            <p style={{ fontSize: 12, color: 'var(--bf-text-3)', marginTop: 3 }}>
              Al <strong style={{ color: 'var(--bf-text)' }}>{platformYappy}</strong>{' '}
              con el código <strong style={{ fontFamily: 'monospace', color: 'var(--bf-text)' }}>{codigo}</strong>
            </p>
          </div>
        )}

        {/* Premio/Castigo */}
        {premioCastigo && (
          <div style={{ background: 'var(--bf-navy)', borderRadius: 'var(--bf-r-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Premio / Castigo</p>
              <p style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginTop: 2 }}>{premioCastigo}</p>
            </div>
          </div>
        )}

        {/* Apodos legend */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, background: 'var(--bf-gold-soft)', border: '1px solid #FFE099',
            borderRadius: 'var(--bf-r-sm)', padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bf-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#fff' }}>1</span>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontWeight: 600 }}>Primero</p>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-gold-dark)' }}>{apodoPrimero}</p>
            </div>
          </div>
          <div style={{
            flex: 1, background: 'var(--bf-coral-soft)', border: '1px solid #FFCACA',
            borderRadius: 'var(--bf-r-sm)', padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, color: '#fff' }}>últ</span>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontWeight: 600 }}>Último</p>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-coral-dark)' }}>{apodoUltimo}</p>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Ranking
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members?.map((m: any, i: number) => {
              const pos = i + 1
              const isMe = m.user_id === user.id
              const isFirst = pos === 1
              const isLast = pos === total && total > 1

              let rowBg = 'var(--bf-card)'
              let rowBorder = 'var(--bf-border)'
              if (isFirst) { rowBg = 'var(--bf-gold-soft)'; rowBorder = '#FFE099' }
              else if (isLast) { rowBg = 'var(--bf-coral-soft)'; rowBorder = '#FFCACA' }
              else if (isMe) { rowBg = 'var(--bf-green-soft)'; rowBorder = '#B3F0D4' }

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--bf-r-md)',
                    background: rowBg, border: `1.5px solid ${rowBorder}`,
                    boxShadow: isFirst ? '0 4px 12px rgba(255,186,0,.15)' : 'var(--bf-shadow-sm)',
                  }}
                >
                  {/* Position badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isFirst ? 'var(--bf-gold)' : isLast ? 'var(--bf-coral)' : 'var(--bf-card-soft)',
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: isFirst ? 13 : isLast ? 10 : 14,
                    color: isFirst || isLast ? '#fff' : 'var(--bf-text-3)',
                  }}>
                    {isFirst ? '1' : isLast ? 'últ' : pos}
                  </div>

                  {/* Name + apodo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.profiles.display_name}
                        {isMe && <span style={{ fontSize: 11, color: 'var(--bf-text-3)', fontWeight: 500, marginLeft: 4 }}>(tú)</span>}
                      </p>
                    </div>
                    {isFirst && (
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-gold-dark)' }}>{apodoPrimero}</p>
                    )}
                    {isLast && (
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-coral-dark)' }}>{apodoUltimo}</p>
                    )}
                    {!isFirst && !isLast && m.payment_status === 'pending' && (
                      <p style={{ fontSize: 10, color: '#7B5800', fontWeight: 600 }}>pago pendiente</p>
                    )}
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                      color: isFirst ? 'var(--bf-gold-dark)' : isLast ? 'var(--bf-coral-dark)' : 'var(--bf-text)',
                    }}>
                      {m.points}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--bf-text-3)' }}>pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Predecir CTA */}
        <Link
          href={`/grupo/${codigo}/predicciones`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px', borderRadius: 'var(--bf-r-lg)',
            background: 'var(--bf-navy)', color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            boxShadow: 'var(--bf-shadow-navy)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5"/>
            <path d="M6 9h6M9 6v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Ver partidos y predecir
        </Link>

        {/* Trofeo / Diploma */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link
            href={`/grupo/${codigo}/trofeo`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '16px 12px', borderRadius: 'var(--bf-r-lg)',
              background: 'var(--bf-gold-soft)', border: '1px solid #FFE099',
              textDecoration: 'none',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bf-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2.2 4.4 4.8.7-3.5 3.4.8 4.8L10 13l-4.3 2.3.8-4.8L3 7.1l4.8-.7L10 2z" fill="white"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--bf-gold-dark)' }}>Trofeo</p>
            <p style={{ fontSize: 10, color: 'var(--bf-text-3)', textAlign: 'center', lineHeight: 1.3 }}>{apodoPrimero}</p>
          </Link>
          <Link
            href={`/grupo/${codigo}/diploma`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '16px 12px', borderRadius: 'var(--bf-r-lg)',
              background: 'var(--bf-coral-soft)', border: '1px solid #FFCACA',
              textDecoration: 'none',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bf-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" stroke="white" strokeWidth="1.5"/>
                <path d="M10 7v5M10 14v.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--bf-coral-dark)' }}>Diploma</p>
            <p style={{ fontSize: 10, color: 'var(--bf-text-3)', textAlign: 'center', lineHeight: 1.3 }}>{apodoUltimo}</p>
          </Link>
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bf-card)', borderTop: '1px solid var(--bf-divider)',
        padding: '10px 24px 28px', display: 'flex', justifyContent: 'space-around',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Inicio</span>
        </Link>
        <Link href={`/grupo/${codigo}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-navy)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Ranking</span>
        </Link>
        <Link href={`/grupo/${codigo}/predicciones`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Predecir</span>
        </Link>
      </nav>
    </div>
  )
}
