import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import type { Level, Round } from '@/data/types'
import { useSession } from '@/hooks/use-session'
import { useNavigate } from '@tanstack/react-router'

interface RoundReadyProps {
  level: Level
  round: Round
}

/** Last stop before the typing exercise starts. */
export function RoundReady({ level, round }: RoundReadyProps) {
  const navigate = useNavigate()
  const { startSession } = useSession()
  const levelParam = String(level.level)
  const roundParam = String(round.round)
  const lastWordSlide = (round.text.word ?? []).length - 1
  const startText = round.text.start?.[0]

  return (
    <div className="round__ready radial mt-[1rem] phone:[&>*]:top-[265px]">
      <Circle
        r={128}
        className="round__ready__circle h-[460px] w-[460px] phone:left-[20%] phone:h-[400px] phone:w-[400px]"
        pop={0}
        popScale={0.55}
      />

      <div className="round__ready__round -translate-x-[193px] -translate-y-[200px] phone:translate-x-1/2 phone:-translate-y-[168px]">
        <Badge variant="blue">{round.round}</Badge>
      </div>
      <label className="round__ready__round-label -translate-x-[235px] -translate-y-[184px] phone:-translate-x-[5px] phone:-translate-y-[157px]">
        Round
      </label>

      <div className="round__ready__inner w-[500px] -translate-x-[104px] -translate-y-[57%] tablet:w-auto tablet:-translate-x-[172px] phone:w-[90%] phone:-translate-x-[140px] [&_h1]:w-[20px] [&_h1]:font-semibold [&_h1]:uppercase [&_h3]:mb-0">
        <h3>Ready?</h3>
        {startText ? <Markdown source={startText} /> : <p>Ready to learn this round's words?</p>}
      </div>

      <BackForwardButtons className="round__ready__buttons translate-x-[110px] translate-y-[140px]">
        <Button
          variant="link"
          arrow="back"
          className="absolute top-0 -left-[20px] -translate-x-full"
          onClick={() => {
            if (lastWordSlide > 0) {
              navigate({
                to: '/level/$level/round/$round/headword/$headword',
                params: {
                  level: levelParam,
                  round: roundParam,
                  headword: String(lastWordSlide),
                },
              })
            } else {
              navigate({
                to: '/level/$level/round/$round/headword',
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
          onClick={() => startSession(level, round)}
        >
          Start!
        </Button>
      </BackForwardButtons>
    </div>
  )
}
