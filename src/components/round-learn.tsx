import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Circle } from '@/components/circle'
import { BigWord } from '@/components/big-word'
import { SoundButton } from '@/components/sound-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LearnResponseForm, LearnResponseNext } from '@/components/learn-response-form'
import type { Level, RomanizationResult, Round, Word } from '@/data/types'
import { getRomanizations } from '@/lib/romanize'
import { getRoundWords, paramFromStep, stepFromParams } from '@/lib/quiz'
import { play, playEffect } from '@/lib/sound'
import { checkRomanization } from '@/lib/validation'
import { useSession } from '@/hooks/use-session'
import { useUser } from '@/providers/user-store'
import { cn } from '@/lib/utils'

interface RoundLearnProps {
  level: Level
  round: Round
  shapes: Record<string, string>
  words: Record<string, Word>
  step?: string
}

/**
 * The core exercise: type the romanization of each word in the round. The word
 * being asked for is part of the URL (`/learn`, `/learn/2`, …), so reloading or
 * sharing a link lands on the same word.
 */
export function RoundLearn({ level, round, shapes, words, step }: RoundLearnProps) {
  const navigate = useNavigate()
  const { recordHit, recordMiss, recordPeek, completeSession } = useSession()
  const { user, dismissHint } = useUser()

  const levelParam = String(level.level)
  const roundParam = String(round.round)

  const list = getRoundWords(round)
  const index = Math.min(stepFromParams(step), Math.max(list.length - 1, 0))
  const word = list[index] ?? ''
  const meta = words[word]

  const [response, setResponse] = useState('')
  const [responseError, setResponseError] = useState<RomanizationResult | null>(null)
  const [showCorrect, setShowCorrect] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [misses, setMisses] = useState(0)
  const soundTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Each step starts from a clean slate.
  useEffect(() => {
    setResponse('')
    setResponseError(null)
    setShowCorrect(false)
    setShowAnswer(false)
    setMisses(0)
    return () => {
      if (soundTimer.current) clearTimeout(soundTimer.current)
    }
  }, [index])

  // The original locked scrolling here so the on-screen keyboard could not shove
  // the layout around.
  useEffect(() => {
    const preventScroll = (event: Event) => {
      event.preventDefault()
      if (window.scrollY > 0) window.scrollTo(0, 0)
    }
    window.addEventListener('scroll', preventScroll)
    return () => window.removeEventListener('scroll', preventScroll)
  }, [])

  const submitResponse = (): RomanizationResult => {
    const result = checkRomanization(word, response, level.level === 5)
    if (response.length) dismissHint('romanization')

    if (result.correct) {
      playEffect('correct')
      recordHit(level, round, word)
      setShowCorrect(true)
      setResponseError(null)
      const audioUrl = meta?.audio?.url
      if (audioUrl) soundTimer.current = setTimeout(() => play(audioUrl), 400)
      return result
    }

    playEffect('wrong')
    recordMiss(level, round, word)
    const nextMisses = misses + 1
    setMisses(nextMisses)
    if (nextMisses < 3) setResponseError(result)
    else {
      setResponseError(null)
      setShowAnswer(true)
    }
    return result
  }

  const goNext = () => {
    if (index + 1 < list.length) {
      navigate({
        to: '/level/$level/round/$round/learn/$step',
        params: { level: levelParam, round: roundParam, step: paramFromStep(index + 1) },
      })
      return
    }
    completeSession(level, round)
  }

  const hasImage = Boolean(meta?.image?.url)
  const hasAudio = Boolean(meta?.audio?.url)
  const phonetics = getRomanizations(word, true)
    .syllables.map((syllable) => syllable.ideal)
    .join(' · ')

  const isOneSyllable = word.length === 1
  const isMedium = word.length > 3 && word.length < 5
  const isLong = word.length >= 5
  const syllableSize = isLong ? '0.5em' : isMedium ? '0.75em' : '1em'
  const textSize = isLong ? '0.3333em' : isMedium ? '0.5em' : '0.6666em'

  const showPeekHint = !user.hinted.peeking && misses > 0
  const showEntryHint = !user.hinted.romanization && !showCorrect && !showAnswer

  return (
    <div
      className={cn(
        'round__learn relative z-5 mt-[40px] ml-[50px] h-[600px] tablet:mt-[120px]',
        'phone:absolute phone:inset-0 phone:m-0',
        hasImage && 'has-image',
        hasAudio && 'has-audio',
        showCorrect && 'show-correct',
      )}
    >
      <div
        className={cn(
          'round__learn__new-word absolute top-[120px] left-1/2 z-2 -ml-[324px] translate-x-[20px] transition-[translate] duration-300',
          'phone:top-[55px] phone:left-0 phone:ml-0 phone:translate-x-0',
          hasImage && showCorrect && 'wide:translate-x-[-100px]',
        )}
      >
        <Circle
          className="absolute -top-[36px] -z-10 h-[7.3333rem] w-[7.3333rem] phone:-top-[21px] phone:h-[7rem] phone:w-[7rem]"
          pop={0}
          popScale={0.6}
        />
        <label className="mb-0 phone:-translate-y-[7px]">New word</label>

        <Tooltip open={showPeekHint}>
          <TooltipTrigger asChild>
            <span className="absolute top-[60px] left-[48px] block h-0 w-0" />
          </TooltipTrigger>
          <TooltipContent side="top">
            <button
              type="button"
              className="cursor-pointer bg-transparent text-white"
              onClick={() => dismissHint('peeking')}
            >
              Click a letter to peek at its pronunciation
            </button>
          </TooltipContent>
        </Tooltip>

        <div
          className={cn(
            'big-word relative top-[65px] z-10 ml-[48px] -translate-y-1/2 text-[3.88888rem]',
            'phone:top-[50px] phone:ml-[10px] phone:text-[3rem]',
            isOneSyllable && 'ml-[0.44em] phone:ml-[0.66em]',
          )}
          style={
            {
              '--syllable-size': syllableSize,
              '--text-size': textSize,
            } as CSSProperties
          }
        >
          <BigWord
            word={word}
            shapes={shapes}
            onPeek={(jamo) => recordPeek(level, round, jamo, word)}
            className="[&_.big-syllable]:h-[var(--syllable-size)] [&_.big-syllable]:w-[var(--syllable-size)] [&_.big-text]:h-[var(--syllable-size)] [&_.big-text]:w-[var(--text-size)]"
          />
        </div>

        <div className="round__learn__phonetics absolute top-[180px] -left-[60px] w-[240px] text-right text-[21px] opacity-0 transition-opacity duration-200 show-correct:opacity-100 phone:top-[128px] phone:left-[52px] phone:text-left">
          {phonetics}
        </div>

        {hasImage && (
          <div
            className={cn(
              'round__learn__image pointer-events-none absolute -top-[56px] left-[214px] h-[442px] w-[442px] scale-0 overflow-hidden rounded-[1000px] border-[16px] border-white bg-white opacity-0',
              'transition-[scale,opacity] duration-300',
              'show-correct:pointer-events-auto show-correct:scale-100 show-correct:opacity-100',
              'phone:hidden',
            )}
          >
            <img
              src={`/images/${meta?.image?.url}`}
              width={420}
              height={420}
              alt={meta?.translation ?? word}
            />
          </div>
        )}

        {hasAudio && (
          <div
            className={cn(
              'round__learn__audio pointer-events-none absolute top-[180px] left-[200px] scale-0 opacity-0',
              'transition-[scale,opacity] duration-150',
              'show-correct:pointer-events-auto show-correct:scale-100 show-correct:opacity-100',
              'phone:top-[113px] phone:left-[2px] phone:show-correct:scale-50',
            )}
          >
            <SoundButton url={meta?.audio?.url} />
          </div>
        )}
      </div>

      {showCorrect && (
        <div
          className={cn(
            'round__learn__correct-word absolute top-[42px] left-1/2 z-2 ml-[76px] pt-[38px] transition-[translate] duration-300',
            'phone:top-[390px] phone:left-[90px] phone:ml-0 phone:pt-[22px] phone:text-left',
            hasImage && 'wide:translate-x-[50px]',
          )}
        >
          <Circle className="absolute -top-[30px] -left-[30px] -z-10 h-[168px] w-[168px] phone:h-[128px] phone:w-[128px]" />
          <label className="absolute top-0 -left-[40px] text-right phone:-top-[20px] phone:-left-[30px]">
            Meaning
          </label>
          <h3 className="m-0 table-cell min-w-[107px] text-center text-[1rem] font-semibold whitespace-nowrap text-brand-blue phone:block phone:text-left">
            {meta?.translation}
          </h3>
        </div>
      )}

      <div
        className={cn(
          'round__learn__entry absolute top-[336px] right-[32%] z-5 text-right transition-[translate] duration-300',
          'phone:top-[228px] phone:right-0 phone:left-0 phone:pt-[1rem]',
          hasImage && showCorrect && 'wide:translate-x-[50px]',
        )}
      >
        <Circle className="absolute -top-[24px] right-[-84px] -z-10 h-[4.6666rem] w-[4.6666rem] phone:right-[-60px]" />

        {showCorrect ? (
          <label className="correct text-brand-green phone:absolute phone:top-[-0.25rem] phone:right-[20px]">
            Correct!
          </label>
        ) : showAnswer ? (
          <label className="phone:absolute phone:top-[-0.25rem] phone:right-[20px]">
            The Correct Answer is
          </label>
        ) : responseError ? (
          <label className="error text-brand-orange phone:absolute phone:top-[-0.25rem] phone:right-[20px]">
            Oops!
          </label>
        ) : (
          <label className="phone:absolute phone:top-[-0.25rem] phone:right-[20px]">Romanization</label>
        )}

        <Tooltip open={showEntryHint}>
          <TooltipTrigger asChild>
            <span className="absolute top-0 left-1/2 block h-0 w-0" />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={12}>
            <button
              type="button"
              className="cursor-pointer bg-transparent text-white"
              onClick={() => dismissHint('romanization')}
            >
              Type the pronunciation of the Korean word here
            </button>
          </TooltipContent>
        </Tooltip>

        {showAnswer ? (
          <div className="round__learn__entry__correct-answer py-[14px] text-[36px]">
            {getRomanizations(word, true).ideal}
          </div>
        ) : (
          <div className="phone:mx-[20px]">
            <LearnResponseForm
              word={word}
              response={response}
              responseError={responseError}
              showCorrect={showCorrect}
              onChange={(value) => {
                setResponse(value)
                setResponseError(null)
              }}
              onSubmit={submitResponse}
              onFocus={() => {
                if (window.scrollY > 0) window.scrollTo(0, 0)
              }}
            />
          </div>
        )}

        {(showCorrect || showAnswer) && <LearnResponseNext onClick={goNext} />}
      </div>
    </div>
  )
}
