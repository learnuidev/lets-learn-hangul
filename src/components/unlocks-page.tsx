import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Circle } from "@/components/circle";
import { Figure } from "@/components/figure";
import {
  ALL_LEVELS,
  FilterPills,
  LevelSelect,
  matchesLevel,
  type FilterOption,
} from "@/components/filters";
import { Section, SectionProse } from "@/components/section";
import { ShowMore } from "@/components/show-more";
import { UnlockLettersTable } from "@/components/unlock-letters-table";
import { UnlockSyllable } from "@/components/unlock-syllable";
import { UnlockWord } from "@/components/unlock-word";
import { useUnlocks } from "@/hooks/use-unlocks";
import { geometric } from "@/data/geometric";
import type { Level, Round } from "@/data/types";
import { nextLessonToTake } from "@/lib/resume";
import {
  gainForLesson,
  stateKey,
  type UnlockCounts,
  type UnlockItem,
  type UnlockState,
  type UnlockStatus,
} from "@/lib/unlocks";
import { cn } from "@/lib/utils";

interface UnlocksPageProps {
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}

/**
 * How many cells one "Show more" step adds — whole rows of the 100px module.
 * Words come 100 at a time.
 */
const SYLLABLE_PAGE = 80;
const WORD_PAGE = 100;

type Filter = "all" | UnlockStatus;

/**
 * The collection screen: what the letters learned so far can actually read.
 *
 * Everything here is derived — see `src/lib/unlocks.ts`. A syllable is *read*
 * when every letter it is spelled with has been taught, *half-read* when only
 * some have, and *locked* before its first letter shows up in a lesson.
 *
 * The saved profile lives in `localStorage`, so the server renders the stage
 * with dashes and the collection as locked; both fill in after mount.
 */
export function UnlocksPage({ levels, rounds }: UnlocksPageProps) {
  const { index, progress, ready } = useUnlocks(rounds);

  const known = progress.known;
  const next = nextLessonToTake(levels, progress.done);
  const nextRound = next ? rounds[`${next.level}.${next.round}`] : null;
  const nextLevel = next ? levels[String(next.level)] : null;
  const nextLessonKey = next ? `${next.level}.${next.round}` : null;
  // What the next lesson would actually hand over, given the letters known now.
  const upcoming = useMemo(
    () =>
      nextLessonKey
        ? gainForLesson(index, known, nextLessonKey)
        : { syllables: 0, words: 0 },
    [index, known, nextLessonKey],
  );
  const show = (value: number | string) => (ready ? value : "—");

  const actions = (
    <>
      <Button variant="bare" arrow="back" asChild>
        <Link to="/">Back</Link>
      </Button>
      <Button arrow="forward" data-autofocus="true" className="ml-[0.4rem]" asChild>
        {next ? (
          <Link
            to="/level/$level/round/$round"
            params={{ level: String(next.level), round: String(next.round) }}
          >
            Keep going
          </Link>
        ) : (
          <Link to="/learnedeverything">Continue</Link>
        )}
      </Button>
    </>
  );

  return (
    <>
      <div className="radial mt-[30px] w-[1000px] wide:h-[600px] wide:min-h-[600px] tablet-down:mt-0 tablet-down:min-h-[520px] tablet-down:w-auto">
        {/* Title disc — the stats page's, with the collection's own promise. */}
        <div className="ml-[-228px] mt-[-56px] h-[298px] w-[298px] tablet-down:mt-[-136px] tablet-down:ml-0 tablet-down:h-[240px] tablet-down:w-[240px]">
          <Circle
            r={298}
            className="absolute top-0 left-0 h-[298px] w-[298px] tablet-down:h-[240px] tablet-down:w-[240px]"
            pop={0}
            popScale={0.5}
          />
          <div className="relative z-1 flex h-full w-full flex-col items-center justify-center text-center">
            <h1 className="m-0 text-[0.8888rem] leading-[0.95rem] font-semibold uppercase text-brand-blue tablet-down:text-[0.72rem] tablet-down:leading-[0.78rem]">
              Unlocks
            </h1>
            <p className="mt-[0.18rem] mb-0 text-[0.3333rem] leading-[0.46rem] uppercase opacity-50">
              {show(progress.syllables.full + progress.words.full)} pieces
              <br />
              you can read
            </p>
          </div>
        </div>

        {/* Headline figure: the syllable blocks, one size up like "Words Read". */}
        <Figure
          className="ml-[40px] mt-[-100px] text-[1.5rem] tablet-down:ml-[-86px] tablet-down:mt-[-6px] tablet-down:text-[1rem]"
          circle="h-[4.8rem] w-[4.8rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Syllables"
          labelClassName="-top-[0.1rem] -left-[0.62rem] tablet-down:-top-[0.26rem] tablet-down:-left-[0.42rem]"
          value={show(progress.syllables.full)}
          detail={`of ${index.syllables.length}`}
          tone="text-brand-blue"
        />

        <Figure
          className="ml-[170px] mt-[60px] text-[1.1111rem] tablet-down:ml-[86px] tablet-down:mt-[-6px] tablet-down:text-[0.9rem]"
          circle="h-[3.6rem] w-[3.6rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Words"
          labelClassName="top-[0.1rem] -left-[0.42rem] tablet-down:top-[0.04rem] tablet-down:-left-[0.3rem]"
          value={show(progress.words.full)}
          detail={`of ${index.words.length}`}
          tone="text-brand-purple"
        />

        <Figure
          className="ml-[300px] mt-[132px] text-[0.95rem] tablet-down:ml-[-86px] tablet-down:mt-[104px] tablet-down:text-[0.85rem]"
          circle="h-[3rem] w-[3rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Halfway"
          labelClassName="top-[0.16rem] -left-[0.6rem] tablet-down:-left-[0.44rem]"
          value={show(progress.syllables.partial + progress.words.partial)}
          detail="half-read"
          tone="text-brand-orange"
        />

        <Figure
          className="ml-[-150px] mt-[166px] text-[1.05rem] tablet-down:mt-[196px] tablet-down:ml-0 tablet-down:text-[0.85rem]"
          circle="h-[3.4rem] w-[3.4rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Letters"
          labelClassName="top-[0.1rem] -left-[0.42rem] tablet-down:-left-[0.4rem]"
          value={show(progress.letters.filter((letter) => letter.known).length)}
          detail={`of ${progress.letters.length}`}
          tone="text-brand-green"
        />

        {/* Centred under the discs, exactly as the stats page places its pair. */}
        <div className="absolute top-[50%] left-[50%] mt-[286px] flex items-center justify-center tablet-down:hidden">
          {actions}
        </div>
      </div>

      {/* Below 900px the stage cannot hold the pair, so it flows underneath. */}
      <div className="hidden items-center justify-center tablet-down:my-[1.5rem] tablet-down:flex">
        {actions}
      </div>

      <Section title="Next up" wide>
        {next && nextRound && nextLevel ? (
          <p className="m-0 max-w-[640px]">
            <b className="uppercase">{nextLevel.name}</b> · {nextRound.name}
            {(nextRound.jamo ?? []).length > 0 && (
              <span className="ml-[0.24rem] font-korean text-[0.5rem] opacity-70">
                {nextRound.jamo?.map((jamo) => (jamo === "-" ? "ㅇ" : jamo)).join(" ")}
              </span>
            )}
            <span className="ml-[0.24rem]">
              {upcoming.syllables + upcoming.words > 0 ? (
                <>
                  completes{" "}
                  <b className="text-brand-blue">{upcoming.syllables}</b> syllables and{" "}
                  <b className="text-brand-blue">{upcoming.words}</b> words.
                </>
              ) : (
                <>
                  makes nothing new readable yet — what you have still needs
                  letters from earlier lessons.
                </>
              )}
            </span>
          </p>
        ) : (
          <p className="m-0 max-w-[640px]">
            Every letter is learned, so all {index.syllables.length} syllables and{" "}
            {index.words.length} words are readable.
          </p>
        )}
      </Section>

      <Section title="Letters" wide>
        <SectionProse className="mb-[0.3rem]">
          The whole alphabet, as the end of a round lays it out. Letters you have
          finished the lesson for are lit; the rest are still ghosts. Hover one to
          see how it sounds, or open it to see everything it spells.
        </SectionProse>
        <UnlockLettersTable
          geometric={geometric}
          known={known}
          title={(letter) =>
            `${letter} — ${index.syllablesForLetter[letter]?.length ?? 0} syllables, ${
              index.wordsForLetter[letter]?.length ?? 0
            } words`
          }
        />
      </Section>

      <SyllableSection
        items={index.syllables}
        counts={progress.syllables}
        states={progress.state}
        ready={ready}
      />

      <WordSection
        items={index.words}
        counts={progress.words}
        states={progress.state}
        known={known}
        ready={ready}
      />

      <p className="mt-[1.6rem] border-t border-ink/10 pt-[0.5rem] pb-[20px] text-[14px] leading-[22px] opacity-50 tablet-down:mx-[1.1rem] tablet-down:pb-[60px]">
        {index.syllables.length.toLocaleString("en-US")} syllable blocks and{" "}
        {index.words.length.toLocaleString("en-US")} words from the Korean
        vocabulary set. Recorded in this browser only — no account, no server.
        Written, designed, and built by{" "}
        <a href="http://noahburney.net" target="_blank" rel="noreferrer">
          Noah Burney
        </a>
        . See{" "}
        <Link to="/credits" className="text-brand-blue">
          audio and photo credits
        </Link>
        .
      </p>
    </>
  );
}

/** The state filter's options, with the counts of the subset it is applied to. */
function stateOptions(counts: UnlockCounts): FilterOption[] {
  return [
    { value: "all", label: "All", count: counts.total },
    { value: "full", label: "Read", count: counts.full },
    { value: "partial", label: "Half-read", count: counts.partial },
    { value: "locked", label: "Locked", count: counts.locked },
  ];
}

/** A one-line key to the three states, using the same discs as the collection. */
function Legend() {
  const items: { fill: string; tone: string; text: string }[] = [
    { fill: "white", tone: "text-ink", text: "read" },
    { fill: "white", tone: "text-ink/45", text: "half-read" },
    { fill: "#e7e0d1", tone: "text-ink/25", text: "locked" },
  ];

  return (
    <div className="mb-[0.3rem] flex flex-wrap items-center gap-x-[0.4rem] gap-y-[0.1rem]">
      {items.map((item) => (
        <span key={item.text} className="inline-flex items-center gap-[0.1rem]">
          <span className="relative block h-[0.34rem] w-[0.34rem]">
            <Circle fill={item.fill} className="absolute top-0 left-0 h-full w-full" />
            <span
              className={cn(
                "relative z-1 flex h-full w-full items-center justify-center text-[0.26rem] leading-none font-bold",
                item.tone,
              )}
            >
              가
            </span>
          </span>
          <span className="text-[11px] leading-[14px] uppercase tracking-[0.06em] opacity-40">
            {item.text}
          </span>
        </span>
      ))}
    </div>
  );
}

function banner(counts: UnlockCounts): string {
  if (counts.full === counts.total) return `All ${counts.total} readable!`;
  return `${counts.full} readable · ${counts.partial} half-read`;
}

function SyllableSection({
  items,
  counts,
  states,
  ready,
}: {
  items: readonly UnlockItem[];
  counts: UnlockCounts;
  states: Record<string, UnlockState>;
  ready: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(SYLLABLE_PAGE);

  const filtered =
    filter === "all"
      ? items
      : items.filter((item) => states[stateKey("syllable", item.input)]?.status === filter);
  const visible = filtered.slice(0, limit);

  return (
    <Section title="Syllable blocks" wide>
      <SectionProse className="mb-[0.3rem]">
        {ready ? banner(counts) : "Reading your saved progress…"} — the blue line
        under each block is how it sounds. A block turns white once every letter
        it is spelled with has come up in a lesson; open one to see the words it
        appears in.
      </SectionProse>
      <FilterPills
        options={stateOptions(counts)}
        value={filter}
        onChange={(next) => {
          setFilter(next as Filter);
          setLimit(SYLLABLE_PAGE);
        }}
        label="Filter syllables"
        className="mb-[0.32rem]"
      />
      <Legend />
      <ul className="m-0 flex list-none flex-wrap pl-0">
        {visible.map((item) => (
          <UnlockSyllable
            key={item.input}
            item={item}
            state={states[stateKey("syllable", item.input)]}
          />
        ))}
      </ul>
      <ShowMore
        step={SYLLABLE_PAGE}
        shown={visible.length}
        total={filtered.length}
        onMore={() => setLimit(limit + SYLLABLE_PAGE)}
      />
    </Section>
  );
}

function WordSection({
  items,
  counts,
  states,
  known,
  ready,
}: {
  items: readonly UnlockItem[];
  counts: UnlockCounts;
  states: Record<string, UnlockState>;
  known: ReadonlySet<string>;
  ready: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [level, setLevel] = useState<string>(ALL_LEVELS);
  const [limit, setLimit] = useState(WORD_PAGE);

  // The state pills always describe the whole collection; the level dropdown
  // describes whatever state is selected, so "Locked" can tell you how much of
  // it is A1 and how much is B2. The grid is the intersection of the two.
  const byState =
    filter === "all"
      ? items
      : items.filter((item) => states[stateKey("word", item.input)]?.status === filter);
  const filtered = byState.filter((item) => matchesLevel(item, level));
  const visible = filtered.slice(0, limit);

  return (
    <Section
      title="Words"
      wide
      controls={
        <LevelSelect
          words={byState}
          value={level}
          onChange={(next) => {
            setLevel(next);
            setLimit(WORD_PAGE);
          }}
        />
      }
    >
      <SectionProse className="mb-[0.3rem]">
        {ready ? banner(counts) : "Reading your saved progress…"} — pronunciation in
        blue, meaning after it, and the letters still missing in red along the
        bottom. Syllables you can already read stay dark; the pale ones are still
        waiting on a letter.
      </SectionProse>
      <FilterPills
        options={stateOptions(counts)}
        value={filter}
        onChange={(next) => {
          setFilter(next as Filter);
          setLimit(WORD_PAGE);
        }}
        label="Filter words"
        className="mb-[0.32rem]"
      />
      <ul className="m-0 flex list-none flex-wrap pl-0">
        {visible.map((item) => (
          <UnlockWord
            key={item.input}
            item={item}
            state={states[stateKey("word", item.input)]}
            known={known}
          />
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="m-0 py-[0.3rem] text-[15px] leading-[20px] opacity-45">
          No words match those filters.
        </p>
      )}
      <ShowMore
        step={WORD_PAGE}
        shown={visible.length}
        total={filtered.length}
        onMore={() => setLimit(limit + WORD_PAGE)}
      />
    </Section>
  );
}
