import { createFileRoute } from '@tanstack/react-router'
import { StatsPage } from '@/components/stats-page'
import { getCourse } from '@/lib/course'

export const Route = createFileRoute('/stats')({
  loader: () => {
    const { levels, rounds } = getCourse()
    return { levels, rounds }
  },
  head: () => ({
    meta: [{ title: 'Your stats | Let’s Learn Hangul!' }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { levels, rounds } = Route.useLoaderData()
  return <StatsPage levels={levels} rounds={rounds} />
}
