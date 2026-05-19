import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PrediccionesClient from './PrediccionesClient'
import { ArrowLeft } from 'lucide-react'

export default async function PrediccionesPage({ params }: { params: Promise<{ codigo: string }> }) {
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

  const { data: membership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.status === 'banned') redirect(`/unirse/${codigo}`)

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  const { data: myPredictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('group_id', group.id)

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link href={`/grupo/${codigo}`}>
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="font-bold">Predicciones</h1>
            <p className="text-xs text-gray-400">{group.name} · {group.mode === 'basic' ? '⚡ Básica' : '🔥 Pro'}</p>
          </div>
        </div>
      </div>

      <PrediccionesClient
        matches={matches ?? []}
        predictions={myPredictions ?? []}
        groupId={group.id}
        groupCode={codigo}
        mode={group.mode}
        userId={user.id}
      />
    </div>
  )
}
