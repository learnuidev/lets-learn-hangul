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
import { useNavigate } from '@tanstack/react-router'
import type { Jamo, Level, RomanizationResult, Round, Word } from '@/data/types'
import { flatten, randomInt, sample, uniq } from '@/lib/collections'
import { play, playEffect, preload } from '@/lib/sound'
import { checkRomanization } from '@/lib/validation'
import { useUser } from './user-store'

export interface SessionState {
  active: boolean
  paused: boolean
  complete: boolean
  showCorrect: boolean
  showAnswer: boolean
  level: Level | null
  round: Round | null
  words: string[]
  queue: string[]
  current: string | null
  response: string
  responseError: RomanizationResult | null
  currentMisses: number
  totalMisses: number
  peeks: string[]
  started: number
  completed: number
}

export const emptySession: SessionState = {
  active: false,
  paused: true,
  complete: false,
  showCorrect: false,
  showAnswer: false,
  level: null,
  round: null,
  words: [],
  queue: [],
  current: null,
  response: '',
  responseError: null,
  currentMisses: 0,
  totalMisses: 0,
  peeks: [],
  started: 0,
  completed: 0,
}

export interface PresessionState {
  level: Level | null
  round: Round | null
  queue: string[]
  current: string | null
  options: string[]
  response: string | null
  showCorrect: boolean
  responseError: RomanizationResult | null
  misses: number
  started: number
  completed: number
}

export const emptyPresession: PresessionState = {
  level: null,
  round: null,
  queue: [],
  current: null,
  options: [],
  response: null,
  showCorrect: false,
  responseError: null,
  misses: 0,
  started: 0,
  completed: 0,
}

interface SessionContextValue {
  session: SessionState
  presession: PresessionState
  /** Learning a round's keyword and words by typing romanizations. */
  startSession: (level: Level, round: Round) => void
  updateResponse: (response: string) => void
  submitResponse: () => RomanizationResult
  handlePeek: (jamo: string) => void
  continueSession: () => void
  completeSession: () => void
  /** Warm-up quiz that asks for the sound each new letter makes. */
  startPresession: (level: Level, round: Round) => void
  submitPresessionResponse: (jamo: string) => void
  continuePresession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

interface SessionProviderProps {
  rounds: Record<string, Round>
  jamos: Record<string, Jamo>
  words: Record<string, Word>
  children: ReactNode
}

export function SessionProvider({ rounds, jamos, words, children }: SessionProviderProps) {
  const navigate = useNavigate()
  const { recordEvent, setLatest, dismissHint } = useUser()

  const [session, setSession] = useState<SessionState>(emptySession)
  const [presession, setPresession] = useState<PresessionState>(emptyPresession)

  // Callbacks fire several times per interaction; refs keep them reading the
  // freshest state without turning every action into a state updater.
  const sessionRef = useRef(session)
  sessionRef.current = session
  const presessionRef = useRef(presession)
  presessionRef.current = presession

  const continueTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const soundTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (continueTimer.current) clearTimeout(continueTimer.current)
      if (soundTimer.current) clearTimeout(soundTimer.current)
      if (focusTimer.current) clearTimeout(focusTimer.current)
    }
  }, [])

  const roundLabel = useCallback((level: Level | null, round: Round | null) => {
    return level && round ? `${level.level}.${round.round}` : undefined
  }, [])

  const focusResponseInput = useCallback(() => {
    if (typeof document === 'undefined') return
    focusTimer.current = setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.learn-response-form .fat-input')
      input?.focus()
      input?.select()
    }, 15)
  }, [])

  /* ------------------------------ warm-up quiz ------------------------------ */

  const getOptions = useCallback(
    (jamo: string): string[] => {
      const allJamos = Object.keys(jamos)
      const picked: string[] = Array.from({ length: 4 }, () => sample(allJamos))
      picked[randomInt(3)] = jamo
      let options = uniq(picked)
      while (options.length < 4) options = uniq(options.concat([sample(allJamos)]))
      return options
    },
    [jamos],
  )

  const startPresession = useCallback(
    (level: Level, round: Round) => {
      const current = parseFloat(`${level.level}.${round.round}`)
      const completed = Object.entries(rounds)
        .filter(([key]) => parseFloat(key) <= current)
        .map(([, value]) => value)
      const knownJamos = flatten(completed.map((value) => value.jamo ?? []))

      let queue = (round.jamo ?? []).slice()
      while (queue.length < 4) queue = uniq(queue.concat([sample(knownJamos)]))

      setPresession({
        level,
        round,
        current: queue[0] ?? null,
        queue,
        options: queue[0] ? getOptions(queue[0]) : [],
        response: null,
        showCorrect: false,
        responseError: null,
        misses: 0,
        started: Date.now(),
        completed: 0,
      })
    },
    [getOptions, rounds],
  )

  const continuePresession = useCallback(() => {
    const current = presessionRef.current

    if (current.queue.length === 0) {
      setPresession({ ...current, completed: Date.now() })
      if (current.level && current.round) {
        navigate({
          to: '/level/$level/round/$round/headword',
          params: { level: String(current.level.level), round: String(current.round.round) },
        })
      }
      return
    }

    const next = current.queue[0] ?? null
    setPresession({
      ...current,
      response: null,
      showCorrect: false,
      misses: 0,
      current: next,
      options: next ? getOptions(next) : [],
    })
  }, [getOptions, navigate])

  const submitPresessionResponse = useCallback(
    (response: string) => {
      const current = presessionRef.current
      const jamo = current.current
      if (!jamo) return

      if (jamo === response) {
        playEffect('correct')
        const audioUrl = jamos[jamo]?.audio?.url
        if (audioUrl) {
          soundTimer.current = setTimeout(() => play(audioUrl), 400)
        }
        setPresession({
          ...current,
          responseError: null,
          queue: current.queue.slice(1),
          showCorrect: true,
        })
        if (continueTimer.current) clearTimeout(continueTimer.current)
        continueTimer.current = setTimeout(() => continuePresession(), 1200)
        return
      }

      playEffect('wrong')
      setPresession({
        ...current,
        responseError: { correct: false, reason: 'Not quite—try another sound.' },
        misses: current.misses + 1,
        queue: [jamo].concat(uniq(current.queue.slice(1).concat([jamo]))),
      })
    },
    [continuePresession, jamos],
  )

  /* ------------------------------- learning round ---------------------------- */

  const completeSession = useCallback(() => {
    const current = sessionRef.current
    setSession({ ...current, active: false, complete: true, paused: true, completed: Date.now() })

    if (current.level && current.round) {
      setLatest(current.level.level, current.round.round)
      recordEvent('session-complete', { round: roundLabel(current.level, current.round) })
      navigate({
        to: '/level/$level/round/$round/complete',
        params: { level: String(current.level.level), round: String(current.round.round) },
      })
    }
  }, [navigate, recordEvent, roundLabel, setLatest])

  const startSession = useCallback(
    (level: Level, round: Round) => {
      const wordList = [round.headword, ...(round.words ?? [])].filter(
        (word): word is string => Boolean(word),
      )

      recordEvent('session-start', { round: roundLabel(level, round) })

      setSession({
        ...emptySession,
        active: true,
        paused: false,
        level,
        round,
        words: wordList,
        queue: wordList.slice(),
        current: wordList[0] ?? null,
        started: Date.now(),
      })

      navigate({
        to: '/level/$level/round/$round/learn',
        params: { level: String(level.level), round: String(round.round) },
      })

      preload(
        wordList
          .map((word) => words[word]?.audio?.url)
          .filter((url): url is string => Boolean(url)),
      )
    },
    [navigate, recordEvent, roundLabel, words],
  )

  const continueSession = useCallback(() => {
    const current = sessionRef.current

    if (current.queue.length === 0) {
      completeSession()
      return
    }

    focusResponseInput()
    setSession({
      ...current,
      response: '',
      showCorrect: false,
      showAnswer: false,
      currentMisses: 0,
      responseError: null,
      current: current.queue[0] ?? null,
    })
  }, [completeSession, focusResponseInput])

  const updateResponse = useCallback((response: string) => {
    setSession({ ...sessionRef.current, response, responseError: null })
  }, [])

  const handlePeek = useCallback(
    (jamo: string) => {
      const current = sessionRef.current
      if (!current.current) return
      recordEvent('peek', {
        jamo,
        word: current.current,
        round: roundLabel(current.level, current.round),
      })
      setSession({ ...current, peeks: [...current.peeks, jamo] })
      dismissHint('peeking')
    },
    [dismissHint, recordEvent, roundLabel],
  )

  const submitResponse = useCallback((): RomanizationResult => {
    const current = sessionRef.current
    const word = current.current
    if (!word) return { correct: false }

    const response = current.response
    const phonetic = current.level?.level === 5
    const result = checkRomanization(word, response, phonetic)
    const meta = words[word]
    const round = roundLabel(current.level, current.round)

    if (response.length) dismissHint('romanization')

    if (result.correct) {
      playEffect('correct')
      recordEvent('word-hit', { word, round })
      const audioUrl = meta?.audio?.url
      if (audioUrl) {
        soundTimer.current = setTimeout(() => play(audioUrl), 400)
      }
      setSession({
        ...current,
        queue: current.queue.slice(1),
        showCorrect: true,
        responseError: null,
      })
      return result
    }

    playEffect('wrong')
    recordEvent('word-miss', { word, round })

    const currentMisses = current.currentMisses + 1
    const totalMisses = current.totalMisses + 1

    if (currentMisses < 3) {
      setSession({ ...current, currentMisses, totalMisses, responseError: result })
      return result
    }

    // Third miss: reveal the answer and move the word to third in the queue.
    const queue = current.queue
    setSession({
      ...current,
      totalMisses,
      responseError: null,
      showAnswer: true,
      currentMisses,
      queue: queue.slice(1, 3).concat(queue[0] ? [queue[0]] : [], queue.slice(3)),
    })
    return result
  }, [dismissHint, recordEvent, roundLabel, words])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      presession,
      startSession,
      updateResponse,
      submitResponse,
      handlePeek,
      continueSession,
      completeSession,
      startPresession,
      submitPresessionResponse,
      continuePresession,
    }),
    [
      session,
      presession,
      startSession,
      updateResponse,
      submitResponse,
      handlePeek,
      continueSession,
      completeSession,
      startPresession,
      submitPresessionResponse,
      continuePresession,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
