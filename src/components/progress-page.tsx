import type { ReactNode } from 'react'
import { ProgressTabs, type ProgressTabId } from '@/components/progress-tabs'
import { StatsPage } from '@/components/stats-page'
import { UnlocksPage } from '@/components/unlocks-page'
import type { Level, Round } from '@/data/types'

interface ProgressPageProps {
  tab: ProgressTabId
  levels: Record<string, Level>
  rounds: Record<string, Round>
}

/**
 * "Your progress", one page with a tab per section.
 *
 * Both halves of the record belong to the same learner looking at the same
 * letters from two angles — what they have practised and what that practice has
 * unlocked — so they share a page, a tab strip and the corner entry point
 * instead of competing for the bottom-left of every screen.
 *
 * Each tab is a full view with its own `.radial` stage and sections, exactly as
 * it was when it was its own page; the strip is the only thing that is shared.
 */
export function ProgressPage({ tab, levels, rounds }: ProgressPageProps) {
  const views: Record<ProgressTabId, ReactNode> = {
    stats: <StatsPage levels={levels} rounds={rounds} />,
    unlocks: <UnlocksPage levels={levels} rounds={rounds} />,
  }

  return (
    <>
      <ProgressTabs active={tab} />
      {views[tab]}
    </>
  )
}
