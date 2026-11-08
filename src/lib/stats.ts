import { isBrowser } from './env'

/**
 * Aggregate attempt stats for one round. Kept in sessionStorage so the round
 * summary still has real numbers after a reload (the per-word position lives in
 * the URL, so it survives anyway).
 */
export interface AttemptStats {
  words: number
  misses: number
  peeks: number
  started: number
  completed: number
}

const KEY_PREFIX = 'lets-learn-hangul:attempt:'

function key(roundKey: string): string {
  return `${KEY_PREFIX}${roundKey}`
}

export function readStats(roundKey: string): AttemptStats | null {
  if (!isBrowser()) return null
  try {
    const raw = window.sessionStorage.getItem(key(roundKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AttemptStats>
    return {
      words: parsed.words ?? 0,
      misses: parsed.misses ?? 0,
      peeks: parsed.peeks ?? 0,
      started: parsed.started ?? 0,
      completed: parsed.completed ?? 0,
    }
  } catch {
    return null
  }
}

function write(roundKey: string, stats: AttemptStats) {
  if (!isBrowser()) return
  try {
    window.sessionStorage.setItem(key(roundKey), JSON.stringify(stats))
  } catch {
    // Storage may be unavailable; the summary just starts from zero.
  }
}

export function startStats(roundKey: string): AttemptStats {
  const stats: AttemptStats = {
    words: 0,
    misses: 0,
    peeks: 0,
    started: Date.now(),
    completed: 0,
  }
  write(roundKey, stats)
  return stats
}

export function ensureStats(roundKey: string): AttemptStats {
  return readStats(roundKey) ?? startStats(roundKey)
}

export function bumpStats(
  roundKey: string,
  delta: Partial<Pick<AttemptStats, 'words' | 'misses' | 'peeks'>>,
): AttemptStats {
  const current = ensureStats(roundKey)
  const next: AttemptStats = {
    ...current,
    words: current.words + (delta.words ?? 0),
    misses: current.misses + (delta.misses ?? 0),
    peeks: current.peeks + (delta.peeks ?? 0),
  }
  write(roundKey, next)
  return next
}

export function finishStats(roundKey: string): AttemptStats {
  const current = ensureStats(roundKey)
  const next = { ...current, completed: Date.now() }
  write(roundKey, next)
  return next
}

