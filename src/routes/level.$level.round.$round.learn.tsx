import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RoundLearn } from '@/components/round-learn'
import { useRoundData } from '@/providers/course-context'
import { useSession } from '@/providers/session-store'

export const Route = createFileRoute('/level/$level/round/$round/learn')({
  component: RouteComponent,
})

function RouteComponent() {
  const { level, round, shapes, words } = useRoundData()
  const { session } = useSession()
  const navigate = useNavigate()

  // The exercise only makes sense inside a running session. This mirrors the
  // original onEnterRoundLearn hook: it is decided once, when the route is
  // entered — not on every session change (finishing a round clears `active`).
  const missingSession = useRef<boolean | null>(null)
  if (missingSession.current === null) {
    missingSession.current = Boolean(level && round && !session.active)
  }

  useEffect(() => {
    if (missingSession.current && level && round) {
      navigate({
        to: '/level/$level/round/$round',
        params: { level: String(level.level), round: String(round.round) },
        replace: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!level || !round) return null
  if (missingSession.current) return null
  return <RoundLearn level={level} round={round} shapes={shapes} words={words} />
}
