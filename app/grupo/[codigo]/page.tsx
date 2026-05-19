import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDeadline } from '@/lib/utils'
import ShareButton from './ShareButton'
import GroupChat from './GroupChat'
import ZumbarButton from './ZumbarButton'
import HeroBall from '@/app/components/HeroBall'
import Wordmark from '@/app/components/Wordmark'

/** Deterministic color from user_id string */
function avatarColor(userId: string): string {
  const colors = ['#00C46A','#001F5B','#FFBA00','#FF5C5C','#7C3AED','#0EA5E9','#F97316','#10B981']
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

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

  // Fetch last 50 chat messages
  const { data: initialMessages } = await supabase
    .from('group_messages')
    .select('*, profiles(display_name)')
    .eq('group_id', group.id)
    .order('created_at', { ascending: true })
    .limit(50)

  const platformYappy = process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? '507-XXXX-XXXX'
  const apodoPrimero: string = group.apodo_primero ?? 'El Profeta'
  const apodoUltimo: string = group.apodo_ultimo ?? 'El Ciego'
  const premioCastigo: string | null = group.premio_castigo ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8', paddingBottom: 96 }}>

      {/* ── HERO HEADER ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px)',
        }} />
        <HeroBall size={220} opacity={0.06} />

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 24px', position: 'relative' }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 14 }}>
            <Wordmark center={false} />
          </div>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  letterSpacing: '.12em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 999,
                  background: group.mode === 'pro' ? 'rgba(255,92,92,.3)' : 'rgba(0,196,106,.25)',
                  color: group.mode === 'pro' ? '#FF8C8C' : '#4DEBA0',
                  border: `1px solid ${group.mode === 'pro' ? 'rgba(255,92,92,.4)' : 'rgba(0,196,106,.4)'}`,
                }}>
                  {group.mode === 'basic' ? 'Básica' : 'Pro'}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-display)' }}>
                  {total} {total === 1 ? 'jugador' : 'jugadores'}
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30,
                color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1,
              }}>
                {group.name}
              </h1>
            </div>
            <ShareButton code={codigo} inviteUrl={inviteUrl} />
          </div>

          {/* Apodos banner inside header */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              flex: 1, background: 'rgba(255,186,0,.15)', border: '1px solid rgba(255,186,0,.3)',
              borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--bf-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff',
              }}>1</div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 600 }}>Primero</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#FFD740' }}>{apodoPrimero}</p>
              </div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,92,92,.15)', border: '1px solid rgba(255,92,92,.3)',
              borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--bf-coral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, color: '#fff',
              }}>últ</div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 600 }}>Último</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#FF8C8C' }}>{apodoUltimo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Warning banner */}
        {membership.status === 'warned' && membership.warning_deadline && (
          <div style={{ background: '#fff', border: '2px solid var(--bf-coral)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ background: 'var(--bf-coral)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'var(--bf-coral)', fontSize: 12, fontWeight: 800 }}>!</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 13 }}>Pago pendiente</p>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--bf-text-2)' }}>
                No hemos recibido tu $1. Tienes <strong>{formatDeadline(membership.warning_deadline)}</strong> o serás removido.
              </p>
              <div style={{ marginTop: 10, background: '#F7F8FC', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
          </div>
        )}

        {/* Soft payment reminder */}
        {membership.payment_status === 'pending' && membership.status !== 'warned' && (
          <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '12px 16px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#7B5800' }}>
              Recuerda enviar tu $1 por Yappy
            </p>
            <p style={{ fontSize: 12, color: 'var(--bf-text-3)', marginTop: 3 }}>
              Al <strong style={{ color: 'var(--bf-text)' }}>{platformYappy}</strong>{' '}· código <strong style={{ fontFamily: 'monospace' }}>{codigo}</strong>
            </p>
          </div>
        )}

        {/* Premio/Castigo */}
        {premioCastigo && (
          <div style={{
            background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B6B 100%)',
            borderRadius: 18, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,186,0,.2)', border: '1px solid rgba(255,186,0,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2.2 4.4 4.8.7-3.5 3.4.8 4.8L10 13l-4.3 2.3.8-4.8L3 7.1l4.8-.7L10 2z" fill="#FFBA00"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Premio / Castigo</p>
              <p style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginTop: 3 }}>{premioCastigo}</p>
            </div>
          </div>
        )}

        {/* ── RANKING ───────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--bf-gold), transparent)' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--bf-text-2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Ranking
            </p>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(270deg, var(--bf-gold), transparent)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members?.map((m: any, i: number) => {
              const pos = i + 1
              const isMe = m.user_id === user.id
              const isFirst = pos === 1
              const isLast = pos === total && total > 1
              const avatarUrl: string | null = m.profiles?.avatar_url ?? null
              const displayName: string = m.profiles?.display_name ?? '?'
              const initial = displayName[0].toUpperCase()
              const color = avatarColor(m.user_id)

              // Shared avatar element helper
              const AvatarCircle = ({ size, border }: { size: number; border?: string }) => (
                <div style={{
                  width: size, height: size, borderRadius: '50%', flexShrink: 0,
                  overflow: 'hidden', border: border ?? 'none',
                  background: avatarUrl ? 'transparent' : color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.38, color: '#fff' }}>{initial}</span>
                  }
                </div>
              )

              if (isFirst) {
                return (
                  <div key={m.id} className="shimmer-gold" style={{
                    borderRadius: 20, padding: '16px 18px',
                    boxShadow: '0 8px 24px rgba(255,186,0,.4)',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <AvatarCircle size={52} border="3px solid rgba(255,255,255,.6)" />
                      <div style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#E6A300',
                        boxShadow: '0 2px 6px rgba(0,0,0,.2)',
                      }}>1°</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff', lineHeight: 1 }}>
                        {displayName}
                        {isMe && <span style={{ fontSize: 12, opacity: .7, marginLeft: 6 }}>(tú)</span>}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,.8)', marginTop: 3 }}>
                        ⚡ {apodoPrimero}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1 }}>{m.points}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>pts</p>
                    </div>
                  </div>
                )
              }

              if (isLast) {
                return (
                  <div key={`sótano-${m.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* ZONA DEL SÓTANO divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,92,92,.3)' }} />
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, color: '#FF5C5C', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                        🚧 Zona del Sótano 🚧
                      </p>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,92,92,.3)' }} />
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #2A0808 0%, #1F0505 100%)',
                      borderRadius: 20, padding: '14px 18px',
                      boxShadow: '0 6px 18px rgba(255,92,92,.25)',
                      border: '1.5px solid rgba(255,92,92,.4)',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <AvatarCircle size={46} border="2px solid rgba(255,92,92,.5)" />
                        <div style={{
                          position: 'absolute', bottom: -4, right: -4,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#FF5C5C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11,
                        }}>🚧</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#FF8C8C', lineHeight: 1 }}>
                          {displayName}
                          {isMe && <span style={{ fontSize: 12, opacity: .7, marginLeft: 6 }}>(tú)</span>}
                        </p>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'rgba(255,140,140,.7)', marginTop: 3 }}>
                          {apodoUltimo}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#FF8C8C', lineHeight: 1 }}>{m.points}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,140,140,.5)' }}>pts</p>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={m.id} style={{
                  background: isMe ? 'var(--bf-green-soft)' : '#fff',
                  border: `1.5px solid ${isMe ? 'rgba(0,196,106,.35)' : 'var(--bf-border)'}`,
                  borderRadius: 16, padding: '11px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <AvatarCircle size={38} border="1.5px solid var(--bf-border)" />
                    <div style={{
                      position: 'absolute', bottom: -3, right: -3,
                      width: 17, height: 17, borderRadius: '50%',
                      background: isMe ? 'var(--bf-green)' : 'var(--bf-card-soft)',
                      border: `1.5px solid ${isMe ? 'var(--bf-green-soft)' : 'var(--bf-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 9,
                      color: isMe ? '#fff' : 'var(--bf-text-3)',
                    }}>{pos}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayName}
                      {isMe && <span style={{ fontSize: 11, color: 'var(--bf-text-3)', marginLeft: 4 }}>(tú)</span>}
                    </p>
                    {m.payment_status === 'pending' && (
                      <p style={{ fontSize: 10, color: '#7B5800', fontWeight: 600, marginTop: 2 }}>pago pendiente</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: isMe ? 'var(--bf-green-dark)' : 'var(--bf-text)' }}>{m.points}</p>
                    <p style={{ fontSize: 10, color: 'var(--bf-text-3)' }}>pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── ZUMBAR BUTTON (only when 2+ members) ─────── */}
        {total > 1 && (
          <ZumbarButton
            groupId={group.id}
            userId={user.id}
            lastPlaceName={members?.[total - 1]?.profiles?.display_name ?? '?'}
            apodoUltimo={apodoUltimo}
          />
        )}

        {/* ── PREDECIR CTA ──────────────────────────────── */}
        <Link
          href={`/grupo/${codigo}/predicciones`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '18px', borderRadius: 20,
            background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17,
            boxShadow: '0 8px 24px rgba(0,31,91,.35)',
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
            <circle cx="11" cy="11" r="4" fill="rgba(255,255,255,.2)"/>
            <path d="M11 2.5C11 2.5 14 6 14 11s-3 8.5-3 8.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"/>
            <path d="M2.5 11h17" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"/>
          </svg>
          Ver partidos y predecir
        </Link>

        {/* ── CHAT GRUPAL ───────────────────────────────── */}
        <GroupChat
          groupId={group.id}
          currentUserId={user.id}
          initialMessages={(initialMessages ?? []) as any}
        />

        {/* ── TROFEO / DIPLOMA ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link
            href={`/grupo/${codigo}/trofeo`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '20px 12px',
              background: 'linear-gradient(145deg, #FFBA00 0%, #E6A300 100%)',
              borderRadius: 20, textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(255,186,0,.3)',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 2.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L13 2.5z" fill="white"/>
                <path d="M9.5 21h7M13 17v4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>Trofeo</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>{apodoPrimero}</p>
            </div>
          </Link>

          <Link
            href={`/grupo/${codigo}/diploma`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '20px 12px',
              background: 'linear-gradient(145deg, #FF5C5C 0%, #E03E3E 100%)',
              borderRadius: 20, textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(255,92,92,.25)',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 3C7.5 3 3 7.5 3 13s4.5 10 10 10 10-4.5 10-10S18.5 3 13 3z" stroke="white" strokeWidth="1.8"/>
                <path d="M13 8v7" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="13" cy="18" r="1.2" fill="white"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>Diploma</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>{apodoUltimo}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--bf-divider)',
        padding: '8px 8px 26px', display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { href: '/dashboard', label: 'Inicio', active: false, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: `/grupo/${codigo}`, label: 'Ranking', active: true, icon: <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
          { href: '/mundial', label: 'Mundial', active: false, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: false, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none', color: tab.active ? 'var(--bf-navy)' : 'var(--bf-text-3)',
            padding: '4px 2px',
          }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">{tab.icon}</svg>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: tab.active ? 800 : 600 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
