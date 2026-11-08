import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Constellation } from '@/components/constellation'
import { CourseIndex } from '@/components/course-index'
import { StatsLink } from '@/components/stats-link'
import type { Level, Round } from '@/data/types'

interface AppShellProps {
  levels: Record<string, Level>
  rounds: Record<string, Round>
  geometric: Record<string, string>
  children: ReactNode
}

/** Chrome shared by every screen: constellation, footer and course index. */
export function AppShell({ levels, rounds, geometric, children }: AppShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const showConstellation = /^\/(?:nowwhat)?$/.test(pathname)
  const page = /nowwhat/.test(pathname) ? 'nowwhat' : 'landing'

  return (
    <div className="app">
      {showConstellation && <Constellation geometric={geometric} page={page} />}

      <div className="app__main mx-auto max-w-[900px]">{children}</div>

      <CourseIndex levels={levels} rounds={rounds} />

      {/* No dead link when the stats page is already open. */}
      {pathname !== '/stats' && <StatsLink />}

      {/*
       * The footer is pinned to the viewport, so it only works on the app's
       * single-screen stages. `/stats` scrolls, and the page carries the same
       * attribution in its own footnote instead.
       */}
      {pathname !== '/stats' && (
        <div className="app__footer fixed bottom-[0.5rem] left-1/2 z-[10000] -translate-x-1/2 text-center text-[14px] leading-[1em] text-shadow-butter opacity-70 tablet-down:hidden">
          Written, designed, and built by{' '}
          <a href="http://noahburney.net" target="_blank" rel="noreferrer">
            Noah Burney
          </a>
          . See{' '}
          <Link to="/credits" className="text-brand-blue">
            audio and photo credits
          </Link>
          .
        </div>
      )}
    </div>
  )
}
