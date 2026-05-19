'use client'

import { useEffect, useState } from 'react'

interface Props {
  groupName: string
  apodoPrimero: string
  playerName: string
  points: number
  isMe: boolean
}

export default function TrofeoClient({ groupName, apodoPrimero, playerName, points, isMe }: Props) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number }[]>([])

  useEffect(() => {
    const colors = ['#FFBA00', '#00C46A', '#FF5C5C', '#ffffff', '#FFE066']
    setConfetti(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
      }))
    )
  }, [])

  function share() {
    const text = `🏆 Gané la quiniela del Mundial 2026 como "${apodoPrimero}" en el grupo ${groupName} con ${points} puntos. 🌟\n#BeatAFriend #Mundial2026 #Campeón`
    if (navigator.share) {
      navigator.share({ title: 'Soy el Campeón', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Texto copiado — pégalo donde quieras')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#0d0d1a] flex flex-col items-center justify-center p-6 overflow-hidden relative">

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute w-2 h-2 rounded-sm opacity-80 animate-bounce"
          style={{
            left: `${c.x}%`,
            top: `${Math.random() * 40}%`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}

      {/* Trofeo */}
      <div className="w-full max-w-sm bg-gradient-to-b from-[#FFBA00] to-[#e6a800] rounded-3xl overflow-hidden shadow-2xl relative z-10">

        {/* Corona */}
        <div className="text-center pt-8 pb-2">
          <div className="text-7xl">🏆</div>
        </div>

        <div className="bg-white mx-3 mb-3 rounded-2xl px-5 py-6 text-center space-y-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Campeón de</p>
            <p className="font-black text-xl text-[#1A1A2E] mt-0.5">{groupName}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">Mundial 2026 · Beat-a-Friend</p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-gray-400 text-xs">Con orgullo se corona a</p>
            <p className="text-2xl font-black text-[#1A1A2E] mt-1">{playerName}</p>
            <p className="text-[#FFBA00] font-bold text-lg">"{apodoPrimero}"</p>
          </div>

          <div className="bg-yellow-50 rounded-xl py-3 px-4">
            <p className="text-gray-400 text-xs">Puntuación final</p>
            <p className="font-black text-4xl text-[#FFBA00]">{points}</p>
            <p className="text-gray-400 text-xs">puntos</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-gray-100" />
            <p className="text-[10px] text-gray-300 font-mono">beat-a-friend.vercel.app</p>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        </div>

        <div className="text-center pb-5">
          <p className="text-[#1A1A2E]/60 text-xs font-semibold">
            ⭐ El único que sabía de fútbol ⭐
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 w-full max-w-sm space-y-3 relative z-10">
        <button
          onClick={share}
          className="w-full py-4 rounded-2xl bg-[#FFBA00] text-[#1A1A2E] font-bold flex items-center justify-center gap-2"
        >
          <span>📤</span>
          {isMe ? 'Compartir mi trofeo' : 'Compartir el trofeo'}
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full py-3 rounded-2xl bg-white/10 text-white text-sm"
        >
          ← Volver al grupo
        </button>
      </div>
    </div>
  )
}
