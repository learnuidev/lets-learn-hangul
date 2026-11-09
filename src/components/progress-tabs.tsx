import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

/**
 * The sections of the progress page.
 *
 * One entry per tab: give each one a route and the strip, the active state and
 * the page title all follow. Adding a section means adding a route file, an
 * entry here, and a view in `progress-page.tsx` — nothing else in the app has to
 * know that the record is split up.
 */
export const PROGRESS_TABS = [
  { id: 'stats', label: 'Stats', to: '/stats' },
  { id: 'unlocks', label: 'Unlocks', to: '/unlocks' },
] as const

export type ProgressTabId = (typeof PROGRESS_TABS)[number]['id']

/**
 * The tab strip across the top of the progress page.
 *
 * Styled entirely from the app's button primitive — the current tab is the
 * `default` (blue-soft) button, the others are `quiet`, so the strip is the same
 * fill / radius / type as every other control and nothing shifts on switch.
 * The tabs are real links, so each one has its own URL and back/forward and
 * shared links land on the right section.
 */
export function ProgressTabs({ active }: { active: ProgressTabId }) {
  return (
    <nav
      aria-label="Your progress"
      className="mt-[0.75rem] flex items-center justify-center gap-[0.12rem] tablet-down:mt-[0.9rem]"
    >
      {PROGRESS_TABS.map((tab) => {
        const current = tab.id === active
        return (
          <Button
            key={tab.id}
            asChild
            variant={current ? 'default' : 'quiet'}
            className="uppercase tracking-[0.04em]"
          >
            <Link to={tab.to} aria-current={current ? 'page' : undefined}>
              {tab.label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
