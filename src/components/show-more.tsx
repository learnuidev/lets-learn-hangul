import { Button } from '@/components/ui/button'

interface ShowMoreProps {
  /** How many more one click reveals. */
  step: number
  shown: number
  total: number
  onMore: () => void
}

/**
 * "Show more", with the running count so a long collection's size stays honest.
 * Shared by the unlocks page and the block pages.
 */
export function ShowMore({ step, shown, total, onMore }: ShowMoreProps) {
  if (shown >= total) {
    return total === 0 ? null : (
      <p className="mt-[0.24rem] mb-0 text-[11px] leading-[14px] uppercase tracking-[0.08em] opacity-30">
        that’s all {total}
      </p>
    )
  }

  return (
    <div className="mt-[0.28rem] flex items-baseline gap-[0.3rem]">
      <Button variant="link" size="none" onClick={onMore}>
        Show {Math.min(step, total - shown)} more
      </Button>
      <span className="text-[11px] leading-[14px] uppercase tracking-[0.08em] opacity-30">
        {shown} of {total}
      </span>
    </div>
  )
}
