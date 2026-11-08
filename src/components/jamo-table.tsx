import { useRef, useState } from 'react'
import { GeometricJamo } from '@/components/geometric-jamo'
import type { Jamo } from '@/data/types'
import { getJamoHint } from '@/lib/display'
import { isMedial } from '@/lib/hangul'
import { play } from '@/lib/sound'
import { cn } from '@/lib/utils'

const table = (
  'ㄱ ㄴ ㄷ ㄹ ㅎ ㅋ ㅍ ㄲ ㄸ ㅃ ' +
  'ㅂ ㅅ ㅇ ㅈ ㅁ ㅊ ㅌ ㅆ ㅉ ㅢ ' +
  'ㅣ ㅡ ㅗ ㅜ ㅛ ㅠ ㅖ ㅘ ㅙ ㅚ ' +
  'ㅐ ㅔ ㅏ ㅓ ㅒ ㅑ ㅕ ㅝ ㅞ ㅟ'
).split(' ')

/** Same swipe-up cross-fade as the level/round indicator and the logo. */
const swipe = 'swipe-swap'

interface JamoTableProps {
  geometric: Record<string, string>
  jamos: Record<string, Jamo>
  known?: Record<string, boolean>
  newJamos?: string[]
  className?: string
}

/**
 * The full 40-letter grid revealed at the end of a round: dim for letters the
 * learner has not met, highlighted for the ones just learned. Hovering (or
 * tapping) a letter swipes the glyph up and fades its romanization in.
 */
export function JamoTable({ geometric, jamos, known = {}, newJamos = [], className }: JamoTableProps) {
  const [active, setActive] = useState<string | null>(null)
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activate = (jamo: string) => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current)
    setActive(jamo)
  }

  // Touch needs an explicit release; hover clears on mouse leave.
  const releaseSoon = () => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current)
    releaseTimer.current = setTimeout(() => setActive(null), 500)
  }

  return (
    <div className={cn('jamo-table flex w-[1000px] flex-wrap phone:w-full', className)}>
      {table.map((jamo) => {
        const isNew = newJamos.includes(jamo)
        const shown = active === jamo
        return (
          <button
            type="button"
            key={jamo}
            className={cn(
              'jamo-table__jamo group/jamo relative flex h-[100px] w-[100px] cursor-pointer items-center justify-center bg-transparent p-0 phone:h-[2rem] phone:w-[20%]',
              !known[jamo] && 'jamo-table__jamo--unknown opacity-10',
              isNew && [
                'jamo-table__jamo--new',
                'before:absolute before:top-1/2 before:left-1/2 before:block before:h-[80px] before:w-[80px]',
                'before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-[80px] before:bg-white before:content-[""]',
                'before:animate-[scale-in_0.72s_both] before:[animation-delay:inherit]',
                'phone:before:h-[60%] phone:before:w-[60%] phone:before:pb-[60%]',
              ],
            )}
            style={{ animationDelay: `${Math.max(0, newJamos.indexOf(jamo)) * 120}ms` }}
            data-jamo={jamo}
            onClick={() => {
              const url = jamos[jamo]?.audio?.url
              if (url) play(url)
            }}
            onMouseEnter={() => activate(jamo)}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => {
              activate(jamo)
              releaseSoon()
            }}
          >
            <GeometricJamo
              jamo={jamo}
              geometric={geometric}
              className={cn(
                'relative z-5 h-[60px] w-[60px] translate-y-0 phone:h-[1.2rem] phone:w-[60%]',
                'group-hover/jamo:-translate-y-[16px] group-hover/jamo:opacity-0',
                shown && '-translate-y-[16px] opacity-0',
                swipe,
              )}
            />
            <span
              className={cn(
                'jamo-table__jamo__latin pointer-events-none absolute top-1/2 left-1/2',
                'text-[0.8888rem] font-black text-brand-red',
                '[translate:-50%_calc(-50%_+_16px)] opacity-0',
                'group-hover/jamo:[translate:-50%_-50%] group-hover/jamo:opacity-100',
                shown && '[translate:-50%_-50%] opacity-100',
                isMedial(jamo) && 'vowel text-brand-blue',
                swipe,
              )}
            >
              {getJamoHint(jamo)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
