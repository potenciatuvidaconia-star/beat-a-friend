'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ display_name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('display_name, email').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = profile?.display_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8', paddingBottom: 96 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(145deg, #001040 0%, #001F5B 55%, #002D80 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: '#CE1126' }} />
          <div style={{ flex: 1, background: '#fff' }} />
          <div style={{ flex: 1, background: '#00C46A' }} />
        </div>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '18px 20px 24px' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Beat-a-Friend
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff' }}>Mi Perfil</h1>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Profile card */}
        <div style={{ background: 'var(--bf-card)', borderRadius: 20, border: '1px solid var(--bf-border)', overflow: 'hidden', boxShadow: 'var(--bf-shadow-sm)' }}>
          <div style={{ background: 'linear-gradient(135deg, #001F5B 0%, #003087 100%)', padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
              background: 'var(--bf-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#fff',
              boxShadow: '0 4px 12px rgba(0,196,106,.4)',
            }}>
              {loading ? '?' : initial}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1.1 }}>
                {loading ? '...' : profile?.display_name}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
                {loading ? '' : profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ background: 'var(--bf-card)', borderRadius: 20, border: '1px solid var(--bf-border)', overflow: 'hidden' }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
            textDecoration: 'none', borderBottom: '1px solid var(--bf-divider)',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bf-navy-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 8L9 1.5 16 8v8a1 1 0 01-1 1h-4v-4H7v4H3a1 1 0 01-1-1V8z" stroke="var(--bf-navy)" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text)' }}>Mis grupos</p>
            <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 2l5 5-5 5" stroke="var(--bf-text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/mundial" style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
            textDecoration: 'none',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bf-navy-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="var(--bf-navy)" strokeWidth="1.6"/>
                <path d="M1.5 9h15M9 1.5C9 1.5 11.5 5 11.5 9S9 16.5 9 16.5" stroke="var(--bf-navy)" strokeWidth="1.2"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--bf-text)' }}>Tabla de grupos Mundial 2026</p>
            <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 2l5 5-5 5" stroke="var(--bf-text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '15px', borderRadius: 18,
            background: 'var(--bf-card)', border: '1.5px solid var(--bf-coral)',
            color: 'var(--bf-coral)', fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M12 5l4 4-4 4M16 9H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cerrar sesión
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--bf-text-3)' }}>
          Beat-a-Friend · Mundial 2026
        </p>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--bf-divider)',
        padding: '10px 24px 28px', display: 'flex', justifyContent: 'space-around',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Inicio</span>
        </Link>
        <Link href="/mundial" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M2 11h18M11 2C11 2 14 6 14 11s-3 9-3 9" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Mundial</span>
        </Link>
        <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-navy)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
