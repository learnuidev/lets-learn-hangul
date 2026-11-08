import { createFileRoute } from '@tanstack/react-router'
import { RoundComplete } from '@/components/round-complete'
import { useRoundData, useRouteParams } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/complete/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, rounds, shapes, jamos, geometric } = useRoundData()
  const params = useRouteParams()
  if (!level || !round) return null
  return (
    <RoundComplete
      level={level}
      round={round}
      rounds={rounds}
      shapes={shapes}
      jamos={jamos}
      geometric={geometric}
      step={params.roundComplete}
    />
  )
}
