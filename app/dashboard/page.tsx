import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)
    .neq('status', 'banned')
    .order('joined_at', { ascending: false })

  const initial = (profile?.display_name ?? 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bf-bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bf-navy)', padding: '16px 20px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Mundial 2026
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', marginTop: 2 }}>
              Hola, {profile?.display_name ?? 'jugador'}
            </p>
          </div>
          {/* User avatar initial */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bf-green)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
          }}>
            {initial}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Mundial standings CTA */}
        <Link href="/mundial" style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)',
          borderRadius: 'var(--bf-r-lg)', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(0,31,91,.25)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.5"/>
              <path d="M1.5 10h17M10 1.5C10 1.5 13 5 13 10s-3 8.5-3 8.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"/>
              <path d="M3 5.5h14M3 14.5h14" stroke="rgba(255,255,255,.4)" strokeWidth="1"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>Tabla de Grupos</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>Mundial 2026 · 12 grupos</p>
          </div>
          <svg style={{ marginLeft: 'auto', opacity: .5 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3l6 5-6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Crear grupo CTA */}
        <Link href="/crear-grupo" style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
          background: 'var(--bf-green)', borderRadius: 'var(--bf-r-lg)',
          textDecoration: 'none', boxShadow: 'var(--bf-shadow-green)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>Crear nuevo grupo</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 1 }}>Invita a tus amigos a sufrir</p>
          </div>
          <svg style={{ marginLeft: 'auto', opacity: .7 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3l6 5-6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Mis grupos */}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Mis grupos
          </p>

          {!memberships || memberships.length === 0 ? (
            <div style={{
              background: 'var(--bf-card)', borderRadius: 'var(--bf-r-lg)',
              border: '1px dashed var(--bf-border)', padding: '40px 24px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--bf-card-soft)', margin: '0 auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--bf-border)" strokeWidth="2"/>
                  <path d="M8 12h8M12 8v8" stroke="var(--bf-text-3)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text-2)' }}>
                Aún no estás en ningún grupo
              </p>
              <p style={{ fontSize: 12, color: 'var(--bf-text-3)', marginTop: 4 }}>
                Crea uno o pídele el link a un amigo
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {memberships.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/grupo/${m.groups.code}`}
                  style={{
                    display: 'block', background: 'var(--bf-card)',
                    borderRadius: 'var(--bf-r-lg)', padding: '14px 16px',
                    border: '1px solid var(--bf-border)', boxShadow: 'var(--bf-shadow-sm)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--bf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.groups.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{
                          fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700,
                          letterSpacing: '.06em', textTransform: 'uppercase',
                          padding: '2px 7px', borderRadius: 999,
                          background: m.groups.mode === 'pro' ? 'var(--bf-coral-soft)' : 'var(--bf-green-soft)',
                          color: m.groups.mode === 'pro' ? 'var(--bf-coral-dark)' : 'var(--bf-green-dark)',
                        }}>
                          {m.groups.mode === 'basic' ? 'Básica' : 'Pro'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)' }}>
                          #{m.groups.code}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--bf-green)' }}>
                        {m.points}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--bf-text-3)' }}>pts</p>
                      {m.payment_status === 'pending' && (
                        <span style={{ fontSize: 10, background: '#FFF3CD', color: '#7B5800', padding: '2px 6px', borderRadius: 999, fontWeight: 700, display: 'block', marginTop: 3 }}>
                          Pago pendiente
                        </span>
                      )}
                      {m.status === 'warned' && (
                        <span style={{ fontSize: 10, background: 'var(--bf-coral-soft)', color: 'var(--bf-coral-dark)', padding: '2px 6px', borderRadius: 999, fontWeight: 700, display: 'block', marginTop: 3 }}>
                          ! Warning
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bf-card)', borderTop: '1px solid var(--bf-divider)',
        padding: '10px 24px 28px', display: 'flex', justifyContent: 'space-around',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-navy)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Inicio</span>
        </Link>
        <Link href="/mundial" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M2 11h18M11 2C11 2 14 6 14 11s-3 9-3 9" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Mundial</span>
        </Link>
        <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
