import type { CourseLevel, Level, RawTextSet, Round, TextSet } from '@/data/types'

/**
 * Splits a set of authored markdown blocks into slide arrays using the `---`
 * separator, exactly like the original server-side `processText`.
 */
export function processText(textSet: RawTextSet): TextSet {
  const separator = /\n+\s*---+\s*\n+/m
  const out: TextSet = {}
  for (const [key, raw] of Object.entries(textSet ?? {})) {
    out[key] = raw.split(separator).map((slide) => slide.trim())
  }
  return out
}

/** Levels keyed by level number, with round references flattened to `"1.1"`. */
export function extractLevels(data: CourseLevel[]): Record<string, Level> {
  const levels: Record<string, Level> = {}
  for (const level of data) {
    levels[String(level.level)] = {
      level: level.level,
      name: level.name,
      text: processText(level.text),
      rounds: level.rounds.map((round) => `${level.level}.${round.round}`),
    }
  }
  return levels
}

/** Rounds keyed by `"level.round"` (e.g. `"1.1"`). */
export function extractRounds(data: CourseLevel[]): Record<string, Round> {
  const rounds: Record<string, Round> = {}
  for (const level of data) {
    for (const round of level.rounds) {
      rounds[`${level.level}.${round.round}`] = {
        ...round,
        text: processText(round.text),
      }
    }
  }
  return rounds
}
