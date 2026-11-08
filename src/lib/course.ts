import { course as courseData } from '@/data/course'
import { credits } from '@/data/credits'
import { geometric } from '@/data/geometric'
import { jamos as jamosData } from '@/data/jamos'
import { romanizations } from '@/data/romanizations'
import { shapes } from '@/data/shapes'
import { words as wordsData } from '@/data/words'
import type { CourseData, Jamo, Level, Round, Word } from '@/data/types'
import { extractLevels, extractRounds } from './text'

function indexBy<T>(items: T[], key: (item: T) => string): Record<string, T> {
  const out: Record<string, T> = {}
  for (const item of items) out[key(item)] = item
  return out
}

// The course payload is derived from static content, so it is built once and
// reused for every request.
let cachedCourse: { levels: Record<string, Level>; rounds: Record<string, Round> } | null = null

export function getCourse(): {
  levels: Record<string, Level>
  rounds: Record<string, Round>
} {
  if (!cachedCourse) {
    cachedCourse = {
      levels: extractLevels(courseData),
      rounds: extractRounds(courseData),
    }
  }
  return cachedCourse
}

export function getJamos(): Record<string, Jamo> {
  return indexBy(jamosData, (jamo) => jamo.jamo)
}

export function getWords(): Record<string, Word> {
  return indexBy(wordsData, (word) => word.word)
}

export function getShapes(): Record<string, string> {
  return shapes
}

export function getGeometric(): Record<string, string> {
  return geometric
}

export function getRomanizationRules() {
  return romanizations
}

export function getCredits() {
  return credits
}

/** Everything a round screen may need, in the shape the components expect. */
export function getRoundBundle(): Pick<CourseData, 'jamos' | 'shapes' | 'words' | 'geometric'> {
  return {
    jamos: getJamos(),
    shapes: getShapes(),
    words: getWords(),
    geometric: getGeometric(),
  }
}

export { courseData }

/** Everything the `/level/$level` branch needs, resolved from its params. */
export function getLevelBundle(levelParam: string) {
  const { levels, rounds } = getCourse()
  return {
    level: levels[levelParam] ?? null,
    levels,
    rounds,
    shapes: getShapes(),
    jamos: getJamos(),
    words: getWords(),
    geometric: getGeometric(),
  }
}

/** Looks a round up the way the original `"level.round"` keys were built. */
export function getRound(levelParam: string, roundParam: string) {
  const { rounds } = getCourse()
  return rounds[`${levelParam}.${roundParam}`] ?? null
}
