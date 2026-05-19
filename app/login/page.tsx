'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #E6F9EF 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div style={{ width:96,height:96,borderRadius:'50%',background:'linear-gradient(135deg,#00C46A,#00A056)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,boxShadow:'0 16px 40px rgba(0,196,106,.35)' }}>⚽</div>
            <span style={{ position:'absolute',top:-6,right:-12,fontSize:26,transform:'rotate(18deg)' }}>👑</span>
            <span style={{ position:'absolute',bottom:-2,left:-14,fontSize:22,transform:'rotate(-12deg)' }}>💀</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:38,fontWeight:600,letterSpacing:'-0.03em',lineHeight:1 }}>
            Beat<span style={{ color:'var(--bf-green)' }}>·</span>a<span style={{ color:'var(--bf-green)' }}>·</span>Friend
          </h1>
          <p style={{ color:'var(--bf-text-2)',fontSize:15,marginTop:10,lineHeight:1.45 }}>
            Humilla a tus amigos prediciendo el Mundial 2026.
          </p>
          <div style={{ display:'flex',gap:8,marginTop:12,justifyContent:'center',flexWrap:'wrap' }}>
            <span className="chip">⚡ 60s para entrar</span>
            <span className="chip">💵 $1 por grupo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div>
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Contraseña</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div style={{ background:'var(--bf-coral-soft)',borderRadius:'var(--bf-r-md)',padding:'10px 14px' }}>
              <p style={{ color:'var(--bf-coral-dark)',fontSize:13,fontWeight:600 }}>⚠️ {error}</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:4 }}>
            {loading ? 'Entrando...' : 'Entrar al campo ⚽'}
          </button>
        </form>

        <p style={{ textAlign:'center',fontSize:14,color:'var(--bf-text-2)',marginTop:20 }}>
          ¿Primera vez?{' '}
          <Link href="/register" style={{ color:'var(--bf-green)',fontWeight:700,fontFamily:'var(--font-display)' }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
