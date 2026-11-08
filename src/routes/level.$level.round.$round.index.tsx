import { createFileRoute } from '@tanstack/react-router'
import { RoundIntro } from '@/components/round-intro'
import { useRoundData, useRouteParams } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round } = useRoundData()
  const params = useRouteParams()
  if (!level || !round) return null
  return <RoundIntro level={level} round={round} slide={params.roundIntro} />
}
