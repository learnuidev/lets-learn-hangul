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
  const { recordEvent, recordProgress, setLatest, dismissHint } = useUser()

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
        const finished = finishStats(roundKey)
        // Seconds for this attempt, so the lesson keeps a best/last time.
        const seconds =
          finished.started > 0
            ? Math.max(0, Math.round((finished.completed - finished.started) / 1000))
            : undefined
        setLatest(level.level, round.round)
        recordProgress(roundKey, { lessons: 1 }, seconds)
        recordEvent('session-complete', { round: roundKey, seconds })
        navigate({
          to: '/level/$level/round/$round/complete',
          params: { level: String(level.level), round: String(round.round) },
        })
      },

      recordHit(level: Level, round: Round, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { words: 1 })
        recordProgress(roundKey, { words: 1 })
        recordEvent('word-hit', { word, round: roundKey })
      },

      recordMiss(level: Level, round: Round, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { misses: 1 })
        recordProgress(roundKey, { misses: 1 })
        recordEvent('word-miss', { word, round: roundKey })
      },

      recordPeek(level: Level, round: Round, jamo: string, word: string) {
        const roundKey = roundKeyOf(level, round)
        bumpStats(roundKey, { peeks: 1 })
        recordProgress(roundKey, { peeks: 1 })
        recordEvent('peek', { jamo, word, round: roundKey })
        dismissHint('peeking')
      },

      /** Warm-up quiz answer. Both outcomes count toward lesson performance. */
      recordQuizAnswer(level: Level, round: Round, jamo: string, correct: boolean) {
        const roundKey = roundKeyOf(level, round)
        recordProgress(roundKey, correct ? { quizCorrect: 1 } : { quizWrong: 1 })
        recordEvent(correct ? 'quiz-correct' : 'quiz-wrong', { jamo, round: roundKey })
      },

      dismissHint,
    }
  }, [dismissHint, navigate, recordEvent, recordProgress, setLatest])
}
