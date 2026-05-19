import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  // All groups with member details
  const { data: groups } = await supabase
    .from('groups')
    .select(`
      *,
      group_members(
        *,
        profiles(display_name, email)
      )
    `)
    .order('created_at', { ascending: false })

  return <AdminClient groups={groups ?? []} />
}
