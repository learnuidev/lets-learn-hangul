import { createFileRoute } from '@tanstack/react-router'
import { RoundLearn } from '@/components/round-learn'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/learn/$step')({
  component: RouteComponent,
})

function RouteComponent() {
  const { step } = Route.useParams()
  const { level, round, shapes, words } = useRoundData()
  if (!level || !round) return null
  return (
    <RoundLearn level={level} round={round} shapes={shapes} words={words} step={step} />
  )
}
