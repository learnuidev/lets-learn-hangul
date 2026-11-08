import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import type { Level } from '@/data/types'

interface LevelIntroProps {
  level: Level
  levelParam: string
  slide?: string
}

/** The slide deck that introduces a level before its first round. */
export function LevelIntro({ level, levelParam, slide }: LevelIntroProps) {
  const navigate = useNavigate()
  const slides = level.text.intro ?? []
  const index = Number(slide ?? 0)
  const text = slides[index] ?? slides[0] ?? ''
  const next = index + 1
  const prev = index - 1
  const hasMoreText = next < slides.length

  return (
    <div className="level__intro radial mt-[1rem] phone:[&>*]:top-[265px]">
      <Circle
        className="level__intro__circle h-[460px] w-[460px] phone:left-[20%] phone:h-[400px] phone:w-[400px]"
        pop={0}
        popScale={0.55}
      />

      <div className="level__intro__level -translate-x-[193px] -translate-y-[200px] phone:translate-x-1/2 phone:-translate-y-[168px]">
        <Badge>{level.level}</Badge>
      </div>
      <label className="level__intro__level-label -translate-x-[230px] -translate-y-[184px] phone:translate-x-0 phone:-translate-y-[157px]">
        Level
      </label>

      <div className="level__intro__inner w-[500px] -translate-x-[104px] -translate-y-[57%] tablet:w-[470px] tablet:-translate-x-[172px] phone:w-[88%] phone:-translate-x-[43.75%] [&_h1]:w-[20px] [&_h1]:font-semibold [&_h1]:uppercase">
        <Markdown source={text} />
      </div>

      <BackForwardButtons className="level__intro__buttons translate-x-[110px] translate-y-[140px]">
        {prev >= 0 && (
          <Button
            variant="link"
            arrow="back"
            className="absolute top-0 -left-[20px] -translate-x-full"
            onClick={() => {
              if (prev > 0) {
                navigate({
                  to: '/level/$level/intro/$levelIntro',
                  params: { level: levelParam, levelIntro: String(prev) },
                })
              } else {
                navigate({ to: '/level/$level', params: { level: levelParam } })
              }
            }}
          >
            Back
          </Button>
        )}

        <Button
          arrow="forward"
          data-autofocus="true"
          onClick={() => {
            if (hasMoreText) {
              navigate({
                to: '/level/$level/intro/$levelIntro',
                params: { level: levelParam, levelIntro: String(next) },
              })
            } else {
              navigate({
                to: '/level/$level/round/$round',
                params: { level: levelParam, round: '1' },
              })
            }
          }}
        >
          {hasMoreText ? 'Continue' : 'Start round one'}
        </Button>
      </BackForwardButtons>
    </div>
  )
}
