#!/usr/bin/env node
/**
 * Generates `src/data/korean.ts` from the Korean dataset recovered in the
 * mandarino-client repo (`korean-content/json/`).
 *
 * The app does not import that repo at runtime — the generated module is
 * committed, exactly like `src/data/course.ts` and `src/data/words.ts`. Re-run
 * this script only when the source dataset changes:
 *
 *   node scripts/build-korean-data.mjs
 *   node scripts/build-korean-data.mjs --from /path/to/mandarino-client/korean-content/json
 *
 * Two source files are used:
 *
 *   korean-components.json  987 syllable blocks   → `koreanComponents`
 *   korean-words.json       vocabulary with CEFR  → `koreanWords`
 *
 * Both are emitted as compact readonly tuples to keep the module (and the
 * client chunk that carries it) small; `src/lib/unlocks.ts` is what turns them
 * into the objects the unlocks page renders. Entries stay in source order —
 * ordering by "the lesson that completes them" needs the course data, so it
 * happens at runtime.
 *
 * The source dataset's own `roman` column is dropped: pronunciations in the app
 * come from its romanizer (`romanizeIdeal` in `src/lib/romanize.ts`), so the
 * course and the collection can never disagree about how a block is read.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..')

const fromFlag = process.argv.indexOf('--from')
const source_dir = path.resolve(
  repo,
  fromFlag > -1 && process.argv[fromFlag + 1]
    ? process.argv[fromFlag + 1]
    : '../mando/mandarino-client/korean-content/json',
)

const outFile = path.resolve(repo, 'src/data/korean.ts')

/** Hangul syllable block, U+AC00–U+D7A3. */
const SYLLABLE = /^[\uac00-\ud7a3]$/

/** CEFR bands the word list uses, easiest first. Anything else sorts last. */
const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function read(name) {
  const file = path.join(source_dir, name)
  if (!fs.existsSync(file)) {
    console.error(`Missing source file: ${file}`)
    console.error('Pass --from <korean-content/json dir> to point at the dataset.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** Collapse whitespace and drop control characters so the tuples stay clean. */
function clean(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levelRank(level) {
  const index = LEVEL_ORDER.indexOf(level)
  return index === -1 ? LEVEL_ORDER.length : index
}

/** The single easiest CEFR band a word lists, e.g. `"A1,A2"` → `"A1"`. */
function primaryLevel(raw) {
  const bands = clean(raw)
    .split(',')
    .map((band) => band.trim().toUpperCase())
    .filter((band) => LEVEL_ORDER.includes(band))
    .sort((a, b) => levelRank(a) - levelRank(b))
  return bands[0] ?? ''
}

/**
 * Every syllable of the word must be a modern Hangul block — the word list also
 * contains phrases and romanizations, and unlocks can only be derived for
 * blocks the course's letters actually spell.
 */
function isSyllableWord(input) {
  return input.length > 0 && Array.from(input).every((char) => SYLLABLE.test(char))
}

function byString(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

// ---------------------------------------------------------------- components

const rawComponents = read('korean-components.json')

const components = []
const seenComponents = new Set()
for (const entry of rawComponents) {
  const input = clean(entry.input)
  const en = clean(entry.en)
  if (!isSyllableWord(input) || Array.from(input).length !== 1 || !en) continue
  if (seenComponents.has(input)) continue
  seenComponents.add(input)
  components.push([input, en])
}
components.sort((a, b) => byString(a[0], b[0]))

// --------------------------------------------------------------------- words

const rawWords = read('korean-words.json')

/** One entry per spelling; the easiest, then shortest, gloss wins. */
const wordsByInput = new Map()
for (const entry of rawWords) {
  const input = clean(entry.input)
  const en = clean(entry.en)
  if (!isSyllableWord(input) || !en) continue

  const candidate = { input, en, level: primaryLevel(entry.level) }
  const existing = wordsByInput.get(input)
  if (!existing) {
    wordsByInput.set(input, candidate)
    continue
  }

  const better =
    levelRank(candidate.level) - levelRank(existing.level) ||
    candidate.en.length - existing.en.length ||
    byString(candidate.en, existing.en)
  if (better < 0) wordsByInput.set(input, candidate)
}

const words = [...wordsByInput.values()]
  .sort((a, b) => byString(a.input, b.input))
  .map((word) => [word.input, word.en, word.level])

// ------------------------------------------------------- translation fixes

/**
 * Hand-written corrections to the dataset's English glosses, keyed by the
 * Korean spelling. They live in `src/data/translation-fixes.json` rather than
 * in this script so that they can be reviewed as data, and they are applied
 * here so that a regeneration cannot revert them.
 */
const fixesFile = path.resolve(repo, 'src/data/translation-fixes.json')
const fixes = fs.existsSync(fixesFile)
  ? JSON.parse(fs.readFileSync(fixesFile, 'utf8'))
  : {}

/**
 * Overwrite the gloss of every entry named in `table`. A key that matches no
 * entry means the correction has gone stale — fail the build instead of
 * silently dropping it.
 */
function applyFixes(rows, table, label) {
  const pending = new Set(Object.keys(table ?? {}))
  for (const row of rows) {
    if (!pending.has(row[0])) continue
    row[1] = table[row[0]]
    pending.delete(row[0])
  }
  for (const key of pending) {
    console.error(`  ✗ ${label} fix for "${key}" matches no entry in the dataset`)
  }
  if (pending.size > 0) process.exitCode = 1
}

applyFixes(components, fixes.components, 'component')
applyFixes(words, fixes.words, 'word')

// ---------------------------------------------------------------- emit module

function tupleLines(rows) {
  return rows.map((row) => `  ${JSON.stringify(row)},`).join('\n')
}

const banner = `/**
 * Korean syllables and vocabulary recovered from mandarino-client
 * (\`korean-content/\`). Generated — do not edit by hand.
 *
 *   node scripts/build-korean-data.mjs
 *
 * The course in \`course.ts\` teaches 40 letters; these entries are what those
 * letters unlock. \`src/lib/unlocks.ts\` decides which are readable right now.
 *
 * Glosses come from the dataset except where \`src/data/translation-fixes.json\`
 * overrides them; correct a translation there, not in this file.
 */`

const source = `${banner}

/** A single syllable block and its gloss. */
export type KoreanSyllable = readonly [syllable: string, english: string]

/** A word: the spelling, its gloss, and the easiest CEFR band it appears in. */
export type KoreanWord = readonly [
  word: string,
  english: string,
  level: string,
]

/** ${components.length} syllable blocks, alphabetical. */
export const koreanComponents: readonly KoreanSyllable[] = [
${tupleLines(components)}
]

/** ${words.length} words, alphabetical, one entry per spelling. */
export const koreanWords: readonly KoreanWord[] = [
${tupleLines(words)}
]
`

fs.writeFileSync(outFile, source)

const kb = (n) => `${Math.round(n / 1024)} KB`
console.log(`source: ${source_dir}`)
console.log(`wrote ${path.relative(repo, outFile)} (${kb(Buffer.byteLength(source))})`)
console.log(`  ${components.length} syllable blocks`)
console.log(`  ${words.length} words`)
