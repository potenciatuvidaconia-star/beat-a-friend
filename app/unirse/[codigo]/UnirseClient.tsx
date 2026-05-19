'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PLATFORM_YAPPY = process.env.NEXT_PUBLIC_YAPPY_NUMBER ?? '507-XXXX-XXXX'

interface Group {
  id: string
  name: string
  code: string
  mode: string
}

export default function UnirseClient({ group, userId }: { group: Group; userId: string }) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setJoining(true)
    const supabase = createClient()

    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      status: 'active',
      payment_status: 'pending',
    })

    setJoined(true)
    setJoining(false)
  }

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">¡Ya estás dentro!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Ahora manda $1 por Yappy para confirmar tu lugar
        </p>

        <div className="w-full max-w-sm bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-left mb-6">
          <p className="font-bold text-sm mb-3">📱 Instrucciones de pago Yappy</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Número</span>
              <span className="font-bold">{PLATFORM_YAPPY}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monto</span>
              <span className="font-bold text-[#00C46A]">$1.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Comentario</span>
              <span className="font-bold font-mono">{group.code}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ⚠️ Pon el código <strong>{group.code}</strong> en el comentario para que te identifiquen
          </p>
        </div>

        <button
          onClick={() => router.push(`/grupo/${group.code}`)}
          className="w-full max-w-sm py-3 rounded-xl bg-[#00C46A] text-white font-bold"
        >
          Ir al grupo →
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-4">⚽</div>
      <h1 className="text-2xl font-bold mb-2">Te invitan a</h1>
      <p className="text-3xl font-bold text-[#00C46A] mb-1">{group.name}</p>
      <p className="text-gray-400 text-sm mb-8">
        {group.mode === 'basic' ? '⚡ Quiniela Básica' : '🔥 Quiniela Pro'} · Mundial 2026
      </p>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-5 text-left mb-6">
        <p className="text-sm font-semibold mb-3">¿Cómo funciona?</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ Entras gratis, predices de inmediato</li>
          <li>💸 Mandas $1 por Yappy para confirmar</li>
          <li>🏆 El que más puntos acumule gana</li>
          <li>😂 El último recibe el diploma de vergüenza</li>
        </ul>
      </div>

      <button
        onClick={handleJoin}
        disabled={joining}
        className="w-full max-w-sm py-4 rounded-xl bg-[#00C46A] text-white font-bold text-lg disabled:opacity-60"
      >
        {joining ? 'Uniéndome...' : '¡Entrar al grupo! 🚀'}
      </button>
    </div>
  )
}
