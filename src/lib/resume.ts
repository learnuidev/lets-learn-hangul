import type { Level } from '@/data/types'

/** A lesson address: level number plus round number, both 1-based. */
export interface LessonTarget {
  level: number
  round: number
}

/**
 * The lesson "keep going" opens: the round after the last one completed,
 * rolling over into the next level, or `null` when there is nothing left.
 *
 * The welcome-back prompt and the stats page both resume through this function
 * so the two entry points can never disagree about where a learner belongs.
 */
export function nextLesson(
  levels: Record<string, Level>,
  latest: string | null,
): LessonTarget | null {
  if (!latest) return { level: 1, round: 1 }

  const [levelPart, roundPart] = latest.split('.').map((n) => Number.parseInt(n, 10))
  if (!Number.isFinite(levelPart) || !Number.isFinite(roundPart)) {
    return { level: 1, round: 1 }
  }

  let nextLevel = levelPart
  let nextRound = roundPart + 1

  const level = levels[String(nextLevel)]
  if (level && nextRound >= level.rounds.length) {
    nextLevel += 1
    nextRound = 1
  }

  return levels[String(nextLevel)] ? { level: nextLevel, round: nextRound } : null
}
