import { createFileRoute } from '@tanstack/react-router'
import { UnlocksPage } from '@/components/unlocks-page'
import { getCourse } from '@/lib/course'

export const Route = createFileRoute('/unlocks/')({
  loader: () => {
    const { levels, rounds } = getCourse()
    return { levels, rounds }
  },
  head: () => ({
    meta: [
      { title: 'Your unlocks | Let’s Learn Hangul!' },
      {
        name: 'description',
        content:
          'Every syllable block and Korean word the Hangul letters you have learned already let you read.',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { levels, rounds } = Route.useLoaderData()
  return <UnlocksPage levels={levels} rounds={rounds} />
}
