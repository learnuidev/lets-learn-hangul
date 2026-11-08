import { createFileRoute } from '@tanstack/react-router'
import { RoundLetter } from '@/components/round-letter'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/letter/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes, jamos } = useRoundData()
  if (!level || !round) return null
  return <RoundLetter level={level} round={round} shapes={shapes} jamos={jamos} />
}
