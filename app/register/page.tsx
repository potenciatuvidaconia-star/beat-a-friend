'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupCode = searchParams.get('grupo')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (groupCode) router.push(`/unirse/${groupCode}`)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #E6F9EF 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div style={{ fontSize:52,marginBottom:8 }}>⚽</div>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:30,fontWeight:600,letterSpacing:'-0.02em' }}>
            Únete a la batalla
          </h1>
          {groupCode && (
            <div style={{ marginTop:10 }}>
              <span className="chip chip-green">🏆 Entrando al grupo: {groupCode}</span>
            </div>
          )}
          <p style={{ color:'var(--bf-text-2)',fontSize:14,marginTop:8 }}>
            Predice, compite, humilla (o sé humillado).
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div>
            <label className="input-label">Tu nombre</label>
            <input className="input" type="text" placeholder="Como te verán tus amigos"
              value={displayName} onChange={e => setDisplayName(e.target.value)} required maxLength={30} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Contraseña</label>
            <input className="input" type="password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && (
            <div style={{ background:'var(--bf-coral-soft)',borderRadius:'var(--bf-r-md)',padding:'10px 14px' }}>
              <p style={{ color:'var(--bf-coral-dark)',fontSize:13,fontWeight:600 }}>⚠️ {error}</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:4 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar 🚀'}
          </button>
        </form>

        <p style={{ textAlign:'center',fontSize:12,color:'var(--bf-text-3)',marginTop:14 }}>
          Al continuar aceptas que te molesten un poco.
        </p>
        <p style={{ textAlign:'center',fontSize:14,color:'var(--bf-text-2)',marginTop:12 }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color:'var(--bf-green)',fontWeight:700,fontFamily:'var(--font-display)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
