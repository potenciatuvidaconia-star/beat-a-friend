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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bf-bg)' }}>

      {/* FIFA-style top stripe */}
      <div className="stripe-navy" style={{ padding: '28px 24px 32px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          {/* Top label */}
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)',
            marginBottom: 10,
          }}>
            Mundial 2026 · Quiniela
          </p>

          {/* Wordmark */}
          <h1 className="display-heading display-xl" style={{ color: '#fff' }}>
            Beat<span style={{ color: 'var(--bf-green)' }}>·</span>a<span style={{ color: 'var(--bf-green)' }}>·</span>Friend
          </h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, marginTop: 8, fontFamily: 'var(--font-display)' }}>
            Predice, compite y humilla a tus amigos.
          </p>

          {/* Info pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <span className="badge badge-green">Registro en 60 seg</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>$1 por grupo</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>Mundial 2026</span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--bf-card)', borderRadius: '0 0 var(--bf-r-xl) var(--bf-r-xl)', boxShadow: 'var(--bf-shadow-lg)', padding: '28px 24px 32px', marginTop: 0 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
            Ingresa a tu cuenta
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <div style={{ background: 'var(--bf-coral-soft)', borderRadius: 'var(--bf-r-md)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bf-coral)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
                <p style={{ color: 'var(--bf-coral-dark)', fontSize: 13, fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Ingresando...' : 'Entrar →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--bf-text-2)', marginTop: 20 }}>
            Primera vez?{' '}
            <Link href="/register" style={{ color: 'var(--bf-navy)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
