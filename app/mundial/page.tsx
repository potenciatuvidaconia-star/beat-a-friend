import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import HeroBall from '@/app/components/HeroBall'
import Wordmark from '@/app/components/Wordmark'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  group_letter: string | null
  stage: string
  status: string
  home_score: number | null
  away_score: number | null
  match_date: string
}

interface TeamStats {
  name: string
  flag: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}

function buildStandings(matches: Match[]): Record<string, TeamStats[]> {
  const groups: Record<string, Record<string, TeamStats>> = {}

  for (const m of matches) {
    if (m.stage !== 'group' || !m.group_letter) continue
    const g = m.group_letter

    if (!groups[g]) groups[g] = {}
    if (!groups[g][m.home_team]) {
      groups[g][m.home_team] = { name: m.home_team, flag: m.home_flag, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
    }
    if (!groups[g][m.away_team]) {
      groups[g][m.away_team] = { name: m.away_team, flag: m.away_flag, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
    }

    if (m.status === 'finished' && m.home_score !== null && m.away_score !== null) {
      const home = groups[g][m.home_team]
      const away = groups[g][m.away_team]

      home.gp++; away.gp++
      home.gf += m.home_score; home.ga += m.away_score
      away.gf += m.away_score; away.ga += m.home_score
      home.gd = home.gf - home.ga
      away.gd = away.gf - away.ga

      if (m.home_score > m.away_score) {
        home.w++; home.pts += 3; away.l++
      } else if (m.home_score < m.away_score) {
        away.w++; away.pts += 3; home.l++
      } else {
        home.d++; home.pts++; away.d++; away.pts++
      }
    }
  }

  const sorted: Record<string, TeamStats[]> = {}
  for (const g of Object.keys(groups).sort()) {
    sorted[g] = Object.values(groups[g]).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.name.localeCompare(b.name)
    })
  }
  return sorted
}

// Upcoming matches per group (next 2 not-finished)
function upcomingByGroup(matches: Match[]): Record<string, Match[]> {
  const result: Record<string, Match[]> = {}
  for (const m of matches) {
    if (m.stage !== 'group' || !m.group_letter) continue
    if (m.status === 'finished') continue
    if (!result[m.group_letter]) result[m.group_letter] = []
    if (result[m.group_letter].length < 2) result[m.group_letter].push(m)
  }
  return result
}

export default async function MundialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  const groupMatches = (matches ?? []).filter((m: Match) => m.stage === 'group')
  const standings = buildStandings(groupMatches)
  const upcoming = upcomingByGroup(groupMatches)

  const totalGroups = Object.keys(standings).length
  const playedMatches = groupMatches.filter((m: Match) => m.status === 'finished').length
  const totalGroupMatches = groupMatches.length

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8', paddingBottom: 96 }}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
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

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 22px', position: 'relative' }}>
          <div style={{ marginBottom: 14 }}>
            <Wordmark center={false} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                FIFA World Cup 2026
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>
                Tabla de Grupos
              </h1>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: totalGroups, label: 'Grupos' },
              { val: playedMatches, label: 'Jugados' },
              { val: totalGroupMatches - playedMatches, label: 'Pendientes' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(255,255,255,.1)', borderRadius: 12,
                padding: '8px 4px', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GROUPS GRID ──────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', background: 'var(--bf-card)', borderRadius: 12, border: '1px solid var(--bf-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--bf-green)' }} />
            <span style={{ fontSize: 11, color: 'var(--bf-text-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Clasifica directo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#FFBA00' }} />
            <span style={{ fontSize: 11, color: 'var(--bf-text-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Mejor tercero</span>
          </div>
        </div>

        {Object.entries(standings).map(([groupLetter, teams]) => {
          const nextMatches = upcoming[groupLetter] ?? []
          const groupPlayed = groupMatches.filter(
            (m: Match) => m.group_letter === groupLetter && m.status === 'finished'
          ).length

          return (
            <div key={groupLetter} style={{
              background: 'var(--bf-card)', borderRadius: 20,
              border: '1px solid var(--bf-border)',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,31,91,.06)',
            }}>
              {/* Group header */}
              <div style={{
                background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff',
                  }}>
                    {groupLetter}
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>
                    Grupo {groupLetter}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, color: 'rgba(255,255,255,.55)',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                }}>
                  {groupPlayed}/6 partidos
                </span>
              </div>

              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
                padding: '8px 14px',
                background: '#F7F8FC',
                borderBottom: '1px solid var(--bf-divider)',
              }}>
                {['Equipo', 'PJ', 'PG', 'PE', 'PP', 'DIF', 'PTS'].map((col, i) => (
                  <p key={col} style={{
                    fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: col === 'PTS' ? 'var(--bf-navy)' : 'var(--bf-text-3)',
                    textAlign: i > 0 ? 'center' : 'left',
                    letterSpacing: '.04em',
                  }}>{col}</p>
                ))}
              </div>

              {/* Team rows */}
              {teams.map((team, idx) => {
                const qualifies = idx < 2         // top 2 qualify directly
                const mayQualify = idx === 2      // 3rd may qualify as best third

                return (
                  <div key={team.name} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
                    padding: '10px 14px',
                    alignItems: 'center',
                    borderBottom: idx < teams.length - 1 ? '1px solid var(--bf-divider)' : 'none',
                    background: qualifies ? 'rgba(0,196,106,.04)' : mayQualify ? 'rgba(255,186,0,.04)' : '#fff',
                  }}>
                    {/* Team name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div style={{
                        width: 4, height: 28, borderRadius: 2, flexShrink: 0,
                        background: qualifies ? 'var(--bf-green)' : mayQualify ? 'var(--bf-gold)' : 'transparent',
                      }} />
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{team.flag}</span>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                        color: 'var(--bf-text)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{team.name}</p>
                    </div>

                    {/* Stats */}
                    {[team.gp, team.w, team.d, team.l].map((val, i) => (
                      <p key={i} style={{
                        textAlign: 'center', fontSize: 13,
                        fontFamily: 'var(--font-display)', fontWeight: 600,
                        color: 'var(--bf-text-2)',
                      }}>{val}</p>
                    ))}

                    {/* Goal diff */}
                    <p style={{
                      textAlign: 'center', fontSize: 13,
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      color: team.gd > 0 ? 'var(--bf-green-dark)' : team.gd < 0 ? 'var(--bf-coral-dark)' : 'var(--bf-text-3)',
                    }}>
                      {team.gd > 0 ? `+${team.gd}` : team.gd}
                    </p>

                    {/* Points */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: qualifies ? 'var(--bf-green)' : mayQualify ? 'var(--bf-gold)' : 'var(--bf-card-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                        color: qualifies || mayQualify ? '#fff' : 'var(--bf-text)',
                      }}>
                        {team.pts}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Next matches preview */}
              {nextMatches.length > 0 && (
                <div style={{ background: '#F7F8FC', borderTop: '1px solid var(--bf-divider)', padding: '10px 14px' }}>
                  <p style={{ fontSize: 10, color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Próximos partidos
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {nextMatches.map((m: Match) => {
                      const d = new Date(m.match_date)
                      const dateStr = d.toLocaleDateString('es-PA', { weekday: 'short', month: 'short', day: 'numeric' })
                      const timeStr = d.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 11, color: 'var(--bf-text-3)', width: 90, flexShrink: 0 }}>{dateStr}</p>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{m.home_flag}</span>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--bf-text)' }}>{m.home_team}</p>
                            <span style={{ fontSize: 11, color: 'var(--bf-text-3)', fontWeight: 700 }}>vs</span>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--bf-text)' }}>{m.away_team}</p>
                            <span style={{ fontSize: 16 }}>{m.away_flag}</span>
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--bf-text-3)', width: 42, textAlign: 'right', flexShrink: 0 }}>{timeStr}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Note about third place */}
        <div style={{ background: 'var(--bf-card)', borderRadius: 14, padding: '12px 16px', border: '1px solid var(--bf-border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bf-navy-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <span style={{ fontSize: 10, color: 'var(--bf-navy)', fontWeight: 800 }}>i</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--bf-text-3)', lineHeight: 1.5 }}>
            Los 2 primeros de cada grupo clasifican directamente a la Ronda de 32. Los 8 mejores terceros también avanzan.
          </p>
        </div>
      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--bf-divider)',
        padding: '8px 8px 26px', display: 'flex', justifyContent: 'space-around',
      }}>
        {([
          { href: '/dashboard', label: 'Inicio', active: false, icon: <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/> },
          { href: '/dashboard', label: 'Ranking', active: false, icon: <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
          { href: '/mundial', label: 'Grupos', active: true, icon: <><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M2 11h18M11 2C11 2 13.5 6 13.5 11S11 20 11 20" stroke="currentColor" strokeWidth="1.2"/></> },
          { href: '/perfil', label: 'Perfil', active: false, icon: <><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></> },
        ] as { href: string; label: string; active: boolean; icon: React.ReactNode }[]).map(tab => (
          <Link key={tab.href + tab.label} href={tab.href} style={{
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
