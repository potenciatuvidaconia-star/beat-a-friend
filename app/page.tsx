import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bf-bg)' }}>

      {/* Hero stripe */}
      <div className="stripe-navy" style={{ padding: '48px 24px 52px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
          letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)',
          marginBottom: 12,
        }}>
          Mundial 2026 · Quiniela privada
        </p>
        <h1 className="display-heading display-xl" style={{ color: '#fff', marginBottom: 10 }}>
          Beat<span style={{ color: 'var(--bf-green)' }}>·</span>a<span style={{ color: 'var(--bf-green)' }}>·</span>Friend
        </h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, maxWidth: 300, margin: '0 auto', lineHeight: 1.5, fontFamily: 'var(--font-display)' }}>
          Predice, compite y humilla a tus amigos — o sé humillado.
        </p>

        {/* Feature badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(0,196,106,.18)', color: 'var(--bf-green)' }}>Ranking en tiempo real</span>
          <span className="badge" style={{ background: 'rgba(255,186,0,.15)', color: '#FFD740' }}>$1 para entrar</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.75)' }}>Bullying garantizado</span>
        </div>
      </div>

      {/* CTA card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bf-card)', borderRadius: '0 0 var(--bf-r-xl) var(--bf-r-xl)',
          boxShadow: 'var(--bf-shadow-lg)', padding: '28px 24px 32px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <Link href="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Empezar gratis →
          </Link>
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px', borderRadius: 999,
            background: 'var(--bf-card)', border: '1.5px solid var(--bf-border)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
            color: 'var(--bf-text)', textDecoration: 'none',
          }}>
            Ya tengo cuenta
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px 48px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { icon: 'M7 17V9M11 17V5M15 17v-5', viewBox: '0 0 22 22', color: 'var(--bf-navy)', label: 'Ranking en vivo' },
          { icon: 'M11 4l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L5.2 8.2l4-.6L11 4z', viewBox: '0 0 22 22', color: 'var(--bf-gold-dark)', label: 'Trofeo al ganador' },
          { icon: 'M3 7h16M3 12h10M3 17h7', viewBox: '0 0 22 22', color: 'var(--bf-coral)', label: 'Diploma de vergüenza' },
        ].map(f => (
          <div key={f.label} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bf-card)', borderRadius: 'var(--bf-r-md)', border: '1px solid var(--bf-border)' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: f.color + '18', margin: '0 auto 8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox={f.viewBox} fill="none">
                <path d={f.icon} stroke={f.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 11, color: 'var(--bf-text-2)', fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.3 }}>{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
