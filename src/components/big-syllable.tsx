import { useCallback, useRef, useState } from 'react'
import { decompose, isHangul } from '@/lib/hangul'
import { getHintIDs, getJamoHint, getShapeIDs } from '@/lib/display'
import { clamp } from '@/lib/numbers'
import { BigText } from '@/components/big-text'
import { cn } from '@/lib/utils'

const hintRadius = 190
const colors = ['#ee1a60', '#367add', '#b70d4e']

interface BigSyllableProps {
  syllable: string
  shapes: Record<string, string>
  className?: string
  clickable?: boolean
  onPeek?: (jamo: string) => void
}

/**
 * A syllable block drawn from its component jamo shapes. Clicking a letter pops
 * a bubble with its pronunciation and reports the peek upward.
 */
export function BigSyllable({
  syllable,
  shapes,
  className,
  clickable = true,
  onPeek,
}: BigSyllableProps) {
  const [hinted, setHinted] = useState<Record<number, boolean>>({})
  const [hovering, setHovering] = useState<Record<number, boolean>>({})
  const [centers, setCenters] = useState<Record<number, { x: number; y: number }>>({})
  const jamoRefs = useRef<Record<number, SVGPathElement | null>>({})
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const updateCenters = useCallback(() => {
    const min = hintRadius
    const max = 600 - hintRadius
    const jamos = decompose(syllable) ?? []
    const next: Record<number, { x: number; y: number }> = {}

    jamos.forEach((_jamo, i) => {
      const path = jamoRefs.current[i]
      if (!path) return
      const bbox = path.getBBox()
      next[i] = {
        x: clamp(bbox.x + bbox.width / 2, min, max),
        y: clamp(bbox.y + bbox.height / 2, min, max),
      }
    })
    setCenters(next)
  }, [syllable])

  const hideHint = useCallback((i: number) => {
    setHinted((current) => ({ ...current, [i]: false }))
  }, [])

  const showHint = useCallback(
    (i: number) => {
      updateCenters()
      setHinted((current) => ({ ...current, [i]: true }))
      if (timers.current[i]) clearTimeout(timers.current[i])
      timers.current[i] = setTimeout(() => hideHint(i), 1000)
      const jamos = decompose(syllable)
      const jamo = jamos?.[i]
      if (jamo && onPeek) onPeek(jamo)
    },
    [hideHint, onPeek, syllable, updateCenters],
  )

  if (!isHangul(syllable)) return <BigText text={syllable} className={className} />

  const jamos = decompose(syllable) ?? []

  return (
    <svg viewBox="0 0 600 600" className={cn('big-syllable', className)}>
      <g className="jamos">
        {getShapeIDs(syllable).map((id, i) => (
          <path
            d={shapes[id] || ''}
            fill={hinted[i] ? 'transparent' : colors[i]}
            opacity={hovering[i] ? 0.5 : 1}
            ref={(element) => {
              jamoRefs.current[i] = element
            }}
            key={i}
          />
        ))}
      </g>

      {clickable && (
        <g className="hints">
          {jamos.map(
            (jamo, i) =>
              hinted[i] &&
              centers[i] && (
                <g key={i}>
                  <circle
                    r={hintRadius}
                    opacity="0.8"
                    fill={colors[i]}
                    cx={centers[i].x}
                    cy={centers[i].y}
                  />
                  <text
                    x={centers[i].x}
                    y={centers[i].y + 40}
                    textAnchor="middle"
                    style={{
                      fontFamily: 'Helvetica, sans-serif',
                      fontSize: '140px',
                      fill: 'white',
                    }}
                  >
                    {getJamoHint(jamo, i === 0)}
                  </text>
                </g>
              ),
          )}
        </g>
      )}

      {clickable && (
        <g className="hitareas">
          {getHintIDs(syllable).map((id, i) => (
            <path
              style={{ cursor: 'pointer' }}
              fill="transparent"
              key={i}
              d={shapes[id] || ''}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => showHint(i)}
              onMouseEnter={() => setHovering((current) => ({ ...current, [i]: true }))}
              onMouseLeave={() => setHovering((current) => ({ ...current, [i]: false }))}
            />
          ))}
        </g>
      )}
    </svg>
  )
}
