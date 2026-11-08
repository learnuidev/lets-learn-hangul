import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { RomanizationResult } from '@/data/types'
import { getRomanizations } from '@/lib/romanize'
import { cn } from '@/lib/utils'

interface LearnResponseFormProps {
  word: string
  response: string
  responseError: RomanizationResult | null
  showCorrect: boolean
  onChange: (value: string) => void
  onSubmit: () => RomanizationResult
  onFocus?: () => void
}

/**
 * The romanization input. The text field keeps its own width based on the
 * answer length, and a mirror layer colours the character that went wrong.
 */
export function LearnResponseForm({
  word,
  response,
  responseError,
  showCorrect,
  onChange,
  onSubmit,
  onFocus,
}: LearnResponseFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const romanization = getRomanizations(word).ideal

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(timer)
  }, [])

  const blur = () => {
    inputRef.current?.blur()
    setTimeout(() => {
      document.querySelector<HTMLElement>('.round__learn__entry button')?.focus()
    }, 30)
  }

  return (
    <form
      action="#"
      className="learn-response-form relative"
      onSubmit={(event) => {
        event.preventDefault()
        const result = onSubmit()
        if (result.correct) blur()
      }}
    >
      <Input
        ref={inputRef}
        className={cn('fat-input', showCorrect && 'correct')}
        style={{ width: `${Math.max(216, 36 + 22 * romanization.length)}px` }}
        value={response}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        autoCorrect="off"
        autoCapitalize="off"
        disabled={showCorrect}
        aria-label="Romanization"
      />

      {responseError && (
        <div className="learn-response-form__highlight pointer-events-none absolute top-0 left-0 h-full w-full rounded-[0.27rem] border-4 border-transparent bg-transparent px-[0.5rem] py-[0.27rem] text-left text-[1rem] text-transparent outline-none">
          {typeof responseError.wrongChar === 'number' ? (
            <span>
              {response.slice(0, responseError.wrongChar)}
              <span className="wrong text-brand-orange">
                {response.slice(responseError.wrongChar, responseError.wrongChar + 1)}
              </span>
              {response.slice(responseError.wrongChar + 1)}
            </span>
          ) : (
            response
          )}
        </div>
      )}
    </form>
  )
}

/** Kept for parity with the original sound-button placement inside the entry. */
export function LearnResponseNext({ onClick }: { onClick: () => void }) {
  return (
    <Button
      arrow="forward"
      data-autofocus="true"
      className="absolute top-[90px] left-full ml-[25px] whitespace-nowrap phone:top-[93px] phone:right-[20px] phone:left-auto"
      onClick={onClick}
    >
      Next
    </Button>
  )
}
