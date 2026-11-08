import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Container for a screen's Back/Continue pair. On phones the stylesheet turns
 * this into the bar pinned to the bottom of the viewport.
 */
export function BackForwardButtons({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('back-forward-buttons', className)}>{children}</div>
}
