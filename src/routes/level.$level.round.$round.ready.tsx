import { createFileRoute } from '@tanstack/react-router'
import { RoundReady } from '@/components/round-ready'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/ready')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round } = useRoundData()
  if (!level || !round) return null
  return <RoundReady level={level} round={round} />
}
