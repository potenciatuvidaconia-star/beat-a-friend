'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import HeroBall from '@/app/components/HeroBall'

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

      {/* Hero */}
      <div className="stripe-navy" style={{ padding: '0 0 0 0' }}>
        {/* Tricolor bar */}
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>
        <div className="hero-texture" />
        <HeroBall size={220} opacity={0.08} />

        <div style={{ maxWidth: 420, margin: '0 auto', padding: '28px 24px 36px', position: 'relative' }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,.65)" strokeWidth="1.2"/>
              <polygon points="8,3.5 10.8,5.6 9.8,8.9 6.2,8.9 5.2,5.6" fill="rgba(255,255,255,.35)" stroke="rgba(255,255,255,.5)" strokeWidth=".8"/>
              <line x1="8" y1="1" x2="8" y2="3.5" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="14.4" y1="4.8" x2="10.8" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="12.9" y1="13" x2="9.8" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="3.1" y1="13" x2="6.2" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="1.6" y1="4.8" x2="5.2" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)' }}>
              BEAT<span style={{ color: '#00C46A' }}>·A·</span>FRIEND
            </p>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,.65)" strokeWidth="1.2"/>
              <polygon points="8,3.5 10.8,5.6 9.8,8.9 6.2,8.9 5.2,5.6" fill="rgba(255,255,255,.35)" stroke="rgba(255,255,255,.5)" strokeWidth=".8"/>
              <line x1="8" y1="1" x2="8" y2="3.5" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="14.4" y1="4.8" x2="10.8" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="12.9" y1="13" x2="9.8" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="3.1" y1="13" x2="6.2" y2="8.9" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
              <line x1="1.6" y1="4.8" x2="5.2" y2="5.6" stroke="rgba(255,255,255,.4)" strokeWidth=".9"/>
            </svg>
          </div>

          {/* Big logotype */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(38px, 9vw, 52px)', lineHeight: .95,
            letterSpacing: '-0.03em', color: '#fff',
          }}>
            Beat<span style={{ color: '#00C46A' }}>·a·</span>Friend
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Predice · Compite · Humilla a tus amigos
          </p>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <span className="badge badge-green">Mundial 2026</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.15)' }}>$1 por grupo</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.15)' }}>Registro gratis</span>
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
