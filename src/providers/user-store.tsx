import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { isBrowser } from '@/lib/env'
import {
  emptyLifetime,
  incrementLifetime,
  normalizeLifetime,
  type Counts,
  type LifetimeStats,
} from '@/lib/lifetime'

const STORAGE_KEY = 'lets-learn-hangul'

/**
 * Cap on the raw event log. Lifetime numbers live in `stats`, so the log only
 * needs to stay useful as a recent activity trail — without a cap it grows for
 * as long as someone keeps practicing and would eventually break localStorage.
 */
const HISTORY_LIMIT = 500

export interface HistoryEvent {
  time: string
  type: string
  [key: string]: unknown
}

export interface UserState {
  levels: { complete: Record<string, boolean> }
  rounds: { complete: Record<string, boolean> }
  latest: string | null
  history: HistoryEvent[]
  hinted: { romanization: boolean; peeking: boolean }
  /** Lifetime learning record: daily buckets, per-lesson records and streaks. */
  stats: LifetimeStats
}

export type HintName = keyof UserState['hinted']

export const defaultUser: UserState = {
  levels: { complete: {} },
  rounds: { complete: {} },
  latest: null,
  history: [],
  hinted: { romanization: false, peeking: false },
  stats: emptyLifetime(),
}

interface UserContextValue {
  user: UserState
  /** False until the saved profile has been read from localStorage. */
  ready: boolean
  startHistory: () => void
  setLatest: (level: number, round: number) => void
  recordEvent: (type: string, data?: Record<string, unknown>) => void
  /** Tally practice into today's bucket and the lesson's bucket. */
  recordProgress: (roundKey: string, delta: Partial<Counts>, seconds?: number) => void
  dismissHint: (hint: HintName) => void
  indexShowing: boolean
  showIndex: () => void
  hideIndex: () => void
  toggleIndex: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(defaultUser)
  const [ready, setReady] = useState(false)
  const [indexShowing, setIndexShowing] = useState(false)

  // `user` is read inside callbacks that may fire in the same tick, so keep a
  // ref in sync for writes that must not wait for a render.
  const userRef = useRef(user)
  userRef.current = user

  useEffect(() => {
    if (!isBrowser()) return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserState>
        const history = Array.isArray(parsed.history) ? parsed.history : []
        const next: UserState = {
          ...defaultUser,
          ...parsed,
          hinted: { ...defaultUser.hinted, ...parsed.hinted },
          history,
          // A profile saved before stats existed has history but no stats —
          // replay it so earlier practice still counts.
          stats: normalizeLifetime(parsed.stats, history),
        }
        setUser(next)
        // Write the replayed record back once. Otherwise it would be rebuilt
        // from the event log on every load, and the capped log would start
        // dropping the older events it is built from.
        if (!parsed.stats) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
    } catch {
      // Corrupt or blocked storage: start fresh.
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: UserState) => {
    if (!isBrowser()) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage may be full or blocked; the in-memory profile still works.
    }
  }, [])

  const update = useCallback(
    (updater: (current: UserState) => UserState) => {
      setUser((current) => {
        const next = updater(current)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const recordEvent = useCallback(
    (type: string, data: Record<string, unknown> = {}) => {
      update((current) => {
        const history = [...current.history, { time: new Date().toISOString(), type, ...data }]
        return {
          ...current,
          history: history.length > HISTORY_LIMIT ? history.slice(-HISTORY_LIMIT) : history,
        }
      })
    },
    [update],
  )

  const recordProgress = useCallback(
    (roundKey: string, delta: Partial<Counts>, seconds?: number) => {
      const at = new Date().toISOString()
      update((current) => ({
        ...current,
        stats: incrementLifetime(current.stats, roundKey, delta, at, seconds),
      }))
    },
    [update],
  )

  const setLatest = useCallback(
    (level: number, round: number) => {
      update((current) => ({ ...current, latest: `${level}.${round}` }))
    },
    [update],
  )

  const startHistory = useCallback(() => recordEvent('started-learning'), [recordEvent])

  const dismissHint = useCallback(
    (hint: HintName) => {
      update((current) =>
        current.hinted[hint]
          ? current
          : { ...current, hinted: { ...current.hinted, [hint]: true } },
      )
    },
    [update],
  )

  const showIndex = useCallback(() => setIndexShowing(true), [])
  const hideIndex = useCallback(() => setIndexShowing(false), [])
  const toggleIndex = useCallback(() => setIndexShowing((showing) => !showing), [])

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      ready,
      startHistory,
      setLatest,
      recordEvent,
      recordProgress,
      dismissHint,
      indexShowing,
      showIndex,
      hideIndex,
      toggleIndex,
    }),
    [
      user,
      ready,
      startHistory,
      setLatest,
      recordEvent,
      recordProgress,
      dismissHint,
      indexShowing,
      showIndex,
      hideIndex,
      toggleIndex,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used inside <UserProvider>')
  return context
}
