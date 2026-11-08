import { createFileRoute } from '@tanstack/react-router'
import { LevelIntro } from '@/components/level-intro'
import { useLevelData, useRouteParams } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/intro/$levelIntro')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level } = useLevelData()
  const params = useRouteParams()
  if (!level) return null
  return <LevelIntro level={level} levelParam={String(level.level)} slide={params.levelIntro} />
}
