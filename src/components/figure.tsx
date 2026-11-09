import { Circle } from '@/components/circle'
import { cn } from '@/lib/utils'

interface FigureProps {
  className?: string
  /** Size classes for the disc — the same box is used for the circle and the text. */
  circle: string
  label: string
  labelClassName?: string
  value: number | string
  detail?: string
  /** Label colour utility, e.g. `text-brand-blue`. */
  tone: string
}

/**
 * A labelled white disc: the round summary's figure, reused by the pages that
 * lay out a cluster of numbers on a `.radial` stage.
 *
 * The wrapper's `text-[…]` sets the number's size, so the same component works
 * at every scale in a cluster.
 */
export function Figure({
  className,
  circle,
  label,
  labelClassName,
  value,
  detail,
  tone,
}: FigureProps) {
  return (
    <div className={cn('absolute', className)}>
      <Circle className={cn('absolute top-0 left-0', circle)} pop={0.15} popScale={0.5} />
      <label className={cn('absolute whitespace-nowrap', labelClassName)}>{label}</label>
      <div className={cn('relative z-1 flex flex-col items-center justify-center text-center', circle)}>
        <div className={cn('leading-[1em] font-black', tone)} style={{ fontSize: '1.15em' }}>
          {value}
        </div>
        {detail && (
          <div className="mt-[0.06em] opacity-45" style={{ fontSize: '0.32em', lineHeight: 1.3 }}>
            {detail}
          </div>
        )}
      </div>
    </div>
  )
}
