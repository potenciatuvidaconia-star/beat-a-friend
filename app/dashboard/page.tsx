import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroBall from '@/app/components/HeroBall'
import Wordmark from '@/app/components/Wordmark'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – path has brackets in folder name, works fine at runtime
import GroupChat from '@/app/grupo/[codigo]/GroupChat'

function daysUntilWorldCup(): number {
  const wc = new Date('2026-06-11T00:00:00Z')
  const now = new Date()
  return Math.max(0, Math.ceil((wc.getTime() - now.getTime()) / 86_400_000))
}

function todayLabel() {
  return new Date().toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** top N entries, including all ties at the Nth position */
function topN(arr: { userId: string; name: string; pts: number }[], n: number) {
  if (!arr.length) return []
  const sorted = [...arr].sort((a, b) => b.pts - a.pts)
  const cutoff = sorted[Math.min(n, sorted.length) - 1]?.pts ?? 0
  return sorted.filter(d => d.pts >= cutoff && d.pts > 0)
}

/** bottom N entries, excluding already-shown top performers, including ties */
function bottomN(
  arr: { userId: string; name: string; pts: number }[],
  n: number,
  exclude: string[],
) {
  const rest = [...arr].filter(d => !exclude.includes(d.userId)).sort((a, b) => a.pts - b.pts)
  if (!rest.length) return []
  const cutoff = rest[Math.min(n, rest.length) - 1]?.pts ?? 0
  return rest.filter(d => d.pts <= cutoff)
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

  // Fetch today's finished match IDs once (shared across all groups)
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'finished')
    .gte('match_date', `${todayStr}T00:00:00Z`)
    .lte('match_date', `${todayStr}T23:59:59Z`)
  const todayMatchIds = (todayMatches ?? []).map((x: any) => x.id)

  // Enrich each group with full ranking + daily stats
  const enriched = await Promise.all(
    (memberships ?? []).map(async (m: any) => {
      // Full ranking
      const { data: allMembers } = await supabase
        .from('group_members')
        .select('user_id, points, profiles(display_name, avatar_url)')
        .eq('group_id', m.group_id)
        .neq('status', 'banned')
        .order('points', { ascending: false })

      const total = allMembers?.length ?? 1
      const myIdx = allMembers?.findIndex((x: any) => x.user_id === user.id) ?? 0
      const rank = myIdx + 1
      const isFirst = rank === 1
      const isLast = rank === total && total > 1

      // Daily stats for this group
      let dailyStats: { userId: string; name: string; pts: number }[] = []
      if (todayMatchIds.length > 0) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('user_id, points_earned, profiles(display_name)')
          .eq('group_id', m.group_id)
          .in('match_id', todayMatchIds)
          .not('points_earned', 'is', null)

        const byUser: Record<string, { name: string; pts: number }> = {}
        for (const p of preds ?? []) {
          const uid = (p as any).user_id
          const name = (p as any).profiles?.display_name ?? '?'
          if (!byUser[uid]) byUser[uid] = { name, pts: 0 }
          byUser[uid].pts += (p as any).points_earned ?? 0
        }
        dailyStats = Object.entries(byUser)
          .map(([userId, d]) => ({ userId, name: d.name, pts: d.pts }))
          .sort((a, b) => b.pts - a.pts)
      }

      const top = topN(dailyStats, 3)
      const bottom = bottomN(dailyStats, 3, top.map(t => t.userId))

      // Fetch last 30 chat messages for this group
      const { data: chatMessages } = await supabase
        .from('group_messages')
        .select('*, profiles(display_name)')
        .eq('group_id', m.group_id)
        .order('created_at', { ascending: true })
        .limit(30)

      return {
        ...m,
        allMembers: allMembers ?? [],
        rank, total, isFirst, isLast,
        dailyTop: top,
        dailyBottom: bottom,
        hasDailyData: dailyStats.length > 0,
        chatMessages: chatMessages ?? [],
      }
    })
  )

  const days = daysUntilWorldCup()
  const initial = (profile?.display_name ?? 'U')[0].toUpperCase()
  const avatarUrl: string | null = profile?.avatar_url ?? null

  // Personalized greeting based on overall position
  const isLeadingAny = enriched.some(g => g.isFirst)
  const isLosingAll = enriched.length > 0 && enriched.every(g => g.isLast)
  const leaderGreetings = [
    '¡Eres el rey! 👑 Que nadie te quite el trono.',
    '🔥 Arriba en el marcador. Así se hace.',
    '⚡ El Profeta ha llegado. Los demás, a sufrir.',
    '🏆 Primero en todo. Que quede claro.',
  ]
  const loserGreetings = [
    '😬 ¿Todo bien en casa? El sótano te espera.',
    '🚧 Sigue intentándolo. El fútbol es así… o no.',
    '📉 Las predicciones no son lo tuyo. Pero aquí seguimos.',
    '💀 El grupo manda condolencias. Tú sabes.',
  ]
  const neutralGreetings = [
    'Bienvenido de vuelta ⚽',
    '¡A predecir se dijo! 🎯',
    'El Mundial espera 🌍',
  ]
  function pickGreeting(arr: string[], seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
    return arr[Math.abs(h) % arr.length]
  }
  const todaySeed = new Date().toDateString() + (profile?.id ?? '')
  const greeting = isLeadingAny
    ? pickGreeting(leaderGreetings, todaySeed)
    : isLosingAll
    ? pickGreeting(loserGreetings, todaySeed)
    : pickGreeting(neutralGreetings, todaySeed)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bf-bg)', paddingBottom: 96 }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>
        {/* Diamond net texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-60deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 22px)',
        }} />
        <HeroBall size={210} opacity={0.07} />

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 24px', position: 'relative' }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 16 }}>
            <Wordmark center={false} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: isLeadingAny ? 'rgba(255,186,0,.7)' : isLosingAll ? 'rgba(255,92,92,.7)' : 'rgba(255,255,255,.45)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {greeting}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: isLeadingAny ? '#FFBA00' : '#fff', letterSpacing: '-0.02em', marginTop: 2 }}>
                {profile?.display_name}
              </h1>
            </div>
            <Link href="/perfil" style={{
              width: 46, height: 46, borderRadius: '50%', textDecoration: 'none', flexShrink: 0,
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--bf-green) 0%, #008C4A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff',
              boxShadow: isLeadingAny ? '0 0 0 3px #FFBA00, 0 4px 12px rgba(255,186,0,.5)' : '0 4px 12px rgba(0,196,106,.4)',
              border: isLeadingAny ? '2px solid #FFBA00' : 'none',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={profile?.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial
              }
            </Link>
          </div>

          {/* Countdown */}
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
                11 de junio · EE.UU / México / Canadá
              </p>
            </div>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".5">
              <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="2"/>
              <path d="M2 16h28M16 3C16 3 20 9 20 16s-4 13-4 13" stroke="white" strokeWidth="1.5"/>
              <path d="M5 8h22M5 24h22" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bf-bg)' }}>

        {/* ── EMPTY STATE ──────────────────────────────────── */}
        {enriched.length === 0 && (
          <div style={{
            background: 'var(--bf-surface)', borderRadius: 18, padding: '36px 24px',
            textAlign: 'center', border: '1px dashed var(--bf-border)',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--bf-text)' }}>
              Tus amigos te están esperando
            </p>
            <p style={{ fontSize: 13, color: 'var(--bf-text-3)', marginTop: 6, lineHeight: 1.5 }}>
              Crea un grupo antes del Mundial y empieza a cobrar facturas.
            </p>
          </div>
        )}

        {/* ── GROUP SECTIONS ───────────────────────────────── */}
        {enriched.map((m: any) => {
          const apodoPrimero = m.groups.apodo_primero ?? 'El Profeta'
          const apodoUltimo = m.groups.apodo_ultimo ?? 'El Ciego'

          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Group header */}
              <Link
                href={`/grupo/${m.groups.code}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)',
                  borderRadius: 18, textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0,31,91,.2)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>
                    {m.groups.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                      letterSpacing: '.06em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 999,
                      background: m.groups.mode === 'pro' ? 'rgba(255,92,92,.3)' : 'rgba(0,196,106,.25)',
                      color: m.groups.mode === 'pro' ? '#FF8C8C' : '#4DEBA0',
                    }}>
                      {m.groups.mode === 'basic' ? 'Básica' : 'Pro'}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>
                      {m.total} jugadores
                    </span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity=".5">
                  <path d="M5 3l6 5-6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              {/* ── RANKING ─────────────────────────────────── */}
              <div style={{
                background: 'var(--bf-surface)',
                borderRadius: 16,
                border: '1px solid var(--bf-border)',
                overflow: 'hidden',
              }}>
                {m.allMembers.map((member: any, i: number) => {
                  const pos = i + 1
                  const isMe = member.user_id === user.id
                  const isFst = pos === 1
                  const isLst = pos === m.total && m.total > 1
                  const name = member.profiles?.display_name ?? '?'
                  const memberAvatar: string | null = member.profiles?.avatar_url ?? null
                  const memberInitial = name[0].toUpperCase()
                  const memberColor = (() => {
                    const colors = ['#00C46A','#001F5B','#FFBA00','#FF5C5C','#7C3AED','#0EA5E9','#F97316','#10B981']
                    let h = 0; for (let k = 0; k < member.user_id.length; k++) h = member.user_id.charCodeAt(k) + ((h << 5) - h)
                    return colors[Math.abs(h) % colors.length]
                  })()

                  const MiniAvatar = ({ size }: { size: number }) => (
                    <div style={{
                      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                      background: memberAvatar ? 'transparent' : memberColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {memberAvatar
                        ? <img src={memberAvatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.4, color: '#fff' }}>{memberInitial}</span>
                      }
                    </div>
                  )

                  if (isFst) {
                    return (
                      <div key={member.user_id} className="shimmer-gold" style={{
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <MiniAvatar size={40} />
                          <div style={{
                            position: 'absolute', bottom: -3, right: -3,
                            width: 16, height: 16, borderRadius: '50%', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#E6A300',
                          }}>1°</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>
                            {name}{isMe && <span style={{ fontSize: 11, opacity: .7, marginLeft: 6 }}>(tú)</span>}
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 1 }}>⚡ {apodoPrimero}</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff' }}>
                          {member.points}<span style={{ fontSize: 11, fontWeight: 600, opacity: .7, marginLeft: 2 }}>pts</span>
                        </p>
                      </div>
                    )
                  }

                  if (isLst) {
                    return (
                      <div key={member.user_id} style={{
                        background: 'linear-gradient(135deg, #0F0505 0%, #180808 100%)',
                        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        borderTop: '1px solid rgba(206,17,38,.3)',
                      }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ filter: 'grayscale(100%) brightness(0.65)' }}>
                            <MiniAvatar size={36} />
                          </div>
                          <div style={{
                            position: 'absolute', bottom: -3, right: -3,
                            width: 14, height: 14, borderRadius: '50%', background: '#CE1126',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8,
                          }}>🚧</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#FF8C8C' }}>
                            {name}{isMe && <span style={{ fontSize: 11, opacity: .6, marginLeft: 6 }}>(tú)</span>}
                          </p>
                          <p style={{ fontSize: 10, color: 'rgba(255,120,120,.5)', marginTop: 1 }}>{apodoUltimo}</p>
                        </div>
                        <p className="score score-sm neon-red">{member.points}<span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600, opacity: .6, marginLeft: 3 }}>pts</span></p>
                      </div>
                    )
                  }

                  return (
                    <div key={member.user_id} style={{
                      padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12,
                      background: isMe ? 'rgba(0,196,106,.07)' : 'transparent',
                      borderTop: '1px solid var(--bf-divider)',
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <MiniAvatar size={32} />
                        <div style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 14, height: 14, borderRadius: '50%',
                          background: isMe ? 'var(--bf-green)' : 'var(--bf-card-soft)',
                          border: `1.5px solid ${isMe ? 'var(--bf-green-soft)' : 'var(--bf-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 8,
                          color: isMe ? '#fff' : 'var(--bf-text-3)',
                        }}>{pos}</div>
                      </div>
                      <p style={{
                        flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                        color: 'var(--bf-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {name}{isMe && <span style={{ fontSize: 11, color: 'var(--bf-text-3)', marginLeft: 4 }}>(tú)</span>}
                      </p>
                      <p className="score score-sm" style={{ color: isMe ? 'var(--bf-green)' : 'var(--bf-text)' }}>
                        {member.points}<span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--bf-text-3)', marginLeft: 2 }}>pts</span>
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* ── HOY ─────────────────────────────────────── */}
              {m.hasDailyData && (
                <div style={{
                  background: 'var(--bf-surface)', borderRadius: 16,
                  border: '1px solid var(--bf-border)',
                  overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '10px 16px',
                    background: 'rgba(0,196,106,.04)',
                    borderBottom: '1px solid var(--bf-divider)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C46A', boxShadow: '0 0 6px #00C46A' }} />
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--bf-text-2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      Hoy · {todayLabel()}
                    </p>
                  </div>

                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Top performers */}
                    {m.dailyTop.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1l1.5 3 3.3.5-2.4 2.3.6 3.3L7 8.8l-3 1.3.6-3.3L2.2 4.5 5.5 4 7 1z" fill="#FFBA00"/>
                          </svg>
                          <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#7B5800', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                            Mejores del día
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {m.dailyTop.map((d: any, i: number) => {
                            const isMe = d.userId === user.id
                            return (
                              <div key={d.userId} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: i === 0 ? 'rgba(255,186,0,.1)' : 'transparent',
                                borderRadius: 10, padding: '6px 10px',
                              }}>
                                <div style={{
                                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                  background: i === 0 ? '#FFBA00' : 'var(--bf-card-soft)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10,
                                  color: i === 0 ? '#fff' : 'var(--bf-text-3)',
                                }}>
                                  {i === 0 ? '1' : i + 1}
                                </div>
                                <p style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--bf-text)' }}>
                                  {d.name}{isMe && <span style={{ color: 'var(--bf-text-3)', fontSize: 11, marginLeft: 4 }}>(tú)</span>}
                                </p>
                                <div style={{
                                  padding: '3px 10px', borderRadius: 999,
                                  background: 'rgba(255,186,0,.15)', border: '1px solid rgba(255,186,0,.4)',
                                }}>
                                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#7B5800' }}>
                                    +{d.pts} pts
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Divider between top and bottom */}
                    {m.dailyTop.length > 0 && m.dailyBottom.length > 0 && (
                      <div style={{ height: 1, background: 'var(--bf-divider)' }} />
                    )}

                    {/* Bottom performers */}
                    {m.dailyBottom.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 13C7 13 2 9.5 2 5.5a3 3 0 015-2.2A3 3 0 0112 5.5C12 9.5 7 13 7 13z" fill="#FF5C5C"/>
                          </svg>
                          <p style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#9B2020', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                            Peores del día
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {m.dailyBottom.map((d: any, i: number) => {
                            const isMe = d.userId === user.id
                            return (
                              <div key={d.userId} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'transparent', borderRadius: 10, padding: '6px 10px',
                              }}>
                                <div style={{
                                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                  background: 'rgba(255,92,92,.15)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, color: '#E03E3E',
                                }}>
                                  {i + 1}
                                </div>
                                <p style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--bf-text)' }}>
                                  {d.name}{isMe && <span style={{ color: 'var(--bf-text-3)', fontSize: 11, marginLeft: 4 }}>(tú)</span>}
                                </p>
                                <div style={{
                                  padding: '3px 10px', borderRadius: 999,
                                  background: 'rgba(255,92,92,.1)', border: '1px solid rgba(255,92,92,.3)',
                                }}>
                                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#E03E3E' }}>
                                    {d.pts} pts
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── CHAT GRUPAL ──────────────────────────────── */}
              <GroupChat
                groupId={m.group_id}
                currentUserId={user.id}
                initialMessages={m.chatMessages}
              />

              {/* ── PREDECIR CTA ─────────────────────────────── */}
              <Link
                href={`/grupo/${m.groups.code}/predicciones`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 14,
                  background: 'var(--bf-surface-2)', border: '1px solid var(--bf-border)',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.4"/>
                    <path d="M9 2.5C9 2.5 11.5 5.5 11.5 9S9 15.5 9 15.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"/>
                    <path d="M2.5 9h13" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"/>
                    <circle cx="9" cy="9" r="2.5" fill="rgba(255,255,255,.3)"/>
                  </svg>
                </div>
                <p style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text-2)' }}>
                  Ver partidos y predecir
                </p>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 2l5 5-5 5" stroke="var(--bf-text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

            </div>
          )
        })}

        {/* ── CREAR GRUPO ──────────────────────────────────── */}
        <Link href="/crear-grupo" style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
          background: 'var(--bf-green)', borderRadius: 20, textDecoration: 'none',
          boxShadow: 'var(--bf-shadow-green)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>Crear nuevo grupo</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 1 }}>Invita a tus amigos a sufrir</p>
          </div>
          <svg style={{ marginLeft: 'auto', opacity: .6 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3l6 5-6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,12,.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--bf-border)',
        padding: '8px 8px 26px', display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { href: '/dashboard', label: 'Inicio', active: true, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: enriched[0] ? `/grupo/${enriched[0].groups.code}` : '/dashboard', label: 'Ranking', active: false, icon: <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
          { href: '/mundial', label: 'Grupos', active: false, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: false, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
        ].map(tab => (
          <Link key={tab.label} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none',
            color: tab.active ? 'var(--bf-green)' : 'var(--bf-text-3)',
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
