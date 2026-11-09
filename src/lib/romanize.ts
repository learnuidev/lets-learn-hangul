import { romanizations } from '@/data/romanizations'
import type { Romanization, RomanizationRules } from '@/data/types'
import { decompose, isHangul, isIotizedVowel } from './hangul'

/** A jamo's candidate readings, or a literal passthrough for non-Hangul text. */
type Readings = string[] & { literal?: string }

const cache: Record<string, Romanization> = {}

function readings(literal?: string): Readings {
  const list: string[] = []
  return literal === undefined ? list : (Object.assign(list, { literal }) as Readings)
}

function toPattern(list: Readings): string {
  if (list.literal) {
    return /[a-zA-Z0-9-]/.test(list.literal) ? `(?:${list.literal})` : `(?:[^a-zA-Z]*)`
  }
  const unique = Array.from(new Set(list.filter((r) => r.length > 0)))
  if (unique.length === 0) return ''
  return `(?:${unique.join('|')})`
}

function emptyRomanization(str: string): Romanization {
  const pattern = toPattern(readings(str))
  return {
    ideal: str,
    regexp: new RegExp(`^${pattern}$`, 'i'),
    possibilities: [str],
    primary: [],
    syllables: [{ ideal: str, pattern, regexp: new RegExp(`^${pattern}$`, 'i') }],
  }
}

/**
 * Collects every accepted reading of each jamo in `str`.
 *
 * Shared by `getRomanizations` (which then builds patterns and the full set of
 * possible spellings) and by `romanizeIdeal` (which only needs the first
 * reading of each jamo). Returns `null` when there is nothing to read.
 */
function readJamo(
  str: string,
  phonetic: boolean,
): { jamoReadings: Readings[]; syllableReadings: Readings[][] } | null {
  const characters = str.split('')
  if (characters.filter(isHangul).length === 0) return null

  const syllables = characters.map((character) => decompose(character))
  const word = syllables.reduce<string[]>((acc, syllable) => acc.concat(syllable ?? []), [])
  // Sized as the loop fills it, not from `word`: `word` only holds the jamo of
  // Hangul syllables, so a word like "읽은 책" (a space between two syllables)
  // needs one more slot than it has jamo. Pre-sizing from `word.length` used to
  // run off the end of the array and throw.
  const jamoReadings: Readings[] = []
  const syllableReadings: Readings[][] = syllables.map(() => [])

  let i = 0
  const last = syllables.length - 1

  for (let s = 0; s <= last; s++) {
    if (!isHangul(characters[s])) {
      jamoReadings[i] = readings(characters[s])
      i++
      continue
    }

    const syllable = syllables[s] ?? [characters[s]]
    for (let j = 0; j < syllable.length; j++) {
      const jamo = syllable[j]
      const prev = word[i - 1]
      const next = word[i + 1]

      const isInitial = j === 0
      const isVowel = j === 1
      const isFinal = j === 2

      const isBeforeVowel = isInitial || Boolean(isFinal && next === 'ㅇ')
      const isBeforeIY =
        isIotizedVowel(next) || Boolean(next === 'ㅇ' && isIotizedVowel(word[i + 2]))
      const isBeforeNasal = next === 'ㄴ' || next === 'ㅁ'
      const isBeforeR = next === 'ㄹ'
      const isAfterR = prev === 'ㄹ'
      const isAfterN = prev === 'ㄴ'
      const isAfterG = prev === 'ㄱ'
      const isAfterM = prev === 'ㅁ'
      const isAfterNg = prev === 'ㅇ'
      const isAfterB = prev === 'ㅂ'
      const isStop = isFinal && next !== 'ㅇ'
      const isAfterS = prev === 'ㅆ' || prev === 'ㅅ'
      const isAfterNull = prev === 'ㅇ'

      const rules: RomanizationRules = romanizations[jamo] ?? {}
      const normal: string[] = []
      const contextual: string[] = []
      const pronunciation: string[] = []

      // Primary reading
      if (isBeforeNasal && rules.beforeNasal) pronunciation.push(rules.beforeNasal)
      else if (isBeforeR && rules.beforeR) pronunciation.push(rules.beforeR)
      else if (isStop && rules.stop) pronunciation.push(rules.stop)
      else if (isAfterR && rules.afterR) pronunciation.push(rules.afterR)
      else if (isAfterN && rules.afterN) pronunciation.push(rules.afterN)
      else if (isAfterM && rules.afterM) pronunciation.push(rules.afterM)
      else if (isAfterG && rules.afterG) pronunciation.push(rules.afterG)
      else if (isAfterNg && rules.afterNg) pronunciation.push(rules.afterNg)
      else if (isFinal && isBeforeIY && rules.finalBeforeIY)
        contextual.push(rules.finalBeforeIY)
      else if (isBeforeIY && rules.beforeIY) contextual.push(rules.beforeIY)
      else if (isBeforeVowel && rules.beforeVowel)
        contextual.push(...(Array.isArray(rules.beforeVowel) ? rules.beforeVowel : [rules.beforeVowel]))
      else if (isInitial && rules.initial != null) normal.push(rules.initial)
      else if (isFinal && rules.final) normal.push(rules.final)
      else if (isAfterNull && rules.afterNull) normal.push(...rules.afterNull)
      else if (isAfterS && rules.afterS)
        contextual.push(...(Array.isArray(rules.afterS) ? rules.afterS : [rules.afterS]))
      else if (isVowel && rules.normal) normal.push(rules.normal)

      // Alternates
      if (isBeforeNasal && rules.alternateBeforeNasal)
        contextual.push(rules.alternateBeforeNasal)
      if (isBeforeR && rules.alternateBeforeR) contextual.push(rules.alternateBeforeR)
      if (isAfterR && rules.alternateAfterR) contextual.push(rules.alternateAfterR)
      if (isAfterN && rules.alternateAfterN) contextual.push(rules.alternateAfterN)
      if (isAfterG && rules.alternateAfterG) contextual.push(rules.alternateAfterG)
      if (isAfterM && rules.alternateAfterM) contextual.push(rules.alternateAfterM)
      if (isAfterNg && rules.alternateAfterNg) contextual.push(rules.alternateAfterNg)
      if (isAfterB && rules.alternateAfterB) contextual.push(rules.alternateAfterB)
      if (isFinal && rules.alternateFinal) contextual.push(rules.alternateFinal)
      if (isInitial && rules.alternateInitial) contextual.push(rules.alternateInitial)
      if (isAfterS && rules.alternatesAfterS) contextual.push(...rules.alternatesAfterS)
      if (rules.alternates) contextual.push(...rules.alternates)

      const current = jamoReadings[i] ?? (jamoReadings[i] = readings())
      current.push(...pronunciation)
      if (!phonetic || pronunciation.length === 0) {
        current.push(...normal)
        current.push(...contextual)
      }

      syllableReadings[s].push(current)
      i++
    }
  }

  return { jamoReadings, syllableReadings }
}

/**
 * The Latin reading shown to learners, and nothing else.
 *
 * `getRomanizations` also builds every acceptable spelling (a cartesian product
 * that runs to tens of thousands of strings for long words) and a matching
 * regexp — work only the typing exercise needs. Pages that merely *display* a
 * pronunciation, like the unlocks collection, come through here instead.
 */
export function romanizeIdeal(str = ''): string {
  const read = readJamo(str, false)
  if (!read) return str
  return read.jamoReadings.map((list) => list.literal || list[0]).join('')
}

/**
 * Builds every acceptable Latin reading of a Korean word, including a regexp
 * that matches all of them plus the "ideal" romanization shown to learners.
 */
export function getRomanizations(str = '', phonetic = false): Romanization {
  if (str in cache) return cache[str]

  const read = readJamo(str, phonetic)
  if (!read) return emptyRomanization(str)
  const { jamoReadings, syllableReadings } = read

  const ideal = jamoReadings.map((list) => list.literal || list[0]).join('')
  const pattern = jamoReadings.map(toPattern).join('')
  const regexp = new RegExp(`^${pattern}$`, 'i')

  const syllablesOut = syllableReadings.map((lists) => {
    const syllableIdeal = lists.map((list) => list.literal || list[0]).join('')
    const syllablePattern = lists.map(toPattern).join('')
    return {
      ideal: syllableIdeal,
      pattern: syllablePattern,
      regexp: new RegExp(`^${syllablePattern}$`, 'i'),
    }
  })

  // Every combination of accepted readings, used to explain mistakes.
  const possibilities: string[] = []
  type Node = [string, Node[]]
  // lodash's `map(undefined, …)` returned [] here, so an empty list ends a branch.
  const recurse = (lists: Readings[]): Node[] =>
    (lists[0] ?? []).map((reading) => [reading, recurse(lists.slice(1))])
  const walk = (acc: string, nodes: Node[]): void => {
    if (!nodes.length) {
      possibilities.push(acc)
      return
    }
    nodes.forEach((node) => walk(acc + node[0], node[1]))
  }
  if (jamoReadings.length) walk('', recurse(jamoReadings))

  return (cache[str] = {
    ideal,
    regexp,
    possibilities,
    primary: jamoReadings.map((list) => Array.from(list)),
    syllables: syllablesOut,
  })
}
