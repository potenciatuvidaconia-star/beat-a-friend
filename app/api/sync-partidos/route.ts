import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Solo sincroniza RESULTADOS de partidos que ya existen en la BD
// El fixture viene de supabase/seed_matches.sql
const API_KEY = process.env.FOOTBALL_DATA_API_KEY

// GET is called by Vercel Cron every 2 minutes during the World Cup
export async function GET() {
  return POST()
}

export async function POST() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not set' }, { status: 500 })
  }

  const supabase = await createAdminClient()

  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED',
    { headers: { 'X-Auth-Token': API_KEY } }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'API fetch failed', status: res.status }, { status: 500 })
  }

  const json = await res.json()
  const finished = json.matches ?? []

  let updated = 0

  for (const m of finished) {
    if (m.score?.fullTime?.home === null) continue

    // Find our match by api_id
    const { data: match } = await supabase
      .from('matches')
      .select('id, status')
      .eq('api_id', m.id)
      .single()

    if (!match || match.status === 'finished') continue

    await supabase
      .from('matches')
      .update({
        status: 'finished',
        home_score: m.score.fullTime.home,
        away_score: m.score.fullTime.away,
      })
      .eq('id', match.id)

    // Trigger point calculation
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calcular-puntos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id }),
    })

    updated++
  }

  return NextResponse.json({ updated, total: finished.length })
}

// Also handle updating knockout bracket teams when group stage ends
export async function PATCH() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not set' }, { status: 500 })
  }

  const supabase = await createAdminClient()

  const res = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?stage=LAST_32',
    { headers: { 'X-Auth-Token': API_KEY } }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'API fetch failed' }, { status: 500 })
  }

  const json = await res.json()
  const r32matches = json.matches ?? []

  const FLAG_MAP: Record<string, string> = {
    'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
    'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
    'Uruguay': '🇺🇾', 'Mexico': '🇲🇽', 'United States': '🇺🇸', 'Canada': '🇨🇦',
    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Morocco': '🇲🇦', 'Senegal': '🇸🇳',
    'Australia': '🇦🇺', 'Croatia': '🇭🇷', 'Colombia': '🇨🇴', 'Ecuador': '🇪🇨',
    'Panama': '🇵🇦', 'Qatar': '🇶🇦', 'Italy': '🇮🇹', 'Belgium': '🇧🇪',
    'Switzerland': '🇨🇭', 'Denmark': '🇩🇰', 'Poland': '🇵🇱', 'Serbia': '🇷🇸',
    'Turkey': '🇹🇷', 'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Nigeria': '🇳🇬',
    'Ghana': '🇬🇭', 'Cameroon': '🇨🇲', 'Tunisia': '🇹🇳', 'Egypt': '🇪🇬',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Haiti': '🇭🇹', 'Paraguay': '🇵🇾', 'Algeria': '🇩🇿',
    'Austria': '🇦🇹', 'Jordan': '🇯🇴', 'Uzbekistan': '🇺🇿', 'DR Congo': '🇨🇩',
    'Czechia': '🇨🇿', 'South Africa': '🇿🇦', 'Bosnia and Herzegovina': '🇧🇦',
    'New Zealand': '🇳🇿', 'Cape Verde': '🇨🇻', 'Norway': '🇳🇴', 'Sweden': '🇸🇪',
    'Iraq': '🇮🇶', 'Curaçao': '🇨🇼',
  }

  let updated = 0

  for (let i = 0; i < r32matches.length; i++) {
    const m = r32matches[i]
    const apiId = 2001 + i  // matches our seed api_ids

    const homeTeam = m.homeTeam?.name ?? 'TBD'
    const awayTeam = m.awayTeam?.name ?? 'TBD'

    if (homeTeam === 'TBD' && awayTeam === 'TBD') continue

    await supabase
      .from('matches')
      .update({
        home_team: homeTeam,
        away_team: awayTeam,
        home_flag: FLAG_MAP[homeTeam] ?? '🏳️',
        away_flag: FLAG_MAP[awayTeam] ?? '🏳️',
      })
      .eq('api_id', apiId)

    updated++
  }

  return NextResponse.json({ updated })
}
