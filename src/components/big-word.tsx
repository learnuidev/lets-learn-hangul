import { BigSyllable } from '@/components/big-syllable'
import { cn } from '@/lib/utils'

interface BigWordProps {
  word: string
  shapes?: Record<string, string>
  className?: string
  onPeek?: (jamo: string) => void
  clickable?: boolean
}

/** A whole word rendered as syllable blocks. */
export function BigWord({ word, shapes, className, onPeek, clickable = true }: BigWordProps) {
  if (!shapes) return null
  return (
    <div className={cn('big-word', className)}>
      {word.split('').map((syllable, i) => (
        <BigSyllable
          syllable={syllable}
          key={i}
          shapes={shapes}
          onPeek={onPeek}
          clickable={clickable}
        />
      ))}
    </div>
  )
}
