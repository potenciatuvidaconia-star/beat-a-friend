'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateGroupCode } from '@/lib/utils'

export default function CrearGrupoPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'basic' | 'pro'>('basic')
  const [apodoPrimero, setApodoPrimero] = useState('El Profeta')
  const [apodoUltimo, setApodoUltimo] = useState('El Ciego')
  const [premioCastigo, setPremioCastigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const code = generateGroupCode(name)
    const { data: group, error: groupErr } = await supabase.from('groups')
      .insert({ name, code, mode, owner_id: user.id, yappy_number: 'platform',
        apodo_primero: apodoPrimero || 'El Profeta',
        apodo_ultimo: apodoUltimo || 'El Ciego',
        premio_castigo: premioCastigo || null })
      .select().single()
    if (groupErr) { setError('Error creando el grupo. Intenta de nuevo.'); setLoading(false); return }
    await supabase.from('group_members').insert({
      group_id: group.id, user_id: user.id, status: 'active', payment_status: 'confirmed'
    })
    router.push(`/grupo/${group.code}`)
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bf-bg)' }}>
      {/* Header */}
      <div style={{ background:'var(--bf-card)',borderBottom:'1px solid var(--bf-divider)',padding:'14px 20px' }}>
        <div style={{ maxWidth:480,margin:'0 auto',display:'flex',alignItems:'center',gap:12 }}>
          <Link href="/dashboard" style={{ width:36,height:36,borderRadius:'50%',background:'var(--bf-card-soft)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'var(--bf-shadow-sm)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="var(--bf-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:600 }}>Nuevo grupo</h1>
            <p style={{ fontSize:12,color:'var(--bf-text-3)' }}>Solo te tomará un minuto</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:480,margin:'0 auto',padding:'20px 20px 40px',display:'flex',flexDirection:'column',gap:20 }}>
        <form onSubmit={handleCreate} style={{ display:'flex',flexDirection:'column',gap:20 }}>

          {/* Nombre */}
          <div>
            <label className="input-label">Nombre del grupo</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:20 }}>⚽</span>
              <input className="input" type="text" placeholder="Los Fracasados 2026"
                value={name} onChange={e => setName(e.target.value)} required maxLength={40}
                style={{ paddingLeft:44 }} />
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="input-label">Modalidad</label>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {[
                { v:'basic', icon:'🎯', title:'Quiniela Básica', pts:'1 punto por acierto', desc:'Marcas 1 / X / 2 — quién gana o empate.' },
                { v:'pro', icon:'🔥', title:'Quiniela Pro', pts:'Hasta 3 pts por partido', badge:'Más bullying', desc:'Predices el marcador exacto.' },
              ].map(opt => (
                <button key={opt.v} type="button" onClick={() => setMode(opt.v as 'basic' | 'pro')}
                  style={{
                    display:'block',width:'100%',textAlign:'left',
                    background: mode === opt.v ? 'var(--bf-card)' : 'var(--bf-card)',
                    border: `2px solid ${mode === opt.v ? 'var(--bf-green)' : 'var(--bf-border)'}`,
                    borderRadius:'var(--bf-r-md)',padding:'14px 16px',cursor:'pointer',
                    boxShadow: mode === opt.v ? '0 6px 18px rgba(0,196,106,.18)' : 'var(--bf-shadow-sm)',
                    transition:'all .15s',
                  }}>
                  <div style={{ display:'flex',alignItems:'flex-start',gap:12 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background: mode === opt.v ? 'rgba(0,196,106,.15)' : 'var(--bf-card-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{opt.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontFamily:'var(--font-display)',fontWeight:600,fontSize:15 }}>{opt.title}</span>
                        {(opt as any).badge && <span className="chip chip-gold" style={{ fontSize:10 }}>{(opt as any).badge}</span>}
                      </div>
                      <div style={{ fontSize:12,fontWeight:600,color:'var(--bf-green-dark)',marginTop:2,fontFamily:'var(--font-display)' }}>{opt.pts}</div>
                      <div style={{ fontSize:12,color:'var(--bf-text-2)',marginTop:3 }}>{opt.desc}</div>
                    </div>
                    <div style={{ width:22,height:22,borderRadius:'50%',border:`2px solid ${mode === opt.v ? 'var(--bf-green)' : 'var(--bf-border)'}`,background: mode === opt.v ? 'var(--bf-green)' : 'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {mode === opt.v && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Apodos */}
          <div style={{ background:'var(--bf-card)',borderRadius:'var(--bf-r-lg)',padding:'18px',boxShadow:'var(--bf-shadow-sm)',border:'1px solid var(--bf-border)',display:'flex',flexDirection:'column',gap:16 }}>
            <div>
              <p style={{ fontFamily:'var(--font-display)',fontWeight:600,fontSize:15 }}>🎭 Dale personalidad al grupo</p>
              <p style={{ fontSize:12,color:'var(--bf-text-3)',marginTop:3 }}>Estos apodos aparecen en el ranking, notificaciones y diplomas</p>
            </div>
            <div>
              <label className="input-label" style={{ color:'#8a6300' }}>👑 Apodo del primero</label>
              <input className="input" type="text" placeholder="El Profeta, El Crack, El Messi del Grupo..."
                value={apodoPrimero} onChange={e => setApodoPrimero(e.target.value)} maxLength={30}
                style={{ borderColor: 'var(--bf-gold)' }} />
            </div>
            <div>
              <label className="input-label" style={{ color:'var(--bf-coral-dark)' }}>🤦 Apodo del último</label>
              <input className="input" type="text" placeholder="El Ciego, El Inútil, El que no sabe nada..."
                value={apodoUltimo} onChange={e => setApodoUltimo(e.target.value)} maxLength={30}
                style={{ borderColor: 'var(--bf-coral)' }} />
            </div>
            <div>
              <label className="input-label">🍽️ Premio / Castigo (opcional)</label>
              <input className="input" type="text" placeholder="El último paga la cena del grupo..."
                value={premioCastigo} onChange={e => setPremioCastigo(e.target.value)} maxLength={80} />
            </div>
          </div>

          {error && (
            <div style={{ background:'var(--bf-coral-soft)',borderRadius:'var(--bf-r-md)',padding:'10px 14px' }}>
              <p style={{ color:'var(--bf-coral-dark)',fontSize:13,fontWeight:600 }}>⚠️ {error}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Crear grupo →'}
          </button>
        </form>
      </div>
    </div>
  )
}
