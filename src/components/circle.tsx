import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface CircleProps {
  /** Diameter as a CSS length; the original passed pixels through `r`. */
  r?: number | string
  fill?: string
  className?: string
  style?: CSSProperties
  /** Delay in seconds for the pop-in animation, or `false` to stay static. */
  pop?: number | false
  /** Scale the circle starts from when popping in. */
  popScale?: number
}

/** The white disc that sits behind most of the content. */
export function Circle({ r, fill, className, style, pop, popScale }: CircleProps) {
  const size = r ?? '400px'
  const animate = pop !== undefined && pop !== false
  const soft = (popScale ?? 0) > 0

  return (
    <svg
      version="1.1"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={cn('circle block', animate && (soft ? 'pop-in-soft' : 'pop-in'), className)}
      style={
        animate
          ? {
              ...(soft ? ({ '--pop-from': String(popScale) } as CSSProperties) : null),
              animationDelay: pop ? `${pop}s` : undefined,
              ...style,
            }
          : style
      }
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="200" fill={fill || 'white'} />
    </svg>
  )
}
