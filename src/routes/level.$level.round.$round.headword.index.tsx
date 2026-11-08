import { createFileRoute } from '@tanstack/react-router'
import { RoundHeadword } from '@/components/round-headword'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/headword/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes } = useRoundData()
  if (!level || !round) return null
  return <RoundHeadword level={level} round={round} shapes={shapes} />
}
