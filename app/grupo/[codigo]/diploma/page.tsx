import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiplomaClient from './DiplomaClient'

export default async function DiplomaPage({ params }: { params: Promise<{ codigo: string }> }) {
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

  const { data: members } = await supabase
    .from('group_members')
    .select('*, profiles(display_name)')
    .eq('group_id', group.id)
    .neq('status', 'banned')
    .order('points', { ascending: true })

  const last = members?.[0]
  const lastProfile = (last as any)?.profiles

  return (
    <DiplomaClient
      groupName={group.name}
      apodoUltimo={group.apodo_ultimo ?? 'El Ciego'}
      premioCastigo={group.premio_castigo ?? null}
      playerName={lastProfile?.display_name ?? '???'}
      points={(last as any)?.points ?? 0}
      isMe={last?.user_id === user.id}
    />
  )
}
