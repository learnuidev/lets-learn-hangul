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
  const latest = parseFloat(user.latest ?? '') || 1.1

  return (
    <Dialog open={indexShowing} onOpenChange={(open) => !open && hideIndex()} modal={false}>
      <DialogContent showCloseButton={false} aria-describedby={undefined}>
        <DialogTitle className="sr-only">Course index</DialogTitle>

        <button
          className="course-index__close absolute top-[12px] right-[4px] block bg-transparent text-[1.1666rem] leading-none font-light text-ink phone:top-0 phone:right-[8px]"
          onClick={hideIndex}
          aria-label="Close course index"
        >
          ×
        </button>

        <div className="course-index__levels tablet-down:pt-[40px] desktop:flex desktop:pt-[80px] desktop:pr-0 desktop:pb-[10px] desktop:pl-[80px]">
          {Object.values(levels).map((level) => (
            <div
              className={cn(
                'course-index__level tablet-down:pl-[60px] tablet-down:pb-[20px] desktop:flex-1 desktop:px-[15px]',
                Number(level.level) > latest && 'incomplete',
              )}
              key={level.level}
            >
              <Link
                className={cn(
                  'level-name relative block pb-[0.5555rem] text-[0.6666rem] font-black uppercase text-inherit',
                  Number(level.level) > latest && 'pointer-events-none opacity-50',
                )}
                to="/level/$level"
                params={{ level: String(level.level) }}
                onClick={hideIndex}
              >
                <Badge className="absolute -top-[0.8888rem] -left-[1.3rem] scale-75 phone:top-[-13px]">
                  {level.level}
                </Badge>
                <span className="relative z-5 phone:left-[20px]">{level.name}</span>
              </Link>

              <div className="course-index__rounds pl-[0.8888rem] phone:pl-[50px]">
                {level.rounds.map((roundKey) => {
                  const round = rounds[roundKey]
                  if (!round) return null
                  const incomplete = parseFloat(`${level.level}.${round.round}`) > latest
                  return (
                    <div
                      className={cn('course-index__round', incomplete && 'incomplete')}
                      key={roundKey}
                    >
                      <Link
                        className={cn(
                          'round-name relative block min-h-[1.7222rem] text-[0.5555rem] leading-[1.2] font-semibold uppercase text-inherit',
                          incomplete && 'pointer-events-none opacity-50',
                        )}
                        to="/level/$level/round/$round"
                        params={{ level: String(level.level), round: String(round.round) }}
                        onClick={hideIndex}
                      >
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
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
