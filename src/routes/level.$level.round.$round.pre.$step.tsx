import { createFileRoute } from '@tanstack/react-router'
import { RoundPreLearn } from '@/components/round-prelearn'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/pre/$step')({
  component: RouteComponent,
})

function RouteComponent() {
  const { step } = Route.useParams()
  const { level, round, shapes, jamos, rounds } = useRoundData()
  if (!level || !round) return null
  return (
    <RoundPreLearn
      level={level}
      round={round}
      shapes={shapes}
      jamos={jamos}
      rounds={rounds}
      step={step}
    />
  )
}
