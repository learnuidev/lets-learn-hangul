import { canRead, type UnlockItem, type UnlockState } from '@/lib/unlocks'
import { cn } from '@/lib/utils'

interface UnlockWordProps {
  item: UnlockItem
  state: UnlockState | undefined
  /** Letters the learner knows, for fading unreadable blocks inside the word. */
  known: ReadonlySet<string>
  /** A block to call out — the one whose page this row is on. */
  highlight?: string
}

/**
 * One word in a collection list: the spelling (block by block, so the parts that
 * can already be read stay dark), how it sounds, what it means, and the letters
 * still missing.
 */
export function UnlockWord({ item, state, known, highlight }: UnlockWordProps) {
  const status = state?.status ?? 'locked'
  const missing = state?.missing ?? []

  return (
    <li className="flex items-baseline gap-[0.24rem] break-inside-avoid border-b border-ink/10 py-[0.09rem]">
      <span
        className={cn(
          'shrink-0 text-[0.5rem] leading-[0.68rem] font-bold',
          status === 'locked' && 'opacity-45',
        )}
      >
        {(item.blocks ?? Array.from(item.input)).map((block, index) => (
          <span
            key={`${block}-${index}`}
            className={cn(
              'font-korean',
              highlight === block
                ? 'text-brand-blue'
                : canRead(block, known).readable
                  ? 'text-ink'
                  : 'text-ink/25',
            )}
          >
            {block}
          </span>
        ))}
      </span>
      <span
        className={cn(
          'shrink-0 text-[12px] leading-[15px] font-semibold italic',
          status === 'full' ? 'text-brand-blue/75' : 'text-brand-blue/45',
        )}
      >
        {item.roman}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-[13px] leading-[16px]',
          status === 'full' ? 'opacity-45' : 'opacity-30',
        )}
      >
        {item.en}
      </span>
      {missing.length > 0 && (
        <span className="shrink-0 text-[11px] leading-[14px] font-semibold text-brand-red/70">
          needs {missing.join(' ')}
        </span>
      )}
      {item.level && (
        <span className="shrink-0 text-[11px] leading-[14px] uppercase opacity-25">{item.level}</span>
      )}
    </li>
  )
}
