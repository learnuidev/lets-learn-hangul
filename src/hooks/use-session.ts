import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Level, Round } from '@/data/types'
import { bumpStats, finishStats, startStats } from '@/lib/stats'
import { useUser } from '@/providers/user-store'

export function roundKeyOf(level: Level, round: Round): string {
  return `${level.level}.${round.round}`
}

/**
 * Actions that need the router and the saved profile.
 *
 * There is no session state here any more: which word or quiz step you are on
 * lives in the URL, and the aggregate numbers for the round summary live in
 * sessionStorage (see `src/lib/stats.ts`). That keeps every exercise step a
 * real, refreshable, deep-linkable page.
 */
export function useSession() {
  const navigate = useNavigate()
  const { recordEvent, setLatest, dismissHint } = useUser()

  return useMemo(() => {
    return {
      /** Called from the "Ready?" screen: fresh counters, then into the exercise. */
      startSession(level: Level, round: Round) {
        const roundKey = roundKeyOf(level, round)
        startStats(roundKey)
        recordEvent('session-start', { round: roundKey })
        navigate({
          to: '/level/$level/round/$round/learn',
          params: { level: String(level.level), round: String(round.round) },
        })
      },

      /** Last word answered: record progress and show the summary. */
      completeSession(level: Level, round: Round) {
        const roundKey = roundKeyOf(level, round)
        finishStats(roundKey)
        setLatest(level.level, round.round)
        recordEvent('session-complete', { round: roundKey })
        navigate({
          to: '/level/$level/round/$round/complete',
          params: { level: String(level.level), round: String(round.round) },
        })
      },

      recordHit(level: Level, round: Round, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { words: 1 })
        recordEvent('word-hit', { word, round: roundKey })
      },

      recordMiss(level: Level, round: Round, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { misses: 1 })
        recordEvent('word-miss', { word, round: roundKey })
      },

      recordPeek(level: Level, round: Round, jamo: string, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { peeks: 1 })
        recordEvent('peek', { jamo, word, round: roundKey })
        dismissHint('peeking')
      },

      dismissHint,
    }
  }, [dismissHint, navigate, recordEvent, setLatest])
}
