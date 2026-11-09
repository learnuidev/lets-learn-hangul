import { Link } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'

/**
 * Standing entry point to `/unlocks`, pinned beside the stats icon in the
 * bottom-left corner.
 *
 * It sits one icon-width to the right of `StatsLink` and shares its layering:
 * `z-40` keeps both under the `z-50` course index, and the phone offsets step up
 * above the Back/Continue bar that owns the bottom edge there.
 */
export function UnlocksLink({ className }: { className?: string }) {
  return (
    <Link
      to="/unlocks"
      aria-label="Your unlocks"
      title="Your unlocks"
      className={[
        'fixed bottom-[0.5rem] left-[62px] z-40 flex h-[38px] w-[38px] items-center justify-center',
        'rounded-full border border-ink/12 bg-white/70 text-ink/60',
        'transition-[scale,color,background-color] duration-150',
        'hover:scale-105 hover:bg-white hover:text-brand-blue',
        'focus-visible:ring-[3px] focus-visible:ring-brand-blue/40 focus-visible:outline-none',
        'phone:bottom-[64px] phone:left-[49px] phone:h-[34px] phone:w-[34px]',
        className ?? '',
      ].join(' ')}
    >
      <Trophy className="h-[18px] w-[18px] phone:h-[16px] phone:w-[16px]" strokeWidth={2.25} />
    </Link>
  )
}
