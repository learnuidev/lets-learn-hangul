import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { BigSyllable } from '@/components/big-syllable'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import type { Level, Round } from '@/data/types'
import { getRomanizations } from '@/lib/romanize'
import { cn } from '@/lib/utils'

interface RoundHeadwordProps {
  level: Level
  round: Round
  shapes: Record<string, string>
  slide?: string
}

/** Introduces the round's keyword and explains how its syllables are built. */
export function RoundHeadword({ level, round, shapes, slide }: RoundHeadwordProps) {
  const navigate = useNavigate()
  const levelParam = String(level.level)
  const roundParam = String(round.round)
  const headword = round.headword ?? ''

  const syllables = headword.split('')
  const slides = round.text.word ?? []
  const index = Number(slide ?? 0)
  const text = slides[index] ?? slides[0] ?? ''
  const next = index + 1
  const prev = index - 1
  const lastLetter = (round.jamo ?? []).length - 1
  const hasMoreText = next < slides.length
  const introSlides = (round.text.intro ?? []).length

  const phonetics = getRomanizations(headword, true)

  return (
    <div
      className={cn(
        'round__headword relative z-5 mt-[40px] ml-[60px]',
        'wide:h-[600px] phone:ml-0 phone:min-h-[480px]',
      )}
    >
      <div className="round__headword__word absolute top-[100px] left-1/2 z-5 -ml-[337px] translate-x-[20px] transition-[translate] duration-300 tablet:top-[150px] phone:top-[1.5rem] phone:left-[175px] phone:ml-0">
        <Circle
          className="absolute -top-[16px] -left-[24px] -z-10 h-[6.6666rem] w-[6.6666rem] phone:-top-[10px] phone:h-[5rem] phone:w-[5rem]"
          pop={0}
          popScale={0.5}
        />
        <label className="ml-[-36px]">Round Keyword</label>

        <div
          className={cn(
            'round__headword__syllables after:table after:clear-both',
            syllables.length === 1 && 'pl-[40px]',
          )}
        >
          {syllables.map((syllable, i) => (
            <div className="round__headword__syllable float-left -ml-[5px]" key={`${syllable}-${i}`}>
              <BigSyllable
                syllable={syllable}
                shapes={shapes}
                className="h-[3rem] w-[3rem] phone:h-[2rem] phone:w-[2rem]"
              />
              <p className="round__headword__syllable__phonetics mt-[-12px] text-center text-[21px] italic phone:text-[16px]">
                {phonetics.syllables[i]?.ideal}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="round__headword__content absolute top-[120px] left-1/2 h-[340px] w-[340px] tablet:top-[290px] tablet:left-[36%] phone:top-[90px] phone:left-0 phone:h-auto phone:w-auto">
        <Circle
          className="absolute top-0 left-0 -z-10 h-[340px] w-[340px] phone:top-1/2 phone:h-[390px] phone:w-[390px] phone:-translate-x-1/2 phone:-translate-y-1/2"
          pop={0.1}
          popScale={0.5}
        />

        <div className="round__headword__content__inner absolute top-1/2 left-[42px] w-[360px] -translate-y-1/2 phone:left-[1rem] phone:w-[9rem]">
          <Markdown source={text} />
        </div>

        <BackForwardButtons className="round__headword__content__buttons absolute bottom-[42px] left-1/2">
          <Button
            variant="link"
            arrow="back"
            className="absolute top-0 -left-[20px] -translate-x-full"
            onClick={() => {
              if (prev > 0) {
                navigate({
                  to: '/level/$level/round/$round/headword/$headword',
                  params: { level: levelParam, round: roundParam, headword: String(prev) },
                })
              } else if (prev === 0) {
                navigate({
                  to: '/level/$level/round/$round/headword',
                  params: { level: levelParam, round: roundParam },
                })
              } else if (round.jamo) {
                if (lastLetter > 0) {
                  navigate({
                    to: '/level/$level/round/$round/letter/$letter',
                    params: { level: levelParam, round: roundParam, letter: String(lastLetter) },
                  })
                } else {
                  navigate({
                    to: '/level/$level/round/$round/letter',
                    params: { level: levelParam, round: roundParam },
                  })
                }
              } else if (introSlides > 0) {
                navigate({
                  to: '/level/$level/round/$round/intro/$roundIntro',
                  params: {
                    level: levelParam,
                    round: roundParam,
                    roundIntro: String(introSlides - 1),
                  },
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
            onClick={() => {
              if (hasMoreText) {
                navigate({
                  to: '/level/$level/round/$round/headword/$headword',
                  params: {
                    level: levelParam,
                    round: roundParam,
                    headword: String(next),
                  },
                })
              } else {
                navigate({
                  to: '/level/$level/round/$round/ready',
                  params: { level: levelParam, round: roundParam },
                })
              }
            }}
          >
            Continue
          </Button>
        </BackForwardButtons>
      </div>
    </div>
  )
}
