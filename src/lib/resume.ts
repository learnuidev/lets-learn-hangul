import type { Level } from '@/data/types'

/** A lesson address: level number plus round number, both 1-based. */
export interface LessonTarget {
  level: number
  round: number
}

/** `"1.10"` sorts after `"1.9"`, which plain string compares get wrong. */
export function parseLessonKey(key: string): [number, number] {
  const [level, round] = key.split('.')
  return [Number.parseInt(level ?? '0', 10) || 0, Number.parseInt(round ?? '0', 10) || 0]
}

export function compareLessonKeys(a: string, b: string): number {
  const [aLevel, aRound] = parseLessonKey(a)
  const [bLevel, bRound] = parseLessonKey(b)
  return aLevel - bLevel || aRound - bRound
}

/** Every lesson key (`"1.1"` … `"5.6"`), in course order. */
export function courseOrder(levels: Record<string, Level>): string[] {
  return Object.values(levels)
    .sort((a, b) => a.level - b.level)
    .flatMap((level) => level.rounds)
}

/**
 * Where the learner belongs: the **first lesson in the course they have not
 * finished**.
 *
 * This is the earliest gap rather than the lesson after the furthest one
 * reached, because those two only agree while the course is taken in order —
 * and nothing stops someone opening a late round directly. Finishing "Oppa!"
 * from a fresh profile leaves twenty-one lessons unfinished, so the frontier is
 * still lesson one, and the course index dims everything the learner has not
 * actually done.
 *
 * `null` means the course is finished.
 */
export function nextLessonToTake(
  levels: Record<string, Level>,
  done: ReadonlySet<string>,
): LessonTarget | null {
  for (const key of courseOrder(levels)) {
    if (done.has(key)) continue
    const [level, round] = parseLessonKey(key)
    return { level, round }
  }
  return null
}
