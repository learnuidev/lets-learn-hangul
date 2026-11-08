import type { CSSProperties } from 'react'
import { getShapeID } from '@/lib/display'
import { cn } from '@/lib/utils'

interface BigJamoProps {
  shapes: Record<string, string>
  jamo: string
  className?: string
  /** Delay in seconds for the pop-in animation, or `false` when static. */
  pop?: number | false
  popScale?: number
}

/** One jamo drawn at display size from the shape path set. */
export function BigJamo({ shapes, jamo, className, pop, popScale }: BigJamoProps) {
  const animate = pop !== undefined && pop !== false
  const soft = (popScale ?? 0) > 0

  return (
    <svg
      viewBox="0 0 600 600"
      className={cn('big-jamo [&_path]:fill-ink', animate && (soft ? 'pop-in-soft' : 'pop-in'), className)}
      aria-hidden="true"
      style={
        animate
          ? {
              ...(soft ? ({ '--pop-from': String(popScale) } as CSSProperties) : null),
              animationDelay: pop ? `${pop}s` : undefined,
            }
          : undefined
      }
    >
      <path d={shapes[getShapeID(jamo)] || ''} />
    </svg>
  )
}
