import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { BigWord } from '@/components/big-word'
import { Circle } from '@/components/circle'
import { GeometricJamo } from '@/components/geometric-jamo'
import { MissionComplete } from '@/components/mission-complete'
import type { Round } from '@/data/types'
import { cubicBezier } from '@/lib/easing'

const ease = cubicBezier(0.4, 0, 0.4, 1)

type Stage = 'intro' | 'letters' | 'words'

interface LearnedEverythingProps {
  rounds: Record<string, Round>
  shapes: Record<string, string>
  geometric: Record<string, string>
}

/**
 * Finale: counts up every letter and every word the learner has read. The
 * original drove this with a requestAnimationFrame loop over an eased clock.
 */
export function LearnedEverything({ rounds, shapes, geometric }: LearnedEverythingProps) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('intro')
  const [letterIndex, setLetterIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [continueShowing, setContinueShowing] = useState(false)

  const animating = useRef(false)
  const startedAt = useRef(0)
  const duration = useRef(3000)
  const frame = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const jamos = Object.values(rounds).flatMap((round) => round.jamo ?? [])
  const words = Object.values(rounds).flatMap((round) => [
    round.headword ?? '',
    ...(round.words ?? []),
  ])
  const wordList = words.filter(Boolean)

  const stopAnimating = () => {
    animating.current = false
  }

  const startAnimating = (ms: number) => {
    duration.current = ms
    startedAt.current = Date.now()
    animating.current = true
  }

  useEffect(() => {
    if (stage === 'intro') return

    const tick = () => {
      if (!animating.current) return
      const progress = Math.min(Math.max(0, (Date.now() - startedAt.current) / duration.current), 1)
      const eased = ease(progress)

      if (stage === 'letters') {
        const index = Math.round(eased * (jamos.length - 1))
        setLetterIndex(index)
        if (index === jamos.length - 1) {
          stopAnimating()
          timer.current = setTimeout(startWords, 1800)
          return
        }
      }

      if (stage === 'words') {
        const index = Math.round(eased * (wordList.length - 1))
        setWordIndex(index)
        if (index === wordList.length - 1) {
          stopAnimating()
          timer.current = setTimeout(() => setContinueShowing(true), 1800)
          return
        }
      }

      frame.current = requestAnimationFrame(tick)
    }

    startAnimating(stage === 'letters' ? 3000 : 4000)
    frame.current = requestAnimationFrame(tick)

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      if (timer.current) clearTimeout(timer.current)
      animating.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const startLetters = () => {
    setLetterIndex(0)
    setStage('letters')
  }

  const startWords = () => {
    setWordIndex(0)
    setStage('words')
  }

  if (stage === 'intro') {
    return (
      <div className="learned-everything radial">
        <Circle
          r={338}
          className="phone:h-[260px] phone:w-[260px]"
          pop={0}
          popScale={0.5}
        />
        <MissionComplete className="absolute left-1/2 top-1/2 -translate-x-[106%] -translate-y-[45%] phone:h-[150px] phone:w-[150px]" />
        <h1 className="-translate-y-[135%] text-[1.1666rem] uppercase text-brand-red phone:text-[1rem]">
          Mission Complete!
        </h1>
        <p className="translate-y-[20px] text-[0.8rem] whitespace-nowrap phone:translate-y-0 phone:text-[0.6rem]">
          You can read Hangul!
        </p>
        <Button
          arrow="forward"
          data-autofocus="true"
          className="translate-y-[86px] whitespace-nowrap phone:translate-y-[40px]"
          onClick={startLetters}
        >
          Continue
        </Button>
      </div>
    )
  }

  if (stage === 'letters') {
    return (
      <div className="learned-everything radial">
        <Circle r={338} className="phone:h-[260px] phone:w-[260px]" />
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[240px] whitespace-nowrap phone:-translate-y-[195px]">
          You learned <b>{letterIndex + 1}</b> Hangul letters!
        </p>
        <GeometricJamo
          jamo={jamos[letterIndex] ?? 'ㅇ'}
          geometric={geometric}
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 phone:h-[300px] phone:w-[300px]"
        />
      </div>
    )
  }

  return (
    <div className="learned-everything radial">
      <Circle r={338} className="phone:h-[260px] phone:w-[260px]" />
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[240px] whitespace-nowrap phone:-translate-y-[195px]">
        You read <b>{wordIndex + 1}</b> Korean words!
      </p>
      <BigWord
        word={wordList[wordIndex] ?? ''}
        shapes={shapes}
        clickable={false}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] whitespace-nowrap [&_.big-syllable]:h-[230px] [&_.big-syllable]:w-[230px] phone:[&_.big-syllable]:h-[115px] phone:[&_.big-syllable]:w-[115px]"
      />
      {continueShowing && (
        <Button
          arrow="forward"
          data-autofocus="true"
          className="translate-x-[100px] translate-y-[200px] whitespace-nowrap phone:translate-x-0 phone:translate-y-[75px]"
          onClick={() => navigate({ to: '/nowwhat' })}
        >
          Now what?
        </Button>
      )}
    </div>
  )
}
