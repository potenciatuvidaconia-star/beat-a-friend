'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        width: '100%', padding: '14px', borderRadius: 18,
        background: 'var(--bf-card)', border: '1.5px solid var(--bf-border)',
        color: 'var(--bf-text-3)', fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 5l4 4-4 4M16 9H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Cerrar sesión
    </button>
  )
}
