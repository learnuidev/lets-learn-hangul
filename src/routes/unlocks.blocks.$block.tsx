import { createFileRoute } from '@tanstack/react-router'
import { UnlocksBlockPage } from '@/components/unlocks-block-page'
import { getCourse } from '@/lib/course'

/** The params arrive percent-encoded (`%EB%B2%84`), so decode before matching. */
function decodeBlock(block: string): string {
  try {
    return decodeURIComponent(block)
  } catch {
    return block
  }
}

export const Route = createFileRoute('/unlocks/blocks/$block')({
  loader: () => {
    const { levels, rounds } = getCourse()
    return { levels, rounds }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${decodeBlock(params.block)} — unlocks | Let’s Learn Hangul!` },
      {
        name: 'description',
        content: `The Korean words spelled with the syllable block ${decodeBlock(params.block)}, and which of them the letters you know already let you read.`,
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { levels, rounds } = Route.useLoaderData()
  const { block } = Route.useParams()
  return <UnlocksBlockPage block={decodeBlock(block)} levels={levels} rounds={rounds} />
}
