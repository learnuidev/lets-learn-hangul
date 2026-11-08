import { useEffect } from 'react'
import { BigJamo } from '@/components/big-jamo'
import { Circle } from '@/components/circle'
import type { Level, Round } from '@/data/types'
import { getJamoHint } from '@/lib/display'
import { isMedial } from '@/lib/hangul'
import { useSession } from '@/providers/session-store'
import { cn } from '@/lib/utils'

interface RoundPreLearnProps {
  level: Level
  round: Round
  shapes: Record<string, string>
}

/**
 * Warm-up quiz: the learner matches each new letter with the sound it makes
 * before typing whole words.
 */
export function RoundPreLearn({ level, round, shapes }: RoundPreLearnProps) {
  const { presession, startPresession, submitPresessionResponse } = useSession()

  useEffect(() => {
    startPresession(level, round)
    // A round's quiz restarts whenever the round changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.level, round.round])

  const { showCorrect, current, options } = presession

  return (
    <div
      className={cn(
        'round__prelearn radial',
        showCorrect && 'show-correct',
      )}
    >
      <div
        key={current ?? 'empty'}
        className="round__prelearn__jamo radial -mt-[20px] -ml-[190px] phone:top-[7rem] phone:mt-0 phone:ml-0"
      >
        <Circle r={245} className="h-[6.8rem] w-[6.8rem]" pop={0} popScale={0.7} />
        <label className=" -translate-x-[140px] -translate-y-[95px] whitespace-nowrap phone:-translate-y-[70px]">
          New Letter
        </label>
        <BigJamo
          shapes={shapes}
          jamo={current ?? ''}
          className="h-[5rem] w-[5rem]"
          pop={0}
          popScale={0.7}
        />
      </div>

      <div className="round__prelearn__options -translate-x-[40px] -translate-y-[115px] phone:relative phone:top-0 phone:left-0 phone:translate-x-0 phone:translate-y-0 phone:px-[1rem] phone:pt-[11rem] phone:pb-[1rem] phone:text-center">
        <p className="wide:-ml-[10px]">What sound does this letter make?</p>
        {options.map((jamo, i) => (
          <button
            type="button"
            key={`${jamo}-${i}`}
            className={cn(
              'round__prelearn__option inline-block mr-[26px] cursor-pointer p-0 outline-none transition-[scale] duration-100',
              'phone:mr-[0.7rem] phone:last:mr-0',
              'hover:scale-105 active:scale-110',
              'h-[1.8333rem] w-[1.8333rem] rounded-[300px] text-center text-[22px] leading-[1.8333rem] font-bold whitespace-nowrap text-white',
              isMedial(jamo) ? 'bg-brand-blue' : 'bg-brand-red',
              showCorrect && 'opacity-10',
              showCorrect && jamo === current && 'scale-110 opacity-100',
            )}
            onClick={() => !showCorrect && submitPresessionResponse(jamo)}
          >
            {getJamoHint(jamo)}
          </button>
        ))}
      </div>
    </div>
  )
}
