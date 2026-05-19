import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PrediccionesClient from './PrediccionesClient'

export default async function PrediccionesPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', codigo)
    .single()

  if (!group) redirect('/dashboard')

  const { data: membership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.status === 'banned') redirect(`/unirse/${codigo}`)

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  const { data: myPredictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('group_id', group.id)

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bf-bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bf-navy)', padding: '14px 20px 18px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/grupo/${codigo}`} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', textDecoration: 'none', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff' }}>
              Predicciones
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 1 }}>
              {group.name} · {group.mode === 'basic' ? 'Quiniela Básica' : 'Quiniela Pro'}
            </p>
          </div>
        </div>
      </div>

      <PrediccionesClient
        matches={matches ?? []}
        predictions={myPredictions ?? []}
        groupId={group.id}
        groupCode={codigo}
        mode={group.mode}
        userId={user.id}
      />

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bf-card)', borderTop: '1px solid var(--bf-divider)',
        padding: '10px 24px 28px', display: 'flex', justifyContent: 'space-around',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 9.5L11 2l8 7.5V20a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Inicio</span>
        </Link>
        <Link href={`/grupo/${codigo}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-text-3)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M7 17V9M11 17V5M15 17v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Ranking</span>
        </Link>
        <Link href={`/grupo/${codigo}/predicciones`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'var(--bf-navy)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Predecir</span>
        </Link>
      </nav>
    </div>
  )
}
