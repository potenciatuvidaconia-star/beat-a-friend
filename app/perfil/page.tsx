import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import AvatarUpload from './AvatarUpload'
import HeroBall from '@/app/components/HeroBall'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)
    .neq('status', 'banned')
    .order('joined_at', { ascending: false })

  const groupsWithRank = await Promise.all(
    (memberships ?? []).map(async (m: any) => {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id, points')
        .eq('group_id', m.group_id)
        .neq('status', 'banned')
        .order('points', { ascending: false })

      const total = members?.length ?? 1
      const rank = (members?.findIndex((x: any) => x.user_id === user.id) ?? 0) + 1
      return { ...m, rank, total, isFirst: rank === 1, isLast: rank === total && total > 1 }
    })
  )

  const totalGroups = groupsWithRank.length
  const leading = groupsWithRank.filter(g => g.isFirst).length
  const losing = groupsWithRank.filter(g => g.isLast).length
  const totalPoints = (memberships ?? []).reduce((sum: number, m: any) => sum + (m.points ?? 0), 0)
  const isLeadingAny = leading > 0
  const isLosingAll = losing > 0 && leading === 0

  const name = profile?.display_name ?? '?'
  const initial = name[0].toUpperCase()

  // The best apodo (first place one from any group they lead)
  const leaderApodo = groupsWithRank.find(g => g.isFirst)?.groups?.apodo_primero ?? 'El Profeta'
  const loserApodo = groupsWithRank.find(g => g.isLast)?.groups?.apodo_ultimo ?? 'El Ciego'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bf-bg)', paddingBottom: 96 }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <div style={{
        background: isLeadingAny
          ? 'linear-gradient(160deg, #0A0A18 0%, #1A1000 50%, #2A1A00 100%)'
          : isLosingAll
          ? 'linear-gradient(160deg, #0F0A0A 0%, #1A0808 50%, #2A0808 100%)'
          : 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
        paddingBottom: 4,
      }}>
        {/* Tricolor bar */}
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: isLeadingAny ? '#FFBA00' : '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>

        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(60deg, rgba(255,255,255,.03) 0px, rgba(255,255,255,.03) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-60deg, rgba(255,255,255,.03) 0px, rgba(255,255,255,.03) 1px, transparent 1px, transparent 22px)',
        }} />
        <HeroBall size={200} opacity={isLeadingAny ? 0.05 : 0.06} />

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 32px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* ── ALTAR DEL LÍDER ── */}
          {isLeadingAny && (
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
              letterSpacing: '.2em', textTransform: 'uppercase',
              color: '#FFBA00', marginBottom: 16,
            }}>
              ⚡ El Altar del Líder ⚡
            </p>
          )}

          {/* ── ZONA DEL SÓTANO ── */}
          {isLosingAll && (
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
              letterSpacing: '.2em', textTransform: 'uppercase',
              color: '#FF5C5C', marginBottom: 16,
            }}>
              🚧 Zona del Sótano 🚧
            </p>
          )}

          {/* Avatar upload */}
          <AvatarUpload
            userId={user.id}
            currentUrl={profile?.avatar_url ?? null}
            displayName={name}
            isLeader={isLeadingAny}
          />

          {/* Name + apodo */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: isLeadingAny ? 30 : 26,
              color: isLeadingAny ? '#FFBA00' : isLosingAll ? '#FF8C8C' : '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.1,
              fontStyle: isLeadingAny ? 'italic' : 'normal',
            }}>
              {name}
            </h1>
            {(isLeadingAny || isLosingAll) && (
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 15, marginTop: 4,
                color: isLeadingAny ? 'rgba(255,186,0,.8)' : 'rgba(255,92,92,.8)',
              }}>
                "{isLeadingAny ? leaderApodo : loserApodo}"
              </p>
            )}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 6 }}>
              {profile?.email}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 20, width: '100%' }}>
            {[
              { val: totalGroups, label: 'Grupos' },
              {
                val: totalPoints,
                label: 'Puntos',
                accent: isLeadingAny ? '#FFBA00' : undefined,
              },
              {
                val: isLeadingAny ? leading : losing,
                label: isLeadingAny ? 'Ganando' : 'Perdiendo',
                accent: isLeadingAny ? '#00C46A' : '#FF5C5C',
              },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,.07)', borderRadius: 14, padding: '12px 8px', textAlign: 'center',
                border: s.accent ? `1px solid ${s.accent}33` : 'none',
              }}>
                <p className="score score-md" style={{ color: s.accent ?? '#fff' }}>{s.val}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: isLeadingAny || isLosingAll ? 'rgba(255,255,255,.5)' : 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Mis grupos
        </p>

        {groupsWithRank.length === 0 ? (
          <div style={{ background: 'var(--bf-surface)', borderRadius: 16, padding: '32px 20px', textAlign: 'center', border: '1px solid var(--bf-border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--bf-text-2)' }}>Todavía no estás en ningún grupo</p>
            <Link href="/crear-grupo" style={{ display: 'inline-block', marginTop: 14, padding: '10px 22px', borderRadius: 999, background: 'var(--bf-green)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Crear grupo →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groupsWithRank.map((m: any) => {
              const apodo = m.isFirst
                ? m.groups.apodo_primero ?? 'El Profeta'
                : m.isLast
                ? m.groups.apodo_ultimo ?? 'El Ciego'
                : null
              const accentColor = m.isFirst ? '#FFBA00' : m.isLast ? '#FF5C5C' : 'var(--bf-text-2)'
              const cardBg = m.isFirst ? 'rgba(255,186,0,.1)' : m.isLast ? 'rgba(255,40,40,.08)' : 'var(--bf-surface)'

              return (
                <Link
                  key={m.id}
                  href={`/grupo/${m.groups.code}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: cardBg, borderRadius: 18, padding: '14px 16px',
                    border: `1.5px solid ${m.isFirst ? 'rgba(255,186,0,.3)' : m.isLast ? 'rgba(255,92,92,.25)' : 'rgba(255,255,255,.08)'}`,
                    textDecoration: 'none',
                    boxShadow: m.isFirst ? '0 4px 16px rgba(255,186,0,.15)' : 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: m.isFirst
                      ? 'linear-gradient(135deg, #FFBA00 0%, #E6A300 100%)'
                      : m.isLast
                      ? 'linear-gradient(135deg, #FF5C5C 0%, #E03E3E 100%)'
                      : 'rgba(255,255,255,.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: m.isLast ? 10 : 16, color: '#fff',
                  }}>
                    {m.isFirst ? '1°' : m.isLast ? '🚧' : `${m.rank}°`}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.groups.name}
                    </p>
                    {apodo && (
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: accentColor, marginTop: 2 }}>
                        "{apodo}"
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: accentColor, lineHeight: 1 }}>
                      {m.points}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
                      pts · {m.rank}/{m.total}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <Link href="/crear-grupo" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: 'var(--bf-green)', borderRadius: 18, textDecoration: 'none',
          boxShadow: 'var(--bf-shadow-green)',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Crear nuevo grupo</p>
        </Link>

        <LogoutButton />
      </div>

      {/* ── BOTTOM NAV ──────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,12,.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--bf-border)',
        padding: '8px 8px 26px', display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { href: '/dashboard', label: 'Inicio', active: false, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: '/dashboard', label: 'Ranking', active: false, icon: <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
          { href: '/mundial', label: 'Grupos', active: false, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: true, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
        ].map(tab => (
          <Link key={tab.label} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none',
            color: tab.active
              ? (isLeadingAny ? '#FFBA00' : isLosingAll ? '#FF8C8C' : 'var(--bf-navy)')
              : (isLeadingAny || isLosingAll ? 'rgba(255,255,255,.4)' : 'var(--bf-text-3)'),
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
