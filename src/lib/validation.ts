import type { RomanizationResult } from '@/data/types'
import { getRomanizations } from './romanize'

/**
 * Checks a learner's answer against every accepted romanization of a word.
 * On a miss it reports the first character that cannot lead anywhere.
 */
export function checkRomanization(
  hangul: string,
  input: string,
  phonetic = false,
): RomanizationResult {
  const romanization = getRomanizations(hangul, phonetic)
  if (input === romanization.ideal) return { correct: true }

  const { ideal, regexp, possibilities } = romanization
  const correct = regexp.test(input)
  if (correct) return { correct: true }

  const result: RomanizationResult = { correct, reason: `Should be “${ideal}”.` }

  for (let i = 0; i < input.length; i++) {
    const matches = possibilities.filter(
      (possibility) => possibility.slice(0, i + 1) === input.slice(0, i + 1),
    )
    if (matches.length === 0) {
      result.wrongChar = i
      break
    }
  }

  return result
}
