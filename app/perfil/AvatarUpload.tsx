'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  currentUrl: string | null
  displayName: string
  isLeader?: boolean
}

export default function AvatarUpload({ userId, currentUrl, displayName, isLeader = false }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const initial = (displayName ?? '?')[0].toUpperCase()
  const size = isLeader ? 110 : 88

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Máximo 5 MB'); return }

    setUploading(true)
    setError('')
    // Optimistic preview
    setPreview(URL.createObjectURL(file))

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const finalUrl = `${publicUrl}?t=${Date.now()}`

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', userId)
      if (dbErr) throw dbErr

      setPreview(finalUrl)
    } catch {
      setPreview(currentUrl)
      setError('Error subiendo foto. Intenta de nuevo.')
    }
    setUploading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={isLeader ? 'avatar-flame' : ''}
        style={{
          width: size, height: size, borderRadius: '50%',
          border: isLeader ? undefined : '3px solid rgba(255,255,255,.25)',
          background: preview
            ? 'transparent'
            : isLeader
            ? 'linear-gradient(135deg, #FFBA00, #E6A300)'
            : 'linear-gradient(135deg, #00C46A, #008C4A)',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          padding: 0,
          flexShrink: 0,
        }}
      >
        {preview ? (
          <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: size * 0.38, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%',
          }}>
            {initial}
          </span>
        )}

        {/* Upload overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: uploading ? 1 : 0,
          transition: 'opacity .2s',
        }}>
          <div className="spin" style={{
            width: 22, height: 22, borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,.3)',
            borderTopColor: '#fff',
          }} />
        </div>
      </button>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '11px 22px', borderRadius: 999, border: 'none',
          background: isLeader
            ? 'linear-gradient(90deg, #E6A300 0%, #FFBA00 20%, #FFE580 48%, #FFBA00 55%, #E6A300 100%)'
            : 'rgba(255,255,255,.12)',
          backgroundSize: isLeader ? '300% auto' : undefined,
          animation: isLeader ? 'bf-shimmer 2.8s linear infinite' : undefined,
          color: isLeader ? '#1A1000' : '#fff',
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase',
          cursor: uploading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 10v2h10v-2M7 2v6M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {uploading ? 'Subiendo...' : 'Subir foto / Actualizar ego'}
      </button>

      {error && (
        <p style={{ fontSize: 12, color: '#FF8C8C', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{error}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  )
}
