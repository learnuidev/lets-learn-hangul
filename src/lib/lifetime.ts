/**
 * Lifetime learning record.
 *
 * The same tallies are kept in two shapes so both questions can be answered
 * without scanning an event log:
 *
 * - `days`   — one bucket per local calendar day → totals, streaks, activity.
 * - `rounds` — one bucket per `level.round`        → performance per lesson.
 *
 * Both live inside the saved profile (`localStorage`), so they survive reloads,
 * are shared between the quiz and the typing exercise, and never need a server.
 */

/** Every counter the app records. All are plain tallies. */
export interface Counts {
  /** Words typed correctly. */
  words: number
  /** Wrong word submissions. */
  misses: number
  /** Letters peeked at during a word. */
  peeks: number
  /** Rounds finished end to end. */
  lessons: number
  /** Warm-up quiz answers that were right. */
  quizCorrect: number
  /** Warm-up quiz answers that were wrong. */
  quizWrong: number
}

export type CountKind = keyof Counts

export const COUNT_KINDS: readonly CountKind[] = [
  'words',
  'misses',
  'peeks',
  'lessons',
  'quizCorrect',
  'quizWrong',
]

export function emptyCounts(): Counts {
  return { words: 0, misses: 0, peeks: 0, lessons: 0, quizCorrect: 0, quizWrong: 0 }
}

/** One lesson's cumulative performance. */
export interface RoundRecord extends Counts {
  /** ISO timestamp of the most recent answer in this lesson. */
  lastAt: string
  /** Seconds spent on the most recently completed attempt. */
  lastSeconds?: number
  /** Fastest completed attempt, in seconds. */
  bestSeconds?: number
}

export interface LifetimeStats {
  days: Record<string, Counts>
  rounds: Record<string, RoundRecord>
}

export function emptyLifetime(): LifetimeStats {
  return { days: {}, rounds: {} }
}

/**
 * The lesson keys (`"1.2"`, `"3.4"`, …) the learner has actually finished.
 *
 * `lessons` is incremented by `completeSession()`, so a round that was opened and
 * abandoned has a record with `lessons: 0` and does not count.
 *
 * `latest` is added on top, because it is the one signal a profile saved before
 * this record existed still carries. It is deliberately *not* expanded into
 * "every lesson before it": nothing stops a learner from opening a late round
 * directly, and crediting them with everything ahead of it is how one finished
 * round at the end of level 3 used to unlock half the alphabet.
 */
export function completedLessons(
  rounds: Record<string, RoundRecord>,
  latest: string | null,
): Set<string> {
  const done = new Set<string>()
  for (const [key, record] of Object.entries(rounds)) {
    if (record.lessons > 0) done.add(key)
  }
  if (latest) done.add(latest)
  return done
}

function toCount(value: unknown): number {
  const num = typeof value === 'number' ? value : 0
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0
}

/** Coerce a possibly-corrupt stored bucket into valid counts. */
function normalizeCounts(raw: unknown): Counts {
  const source = (raw ?? {}) as Partial<Record<CountKind, unknown>>
  const counts = emptyCounts()
  for (const kind of COUNT_KINDS) counts[kind] = toCount(source[kind])
  return counts
}

export function addCounts(base: Counts, delta: Partial<Counts>): Counts {
  const next = emptyCounts()
  for (const kind of COUNT_KINDS) next[kind] = base[kind] + (delta[kind] ?? 0)
  return next
}

/** Local calendar day key (`YYYY-MM-DD`). Local on purpose: streaks are personal. */
export function dateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Midnight-anchored copy shifted by `delta` days. */
export function shiftDay(date: Date, delta: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + delta)
  return next
}

export function hasActivity(counts: Counts | undefined): boolean {
  return counts ? COUNT_KINDS.some((kind) => counts[kind] > 0) : false
}

/** Sum every day bucket into lifetime totals. */
export function totalCounts(days: Record<string, Counts>): Counts {
  let total = emptyCounts()
  for (const counts of Object.values(days)) total = addCounts(total, counts)
  return total
}

export interface Streaks {
  /** Consecutive active days ending today (or yesterday, if today is still open). */
  current: number
  /** Best run of consecutive active days ever. */
  longest: number
  /** Number of distinct days with any activity. */
  activeDays: number
  /** Most recent active day, or null when nothing has been recorded. */
  lastDay: string | null
}

export function computeStreaks(days: Record<string, Counts>, today = new Date()): Streaks {
  const active = Object.keys(days)
    .filter((key) => hasActivity(days[key]))
    .sort()

  if (!active.length) return { current: 0, longest: 0, activeDays: 0, lastDay: null }

  const set = new Set(active)

  // A streak is still alive before you practice today, so start counting from
  // yesterday when today has no activity yet.
  let cursor = shiftDay(today, 0)
  if (!set.has(dateKey(cursor))) cursor = shiftDay(today, -1)

  let current = 0
  while (set.has(dateKey(cursor))) {
    current += 1
    cursor = shiftDay(cursor, -1)
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < active.length; i += 1) {
    const previous = active[i - 1]
    const currentKey = active[i]
    const isNext =
      previous !== undefined &&
      currentKey !== undefined &&
      dateKey(shiftDay(new Date(`${previous}T00:00:00`), 1)) === currentKey
    run = isNext ? run + 1 : 1
    if (run > longest) longest = run
  }

  return {
    current,
    longest,
    activeDays: active.length,
    lastDay: active[active.length - 1] ?? null,
  }
}

export interface DaySlice {
  key: string
  date: Date
  counts: Counts
}

/** The last `count` days, oldest first — feed for the activity strip. */
export function recentDays(
  days: Record<string, Counts>,
  count: number,
  today = new Date(),
): DaySlice[] {
  const out: DaySlice[] = []
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = shiftDay(today, -offset)
    const key = dateKey(date)
    out.push({ key, date, counts: days[key] ?? emptyCounts() })
  }
  return out
}

/** `null` when nothing was attempted, so the UI can print “—” not “0%”. */
export function ratio(correct: number, wrong: number): number | null {
  const total = correct + wrong
  return total === 0 ? null : correct / total
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}

/** Shared shape of the events already recorded in `user.history`. */
export interface RecordedEvent {
  type: string
  time?: unknown
  round?: unknown
}

/**
 * Rebuild the lifetime record from an existing event log.
 *
 * Used once, when a profile saved by an older version of the app is loaded: it
 * has `history` but no `stats`, so its words, misses, peeks and finished
 * lessons are replayed into the new day/round buckets instead of being lost.
 */
export function backfillLifetime(history: readonly RecordedEvent[]): LifetimeStats {
  const stats = emptyLifetime()

  for (const event of history) {
    const counts: Partial<Counts> | null =
      event.type === 'word-hit'
        ? { words: 1 }
        : event.type === 'word-miss'
          ? { misses: 1 }
          : event.type === 'peek'
            ? { peeks: 1 }
            : event.type === 'session-complete'
              ? { lessons: 1 }
              : event.type === 'quiz-correct'
                ? { quizCorrect: 1 }
                : event.type === 'quiz-wrong'
                  ? { quizWrong: 1 }
                  : null
    if (!counts) continue

    const when = typeof event.time === 'string' ? new Date(event.time) : new Date()
    const date = Number.isNaN(when.getTime()) ? new Date() : when
    const key = dateKey(date)
    stats.days[key] = addCounts(stats.days[key] ?? emptyCounts(), counts)

    const roundKey = typeof event.round === 'string' ? event.round : null
    if (roundKey) {
      const existing = stats.rounds[roundKey]
      const base: RoundRecord = existing ?? { ...emptyCounts(), lastAt: date.toISOString() }
      const merged = addCounts(base, counts)
      stats.rounds[roundKey] = {
        ...merged,
        lastAt: date.toISOString(),
        ...(existing?.lastSeconds !== undefined ? { lastSeconds: existing.lastSeconds } : {}),
        ...(existing?.bestSeconds !== undefined ? { bestSeconds: existing.bestSeconds } : {}),
      }
    }
  }

  return stats
}

/** Validate a stored record, falling back to a replay of the event log. */
export function normalizeLifetime(
  raw: unknown,
  history: readonly RecordedEvent[] = [],
): LifetimeStats {
  const source = raw as Partial<LifetimeStats> | undefined

  if (!source || typeof source !== 'object' || !source.days || typeof source.days !== 'object') {
    return backfillLifetime(history)
  }

  const days: Record<string, Counts> = {}
  for (const [key, counts] of Object.entries(source.days)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) days[key] = normalizeCounts(counts)
  }

  const rounds: Record<string, RoundRecord> = {}
  const rawRounds = (source.rounds ?? {}) as Record<string, Partial<RoundRecord>>
  for (const [key, record] of Object.entries(rawRounds)) {
    if (!record || typeof record !== 'object') continue
    rounds[key] = {
      ...normalizeCounts(record),
      lastAt: typeof record.lastAt === 'string' ? record.lastAt : new Date(0).toISOString(),
      ...(typeof record.lastSeconds === 'number' ? { lastSeconds: record.lastSeconds } : {}),
      ...(typeof record.bestSeconds === 'number' ? { bestSeconds: record.bestSeconds } : {}),
    }
  }

  return { days, rounds }
}

/**
 * Add `delta` to today's bucket and to the lesson's bucket.
 *
 * Pure, so the provider stays a thin wrapper around `setState`.
 */
export function incrementLifetime(
  stats: LifetimeStats,
  roundKey: string,
  delta: Partial<Counts>,
  at: string,
  seconds?: number,
): LifetimeStats {
  const today = dateKey(new Date(at))
  const days = { ...stats.days, [today]: addCounts(stats.days[today] ?? emptyCounts(), delta) }

  const existing = stats.rounds[roundKey]
  const base: RoundRecord = existing ?? { ...emptyCounts(), lastAt: at }
  const merged = addCounts(base, delta)
  const record: RoundRecord = { ...merged, lastAt: at }

  if (seconds !== undefined && Number.isFinite(seconds) && seconds >= 0) {
    const rounded = Math.round(seconds)
    record.lastSeconds = rounded
    record.bestSeconds =
      existing?.bestSeconds === undefined ? rounded : Math.min(existing.bestSeconds, rounded)
  } else {
    if (existing?.lastSeconds !== undefined) record.lastSeconds = existing.lastSeconds
    if (existing?.bestSeconds !== undefined) record.bestSeconds = existing.bestSeconds
  }

  return { days, rounds: { ...stats.rounds, [roundKey]: record } }
}
