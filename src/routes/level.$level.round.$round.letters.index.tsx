import { createFileRoute } from '@tanstack/react-router'
import { RoundLetters } from '@/components/round-letters'
import { useRoundData } from '@/providers/course-context'

export const Route = createFileRoute('/level/$level/round/$round/letters/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes } = useRoundData()
  if (!level || !round) return null
  return <RoundLetters level={level} round={round} shapes={shapes} />
}
