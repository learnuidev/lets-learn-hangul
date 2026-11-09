import { useState } from "react";
import { ShowMore } from "@/components/show-more";
import { UnlockSyllable } from "@/components/unlock-syllable";
import { UnlockWord } from "@/components/unlock-word";
import { stateKey, type UnlockItem, type UnlockProgress } from "@/lib/unlocks";

/** How many rows of a group are listed before "Show more". */
const WORD_PAGE = 24;
const SYLLABLE_PAGE = 96;

/**
 * One titled group inside a list — "Read now", "One letter away", "Still needs
 * letters" — with its own reveal count, so a long group does not bury the one
 * below it.
 */
function GroupHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-[0.2rem]">
      <span className="text-[12px] leading-[15px] font-bold uppercase tracking-[0.06em] opacity-45">
        {title}
      </span>
      <span className="text-[11px] leading-[14px] uppercase opacity-25">{count}</span>
    </div>
  );
}

interface WordGroupProps {
  title: string;
  words: readonly UnlockItem[];
  progress: UnlockProgress;
  /** Blocks to call out inside each spelling — the page the group belongs to. */
  highlight?: string | ReadonlySet<string>;
}

/** A group of words, as rows: spelling, pronunciation, meaning, what is missing. */
export function WordGroup({ title, words, progress, highlight }: WordGroupProps) {
  const [limit, setLimit] = useState(WORD_PAGE);

  if (words.length === 0) return null;

  const visible = words.slice(0, limit);

  return (
    <div className="mt-[0.4rem] first:mt-0">
      <GroupHeader title={title} count={words.length} />
      <ul className="m-0 list-none pl-0 wide:columns-2 wide:gap-[1.6rem]">
        {visible.map((word) => (
          <UnlockWord
            key={word.input}
            item={word}
            state={progress.state[stateKey("word", word.input)]}
            known={progress.known}
            highlight={highlight}
          />
        ))}
      </ul>
      <ShowMore
        step={WORD_PAGE}
        shown={visible.length}
        total={words.length}
        onMore={() => setLimit(limit + WORD_PAGE)}
      />
    </div>
  );
}

interface SyllableGroupProps {
  title: string;
  blocks: readonly UnlockItem[];
  progress: UnlockProgress;
}

/** A group of syllable blocks, as the same discs the collection grid uses. */
export function SyllableGroup({ title, blocks, progress }: SyllableGroupProps) {
  const [limit, setLimit] = useState(SYLLABLE_PAGE);

  if (blocks.length === 0) return null;

  const visible = blocks.slice(0, limit);

  return (
    <div className="mt-[0.4rem] first:mt-0">
      <GroupHeader title={title} count={blocks.length} />
      <ul className="m-0 flex list-none flex-wrap gap-x-[0.1rem] gap-y-[0.24rem] pl-0">
        {visible.map((block) => (
          <UnlockSyllable
            key={block.input}
            item={block}
            state={progress.state[stateKey("syllable", block.input)]}
          />
        ))}
      </ul>
      <ShowMore
        step={SYLLABLE_PAGE}
        shown={visible.length}
        total={blocks.length}
        onMore={() => setLimit(limit + SYLLABLE_PAGE)}
      />
    </div>
  );
}
