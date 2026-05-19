import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">⚽</div>
      <h1 className="text-3xl font-bold mb-2">Beat-a-Friend</h1>
      <p className="text-gray-500 mb-2">El campo de batalla del Mundial 2026</p>
      <p className="text-sm text-gray-400 mb-10 max-w-xs">
        Predice, compite y humilla a tus amigos — o sé humillado. Tú decides.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/register"
          className="block w-full py-4 rounded-xl bg-[#00C46A] text-white font-bold text-lg"
        >
          Empezar gratis
        </Link>
        <Link
          href="/login"
          className="block w-full py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold"
        >
          Ya tengo cuenta
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-6 text-center max-w-xs">
        {[
          { emoji: '🏆', text: 'Ranking en tiempo real' },
          { emoji: '😂', text: 'Bullying amistoso' },
          { emoji: '💸', text: '$1 para entrar' },
        ].map(f => (
          <div key={f.text}>
            <div className="text-2xl mb-1">{f.emoji}</div>
            <p className="text-xs text-gray-500">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
