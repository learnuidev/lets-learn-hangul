import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import type { Level, Round } from '@/data/types'

interface RoundIntroProps {
  level: Level
  round: Round
  slide?: string
}

/** Introductory slides shown before a round's letters. */
export function RoundIntro({ level, round, slide }: RoundIntroProps) {
  const navigate = useNavigate()
  const levelParam = String(level.level)
  const roundParam = String(round.round)

  const slides = round.text.intro ?? []
  const index = Number(slide ?? 0)
  const text = slides[index] ?? slides[0] ?? ''
  const next = index + 1
  const prev = index - 1
  const hasMoreText = next < slides.length
  const hasLetters = Boolean(round.jamo && round.jamo.length)
  const hasHeadword = Boolean(round.headword)

  const goNext = () => {
    if (hasMoreText) {
      navigate({
        to: '/level/$level/round/$round/intro/$roundIntro',
        params: { level: levelParam, round: roundParam, roundIntro: String(next) },
      })
    } else if (hasLetters) {
      navigate({
        to: '/level/$level/round/$round/letters',
        params: { level: levelParam, round: roundParam },
      })
    } else if (hasHeadword) {
      navigate({
        to: '/level/$level/round/$round/headword',
        params: { level: levelParam, round: roundParam },
      })
    } else {
      navigate({
        to: '/level/$level/round/$round/ready',
        params: { level: levelParam, round: roundParam },
      })
    }
  }

  const goBack = () => {
    if (prev > 0) {
      navigate({
        to: '/level/$level/round/$round/intro/$roundIntro',
        params: { level: levelParam, round: roundParam, roundIntro: String(prev) },
      })
    } else {
      navigate({
        to: '/level/$level/round/$round',
        params: { level: levelParam, round: roundParam },
      })
    }
  }

  return (
    <div className="round__intro radial mt-[1rem] phone:[&>*]:top-[265px]">
      <Circle
        r={128}
        className="round__intro__circle h-[460px] w-[460px] phone:left-[20%] phone:h-[400px] phone:w-[400px]"
        pop={0}
        popScale={0.55}
      />

      <div className="round__intro__round -translate-x-[193px] -translate-y-[200px] phone:translate-x-1/2 phone:-translate-y-[168px]">
        <Badge variant="blue">{round.round}</Badge>
      </div>
      <label className="round__intro__round-label -translate-x-[235px] -translate-y-[184px] phone:-translate-x-[5px] phone:-translate-y-[157px]">
        Round
      </label>

      <div className="round__intro__inner w-[500px] -translate-x-[104px] -translate-y-[57%] tablet:w-[470px] tablet:-translate-x-[172px] phone:w-[88%] phone:-translate-x-[43.75%] [&_h1]:w-[20px] [&_h1]:font-semibold [&_h1]:uppercase">
        <Markdown source={text} />
      </div>

      <BackForwardButtons className="round__intro__buttons translate-x-[110px] translate-y-[140px]">
        {prev >= 0 && (
          <Button
            variant="link"
            arrow="back"
            className="absolute top-0 -left-[20px] -translate-x-full"
            onClick={goBack}
          >
            Back
          </Button>
        )}
        <Button arrow="forward" data-autofocus="true" onClick={goNext}>
          Continue
        </Button>
      </BackForwardButtons>
    </div>
  )
}
