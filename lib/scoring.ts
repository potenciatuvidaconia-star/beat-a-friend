interface MatchResult {
  home_score: number
  away_score: number
  stage: string
}

interface Prediction {
  prediction: string | null  // '1' | 'X' | '2'
  home_pred: number | null
  away_pred: number | null
}

function getOutcome(home: number, away: number, stage: string): string {
  if (stage === 'group') {
    if (home > away) return '1'
    if (home < away) return '2'
    return 'X'
  }
  // Knockout: no draws
  return home > away ? '1' : '2'
}

export function calcBasicPoints(result: MatchResult, pred: Prediction): number {
  const actual = getOutcome(result.home_score, result.away_score, result.stage)
  return pred.prediction === actual ? 1 : 0
}

export function calcProPoints(result: MatchResult, pred: Prediction): number {
  if (pred.home_pred === null || pred.away_pred === null) return 0

  let pts = 0
  const actual = getOutcome(result.home_score, result.away_score, result.stage)
  const predOutcome = getOutcome(pred.home_pred, pred.away_pred, result.stage)

  if (predOutcome === actual) pts += 1
  if (pred.home_pred === result.home_score) pts += 1
  if (pred.away_pred === result.away_score) pts += 1

  return pts
}
