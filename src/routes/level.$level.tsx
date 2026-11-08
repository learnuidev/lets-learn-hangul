import { Outlet, createFileRoute, useParams, useRouterState } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { YouAreHere } from '@/components/you-are-here'
import { getLevelBundle } from '@/lib/course'
import { LevelDataProvider } from '@/providers/course-context'
import { SessionProvider } from '@/providers/session-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/level/$level')({
  beforeLoad: ({ params }) => getLevelBundle(params.level),
  component: LevelLayout,
})

function LevelLayout() {
  const bundle = Route.useRouteContext()
  const params = useParams({ strict: false })
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (!bundle.level) return null

  const learning = /\/learn/.test(pathname)
  const roundComplete = /\/round\/\d+\/complete/.test(pathname)

  return (
    <div className="level-container">
      <div
        className={cn(
          'level',
          learning && 'level--learning',
          roundComplete && 'level--round-complete',
        )}
      >
        <Logo
          className={cn(
            (learning || roundComplete) && 'phone:hidden',
          )}
        />
        <YouAreHere level={params.level} round={params.round} />

        <LevelDataProvider value={bundle}>
          <SessionProvider rounds={bundle.rounds} jamos={bundle.jamos} words={bundle.words}>
            <Outlet />
          </SessionProvider>
        </LevelDataProvider>
      </div>
    </div>
  )
}
