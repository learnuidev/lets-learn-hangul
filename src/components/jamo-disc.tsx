import { Circle } from '@/components/circle'
import { getJamoHint } from '@/lib/display'
import { cn } from '@/lib/utils'

/** Two scales: the collection grid, and a block's own page. */
const SIZES = {
  small: {
    cell: 'w-[0.92rem]',
    disc: 'h-[0.72rem] w-[0.72rem]',
    glyph: 'text-[0.36rem]',
    hint: 'mt-[0.05rem] text-[11px] leading-[12px]',
  },
  large: {
    cell: 'w-[1.5rem]',
    disc: 'h-[1.2rem] w-[1.2rem]',
    glyph: 'text-[0.58rem]',
    hint: 'mt-[0.06rem] text-[13px] leading-[15px]',
  },
}

interface JamoDiscProps {
  letter: string
  known: boolean
  /** Delay for the pop-in, when a whole row of these appears at once. */
  delay?: number | false
  size?: keyof typeof SIZES
  className?: string
}

/**
 * One letter as the collection draws them: a pale disc while it is still
 * unlearned, a white one once it has come up in a lesson, with the romanized
 * hint underneath.
 */
export function JamoDisc({ letter, known, delay = false, size = 'small', className }: JamoDiscProps) {
  const scale = SIZES[size]

  return (
    <span className={cn('flex flex-col items-center', scale.cell, className)}>
      <span className={cn('relative block', scale.disc)}>
        <Circle
          fill={known ? 'white' : '#e7e0d1'}
          className="absolute top-0 left-0 h-full w-full"
          pop={delay === false ? false : delay}
          popScale={0.5}
        />
        <span
          className={cn(
            'relative z-1 flex h-full w-full items-center justify-center leading-none font-bold',
            scale.glyph,
            known ? 'text-ink' : 'text-ink/30',
          )}
        >
          {letter}
        </span>
      </span>
      <span
        className={cn(
          'font-semibold lowercase',
          scale.hint,
          known ? 'opacity-40' : 'opacity-20',
        )}
      >
        {getJamoHint(letter)}
      </span>
    </span>
  )
}
