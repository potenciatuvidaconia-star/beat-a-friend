import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDeadline } from '@/lib/utils'
import ShareButton from './ShareButton'

export default async function GrupoPage({ params }: { params: Promise<{ codigo: string }> }) {
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

  if (!membership || membership.status === 'banned') {
    redirect(`/unirse/${codigo}`)
  }

  const { data: members } = await supabase
    .from('group_members')
    .select('*, profiles(display_name, avatar_url)')
    .eq('group_id', group.id)
    .neq('status', 'banned')
    .order('points', { ascending: false })

  const total = members?.length ?? 0
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unirse/${codigo}`

  const platformYappy = process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? '507-XXXX-XXXX'
  const apodoPrimero: string = group.apodo_primero ?? 'El Profeta'
  const apodoUltimo: string = group.apodo_ultimo ?? 'El Ciego'
  const premioCastigo: string | null = group.premio_castigo ?? null

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">{group.name}</h1>
              <p className="text-xs text-gray-400">
                {group.mode === 'basic' ? '⚡ Básica' : '🔥 Pro'} · {total} jugadores
              </p>
            </div>
            <ShareButton code={codigo} inviteUrl={inviteUrl} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Warning banner */}
        {membership.status === 'warned' && membership.warning_deadline && (
          <div className="bg-red-50 border border-[#FF5C5C] rounded-2xl p-4">
            <p className="font-bold text-[#FF5C5C] text-sm">⚠️ Pago pendiente</p>
            <p className="text-xs text-gray-600 mt-1">
              No hemos recibido tu $1 de Yappy. Tienes{' '}
              <strong>{formatDeadline(membership.warning_deadline)}</strong> o serás removido.
            </p>
            <div className="mt-3 bg-white rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Número Yappy</span>
                <span className="font-bold">{platformYappy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto</span>
                <span className="font-bold text-[#00C46A]">$1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Comentario</span>
                <span className="font-bold font-mono">{codigo}</span>
              </div>
            </div>
          </div>
        )}

        {/* Soft payment reminder */}
        {membership.payment_status === 'pending' && membership.status !== 'warned' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-yellow-700">💛 Recuerda mandar tu $1 por Yappy</p>
            <p className="text-xs text-gray-500 mt-1">
              Al <strong>{platformYappy}</strong> con el código <strong className="font-mono">{codigo}</strong>
            </p>
          </div>
        )}

        {/* Premio/Castigo banner */}
        {premioCastigo && (
          <div className="bg-[#1A1A2E] rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Premio / Castigo</p>
              <p className="text-white font-bold text-sm mt-0.5">{premioCastigo}</p>
            </div>
          </div>
        )}

        {/* Leyenda de apodos */}
        <div className="flex gap-2">
          <div className="flex-1 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <p className="text-[10px] text-gray-400">Primero</p>
              <p className="text-xs font-bold text-[#FFBA00]">{apodoPrimero}</p>
            </div>
          </div>
          <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">🤦</span>
            <div>
              <p className="text-[10px] text-gray-400">Último</p>
              <p className="text-xs font-bold text-[#FF5C5C]">{apodoUltimo}</p>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div>
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-3">
            Ranking
          </h2>
          <div className="space-y-2">
            {members?.map((m: any, i: number) => {
              const pos = i + 1
              const isMe = m.user_id === user.id
              const isFirst = pos === 1
              const isLast = pos === total && total > 1

              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-[#FFBA00]/40'
                      : isLast
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-[#FF5C5C]/30'
                      : isMe
                      ? 'bg-green-50 border border-[#00C46A]/40'
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  {/* Position badge */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isFirst ? 'bg-[#FFBA00] text-white shadow-sm' :
                    isLast ? 'bg-[#FF5C5C] text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isFirst ? '👑' : isLast ? '🤦' : pos}
                  </div>

                  {/* Name + apodo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-sm truncate">
                        {m.profiles.display_name}
                        {isMe && <span className="text-xs text-gray-400 ml-1">(tú)</span>}
                      </p>
                    </div>
                    {isFirst && (
                      <p className="text-xs font-bold text-[#FFBA00]">{apodoPrimero}</p>
                    )}
                    {isLast && (
                      <p className="text-xs font-bold text-[#FF5C5C]">{apodoUltimo}</p>
                    )}
                    {!isFirst && !isLast && m.payment_status === 'pending' && (
                      <p className="text-[10px] text-yellow-500">💸 pago pendiente</p>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-base ${
                      isFirst ? 'text-[#FFBA00]' : isLast ? 'text-[#FF5C5C]' : 'text-[#1A1A2E]'
                    }`}>
                      {m.points}
                    </p>
                    <p className="text-[10px] text-gray-400">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Predecir CTA */}
        <Link
          href={`/grupo/${codigo}/predicciones`}
          className="block w-full py-4 rounded-2xl bg-[#1A1A2E] text-white text-center font-bold"
        >
          ⚽ Ver partidos y predecir
        </Link>

        {/* Diplomas / Trofeos */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/grupo/${codigo}/trofeo`}
            className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-yellow-50 border border-yellow-100"
          >
            <span className="text-2xl">🏆</span>
            <p className="text-xs font-bold text-[#FFBA00]">Trofeo</p>
            <p className="text-[10px] text-gray-400 text-center">{apodoPrimero}</p>
          </Link>
          <Link
            href={`/grupo/${codigo}/diploma`}
            className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-red-50 border border-red-100"
          >
            <span className="text-2xl">🤦</span>
            <p className="text-xs font-bold text-[#FF5C5C]">Diploma</p>
            <p className="text-[10px] text-gray-400 text-center">{apodoUltimo}</p>
          </Link>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Inicio</span>
        </Link>
        <Link href={`/grupo/${codigo}`} className="flex flex-col items-center gap-1 text-[#00C46A]">
          <span className="text-xl">🏆</span>
          <span className="text-[10px] font-semibold">Ranking</span>
        </Link>
        <Link href={`/grupo/${codigo}/predicciones`} className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xl">⚽</span>
          <span className="text-[10px]">Predecir</span>
        </Link>
      </nav>
    </div>
  )
}
