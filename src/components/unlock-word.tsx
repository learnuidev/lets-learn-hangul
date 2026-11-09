import { canRead, type UnlockItem, type UnlockState } from '@/lib/unlocks'
import { cn } from '@/lib/utils'

/**
 * The spelling shrinks as a word gets longer, so it stays inside its cell: the
 * long words in the dataset run to five or six syllables.
 */
const GLYPH_SIZE = [
  'text-[20px]',
  'text-[20px]',
  'text-[18px]',
  'text-[16px]',
  'text-[14px]',
  'text-[13px]',
] as const

interface UnlockWordProps {
  item: UnlockItem
  state: UnlockState | undefined
  /** Letters the learner knows, for fading unreadable blocks inside the word. */
  known: ReadonlySet<string>
  /**
   * Blocks to call out inside the spelling: one block's spelling on a block's
   * page, or every block containing a letter on a letter's page.
   */
  highlight?: string | ReadonlySet<string>
}

/**
 * One word in the collection grid — the same 100px cell as a syllable block, so
 * words and blocks line up on one module.
 *
 * The spelling goes block by block, so the parts that can already be read stay
 * dark; then how it sounds, what it means, and — along the bottom — the letters
 * still missing (in red) beside the word's CEFR band.
 */
export function UnlockWord({ item, state, known, highlight }: UnlockWordProps) {
  const status = state?.status ?? 'locked'
  const missing = state?.missing ?? []
  const blocks = item.blocks ?? Array.from(item.input)

  const called =
    typeof highlight === 'string'
      ? (block: string) => block === highlight
      : (block: string) => highlight?.has(block) === true

  return (
    <li className="w-[100px] tablet-down:w-[20%]">
      <div
        title={`${item.input} — ${item.roman} — ${item.en}${
          missing.length > 0 ? ` · needs ${missing.join(' ')}` : ''
        }${item.level ? ` · ${item.level}` : ''}`}
        className="flex h-[100px] w-full flex-col items-center justify-center px-[3px] tablet-down:h-[72px]"
      >
        <span
          className={cn(
            'w-full truncate text-center leading-[1.15] font-bold',
            GLYPH_SIZE[Math.min(blocks.length, GLYPH_SIZE.length) - 1],
            status === 'locked' && 'opacity-45',
          )}
        >
          {blocks.map((block, index) => (
            <span
              key={`${block}-${index}`}
              className={cn(
                'font-korean',
                called(block)
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
            'mt-[2px] w-full truncate text-center text-[11px] leading-[13px] font-semibold italic tablet-down:mt-[1px] tablet-down:text-[10px] tablet-down:leading-[12px]',
            status === 'full' ? 'text-brand-blue/75' : 'text-brand-blue/45',
          )}
        >
          {item.roman}
        </span>
        <span
          className={cn(
            'w-full truncate text-center text-[10px] leading-[12px] tablet-down:text-[9px] tablet-down:leading-[11px]',
            status === 'full' ? 'opacity-45' : 'opacity-30',
          )}
        >
          {item.en}
        </span>
        <span className="mt-[2px] flex w-full items-baseline justify-between gap-[3px]">
          <span className="truncate text-[10px] leading-[11px] font-semibold text-brand-red/70 tablet-down:text-[9px]">
            {missing.join('')}
          </span>
          <span className="shrink-0 text-[9px] leading-[11px] uppercase opacity-25">
            {item.level}
          </span>
        </span>
      </div>
    </li>
  )
}
