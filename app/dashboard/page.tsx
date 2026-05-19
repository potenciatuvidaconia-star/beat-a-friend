import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Days until World Cup June 11 2026
function daysUntilWorldCup(): number {
  const wc = new Date('2026-06-11T00:00:00Z')
  const now = new Date()
  const diff = wc.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)
    .neq('status', 'banned')
    .order('joined_at', { ascending: false })

  // Enrich each group with ranking context
  const enriched = await Promise.all(
    (memberships ?? []).map(async (m: any) => {
      const { data: allMembers } = await supabase
        .from('group_members')
        .select('user_id, points, profiles(display_name)')
        .eq('group_id', m.group_id)
        .neq('status', 'banned')
        .order('points', { ascending: false })

      const total = allMembers?.length ?? 1
      const myIdx = allMembers?.findIndex((x: any) => x.user_id === user.id) ?? 0
      const rank = myIdx + 1
      const leader = allMembers?.[0] as any
      const isFirst = rank === 1
      const isLast = rank === total && total > 1
      const leaderName = leader?.profiles?.display_name ?? ''
      const leaderPts = leader?.points ?? 0
      const gap = leaderPts - m.points

      return { ...m, rank, total, isFirst, isLast, leaderName, leaderPts, gap }
    })
  )

  const days = daysUntilWorldCup()
  const initial = (profile?.display_name ?? 'U')[0].toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8', paddingBottom: 96 }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .05,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)',
        }} />
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '18px 20px 24px', position: 'relative' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Bienvenido de vuelta
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em', marginTop: 2 }}>
                {profile?.display_name}
              </h1>
            </div>
            <Link href="/perfil" style={{
              width: 44, height: 44, borderRadius: '50%', textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--bf-green) 0%, #008C4A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff',
              boxShadow: '0 4px 12px rgba(0,196,106,.4)', flexShrink: 0,
            }}>
              {initial}
            </Link>
          </div>

          {/* Countdown card */}
          <div style={{
            background: days <= 7
              ? 'linear-gradient(135deg, rgba(206,17,38,.3) 0%, rgba(206,17,38,.15) 100%)'
              : 'rgba(255,255,255,.08)',
            border: days <= 7 ? '1px solid rgba(206,17,38,.5)' : '1px solid rgba(255,255,255,.1)',
            borderRadius: 16, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: days <= 7 ? '#FF8C8C' : '#fff', lineHeight: 1 }}>
                {days}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.06em' }}>
                {days === 1 ? 'DÍA' : 'DÍAS'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>
                {days === 0 ? '¡El Mundial empieza HOY!' : days <= 7 ? '¡El Mundial está a la vuelta!' : 'Para el Mundial 2026'}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>
                {days === 0 ? 'Haz tus predicciones ahora' : '11 de junio · EE.UU / México / Canadá'}
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".6">
                <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="2"/>
                <path d="M2 16h28M16 3C16 3 20 9 20 16s-4 13-4 13" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8h22M5 24h22" stroke="white" strokeWidth="1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── MIS GRUPOS ───────────────────────────────────── */}
        {enriched.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Mis grupos
              </p>
              <Link href="/crear-grupo" style={{
                fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--bf-green)',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                + Nuevo
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enriched.map((m: any) => {
                const accentColor = m.isFirst ? '#FFBA00' : m.isLast ? '#FF5C5C' : 'var(--bf-navy)'
                const accentBg = m.isFirst
                  ? 'linear-gradient(135deg, #FFBA00 0%, #E6A300 100%)'
                  : m.isLast
                  ? 'linear-gradient(135deg, #FF5C5C 0%, #E03E3E 100%)'
                  : 'linear-gradient(135deg, #001F5B 0%, #003087 100%)'
                const apodo = m.isFirst
                  ? m.groups.apodo_primero ?? 'El Profeta'
                  : m.isLast
                  ? m.groups.apodo_ultimo ?? 'El Ciego'
                  : null
                const taunt = m.isLast && m.total > 1
                  ? `${m.leaderName} te lleva ${m.leaderPts - m.points} pts`
                  : m.isFirst && m.total > 1
                  ? `Liderando con ${m.points} pts`
                  : m.gap > 0
                  ? `${m.gap} pts detrás de ${m.leaderName}`
                  : null

                return (
                  <Link
                    key={m.id}
                    href={`/grupo/${m.groups.code}`}
                    style={{
                      display: 'block', textDecoration: 'none',
                      background: 'var(--bf-card)', borderRadius: 20, overflow: 'hidden',
                      border: `1.5px solid ${m.isFirst ? '#FFE099' : m.isLast ? '#FFCACA' : 'var(--bf-border)'}`,
                      boxShadow: m.isFirst
                        ? '0 6px 20px rgba(255,186,0,.2)'
                        : m.isLast
                        ? '0 6px 20px rgba(255,92,92,.15)'
                        : 'var(--bf-shadow-sm)',
                    }}
                  >
                    {/* Colored top bar */}
                    <div style={{ height: 4, background: accentBg }} />

                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Rank badge */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: accentBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: m.isLast ? 11 : 18, color: '#fff',
                      }}>
                        {m.isFirst ? '1°' : m.isLast ? 'últ' : `${m.rank}°`}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.groups.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          {apodo && (
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: accentColor }}>
                              "{apodo}"
                            </span>
                          )}
                          {taunt && (
                            <span style={{ fontSize: 11, color: 'var(--bf-text-3)' }}>{taunt}</span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: accentColor, lineHeight: 1 }}>
                          {m.points}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--bf-text-3)', marginTop: 1 }}>
                          pts · {m.total} jug
                        </p>
                      </div>
                    </div>

                    {/* Payment warning strip */}
                    {m.payment_status === 'pending' && (
                      <div style={{ background: '#FFFBEB', borderTop: '1px solid #FDE68A', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFBA00', flexShrink: 0 }} />
                        <p style={{ fontSize: 11, color: '#7B5800', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                          Pago pendiente — envía $1 por Yappy
                        </p>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────── */}
        {enriched.length === 0 && (
          <div style={{
            background: 'var(--bf-card)', borderRadius: 20, padding: '32px 24px',
            textAlign: 'center', border: '1px dashed var(--bf-border)',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--bf-text)' }}>
              Tus amigos te están esperando
            </p>
            <p style={{ fontSize: 13, color: 'var(--bf-text-3)', marginTop: 6, lineHeight: 1.5 }}>
              Crea un grupo antes de que empiece el Mundial y empieza a cobrar facturas.
            </p>
          </div>
        )}

        {/* ── ACTION BUTTONS ───────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/crear-grupo" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 12px',
            background: 'var(--bf-green)', borderRadius: 18, textDecoration: 'none',
            boxShadow: 'var(--bf-shadow-green)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Nuevo grupo</p>
          </Link>

          <Link href="/mundial" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 12px',
            background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)', borderRadius: 18, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,31,91,.25)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="white" strokeWidth="1.6"/>
              <path d="M1.5 9h15M9 1.5C9 1.5 11.5 5 11.5 9S9 16.5 9 16.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"/>
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Grupos FIFA</p>
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
          { href: '/dashboard', label: 'Inicio', active: true, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: '/mundial', label: 'Mundial', active: false, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: false, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none', color: tab.active ? 'var(--bf-navy)' : 'var(--bf-text-3)',
            padding: '4px 2px',
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{tab.icon}</svg>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: tab.active ? 800 : 600 }}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
