import { Link } from '@tanstack/react-router'
import { ChartColumn } from 'lucide-react'

/**
 * Standing entry point to `/stats`, pinned to the bottom-left corner.
 *
 * `z-40` is deliberate: the full-screen course index is a `z-50` dialog, so the
 * icon is covered while that overlay is open instead of floating above it. On
 * phones the Back/Continue bar owns the bottom edge, so the icon steps up above
 * it (`phone:bottom-[64px]`).
 */
export function StatsLink({ className }: { className?: string }) {
  return (
    <Link
      to="/stats"
      aria-label="Your stats"
      title="Your stats"
      className={[
        'fixed bottom-[0.5rem] left-[0.5rem] z-40 flex h-[38px] w-[38px] items-center justify-center',
        'rounded-full border border-ink/12 bg-white/70 text-ink/60',
        'transition-[scale,color,background-color] duration-150',
        'hover:scale-105 hover:bg-white hover:text-brand-blue',
        'focus-visible:ring-[3px] focus-visible:ring-brand-blue/40 focus-visible:outline-none',
        'phone:bottom-[64px] phone:left-[9px] phone:h-[34px] phone:w-[34px]',
        className ?? '',
      ].join(' ')}
    >
      <ChartColumn className="h-[18px] w-[18px] phone:h-[16px] phone:w-[16px]" strokeWidth={2.25} />
    </Link>
  )
}
