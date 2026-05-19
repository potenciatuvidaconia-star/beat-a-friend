'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDeadline } from '@/lib/utils'

const WARNING_HOURS = [24, 48, 72]

export default function AdminClient({ groups }: { groups: any[] }) {
  const [data, setData] = useState(groups)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(groups[0]?.id ?? null)

  const supabase = createClient()

  const currentGroup = data.find(g => g.id === selectedGroup)
  const members = currentGroup?.group_members?.filter((m: any) => m.status !== 'banned') ?? []

  const pending = members.filter((m: any) => m.payment_status === 'pending')
  const confirmed = members.filter((m: any) => m.payment_status === 'confirmed')
  const warned = members.filter((m: any) => m.status === 'warned')

  async function confirmPayment(memberId: string) {
    setLoading(memberId)
    await supabase
      .from('group_members')
      .update({ payment_status: 'confirmed', status: 'active', warning_deadline: null, apodo: null })
      .eq('id', memberId)

    setData(prev => prev.map(g => ({
      ...g,
      group_members: g.group_members.map((m: any) =>
        m.id === memberId
          ? { ...m, payment_status: 'confirmed', status: 'active', warning_deadline: null }
          : m
      )
    })))
    setLoading(null)
  }

  async function sendWarning(memberId: string, hours: number) {
    setLoading(memberId)
    const deadline = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    await supabase
      .from('group_members')
      .update({ status: 'warned', warning_deadline: deadline })
      .eq('id', memberId)

    setData(prev => prev.map(g => ({
      ...g,
      group_members: g.group_members.map((m: any) =>
        m.id === memberId ? { ...m, status: 'warned', warning_deadline: deadline } : m
      )
    })))
    setLoading(null)
  }

  async function banMember(memberId: string) {
    if (!confirm('¿Banear a este usuario?')) return
    setLoading(memberId)
    await supabase
      .from('group_members')
      .update({ status: 'banned' })
      .eq('id', memberId)

    setData(prev => prev.map(g => ({
      ...g,
      group_members: g.group_members.map((m: any) =>
        m.id === memberId ? { ...m, status: 'banned' } : m
      )
    })))
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="font-bold text-lg">⚙️ Admin Panel</h1>
        <p className="text-xs text-gray-400">Validación de pagos Yappy</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* Group selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {data.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedGroup === g.id
                  ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {currentGroup && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Confirmados', value: confirmed.length, color: 'text-[#00C46A]' },
                { label: 'Pendientes', value: pending.length, color: 'text-yellow-500' },
                { label: 'Con warning', value: warned.length, color: 'text-[#FF5C5C]' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Yappy info */}
            <div className="bg-green-50 rounded-2xl p-4 text-sm">
              <p className="font-semibold mb-1">📱 Yappy del grupo</p>
              <p className="font-mono font-bold">{currentGroup.yappy_number}</p>
              <p className="text-xs text-gray-500 mt-1">Los pagos deben incluir el código: <strong>{currentGroup.code}</strong></p>
            </div>

            {/* Members list */}
            <div>
              <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-3">
                Miembros
              </h2>
              <div className="space-y-3">
                {members.map((m: any) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{m.profiles.display_name}</p>
                        <p className="text-xs text-gray-400">{m.profiles.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={m.payment_status === 'confirmed' ? 'confirmed' : m.status} />
                          {m.status === 'warned' && m.warning_deadline && (
                            <span className="text-[10px] text-[#FF5C5C]">
                              Vence en {formatDeadline(m.warning_deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-sm">{m.points} pts</p>
                    </div>

                    {/* Actions */}
                    {m.payment_status === 'pending' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => confirmPayment(m.id)}
                          disabled={loading === m.id}
                          className="px-3 py-1.5 rounded-lg bg-[#00C46A] text-white text-xs font-semibold disabled:opacity-60"
                        >
                          ✅ Confirmar pago
                        </button>
                        {m.status !== 'warned' && (
                          <div className="flex gap-1">
                            {WARNING_HOURS.map(h => (
                              <button
                                key={h}
                                onClick={() => sendWarning(m.id, h)}
                                disabled={loading === m.id}
                                className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold disabled:opacity-60"
                              >
                                ⚠️ {h}h
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => banMember(m.id)}
                          disabled={loading === m.id}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-[#FF5C5C] text-xs font-semibold disabled:opacity-60"
                        >
                          🚫 Banear
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: '✅ Pagado', cls: 'bg-green-100 text-[#00C46A]' },
    active: { label: '⏳ Pendiente', cls: 'bg-yellow-100 text-yellow-600' },
    pending_payment: { label: '⏳ Pendiente', cls: 'bg-yellow-100 text-yellow-600' },
    warned: { label: '⚠️ Warning', cls: 'bg-red-100 text-[#FF5C5C]' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}
