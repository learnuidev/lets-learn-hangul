import { createFileRoute } from '@tanstack/react-router'
import { RoundPreLearn } from '@/components/round-prelearn'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/pre')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes } = useRoundData()
  if (!level || !round) return null
  return <RoundPreLearn level={level} round={round} shapes={shapes} />
}
