import type { Round } from '@/data/types'

/**
 * Small deterministic PRNG (mulberry32). The warm-up quiz used to pick its
 * questions randomly in memory, which meant a reload restarted it; deriving the
 * whole quiz from a seed keeps every step addressable by URL and stable across
 * reloads, back/forward and deep links.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const MIN_QUESTIONS = 4

/** The letters a learner has already met, up to and including this round. */
function knownJamos(roundKey: string, rounds: Record<string, Round>): string[] {
  const limit = parseFloat(roundKey)
  return Object.entries(rounds)
    .filter(([key]) => parseFloat(key) <= limit)
    .flatMap(([, round]) => round.jamo ?? [])
    .filter((jamo) => jamo !== '-')
}

/**
 * The full question order for a round: its own new letters first, padded with
 * letters from earlier rounds so there are at least {@link MIN_QUESTIONS}.
 */
export function getQuizQueue(
  roundKey: string,
  round: Round,
  rounds: Record<string, Round>,
): string[] {
  const own = (round.jamo ?? []).filter((jamo) => jamo !== '-')
  const pool = knownJamos(roundKey, rounds).filter((jamo) => !own.includes(jamo))
  const random = mulberry32(hashString(`queue:${roundKey}`))

  const queue = own.slice()
  while (queue.length < MIN_QUESTIONS && pool.length > 0) {
    const candidate = pool[Math.floor(random() * pool.length)]
    if (!queue.includes(candidate)) queue.push(candidate)
    else if (pool.every((jamo) => queue.includes(jamo))) break
  }
  return queue
}

/** Four answer options for one quiz step, always containing the right answer. */
export function getQuizOptions(
  roundKey: string,
  step: number,
  jamo: string,
  allJamos: string[],
): string[] {
  const random = mulberry32(hashString(`options:${roundKey}:${step}`))
  const options = new Set<string>([jamo])
  let guard = 0
  while (options.size < 4 && guard++ < 200) {
    options.add(allJamos[Math.floor(random() * allJamos.length)])
  }
  const list = Array.from(options)
  // Deterministic shuffle so the right answer is not always first.
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

/** Zero-based step from the `$step` URL segment (the bare path is step 0). */
export function stepFromParams(step?: string): number {
  const parsed = Number.parseInt(step ?? '1', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 0
  return parsed - 1
}

/** One-based URL segment for a zero-based step. */
export function paramFromStep(step: number): string {
  return String(step + 1)
}

/** The words a round asks for, in order. */
export function getRoundWords(round: Round): string[] {
  return [round.headword, ...(round.words ?? [])].filter(
    (word): word is string => Boolean(word),
  )
}
