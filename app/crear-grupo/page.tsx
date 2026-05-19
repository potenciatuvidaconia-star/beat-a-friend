'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateGroupCode } from '@/lib/utils'

export default function CrearGrupoPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'basic' | 'pro'>('basic')
  const [yappy, setYappy] = useState('')
  const [apodoPrimero, setApodoPrimero] = useState('El Profeta')
  const [apodoUltimo, setApodoUltimo] = useState('El Ciego')
  const [premioCastigo, setPremioCastigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const code = generateGroupCode(name)

    const { data: group, error: groupErr } = await supabase
      .from('groups')
      .insert({
        name, code, mode,
        owner_id: user.id,
        yappy_number: yappy,
        apodo_primero: apodoPrimero || 'El Profeta',
        apodo_ultimo: apodoUltimo || 'El Ciego',
        premio_castigo: premioCastigo || null,
      })
      .select()
      .single()

    if (groupErr) {
      setError('Error creando el grupo. Intenta de nuevo.')
      setLoading(false)
      return
    }

    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      status: 'active',
      payment_status: 'confirmed',
    })

    router.push(`/grupo/${group.code}`)
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link href="/dashboard">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="font-bold">Crear grupo</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <form onSubmit={handleCreate} className="space-y-6">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del grupo</label>
            <input
              type="text"
              placeholder="Los Fracasados 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C46A]"
            />
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-semibold mb-2">Modalidad</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: 'basic', icon: '⚡', label: 'Básica', sub: '1 / X / 2', pts: '1 punto por acierto' },
                { v: 'pro', icon: '🔥', label: 'Pro', sub: 'Marcador exacto', pts: 'Hasta 3 pts por partido' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setMode(opt.v as 'basic' | 'pro')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === opt.v ? 'border-[#00C46A] bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-bold text-sm">{opt.icon} {opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.sub}</p>
                  <p className="text-xs text-gray-400">{opt.pts}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Yappy */}
          <div>
            <label className="block text-sm font-semibold mb-1">Tu número de Yappy</label>
            <p className="text-xs text-gray-400 mb-2">Aquí recibirás los $1 de cada participante</p>
            <input
              type="text"
              placeholder="507-6XXX-XXXX"
              value={yappy}
              onChange={e => setYappy(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C46A]"
            />
          </div>

          {/* Apodos — la personalización del grupo */}
          <div className="bg-[#FAFAFA] rounded-2xl border border-gray-200 p-4 space-y-4">
            <div>
              <p className="font-bold text-sm mb-1">🎭 Dale personalidad a tu grupo</p>
              <p className="text-xs text-gray-400">Estos apodos aparecerán en el ranking, notificaciones y diplomas</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FFBA00] mb-1">
                👑 Apodo del primero
              </label>
              <input
                type="text"
                placeholder="El Profeta, El Crack, El Messi del Grupo..."
                value={apodoPrimero}
                onChange={e => setApodoPrimero(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFBA00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FF5C5C] mb-1">
                🤦 Apodo del último
              </label>
              <input
                type="text"
                placeholder="El Ciego, El Inútil, El que no sabe nada..."
                value={apodoUltimo}
                onChange={e => setApodoUltimo(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                🍽️ Premio / Castigo (opcional)
              </label>
              <input
                type="text"
                placeholder="El último paga la cena del grupo..."
                value={premioCastigo}
                onChange={e => setPremioCastigo(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C46A]"
              />
            </div>
          </div>

          {error && <p className="text-[#FF5C5C] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#00C46A] text-white font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear grupo 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
