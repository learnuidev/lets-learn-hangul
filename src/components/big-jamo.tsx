import { motion } from 'motion/react'
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
export function BigJamo({ shapes, jamo, className, pop, popScale = 0 }: BigJamoProps) {
  const animate = pop !== undefined && pop !== false
  return (
    <motion.svg
      viewBox="0 0 600 600"
      className={cn('big-jamo [&_path]:fill-ink', className)}
      aria-hidden="true"
      initial={animate ? { scale: popScale } : false}
      animate={animate ? { scale: 1 } : undefined}
      transition={animate ? { type: 'spring', bounce: 0.35, duration: 0.6, delay: pop } : undefined}
    >
      <path d={shapes[getShapeID(jamo)] || ''} />
    </motion.svg>
  )
}
