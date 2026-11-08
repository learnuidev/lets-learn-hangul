import { cn } from '@/lib/utils'

interface BigTextProps {
  text: string
  className?: string
}

/** Letters that have no shape path (Latin, punctuation, digits). */
export function BigText({ text, className }: BigTextProps) {
  return (
    <svg viewBox="0 0 400 600" className={cn('big-text', className)} aria-hidden="true">
      <text
        x="200"
        y="300"
        dy="175"
        fill="#2d2b29"
        textAnchor="middle"
        fontSize="450pt"
        fontWeight="600"
        fontFamily="ff-enzo-web"
      >
        {text}
      </text>
    </svg>
  )
}
