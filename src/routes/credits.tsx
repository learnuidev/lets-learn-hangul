import { createFileRoute } from '@tanstack/react-router'
import { Credits } from '@/components/credits'
import { getCredits } from '@/lib/course'

export const Route = createFileRoute('/credits')({
  loader: () => ({ credits: getCredits() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { credits } = Route.useLoaderData()
  return <Credits credits={credits} />
}
