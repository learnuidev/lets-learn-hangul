import { createContext, useContext, type ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'
import type { Jamo, Level, Round, Word } from '@/data/types'

export interface LevelBundle {
  level: Level | null
  levels: Record<string, Level>
  rounds: Record<string, Round>
  shapes: Record<string, string>
  jamos: Record<string, Jamo>
  words: Record<string, Word>
  geometric: Record<string, string>
}

export interface RouteParams {
  level?: string
  round?: string
  levelIntro?: string
  roundIntro?: string
  letters?: string
  letter?: string
  headword?: string
  roundComplete?: string
  levelComplete?: string
  step?: string
}

const LevelDataContext = createContext<LevelBundle | null>(null)

export function LevelDataProvider({
  value,
  children,
}: {
  value: LevelBundle
  children: ReactNode
}) {
  return <LevelDataContext.Provider value={value}>{children}</LevelDataContext.Provider>
}

export function useLevelData(): LevelBundle {
  const context = useContext(LevelDataContext)
  if (!context) throw new Error('useLevelData must be used inside <LevelDataProvider>')
  return context
}

/** Path params for the level/round branch, as strings (as the URLs have them). */
export function useRouteParams(): RouteParams {
  return useParams({ strict: false }) as RouteParams
}

/** Level data plus the round the current URL points at. */
export function useRoundData(): LevelBundle & { round: Round | null } {
  const data = useLevelData()
  const params = useRouteParams()
  const key = `${params.level}.${params.round}`
  return { ...data, round: data.rounds[key] ?? null }
}
