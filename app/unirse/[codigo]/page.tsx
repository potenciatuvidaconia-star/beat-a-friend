import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UnirseClient from './UnirseClient'

export default async function UnirsePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, redirect to register with group code
  if (!user) {
    redirect(`/register?grupo=${codigo}`)
  }

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', codigo)
    .single()

  if (!group) {
    redirect('/dashboard')
  }

  // Check if already a member
  const { data: membership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (membership && membership.status !== 'banned') {
    redirect(`/grupo/${codigo}`)
  }

  return <UnirseClient group={group} userId={user.id} />
}
