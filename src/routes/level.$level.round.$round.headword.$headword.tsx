import { createFileRoute } from '@tanstack/react-router'
import { RoundHeadword } from '@/components/round-headword'
import { useRoundData, useRouteParams } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/headword/$headword')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes } = useRoundData()
  const params = useRouteParams()
  if (!level || !round) return null
  return <RoundHeadword level={level} round={round} shapes={shapes} slide={params.headword} />
}
