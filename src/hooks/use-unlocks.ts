import { useMemo } from 'react'
import type { Round } from '@/data/types'
import type { RoundRecord } from '@/lib/lifetime'
import {
  progress,
  unlockIndex,
  type ProgressInput,
  type UnlockIndex,
  type UnlockProgress,
} from '@/lib/unlocks'
import { useUser } from '@/providers/user-store'

/**
 * Which letters the saved profile has been taught.
 *
 * A lesson counts as finished once it has been completed at least once
 * (`stats.rounds[key].lessons > 0`) *or* it sits at or before the furthest
 * lesson reached, which is the same comparison the course index uses. Taking
 * the union means progress can never go backwards by re-reading an old round —
 * and a profile that predates the stats record still reports its letters
 * through `latest`.
 */
export function learnedLetters(
  index: UnlockIndex,
  latest: string | null,
  records: Record<string, RoundRecord>,
): ProgressInput {
  const { course } = index
  const latestRank = latest !== null ? (course.rank[latest] ?? -1) : -1

  const done = new Set<string>()
  for (const [key, record] of Object.entries(records)) {
    if (record.lessons > 0) done.add(key)
  }
  for (const lesson of course.lessons) {
    if ((course.rank[lesson] ?? 0) <= latestRank) done.add(lesson)
  }

  const known = new Set<string>()
  for (const [letter, lesson] of Object.entries(course.taughtIn)) {
    if (done.has(lesson)) known.add(letter)
  }

  return { known, done }
}

/** Just the static index — for screens that only need "what does this round unlock". */
export function useUnlockIndex(rounds: Record<string, Round>): UnlockIndex {
  return useMemo(() => unlockIndex(rounds), [rounds])
}

export interface UnlocksView {
  index: UnlockIndex
  progress: UnlockProgress
  /** False until the saved profile has been read from localStorage. */
  ready: boolean
}

/** The static index plus every item resolved against the learner's letters. */
export function useUnlocks(rounds: Record<string, Round>): UnlocksView {
  const { user, ready } = useUser()
  const latest = user.latest
  const records = user.stats.rounds

  return useMemo(() => {
    const index = unlockIndex(rounds)
    return {
      index,
      progress: progress(index, learnedLetters(index, latest, records)),
      ready,
    }
  }, [rounds, latest, records, ready])
}
