import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { BigJamo } from '@/components/big-jamo'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import type { Level, Round } from '@/data/types'
import { getJamoHint } from '@/lib/display'
import { isMedial } from '@/lib/hangul'

const defaultText = 'New letters for this round…'

interface RoundLettersProps {
  level: Level
  round: Round
  shapes: Record<string, string>
}

/** Overview of every new letter a round introduces. */
export function RoundLetters({ level, round, shapes }: RoundLettersProps) {
  const navigate = useNavigate()
  const levelParam = String(level.level)
  const roundParam = String(round.round)
  const slide = (round.text.intro ?? []).length - 1

  return (
    <div className="round__letters relative mt-[130px] tablet:mt-[160px] phone:mt-[100px] phone:pb-[80px]">
      <div className="round__letters__text text-center -indent-[220px] phone:indent-0">
        <Markdown source={defaultText} />
      </div>

      <div className="round__letters__container mt-[80px] flex flex-wrap justify-center phone:mt-[30px]">
        {(round.jamo ?? []).map((jamo, i) => (
          <div
            className="round__letters__jamo relative h-[140px] w-[180px] phone:h-[125px] phone:w-[140px] [&>*]:absolute"
            key={jamo}
          >
            <Circle
              r={137}
              className="top-0 left-0 phone:left-[25px] phone:h-[91px] phone:w-[91px]"
              pop={i * 0.1}
            />
            <BigJamo
              shapes={shapes}
              jamo={jamo}
              className="top-[0.5555rem] left-[0.5555rem] h-[2.7777rem] w-[2.7777rem] phone:top-[9px] phone:left-[34px]"
              pop={i * 0.15}
            />
            <Badge
              variant={isMedial(jamo) ? 'blue' : 'default'}
              className="top-[2.7777rem] left-[2.7777rem] h-[1.5rem] w-[1.5rem] text-[0.5rem] leading-[1.5rem] phone:top-[66px] phone:left-[91px]"
            >
              {getJamoHint(jamo)}
            </Badge>
          </div>
        ))}
      </div>

      <BackForwardButtons className="absolute top-[345px] left-1/2 ml-[120px] tablet:top-[475px] tablet:ml-0 tablet:-translate-x-1/2">
        <Button
          variant="link"
          arrow="back"
          className="mr-[20px]"
          onClick={() => {
            if (slide > 0) {
              navigate({
                to: '/level/$level/round/$round/intro/$roundIntro',
                params: { level: levelParam, round: roundParam, roundIntro: String(slide) },
              })
            } else {
              navigate({
                to: '/level/$level/round/$round',
                params: { level: levelParam, round: roundParam },
              })
            }
          }}
        >
          Back
        </Button>

        <Button
          arrow="forward"
          data-autofocus="true"
          onClick={() =>
            navigate({
              to: '/level/$level/round/$round/letter',
              params: { level: levelParam, round: roundParam },
            })
          }
        >
          Continue
        </Button>
      </BackForwardButtons>
    </div>
  )
}
