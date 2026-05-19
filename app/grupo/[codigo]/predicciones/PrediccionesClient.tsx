'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  stage: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
}

interface Prediction {
  id: string
  match_id: string
  prediction: string | null
  home_pred: number | null
  away_pred: number | null
  points_earned: number | null
}

const STAGE_LABELS: Record<string, string> = {
  group: 'Fase de Grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarter: 'Cuartos de Final',
  semi: 'Semifinales',
  third: 'Tercer Lugar',
  final: 'Final',
}

export default function PrediccionesClient({
  matches, predictions, groupId, groupCode, mode, userId
}: {
  matches: Match[]
  predictions: Prediction[]
  groupId: string
  groupCode: string
  mode: string
  userId: string
}) {
  const [preds, setPreds] = useState<Record<string, Prediction>>(
    Object.fromEntries(predictions.map(p => [p.match_id, p]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  const isLocked = (match: Match) => match.status !== 'scheduled'

  async function savePrediction(matchId: string, update: Partial<Prediction>) {
    setSaving(matchId)
    const existing = preds[matchId]
    const newPred = { ...existing, ...update, match_id: matchId }

    if (existing?.id) {
      await supabase.from('predictions').update(update).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('predictions').insert({
        user_id: userId,
        group_id: groupId,
        match_id: matchId,
        ...update,
      }).select().single()
      if (data) newPred.id = data.id
    }

    setPreds(prev => ({ ...prev, [matchId]: newPred as Prediction }))
    setSaving(null)
  }

  // Group matches by stage
  const byStage = matches.reduce((acc, m) => {
    const s = m.stage
    if (!acc[s]) acc[s] = []
    acc[s].push(m)
    return acc
  }, {} as Record<string, Match[]>)

  const stageOrder = ['group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third', 'final']

  if (matches.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bf-card-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="11" stroke="var(--bf-text-3)" strokeWidth="2"/>
            <path d="M14 8v7l4 3" stroke="var(--bf-text-3)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Los partidos aún no están cargados</p>
        <p style={{ fontSize: 13, color: 'var(--bf-text-3)', marginTop: 6 }}>Vuelve pronto — el Mundial 2026 se acerca</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {stageOrder.filter(s => byStage[s]).map(stage => (
        <div key={stage}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--bf-text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            {STAGE_LABELS[stage] ?? stage}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byStage[stage].map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={preds[match.id]}
                mode={mode}
                locked={isLocked(match)}
                saving={saving === match.id}
                onSave={(update) => savePrediction(match.id, update)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MatchCard({
  match, prediction, mode, locked, saving, onSave
}: {
  match: Match
  prediction: Prediction | undefined
  mode: string
  locked: boolean
  saving: boolean
  onSave: (update: Partial<Prediction>) => void
}) {
  const date = new Date(match.match_date)
  const dateStr = date.toLocaleDateString('es-PA', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })

  const hasResult = match.status === 'finished' && match.home_score !== null
  const pts = prediction?.points_earned

  const cardBorder = (pts !== null && pts !== undefined) ? 'var(--bf-green)' : locked ? 'var(--bf-divider)' : 'var(--bf-border)'
  return (
    <div style={{
      background: 'var(--bf-card)', borderRadius: 'var(--bf-r-md)',
      border: `1.5px solid ${cardBorder}`,
      padding: '14px 14px',
      opacity: locked && !hasResult ? 0.75 : 1,
      boxShadow: 'var(--bf-shadow-sm)',
    }}>
      {/* Date & status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: 'var(--bf-text-3)' }}>{dateStr} · {timeStr}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {match.status === 'live' && (
            <span className="chip chip-live" style={{ fontSize: 10, padding: '3px 8px' }}>EN VIVO</span>
          )}
          {pts !== null && pts !== undefined && (
            <span style={{ fontSize: 10, background: 'var(--bf-green-soft)', color: 'var(--bf-green-dark)', padding: '3px 8px', borderRadius: 999, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              +{pts} pts
            </span>
          )}
          {saving && <span style={{ fontSize: 10, color: 'var(--bf-text-3)' }}>Guardando...</span>}
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <span style={{ fontSize: 22 }}>{match.home_flag}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{match.home_team}</span>
        </div>

        {hasResult ? (
          <div style={{ padding: '5px 12px', background: 'var(--bf-navy)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {match.home_score} - {match.away_score}
          </div>
        ) : (
          <span style={{ color: 'var(--bf-text-3)', fontWeight: 700, padding: '0 10px', flexShrink: 0 }}>vs</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textAlign: 'right' }}>{match.away_team}</span>
          <span style={{ fontSize: 22 }}>{match.away_flag}</span>
        </div>
      </div>

      {/* Prediction input */}
      {!locked && mode === 'basic' && (
        <BasicPicker
          value={prediction?.prediction ?? null}
          onChange={val => onSave({ prediction: val })}
          stage={match.stage}
        />
      )}

      {!locked && mode === 'pro' && (
        <ProPicker
          home={prediction?.home_pred ?? null}
          away={prediction?.away_pred ?? null}
          onChange={(h, a) => onSave({ home_pred: h, away_pred: a })}
        />
      )}

      {locked && prediction && (
        <p style={{ fontSize: 12, color: 'var(--bf-text-3)', textAlign: 'center' }}>
          Tu predicción:{' '}
          <strong style={{ color: 'var(--bf-text)' }}>
            {mode === 'basic'
              ? prediction.prediction
              : `${prediction.home_pred ?? '?'} - ${prediction.away_pred ?? '?'}`
            }
          </strong>
        </p>
      )}

      {locked && !prediction && (
        <p style={{ fontSize: 12, color: 'var(--bf-border)', textAlign: 'center' }}>No predijiste este partido</p>
      )}
    </div>
  )
}

function BasicPicker({ value, onChange, stage }: {
  value: string | null
  onChange: (v: string) => void
  stage: string
}) {
  const options = stage === 'group'
    ? [{ v: '1', label: 'Local' }, { v: 'X', label: 'Empate' }, { v: '2', label: 'Visitante' }]
    : [{ v: '1', label: 'Local' }, { v: '2', label: 'Visitante' }]

  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: stage === 'group' ? 'repeat(3,1fr)' : 'repeat(2,1fr)' }}>
      {options.map(opt => (
        <button
          key={opt.v}
          onClick={() => onChange(opt.v)}
          style={{
            padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
            border: '1.5px solid',
            borderColor: value === opt.v ? 'var(--bf-green)' : 'var(--bf-border)',
            background: value === opt.v ? 'var(--bf-green)' : 'var(--bf-card-soft)',
            color: value === opt.v ? '#fff' : 'var(--bf-text-2)',
            transition: 'all .12s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ProPicker({ home, away, onChange }: {
  home: number | null
  away: number | null
  onChange: (h: number, a: number) => void
}) {
  const [h, setH] = useState(home?.toString() ?? '')
  const [a, setA] = useState(away?.toString() ?? '')

  function handleChange(newH: string, newA: string) {
    const hp = parseInt(newH)
    const ap = parseInt(newA)
    if (!isNaN(hp) && !isNaN(ap) && hp >= 0 && ap >= 0) {
      onChange(hp, ap)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="number" min="0" max="20" value={h}
        onChange={e => { setH(e.target.value); handleChange(e.target.value, a) }}
        placeholder="0"
        style={{
          flex: 1, textAlign: 'center', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800,
          padding: '8px', borderRadius: 12, border: '1.5px solid var(--bf-border)', outline: 'none',
          background: 'var(--bf-card-soft)', color: 'var(--bf-text)',
        }}
      />
      <span style={{ color: 'var(--bf-text-3)', fontWeight: 700, fontSize: 20 }}>-</span>
      <input
        type="number" min="0" max="20" value={a}
        onChange={e => { setA(e.target.value); handleChange(h, e.target.value) }}
        placeholder="0"
        style={{
          flex: 1, textAlign: 'center', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800,
          padding: '8px', borderRadius: 12, border: '1.5px solid var(--bf-border)', outline: 'none',
          background: 'var(--bf-card-soft)', color: 'var(--bf-text)',
        }}
      />
    </div>
  )
}
