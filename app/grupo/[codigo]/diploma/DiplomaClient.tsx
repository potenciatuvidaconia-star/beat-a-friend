'use client'

import { useRef } from 'react'

interface Props {
  groupName: string
  apodoUltimo: string
  premioCastigo: string | null
  playerName: string
  points: number
  isMe: boolean
}

export default function DiplomaClient({ groupName, apodoUltimo, premioCastigo, playerName, points, isMe }: Props) {
  const diplomaRef = useRef<HTMLDivElement>(null)

  function share() {
    const text = `🏆 Recibí el diploma oficial de "${apodoUltimo}" en la quiniela ${groupName} del Mundial 2026 con solo ${points} puntos. 😭\n#BeatAFriend #Mundial2026`
    if (navigator.share) {
      navigator.share({ title: 'Mi Diploma de Vergüenza', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Texto copiado — pégalo en WhatsApp o Instagram')
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center p-6">
      {/* Diploma */}
      <div
        ref={diplomaRef}
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header rojo de vergüenza */}
        <div className="bg-[#FF5C5C] px-6 py-5 text-center">
          <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">
            Certificado Oficial de
          </p>
          <p className="text-white text-3xl font-black">VERGÜENZA</p>
          <p className="text-white/80 text-xs mt-1">Mundial 2026 · Beat-a-Friend</p>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 text-center space-y-4">
          <div className="text-6xl">🤦</div>

          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Se certifica que</p>
            <p className="text-2xl font-black text-[#1A1A2E] mt-1">{playerName}</p>
            <p className="text-[#FF5C5C] font-bold text-lg mt-1">
              "{apodoUltimo}"
            </p>
          </div>

          <div className="bg-red-50 rounded-2xl px-4 py-3">
            <p className="text-gray-500 text-xs">terminó en último lugar del grupo</p>
            <p className="font-black text-2xl text-[#FF5C5C] mt-1">{groupName}</p>
            <p className="text-gray-400 text-xs mt-1">con solo</p>
            <p className="font-black text-3xl text-[#1A1A2E]">{points} puntos</p>
          </div>

          {premioCastigo && (
            <div className="border-2 border-dashed border-[#FF5C5C] rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Su castigo</p>
              <p className="font-bold text-[#1A1A2E] text-sm">{premioCastigo}</p>
            </div>
          )}

          {/* Sello */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px flex-1 bg-gray-200" />
            <p className="text-[10px] text-gray-300 font-mono">beat-a-friend.vercel.app</p>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FF5C5C]/10 px-6 py-3 text-center">
          <p className="text-[10px] text-[#FF5C5C] font-semibold">
            🏆 Mundial 2026 · Diploma válido en todos los grupos de WhatsApp
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 w-full max-w-sm space-y-3">
        <button
          onClick={share}
          className="w-full py-4 rounded-2xl bg-[#FF5C5C] text-white font-bold flex items-center justify-center gap-2"
        >
          <span>📤</span>
          {isMe ? 'Compartir mi vergüenza' : 'Compartir el diploma'}
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full py-3 rounded-2xl bg-white/10 text-white text-sm"
        >
          ← Volver al grupo
        </button>
      </div>

      {isMe && (
        <p className="text-white/40 text-xs text-center mt-4 max-w-xs">
          La próxima vez estudia algo de fútbol antes de apostarlo todo 🙃
        </p>
      )}
    </div>
  )
}
