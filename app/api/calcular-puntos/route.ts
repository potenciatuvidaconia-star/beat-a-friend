import { createAdminClient } from '@/lib/supabase/server'
import { calcBasicPoints, calcProPoints } from '@/lib/scoring'
import { NextRequest, NextResponse } from 'next/server'

const MENSAJES_FALLO = [
  (name: string, apodo: string) => `${name} (${apodo}) volvió a fallar. Alguien ayúdenle.`,
  (name: string, apodo: string) => `Se cayó otro. ${name} (${apodo}) ya no tiene esperanza.`,
  (name: string, apodo: string) => `${name} lleva una racha increíble... de errores. ${apodo} confirmado.`,
]

const MENSAJES_BRUJERIA = [
  (name: string) => `Brujería detectada. Reporten a ${name}. Marcador exacto.`,
  (name: string) => `${name} acertó el marcador exacto. Claramente tiene información privilegiada.`,
]

const MENSAJES_LIDER = [
  (name: string, apodo: string) => `${name} (${apodo}) lleva 3 partidos perfectos. Alguien investiguen.`,
  (name: string, apodo: string) => `${name} sigue primero. ${apodo} bien merecido.`,
]

export async function POST(req: NextRequest) {
  const { matchId } = await req.json()
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (!match || match.status !== 'finished' || match.home_score === null) {
    return NextResponse.json({ error: 'match not finished' }, { status: 400 })
  }

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, groups(mode, apodo_primero, apodo_ultimo)')
    .eq('match_id', matchId)

  if (!predictions?.length) return NextResponse.json({ updated: 0 })

  let updated = 0

  for (const pred of predictions) {
    const group = pred.groups as any
    const mode = group?.mode ?? 'basic'
    const pts = mode === 'pro'
      ? calcProPoints(match, pred)
      : calcBasicPoints(match, pred)

    await supabase
      .from('predictions')
      .update({ points_earned: pts })
      .eq('id', pred.id)

    const { data: member } = await supabase
      .from('group_members')
      .select('id, points, profiles(display_name)')
      .eq('user_id', pred.user_id)
      .eq('group_id', pred.group_id)
      .single()

    if (member) {
      await supabase
        .from('group_members')
        .update({ points: ((member as any).points ?? 0) + pts })
        .eq('id', (member as any).id)

      // Generate bullying message for exact score in pro mode
      if (mode === 'pro' && pts === 3) {
        const name = (member as any).profiles?.display_name ?? 'Alguien'
        const msg = MENSAJES_BRUJERIA[Math.floor(Math.random() * MENSAJES_BRUJERIA.length)](name)
        await supabase.from('group_notifications').insert({
          group_id: pred.group_id,
          message: msg,
          type: 'brujeria',
        }).then(() => {}) // table may not exist yet, ignore error
      }

      // Generate fail message
      if (pts === 0) {
        const name = (member as any).profiles?.display_name ?? 'Alguien'
        const apodo = group?.apodo_ultimo ?? 'El Ciego'
        const msg = MENSAJES_FALLO[Math.floor(Math.random() * MENSAJES_FALLO.length)](name, apodo)
        await supabase.from('group_notifications').insert({
          group_id: pred.group_id,
          message: msg,
          type: 'fallo',
        }).then(() => {})
      }
    }

    updated++
  }

  // Update last-place apodo and leader message per group
  const groupIds = [...new Set(predictions.map(p => p.group_id))]

  for (const groupId of groupIds) {
    const { data: groupData } = await supabase
      .from('groups')
      .select('apodo_ultimo, apodo_primero')
      .eq('id', groupId)
      .single()

    const { data: members } = await supabase
      .from('group_members')
      .select('id, points, user_id, profiles(display_name)')
      .eq('group_id', groupId)
      .neq('status', 'banned')
      .order('points', { ascending: true })

    if (members && members.length > 1) {
      const last = members[0] as any
      await supabase
        .from('group_members')
        .update({ apodo: groupData?.apodo_ultimo ?? 'El Ciego' })
        .eq('id', last.id)

      // Leader sarcastic message (every 3rd match roughly)
      const leader = members[members.length - 1] as any
      if (Math.random() < 0.33) {
        const name = leader.profiles?.display_name ?? 'El primero'
        const apodo = groupData?.apodo_primero ?? 'El Profeta'
        const msg = MENSAJES_LIDER[Math.floor(Math.random() * MENSAJES_LIDER.length)](name, apodo)
        await supabase.from('group_notifications').insert({
          group_id: groupId,
          message: msg,
          type: 'lider',
        }).then(() => {})
      }
    }
  }

  return NextResponse.json({ updated })
}
