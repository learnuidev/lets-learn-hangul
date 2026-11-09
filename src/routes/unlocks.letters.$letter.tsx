import { createFileRoute } from '@tanstack/react-router'
import { UnlocksLetterPage } from '@/components/unlocks-letter-page'
import { getCourse } from '@/lib/course'

/** The params arrive percent-encoded (`%E3%84%B1`), so decode before matching. */
function decodeLetter(letter: string): string {
  try {
    return decodeURIComponent(letter)
  } catch {
    return letter
  }
}

export const Route = createFileRoute('/unlocks/letters/$letter')({
  loader: () => {
    const { levels, rounds } = getCourse()
    return { levels, rounds }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${decodeLetter(params.letter)} — unlocks | Let’s Learn Hangul!` },
      {
        name: 'description',
        content: `Every syllable block and Korean word spelled with the letter ${decodeLetter(params.letter)}, and which of them the letters you know already let you read.`,
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { levels, rounds } = Route.useLoaderData()
  const { letter } = Route.useParams()
  return <UnlocksLetterPage letter={decodeLetter(letter)} levels={levels} rounds={rounds} />
}
