/**
 * "Unlocks": what the letters you have learned so far let you actually read.
 *
 * The course teaches 40 letters, one round at a time. Every syllable block and
 * every word in `src/data/korean.ts` is spelled with some subset of those
 * letters, so each one can be placed on the timeline: the lesson that teaches
 * the *last* of its letters is the lesson that completes it. That single idea
 * drives the whole section —
 *
 * - **full**    — every letter it needs is known, so it can be read right now.
 * - **partial** — some of its letters are known; it is "half-read".
 * - **locked**  — none of its letters have been taught yet.
 *
 * Cluster finals (ㄳ, ㄺ, ㅄ, …) are the one exception: the course never
 * introduces them as letters — level 5 introduces them as *pronunciation*
 * rules — so they are treated as the two consonants they are made of (ㄺ needs
 * ㄹ and ㄱ). Nothing else is expanded: ㅆ, ㅉ, ㄲ, ㅘ, ㅢ … are all taught as
 * letters in their own right, so a block that needs one waits for that lesson.
 */

import { koreanComponents, koreanWords } from '@/data/korean'
import type { Round } from '@/data/types'
import { completedLessons, type RoundRecord } from './lifetime'
import { compareLessonKeys } from './resume'
import { decompose, decomposeDoubleJamo } from './hangul'
import { romanizeIdeal } from './romanize'

export type UnlockStatus = 'full' | 'partial' | 'locked'

/** The final clusters, which are read as the two consonants they are built from. */
const CLUSTER_FINALS = new Set(['ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ'])

/** One syllable block or word, placed on the course's letter timeline. */
export interface UnlockItem {
  /** The Hangul spelling. Also its key — spellings are unique in the dataset. */
  readonly input: string
  /** English gloss. */
  readonly en: string
  /** English pronunciation, from the same romanizer the lessons use. */
  readonly roman: string
  /** Easiest CEFR band the word appears in; empty for a syllable block. */
  readonly level: string
  /** Every letter it needs, in spelling order, deduplicated. */
  readonly letters: readonly string[]
  /** The lesson that teaches the last of `letters` — when this becomes readable. */
  readonly lesson: string
  /** Position of `lesson` in the course, for ordering the page. */
  readonly rank: number
  /** Words only: the syllable blocks it is spelled from. */
  readonly blocks?: readonly string[]
}

/** How many items are in each state. `total` is the sum. */
export interface UnlockCounts {
  full: number
  partial: number
  locked: number
  total: number
}

export function emptyCounts(): UnlockCounts {
  return { full: 0, partial: 0, locked: 0, total: 0 }
}

/** The letters a block needs, expanding cluster finals into their consonants. */
export function lettersFor(block: string): string[] {
  const parts = decompose(block)
  if (!parts) return []
  const [initial, medial, final] = parts
  const letters: string[] = []
  if (initial) letters.push(initial)
  if (medial) letters.push(medial)
  if (final) {
    if (CLUSTER_FINALS.has(final)) letters.push(...(decomposeDoubleJamo(final) ?? [final]))
    else letters.push(final)
  }
  return Array.from(new Set(letters))
}

/**
 * The course's letters, in the order they are taught.
 *
 * A round's `jamo` list is the source of truth; `-` is the placeholder the
 * course uses for a syllable with no initial consonant, which is ㅇ.
 */
export interface CourseLetters {
  /** Lesson keys (`"2.3"`), in course order. */
  readonly lessons: readonly string[]
  /** Letter → the first lesson that teaches it. */
  readonly taughtIn: Record<string, string>
  /** Lesson key → its position in `lessons`. */
  readonly rank: Record<string, number>
  /** Lesson key → the letters that lesson introduces, as `jamo` lists them. */
  readonly lettersByLesson: Record<string, readonly string[]>
}

export function courseLetters(rounds: Record<string, Round>): CourseLetters {
  const lessons = Object.keys(rounds).sort(compareLessonKeys)

  const taughtIn: Record<string, string> = {}
  const rank: Record<string, number> = {}
  const lettersByLesson: Record<string, string[]> = {}

  lessons.forEach((lesson, index) => {
    rank[lesson] = index
    const letters: string[] = []
    for (const jamo of rounds[lesson]?.jamo ?? []) {
      const letter = jamo === '-' ? 'ㅇ' : jamo
      letters.push(letter)
      if (!(letter in taughtIn)) taughtIn[letter] = lesson
    }
    lettersByLesson[lesson] = letters
  })

  return { lessons, taughtIn, rank, lettersByLesson }
}

/** How many items a lesson would make readable. */
export interface LessonUnlocks {
  syllables: number
  words: number
}

/** A built index: every item, ordered by the lesson that completes it. */
export interface UnlockIndex {
  readonly course: CourseLetters
  /** Syllable blocks, easiest first. */
  readonly syllables: readonly UnlockItem[]
  /** Words, easiest first. */
  readonly words: readonly UnlockItem[]
  /** Block spelling → its item, for the block's own page. */
  readonly blockByInput: Record<string, UnlockItem>
  /** Block spelling → every word spelled with it, in index order. */
  readonly wordsForBlock: Record<string, readonly UnlockItem[]>
}

/** The lesson rank at which an item becomes readable; `Infinity` if never. */
function rankOf(letters: readonly string[], course: CourseLetters): number {
  let rank = 0
  for (const letter of letters) {
    const lesson = course.taughtIn[letter]
    if (lesson === undefined) return Number.POSITIVE_INFINITY
    rank = Math.max(rank, course.rank[lesson] ?? 0)
  }
  return rank
}

function lessonAt(rank: number, course: CourseLetters): string {
  return course.lessons[rank] ?? ''
}

function buildSyllables(course: CourseLetters): UnlockItem[] {
  return koreanComponents
    .map(([input, en]) => {
      const letters = lettersFor(input)
      const rank = rankOf(letters, course)
      return {
        input,
        en,
        roman: romanizeIdeal(input),
        level: '',
        letters,
        lesson: lessonAt(rank, course),
        rank,
      }
    })
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.letters.length - b.letters.length ||
        (a.input < b.input ? -1 : a.input > b.input ? 1 : 0),
    )
}

function buildWords(course: CourseLetters): UnlockItem[] {
  return koreanWords
    .map(([input, en, level]) => {
      const blocks = Array.from(input)
      const letters = Array.from(new Set(blocks.flatMap(lettersFor)))
      const rank = rankOf(letters, course)
      return {
        input,
        en,
        roman: romanizeIdeal(input),
        level,
        letters,
        lesson: lessonAt(rank, course),
        rank,
        blocks,
      }
    })
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.letters.length - b.letters.length ||
        a.input.length - b.input.length ||
        (a.input < b.input ? -1 : a.input > b.input ? 1 : 0),
    )
}

/** `rounds` comes from a cached loader, so identity is a safe cache key. */
let cached: { rounds: Record<string, Round>; index: UnlockIndex } | null = null

/**
 * Every item, ordered by the lesson that completes it.
 *
 * Pure and memoised on the course itself — the same index serves every learner;
 * only the letters they know differ, which is `progress()`'s job.
 */
export function unlockIndex(rounds: Record<string, Round>): UnlockIndex {
  if (cached && cached.rounds === rounds) return cached.index

  const course = courseLetters(rounds)
  const syllables = buildSyllables(course)
  const words = buildWords(course)

  const blockByInput: Record<string, UnlockItem> = {}
  for (const item of syllables) blockByInput[item.input] = item

  // Which words a block appears in — the reverse of `blocks`. A word that
  // repeats a block still lists it once.
  const buckets = new Map<string, UnlockItem[]>()
  for (const word of words) {
    for (const block of new Set(word.blocks ?? [])) {
      const list = buckets.get(block)
      if (list) list.push(word)
      else buckets.set(block, [word])
    }
  }

  const index: UnlockIndex = {
    course,
    syllables,
    words,
    blockByInput,
    wordsForBlock: Object.fromEntries(buckets),
  }
  cached = { rounds, index }
  return index
}

/** One item's state, given the letters the learner knows. */
export interface UnlockState {
  status: UnlockStatus
  /** Letters still to learn — empty when it is fully readable. */
  missing: string[]
}

export function stateOf(item: UnlockItem, known: ReadonlySet<string>): UnlockState {
  const missing: string[] = []
  let found = 0
  for (const letter of item.letters) {
    if (known.has(letter)) found += 1
    else missing.push(letter)
  }
  const status: UnlockStatus = found === 0 ? 'locked' : missing.length === 0 ? 'full' : 'partial'
  return { status, missing }
}

/**
 * Whether a single syllable can be read with `known`, plus the letters that are
 * holding it back. Used to fade the individual blocks of a half-read word.
 */
export function canRead(
  block: string,
  known: ReadonlySet<string>,
): { readable: boolean; missing: string[] } {
  const missing = lettersFor(block).filter((letter) => !known.has(letter))
  return { readable: missing.length === 0, missing }
}

/** The lesson whose single letter would complete the most half-read items. */
export interface NextUnlock {
  letter: string
  lesson: string
  rank: number
  syllables: number
  words: number
  /** Everything those items need once `letter` is learned. */
  total: number
}

export interface ProgressInput {
  /** Letters already taught. */
  known: ReadonlySet<string>
  /** Lessons finished, for marking the index. */
  done: ReadonlySet<string>
}

/** Which collection an item belongs to. */
export type UnlockKind = 'syllable' | 'word'

/**
 * Key for `UnlockProgress.state`.
 *
 * The two collections overlap — 약 is both a syllable block and a word — so the
 * spelling alone is not a key.
 */
export function stateKey(kind: UnlockKind, input: string): string {
  return `${kind}:${input}`
}

export interface UnlockProgress {
  known: ReadonlySet<string>
  done: ReadonlySet<string>
  /** `stateKey()` → state. */
  state: Record<string, UnlockState>
  syllables: UnlockCounts
  words: UnlockCounts
  /** Every letter the course teaches, in teaching order. */
  letters: { letter: string; lesson: string; known: boolean }[]
  next: NextUnlock | null
}

function tally(counts: UnlockCounts, status: UnlockStatus): UnlockCounts {
  counts[status] += 1
  counts.total += 1
  return counts
}

/** Resolve every item against the letters the learner knows. */
export function progress(index: UnlockIndex, input: ProgressInput): UnlockProgress {
  const { known, done } = input

  const state: Record<string, UnlockState> = {}
  const syllables = emptyCounts()
  const words = emptyCounts()

  /** Single-letter-away items, grouped by the letter that would finish them. */
  const waiting = new Map<string, { syllables: number; words: number }>()

  const note = (item: UnlockItem, isWord: boolean) => {
    const itemState = stateOf(item, known)
    state[stateKey(isWord ? 'word' : 'syllable', item.input)] = itemState
    tally(isWord ? words : syllables, itemState.status)
    if (itemState.status !== 'partial' || itemState.missing.length !== 1) return
    const letter = itemState.missing[0] as string
    const bucket = waiting.get(letter) ?? { syllables: 0, words: 0 }
    if (isWord) bucket.words += 1
    else bucket.syllables += 1
    waiting.set(letter, bucket)
  }

  for (const item of index.syllables) note(item, false)
  for (const item of index.words) note(item, true)

  let next: NextUnlock | null = null
  for (const [letter, bucket] of waiting) {
    const lesson = index.course.taughtIn[letter]
    if (lesson === undefined) continue
    const rank = index.course.rank[lesson] ?? 0
    const total = bucket.syllables + bucket.words
    if (
      !next ||
      total > next.total ||
      (total === next.total && rank < next.rank) ||
      (total === next.total && rank === next.rank && letter < next.letter)
    ) {
      next = { letter, lesson, rank, syllables: bucket.syllables, words: bucket.words, total }
    }
  }

  const letters = Object.entries(index.course.taughtIn)
    .map(([letter, lesson]) => ({ letter, lesson, known: known.has(letter) }))
    .sort(
      (a, b) =>
        (index.course.rank[a.lesson] ?? 0) - (index.course.rank[b.lesson] ?? 0) ||
        (a.letter < b.letter ? -1 : 1),
    )

  return { known, done, state, syllables, words, letters, next }
}

/**
 * Which letters the saved profile has been taught.
 *
 * A letter counts once the lesson that introduces it has actually been finished
 * — see `completedLessons()`. Lessons the learner skipped past therefore teach
 * nothing: opening "Oppa!" from a fresh profile unlocks ㅃ, ㄸ and ㄲ, not the
 * twenty-one rounds that happen to sit before it in the course.
 */
export function learnedLetters(
  index: UnlockIndex,
  latest: string | null,
  records: Record<string, RoundRecord>,
): ProgressInput {
  const { course } = index
  const done = completedLessons(records, latest)

  const known = new Set<string>()
  for (const [letter, lesson] of Object.entries(course.taughtIn)) {
    if (done.has(lesson)) known.add(letter)
  }

  return { known, done }
}

/**
 * What learning one lesson's letters would actually make readable, given what
 * the learner knows now.
 *
 * This is *not* "every item the lesson completes": that is only the same thing
 * while the course is taken in order. Someone who jumps straight to a late
 * round would be told a lesson hands them dozens of blocks that still need
 * letters from lessons they never opened, so the question is asked against the
 * letters actually known — an item counts only if everything still missing from
 * it is taught by this lesson.
 */
export function gainForLesson(
  index: UnlockIndex,
  known: ReadonlySet<string>,
  lesson: string,
): LessonUnlocks {
  const teaching = new Set(index.course.lettersByLesson[lesson] ?? [])
  const counts: LessonUnlocks = { syllables: 0, words: 0 }
  if (teaching.size === 0) return counts

  const becomesReadable = (item: UnlockItem): boolean => {
    let missing = 0
    for (const letter of item.letters) {
      if (known.has(letter)) continue
      if (!teaching.has(letter)) return false
      missing += 1
    }
    return missing > 0
  }

  for (const item of index.syllables) if (becomesReadable(item)) counts.syllables += 1
  for (const item of index.words) if (becomesReadable(item)) counts.words += 1
  return counts
}
