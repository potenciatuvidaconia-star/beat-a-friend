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
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="text-5xl mb-4">🕐</div>
        <p className="font-bold text-lg">Los partidos aún no están cargados</p>
        <p className="text-sm text-gray-400 mt-2">Vuelve pronto — el Mundial 2026 se acerca</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 space-y-8">
      {stageOrder.filter(s => byStage[s]).map(stage => (
        <div key={stage}>
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-3">
            {STAGE_LABELS[stage] ?? stage}
          </h2>
          <div className="space-y-3">
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

  return (
    <div className={`bg-white rounded-2xl border p-4 ${
      locked ? 'border-gray-100 opacity-80' : 'border-gray-200'
    } ${pts !== null && pts !== undefined ? 'border-[#00C46A]' : ''}`}>
      {/* Date & status */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">{dateStr} · {timeStr}</p>
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="text-[10px] bg-red-100 text-[#FF5C5C] px-2 py-0.5 rounded-full font-semibold animate-pulse">
              EN VIVO
            </span>
          )}
          {pts !== null && pts !== undefined && (
            <span className="text-[10px] bg-green-100 text-[#00C46A] px-2 py-0.5 rounded-full font-bold">
              +{pts} pts
            </span>
          )}
          {saving && <span className="text-[10px] text-gray-400">Guardando...</span>}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{match.home_flag}</span>
          <span className="font-bold text-sm">{match.home_team}</span>
        </div>

        {hasResult ? (
          <div className="px-3 py-1 bg-[#1A1A2E] text-white rounded-lg font-bold text-sm">
            {match.home_score} - {match.away_score}
          </div>
        ) : (
          <span className="text-gray-300 font-bold">vs</span>
        )}

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-bold text-sm text-right">{match.away_team}</span>
          <span className="text-2xl">{match.away_flag}</span>
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
        <div className="text-xs text-gray-400 text-center">
          Tu predicción:{' '}
          {mode === 'basic'
            ? <strong>{prediction.prediction}</strong>
            : <strong>{prediction.home_pred ?? '?'} - {prediction.away_pred ?? '?'}</strong>
          }
        </div>
      )}

      {locked && !prediction && (
        <p className="text-xs text-gray-300 text-center">No predijiste este partido</p>
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
    <div className={`grid gap-2 ${stage === 'group' ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map(opt => (
        <button
          key={opt.v}
          onClick={() => onChange(opt.v)}
          className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
            value === opt.v
              ? 'bg-[#00C46A] text-white'
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}
        >
          {opt.v === 'X' ? 'X' : opt.label}
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
    <div className="flex items-center gap-3">
      <input
        type="number"
        min="0"
        max="20"
        value={h}
        onChange={e => { setH(e.target.value); handleChange(e.target.value, a) }}
        className="flex-1 text-center text-2xl font-bold py-2 rounded-xl border-2 border-gray-200 focus:border-[#00C46A] focus:outline-none"
        placeholder="0"
      />
      <span className="text-gray-400 font-bold text-xl">-</span>
      <input
        type="number"
        min="0"
        max="20"
        value={a}
        onChange={e => { setA(e.target.value); handleChange(h, e.target.value) }}
        className="flex-1 text-center text-2xl font-bold py-2 rounded-xl border-2 border-gray-200 focus:border-[#00C46A] focus:outline-none"
        placeholder="0"
      />
    </div>
  )
}
