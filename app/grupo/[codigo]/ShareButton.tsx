'use client'

import { Share2 } from 'lucide-react'

export default function ShareButton({ code, inviteUrl }: { code: string; inviteUrl: string }) {
  function share() {
    const text = `¡Únete a mi grupo de quinielas del Mundial 2026! 🌍⚽\nEntra aquí: ${inviteUrl}\nCódigo: ${code}`
    if (navigator.share) {
      navigator.share({ title: 'Beat-a-Friend', text, url: inviteUrl })
    } else {
      navigator.clipboard.writeText(text)
      alert('Link copiado al portapapeles')
    }
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00C46A] text-white text-xs font-semibold"
    >
      <Share2 size={14} />
      Invitar
    </button>
  )
}
