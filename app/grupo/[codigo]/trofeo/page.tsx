import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrofeoClient from './TrofeoClient'

export default async function TrofeoPage({ params }: { params: Promise<{ codigo: string }> }) {
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
    .order('points', { ascending: false })

  const first = members?.[0]
  const firstProfile = (first as any)?.profiles

  return (
    <TrofeoClient
      groupName={group.name}
      apodoPrimero={group.apodo_primero ?? 'El Profeta'}
      playerName={firstProfile?.display_name ?? '???'}
      points={(first as any)?.points ?? 0}
      isMe={first?.user_id === user.id}
    />
  )
}
