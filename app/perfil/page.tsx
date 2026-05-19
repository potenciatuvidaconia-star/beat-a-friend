import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import HeroBall from '@/app/components/HeroBall'
import Wordmark from '@/app/components/Wordmark'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  // Get all memberships with group info
  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)
    .neq('status', 'banned')
    .order('joined_at', { ascending: false })

  // For each group, calculate the user's rank
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
      const isFirst = rank === 1
      const isLast = rank === total && total > 1

      return { ...m, rank, total, isFirst, isLast }
    })
  )

  const totalGroups = groupsWithRank.length
  const leading = groupsWithRank.filter(g => g.isFirst).length
  const losing = groupsWithRank.filter(g => g.isLast).length
  const initial = (profile?.display_name ?? '?')[0].toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8', paddingBottom: 96 }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 60%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px)',
        }} />
        <HeroBall size={200} opacity={0.07} />
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 28px', position: 'relative' }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 16 }}>
            <Wordmark center={false} />
          </div>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--bf-green) 0%, #008C4A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: '#fff',
              boxShadow: '0 6px 20px rgba(0,196,106,.4)',
            }}>
              {initial}
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Jugador
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {profile?.display_name}
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
                {profile?.email}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff', lineHeight: 1 }}>{totalGroups}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>Grupos</p>
            </div>
            <div style={{ background: 'rgba(0,196,106,.15)', border: '1px solid rgba(0,196,106,.3)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#4DEBA0', lineHeight: 1 }}>{leading}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>Ganando</p>
            </div>
            <div style={{ background: 'rgba(255,92,92,.15)', border: '1px solid rgba(255,92,92,.3)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#FF8C8C', lineHeight: 1 }}>{losing}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>Perdiendo</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── MIS GRUPOS ───────────────────────────────────── */}
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Mis grupos
        </p>

        {groupsWithRank.length === 0 ? (
          <div style={{ background: 'var(--bf-card)', borderRadius: 18, padding: '32px 20px', textAlign: 'center', border: '1px solid var(--bf-border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--bf-text-2)' }}>Todavía no estás en ningún grupo</p>
            <p style={{ fontSize: 13, color: 'var(--bf-text-3)', marginTop: 4 }}>Crea uno o pídele el link a un amigo</p>
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

              const accentColor = m.isFirst ? '#FFBA00' : m.isLast ? '#FF5C5C' : 'var(--bf-navy)'
              const accentBg = m.isFirst
                ? 'linear-gradient(135deg, #FFBA00 0%, #E6A300 100%)'
                : m.isLast
                ? 'linear-gradient(135deg, #FF5C5C 0%, #E03E3E 100%)'
                : 'linear-gradient(135deg, #001F5B 0%, #003087 100%)'

              return (
                <Link
                  key={m.id}
                  href={`/grupo/${m.groups.code}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bf-card)', borderRadius: 18, padding: '14px 16px',
                    border: `1.5px solid ${m.isFirst ? '#FFE099' : m.isLast ? '#FFCACA' : 'var(--bf-border)'}`,
                    textDecoration: 'none',
                    boxShadow: m.isFirst ? '0 4px 16px rgba(255,186,0,.18)' : m.isLast ? '0 4px 16px rgba(255,92,92,.12)' : 'var(--bf-shadow-sm)',
                  }}
                >
                  {/* Rank badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: accentBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: m.isLast ? 10 : 16, color: '#fff',
                  }}>
                    {m.isFirst ? '1' : m.isLast ? 'últ' : `${m.rank}°`}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.groups.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                        letterSpacing: '.04em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 999,
                        background: m.groups.mode === 'pro' ? 'var(--bf-coral-soft)' : 'var(--bf-green-soft)',
                        color: m.groups.mode === 'pro' ? 'var(--bf-coral-dark)' : 'var(--bf-green-dark)',
                      }}>
                        {m.groups.mode === 'basic' ? 'Básica' : 'Pro'}
                      </span>
                      {apodo && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: accentColor }}>
                          "{apodo}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: accentColor, lineHeight: 1 }}>
                      {m.points}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--bf-text-3)', marginTop: 1 }}>
                      pts · {m.rank}/{m.total}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── ACCIONES ─────────────────────────────────────── */}
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

      {/* ── BOTTOM NAV ───────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--bf-divider)',
        padding: '8px 8px 26px', display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { href: '/dashboard', label: 'Inicio', active: false, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: '/dashboard', label: 'Ranking', active: false, icon: <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
          { href: '/mundial', label: 'Mundial', active: false, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: true, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
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
