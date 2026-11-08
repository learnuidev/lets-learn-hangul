import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import type { Level } from '@/data/types'
import { useUser } from '@/providers/user-store'

interface ReturnVisitProps {
  levels: Record<string, Level>
}

/** "Welcome back!" prompt shown when a saved progress file exists. */
export function ReturnVisit({ levels }: ReturnVisitProps) {
  const navigate = useNavigate()
  const { user } = useUser()
  const latest = user.latest ?? ''

  // Continue at the round after the last completed one.
  let nextLevel = 1
  let nextRound = 1
  if (latest) {
    const [levelPart, roundPart] = latest.split('.').map((n) => parseInt(n, 10))
    nextLevel = levelPart
    nextRound = roundPart + 1
    const level = levels[String(nextLevel)]
    if (level && nextRound >= level.rounds.length) {
      nextLevel += 1
      nextRound = 1
    }
  }
  const hasNext = Boolean(levels[String(nextLevel)])

  return (
    <div className="return-visit relative h-full min-h-[600px] phone:min-h-[17rem]">
      <div className="return-visit__inner absolute top-1/2 left-1/2 w-[16rem] -translate-x-1/2 -translate-y-[70%] phone:w-full phone:px-[1rem]">
        <h4 className="mb-[0.25rem]">Welcome back!</h4>
        <p>Do you want to pick back up where you left off last time?</p>

        <div className="return-visit__actions relative">
          <Button
            arrow="forward"
            data-autofocus="true"
            className="absolute top-0 left-[65%] block whitespace-nowrap phone:relative phone:left-0 phone:mb-[0.5rem] phone:inline-block"
            onClick={() => {
              if (hasNext) {
                navigate({
                  to: '/level/$level/round/$round',
                  params: { level: String(nextLevel), round: String(nextRound) },
                })
              } else {
                navigate({ to: '/learnedeverything' })
              }
            }}
          >
            Yes, keep going!
          </Button>

          <Button
            variant="link"
            className="-ml-[12px]"
            onClick={() => navigate({ to: '/level/$level', params: { level: '1' } })}
          >
            No, start over from the beginning
          </Button>
        </div>
      </div>
    </div>
  )
}
