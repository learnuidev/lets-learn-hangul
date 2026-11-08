import { Outlet, createFileRoute, useParams, useRouterState } from '@tanstack/react-router'
import { Logo } from '@/components/logo'
import { YouAreHere } from '@/components/you-are-here'
import { getLevelBundle } from '@/lib/course'
import { LevelDataProvider } from '@/providers/course-context'
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
        <YouAreHere
          level={params.level}
          round={params.round}
          className={cn(roundComplete && 'phone:hidden')}
        />

        <LevelDataProvider value={bundle}>
          <Outlet />
        </LevelDataProvider>
      </div>
    </div>
  )
}
