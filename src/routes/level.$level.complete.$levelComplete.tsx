import { createFileRoute } from '@tanstack/react-router'
import { LevelComplete } from '@/components/level-complete'
import { useLevelData, useRouteParams } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/complete/$levelComplete')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, levels } = useLevelData()
  const params = useRouteParams()
  if (!level) return null
  return <LevelComplete level={level} levels={levels} levelParam={params.level ?? String(level.level)} />
}
