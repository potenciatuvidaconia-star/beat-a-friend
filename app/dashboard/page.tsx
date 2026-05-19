import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trophy } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)
    .neq('status', 'banned')
    .order('joined_at', { ascending: false })

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-gray-400">Bienvenido</p>
            <p className="font-bold">{profile?.display_name}</p>
          </div>
          <div className="text-2xl">⚽</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Crear grupo */}
        <Link
          href="/crear-grupo"
          className="flex items-center gap-3 p-4 rounded-2xl bg-[#00C46A] text-white"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <p className="font-bold">Crear nuevo grupo</p>
            <p className="text-xs text-white/80">Invita a tus amigos a sufrir</p>
          </div>
        </Link>

        {/* Mis grupos */}
        <div>
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-3">
            Mis grupos
          </h2>

          {!memberships || memberships.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🏜️</div>
              <p className="text-sm">Aún no estás en ningún grupo</p>
              <p className="text-xs mt-1">Crea uno o pídele el link a un amigo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memberships.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/grupo/${m.groups.code}`}
                  className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{m.groups.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {m.groups.mode === 'basic' ? '⚡ Quiniela Básica' : '🔥 Quiniela Pro'} · #{m.groups.code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#00C46A]">{m.points} pts</p>
                      {m.payment_status === 'pending' && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                          Pago pendiente
                        </span>
                      )}
                      {m.status === 'warned' && (
                        <span className="text-[10px] bg-red-100 text-[#FF5C5C] px-2 py-0.5 rounded-full">
                          ⚠️ Warning
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#00C46A]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-semibold">Inicio</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <Trophy size={20} />
          <span className="text-[10px]">Rankings</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px]">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
