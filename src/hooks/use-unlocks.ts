import { useMemo } from 'react'
import type { Round } from '@/data/types'
import {
  learnedLetters,
  progress,
  unlockIndex,
  type UnlockIndex,
  type UnlockProgress,
} from '@/lib/unlocks'
import { useUser } from '@/providers/user-store'

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
