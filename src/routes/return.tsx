import { createFileRoute } from '@tanstack/react-router'
import { ReturnVisit } from '@/components/return-visit'
import { getCourse } from '@/lib/course'

export const Route = createFileRoute('/return')({
  loader: () => ({ levels: getCourse().levels }),
  component: RouteComponent,
})

function RouteComponent() {
  const { levels } = Route.useLoaderData()
  return <ReturnVisit levels={levels} />
}
