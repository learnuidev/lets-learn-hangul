import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { BigJamo } from '@/components/big-jamo'
import { Circle } from '@/components/circle'
import type { Jamo, Level, Round } from '@/data/types'
import { getJamoHint } from '@/lib/display'
import { isMedial } from '@/lib/hangul'
import { getQuizOptions, getQuizQueue, paramFromStep, stepFromParams } from '@/lib/quiz'
import { play, playEffect } from '@/lib/sound'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'

interface RoundPreLearnProps {
  level: Level
  round: Round
  shapes: Record<string, string>
  jamos: Record<string, Jamo>
  rounds: Record<string, Round>
  step?: string
}

/**
 * Warm-up quiz: match each new letter with the sound it makes.
 *
 * The question order is derived deterministically from the round, so every step
 * is its own URL (`/pre`, `/pre/2`, …) and survives a reload or a deep link.
 */
export function RoundPreLearn({ level, round, shapes, jamos, rounds, step }: RoundPreLearnProps) {
  const navigate = useNavigate()
  const { recordQuizAnswer } = useSession()
  const levelParam = String(level.level)
  const roundParam = String(round.round)
  const roundKey = `${levelParam}.${roundParam}`

  const queue = useMemo(() => getQuizQueue(roundKey, round, rounds), [roundKey, round, rounds])
  const index = Math.min(stepFromParams(step), Math.max(queue.length - 1, 0))
  const current = queue[index] ?? ''
  const options = useMemo(
    () => (current ? getQuizOptions(roundKey, index, current, Object.keys(jamos)) : []),
    [current, index, jamos, roundKey],
  )

  const [answered, setAnswered] = useState<'correct' | 'wrong' | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const soundTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAnswered(null)
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
      if (wrongTimer.current) clearTimeout(wrongTimer.current)
      if (soundTimer.current) clearTimeout(soundTimer.current)
    }
  }, [index])

  const choose = (option: string) => {
    if (!current || answered === 'correct') return

    if (option === current) {
      playEffect('correct')
      recordQuizAnswer(level, round, current, true)
      const audioUrl = jamos[current]?.audio?.url
      if (audioUrl) soundTimer.current = setTimeout(() => play(audioUrl), 400)
      setAnswered('correct')

      advanceTimer.current = setTimeout(() => {
        if (index + 1 < queue.length) {
          navigate({
            to: '/level/$level/round/$round/pre/$step',
            params: { level: levelParam, round: roundParam, step: paramFromStep(index + 1) },
          })
        } else {
          navigate({
            to: '/level/$level/round/$round/headword',
            params: { level: levelParam, round: roundParam },
          })
        }
      }, 900)
      return
    }

    playEffect('wrong')
    recordQuizAnswer(level, round, current, false)
    setAnswered('wrong')
    if (wrongTimer.current) clearTimeout(wrongTimer.current)
    wrongTimer.current = setTimeout(() => setAnswered(null), 550)
  }

  return (
    <div className={cn('round__prelearn radial', answered === 'correct' && 'show-correct')}>
      <div
        key={current}
        className="round__prelearn__jamo radial -mt-[20px] -ml-[190px] phone:top-[7rem] phone:mt-0 phone:ml-0"
      >
        <Circle r={245} className="pop-in-soft h-[6.8rem] w-[6.8rem]" />
        <label className="-translate-x-[140px] -translate-y-[95px] whitespace-nowrap phone:-translate-y-[70px]">
          New Letter
        </label>
        <BigJamo shapes={shapes} jamo={current} className="pop-in-soft h-[5rem] w-[5rem]" />
      </div>

      <div className="round__prelearn__options -translate-x-[40px] -translate-y-[115px] phone:relative phone:top-0 phone:left-0 phone:translate-x-0 phone:translate-y-0 phone:px-[1rem] phone:pt-[11rem] phone:pb-[1rem] phone:text-center">
        <p className="wide:-ml-[10px]">What sound does this letter make?</p>
        {options.map((option) => {
          const isCorrect = option === current
          return (
            <button
              type="button"
              key={option}
              className={cn(
                'round__prelearn__option inline-block mr-[26px] cursor-pointer p-0 outline-none transition-[scale] duration-100',
                'phone:mr-[0.7rem] phone:last:mr-0',
                'hover:scale-105 active:scale-110',
                'h-[1.8333rem] w-[1.8333rem] rounded-[300px] text-center text-[22px] leading-[1.8333rem] font-bold whitespace-nowrap text-white',
                isMedial(option) ? 'bg-brand-blue' : 'bg-brand-red',
                answered === 'correct' && !isCorrect && 'opacity-10',
                answered === 'correct' && isCorrect && 'scale-110',
              )}
              onClick={() => choose(option)}
            >
              {getJamoHint(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
