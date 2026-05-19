'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import HeroBall from '@/app/components/HeroBall'

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bf-bg)' }}>

      {/* Hero */}
      <div className="stripe-navy">
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>
        <div className="hero-texture" />
        <HeroBall size={200} opacity={0.07} />

        <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 24px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"/>
              <polygon points="8,3.5 10.8,5.6 9.8,8.9 6.2,8.9 5.2,5.6" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.5)" strokeWidth=".8"/>
              <line x1="8" y1="1" x2="8" y2="3.5" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="14.4" y1="4.8" x2="10.8" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="12.9" y1="13" x2="9.8" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="3.1" y1="13" x2="6.2" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="1.6" y1="4.8" x2="5.2" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
              BEAT<span style={{ color: '#00C46A' }}>·A·</span>FRIEND
            </p>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px, 7vw, 40px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Únete a la batalla
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 8, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Predice · Compite · Humilla (o sé humillado)
          </p>
          {groupCode && (
            <div style={{ marginTop: 12 }}>
              <span className="badge" style={{ background: 'rgba(0,196,106,.2)', color: '#4DEBA0', border: '1px solid rgba(0,196,106,.3)' }}>
                Entrando al grupo: {groupCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--bf-card)', borderRadius: '0 0 var(--bf-r-xl) var(--bf-r-xl)', boxShadow: 'var(--bf-shadow-lg)', padding: '28px 24px 32px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
            Crea tu cuenta
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <div style={{ background: 'var(--bf-coral-soft)', borderRadius: 'var(--bf-r-md)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bf-coral)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
                <p style={{ color: 'var(--bf-coral-dark)', fontSize: 13, fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--bf-text-3)', marginTop: 14 }}>
            Al continuar aceptas que te molesten un poco.
          </p>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--bf-text-2)', marginTop: 12 }}>
            Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--bf-navy)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
