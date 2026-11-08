import { Link } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/providers/user-store'
import type { Level, Round } from '@/data/types'
import { cn } from '@/lib/utils'

interface CourseIndexProps {
  levels: Record<string, Level>
  rounds: Record<string, Round>
}

/** Full-screen table of contents, opened from the level/round indicator. */
export function CourseIndex({ levels, rounds }: CourseIndexProps) {
  const { indexShowing, hideIndex, user } = useUser()

  // Progress is compared as an integer index (level * 100 + round) so that
  // "1.10" and float rounding can never make two lessons look equivalent.
  const [latestLevel, latestRound] = (user.latest ?? '1.1')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 1)
  const latestIndex = latestLevel * 100 + latestRound

  const roundCount = (level: number) =>
    Object.keys(rounds).filter((key) => key.startsWith(`${level}.`)).length

  /** A level opens once the level before it is finished. */
  const isLevelLocked = (level: number) =>
    level > 1 && (level - 1) * 100 + roundCount(level - 1) > latestIndex

  /** Within a level you may open the round you are on and the next one. */
  const isRoundLocked = (level: number, round: number) => {
    if (isLevelLocked(level)) return true
    // A level that just opened starts at its first round.
    if (level > latestLevel) return round > 1
    return level * 100 + round > latestIndex + 1
  }

  return (
    <Dialog open={indexShowing} onOpenChange={(open) => !open && hideIndex()} modal={false}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        // Nothing should grab focus (and paint a focus ring) when the index
        // opens — the original overlay was inert until you clicked a link.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Course index</DialogTitle>

        <button
          className={cn(
            'course-index__close absolute top-[34px] right-[24px] block rounded-[3px] bg-transparent',
            'text-[1.1666rem] leading-none font-light text-ink opacity-80 outline-none',
            'transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-blue/40',
            'phone:top-0 phone:right-[8px]',
          )}
          onClick={hideIndex}
          aria-label="Close course index"
        >
          ×
        </button>

        <div className="course-index__levels tablet-down:pt-[40px] desktop:flex desktop:pt-[80px] desktop:pr-0 desktop:pb-[10px] desktop:pl-[80px]">
          {Object.values(levels).map((level) => {
            const levelLocked = isLevelLocked(Number(level.level))
            return (
            <div
              className={cn(
                'course-index__level tablet-down:pl-[60px] tablet-down:pb-[20px] desktop:flex-1 desktop:px-[15px]',
                levelLocked && 'incomplete',
              )}
              key={level.level}
            >
              <LevelName
                level={level}
                locked={levelLocked}
                onNavigate={hideIndex}
              />

              <div className="course-index__rounds pl-[0.8888rem] phone:pl-[50px]">
                {level.rounds.map((roundKey) => {
                  const round = rounds[roundKey]
                  if (!round) return null
                  return (
                    <div
                      className={cn(
                        'course-index__round',
                        isRoundLocked(Number(level.level), round.round) && 'incomplete',
                      )}
                      key={roundKey}
                    >
                      <RoundName
                        level={level}
                        round={round}
                        locked={isRoundLocked(Number(level.level), round.round)}
                        onNavigate={hideIndex}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A level row. Locked levels render as plain, non-focusable markup: a dimmed
 * link was still reachable by keyboard (and by any script), which made the
 * "not unlocked yet" styling a lie.
 */
function LevelName({
  level,
  locked,
  onNavigate,
}: {
  level: Level
  locked: boolean
  onNavigate: () => void
}) {
  const content = (
    <>
      <Badge className="absolute -top-[0.8888rem] -left-[1.3rem] scale-75 phone:top-[-13px]">
        {level.level}
      </Badge>
      <span className="relative z-5 phone:left-[20px]">{level.name}</span>
    </>
  )

  const className = cn(
    'level-name relative block pb-[0.5555rem] text-[0.6666rem] font-black uppercase text-inherit',
    locked && 'opacity-50',
  )

  return (
    <Link
      className={className}
      to="/level/$level"
      params={{ level: String(level.level) }}
      onClick={onNavigate}
    >
      {content}
    </Link>
  )
}

/** A round row; same locking rules as the level row. */
function RoundName({
  level,
  round,
  locked,
  onNavigate,
}: {
  level: Level
  round: Round
  locked: boolean
  onNavigate: () => void
}) {
  const content = (
    <>
      <Badge
        variant="blue"
        className="absolute top-[-30px] left-[-55px] scale-[0.45] phone:top-[-16px] phone:left-[-43px]"
      >
        {round.round}
      </Badge>
      <span className="name">{round.name}</span>
      <span className="jamos block font-normal normal-case opacity-50">
        {(round.jamo ?? []).map((jamo) => (jamo === '-' ? 'ㅇ' : jamo)).join(' ')}
      </span>
    </>
  )

  const className = cn(
    'round-name relative block min-h-[1.7222rem] text-[0.5555rem] leading-[1.2] font-semibold uppercase text-inherit',
    locked && 'opacity-50',
  )

  return (
    <Link
      className={className}
      to="/level/$level/round/$round"
      params={{ level: String(level.level), round: String(round.round) }}
      onClick={onNavigate}
    >
      {content}
    </Link>
  )
}
