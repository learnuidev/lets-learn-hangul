import { cn } from '@/lib/utils'
import { isMedial } from '@/lib/hangul'
import { mapping } from '@/lib/display'

const red = '#ee1a60'
const blue = '#367add'

interface GeometricJamoProps {
  geometric: Record<string, string>
  jamo: string
  className?: string
  style?: React.CSSProperties
  fill?: boolean
  size?: number
}

/**
 * The geometric, single-stroke versions of each jamo used by the constellation,
 * confetti, jamo table and the finale screens.
 */
export function GeometricJamo({
  geometric,
  jamo,
  className,
  style,
  fill = true,
  size = 600,
}: GeometricJamoProps) {
  const color = isMedial(jamo) ? blue : red
  return (
    <svg
      viewBox="0 0 600 600"
      width={size}
      height={size}
      className={cn('geometric-jamo', className)}
      style={style ?? {}}
      aria-hidden="true"
    >
      <path
        d={geometric[mapping[jamo]] || ''}
        vectorEffect="non-scaling-stroke"
        fill={fill ? color : 'transparent'}
        stroke={fill ? undefined : color}
      />
    </svg>
  )
}
