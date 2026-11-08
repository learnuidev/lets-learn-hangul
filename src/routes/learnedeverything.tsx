import { createFileRoute } from '@tanstack/react-router'
import { LearnedEverything } from '@/components/learned-everything'
import { getCourse, getGeometric, getShapes } from '@/lib/course'

export const Route = createFileRoute('/learnedeverything')({
  loader: () => ({
    rounds: getCourse().rounds,
    shapes: getShapes(),
    geometric: getGeometric(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { rounds, shapes, geometric } = Route.useLoaderData()
  return <LearnedEverything rounds={rounds} shapes={shapes} geometric={geometric} />
}
