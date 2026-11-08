import { createFileRoute } from '@tanstack/react-router'
import { LearnedEmAll } from '@/components/learned-em-all'
import { getGeometric } from '@/lib/course'

export const Route = createFileRoute('/learnedemall')({
  loader: () => ({ geometric: getGeometric() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { geometric } = Route.useLoaderData()
  return <LearnedEmAll geometric={geometric} />
}
