import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { BigJamo } from '@/components/big-jamo'
import { Circle } from '@/components/circle'
import { Markdown } from '@/components/markdown'
import { SoundButton } from '@/components/sound-button'
import type { Jamo, Level, Round } from '@/data/types'
import { getJamoHint, getShapeID, isVertical } from '@/lib/display'
import { isMedial } from '@/lib/hangul'
import { play } from '@/lib/sound'
import { cn } from '@/lib/utils'

/** Per-glyph nudges so wide vowels sit centred inside the big circle. */
const glyphNudges: Record<string, { jamo: string; bubble?: string }> = {
  jamo_V_a: { jamo: 'wide:ml-[27px]' },
  jamo_V_eo: { jamo: 'wide:ml-[-30px]' },
  jamo_H_eu: { jamo: 'wide:ml-[-30px]' },
  jamo_V_ae: { jamo: 'wide:ml-[35px]', bubble: 'wide:ml-[70px]' },
  jamo_V_e: { jamo: 'wide:ml-[7px]', bubble: 'wide:ml-[70px]' },
  jamo_V_ye: { jamo: 'wide:ml-[7px]', bubble: 'wide:ml-[70px]' },
  jamo_V_ya: { jamo: 'wide:ml-[30px]' },
  jamo_V_yeo: { jamo: 'wide:ml-[-35px]' },
  jamo_V_yae: { jamo: 'wide:ml-[35px]', bubble: 'wide:ml-[70px]' },
  jamo_W_wa: { jamo: 'wide:ml-[-50px]' },
  jamo_W_wae: { jamo: 'wide:ml-[-30px]', bubble: 'wide:ml-[70px]' },
  jamo_W_weo: { jamo: 'wide:ml-[-90px]' },
  jamo_W_we: { jamo: 'wide:ml-[-35px]', bubble: 'wide:ml-[70px]' },
  jamo_W_wi: { jamo: 'wide:ml-[-90px]' },
  jamo_W_oi: { jamo: 'wide:ml-[-87px]' },
  jamo_W_eui: { jamo: 'wide:ml-[-90px]' },
}

interface RoundLetterProps {
  level: Level
  round: Round
  shapes: Record<string, string>
  jamos: Record<string, Jamo>
  index?: string
}

/** Deep dive on a single new letter, with audio and a memory hook. */
export function RoundLetter({ level, round, shapes, jamos, index }: RoundLetterProps) {
  const navigate = useNavigate()
  const levelParam = String(level.level)
  const roundParam = String(round.round)
  const position = Number(index ?? 0)

  const jamo = round.jamo?.[position] ?? round.jamo?.[0] ?? ''
  const meta = jamos[jamo]
  const audioUrl = meta?.audio?.url

  useEffect(() => {
    play(audioUrl)
  }, [audioUrl])

  if (!meta) return null

  const next = position + 1
  const prev = position - 1
  const hasAnother = next < (round.jamo ?? []).length
  const shapeID = getShapeID(jamo)
  const nudge = glyphNudges[shapeID]

  return (
    <div className="round__letter radial mt-[40px]" data-shape={shapeID}>
      <Circle
        r={464}
        className="round__letter__circle phone:top-[160px] phone:h-[8rem] phone:w-[8rem]"
        pop={0}
        popScale={0.54}
      />

      <label className="-translate-x-[280px] -translate-y-[150px] phone:hidden">New Letter</label>

      <BigJamo
        shapes={shapes}
        jamo={jamo}
        className={cn(
          'h-[9.7222rem] w-[9.7222rem] -translate-x-[340px] -translate-y-1/2',
          'phone:top-[165px] phone:h-[7rem] phone:w-[7rem] phone:-translate-x-1/2 phone:-translate-y-1/2',
          isVertical(jamo) && 'wide:-translate-x-[310px]',
          nudge?.jamo,
        )}
      />

      <SoundButton
        url={audioUrl}
        className="z-1 h-[1.1666rem] w-[1.1666rem] -translate-x-[45px] -translate-y-[119px] phone:top-[195px] phone:left-[295px]"
      />

      {jamo !== '-' && (
        <Badge
          variant={isMedial(jamo) ? 'blue' : 'default'}
          className={cn(
            'h-[2rem] w-[2rem] text-[0.6666rem] leading-[2rem] -translate-x-[95px] -translate-y-[166px]',
            'phone:top-[210px] phone:left-[310px] phone:translate-x-0 phone:translate-y-0',
            nudge?.bubble,
          )}
        >
          {getJamoHint(jamo)}
        </Badge>
      )}

      <div
        className={cn(
          'round__letter__description w-[410px] pl-[0.5rem] -translate-y-1/2',
          'phone:relative phone:top-0 phone:left-0 phone:mt-0 phone:w-auto phone:translate-y-0 phone:pt-[11rem] phone:pr-[1rem] phone:pb-[1rem] phone:pl-[1rem]',
          'tablet:w-auto',
          '[&_p]:mb-[8px] [&_p]:text-[18px] [&_p]:leading-[24px]',
          'phone:[&_p]:text-[15px] phone:[&_p]:leading-[21px]',
          '[&_p:first-child]:text-[inherit] [&_p:first-child]:leading-[inherit] [&_p:first-child]:mb-[12px]',
          '[&_img]:mt-[12px] [&_img]:block',
        )}
      >
        <Markdown source={meta.description} />
      </div>

      <BackForwardButtons className="round__letter__buttons translate-x-[110px] translate-y-[140px]">
        {prev < 0 ? (
          <Button
            variant="link"
            arrow="back"
            className="absolute top-0 -left-[20px] -translate-x-full"
            onClick={() =>
              navigate({
                to: '/level/$level/round/$round/letters',
                params: { level: levelParam, round: roundParam },
              })
            }
          >
            Back
          </Button>
        ) : (
          <Button
            variant="link"
            arrow="back"
            className="absolute top-0 -left-[20px] -translate-x-full"
            onClick={() => {
              if (prev > 0) {
                navigate({
                  to: '/level/$level/round/$round/letter/$letter',
                  params: { level: levelParam, round: roundParam, letter: String(prev) },
                })
              } else {
                navigate({
                  to: '/level/$level/round/$round/letter',
                  params: { level: levelParam, round: roundParam },
                })
              }
            }}
          >
            Back
          </Button>
        )}

        {hasAnother ? (
          <Button
            arrow="forward"
            data-autofocus="true"
            onClick={() =>
              navigate({
                to: '/level/$level/round/$round/letter/$letter',
                params: { level: levelParam, round: roundParam, letter: String(next) },
              })
            }
          >
            Next letter
          </Button>
        ) : (
          <Button
            arrow="forward"
            data-autofocus="true"
            onClick={() =>
              navigate({
                to: '/level/$level/round/$round/pre',
                params: { level: levelParam, round: roundParam },
              })
            }
          >
            Continue
          </Button>
        )}
      </BackForwardButtons>
    </div>
  )
}
