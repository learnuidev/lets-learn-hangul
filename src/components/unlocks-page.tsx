import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Circle } from "@/components/circle";
import { Figure } from "@/components/figure";
import { useUnlocks } from "@/hooks/use-unlocks";
import type { Level, Round } from "@/data/types";
import { getJamoHint } from "@/lib/display";
import { nextLesson } from "@/lib/resume";
import { canRead, stateKey, type UnlockCounts, type UnlockItem, type UnlockState, type UnlockStatus } from "@/lib/unlocks";
import { useUser } from "@/providers/user-store";
import { cn } from "@/lib/utils";

interface UnlocksPageProps {
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}

/** How many items one "Show more" step adds. */
const SYLLABLE_PAGE = 96;
const WORD_PAGE = 60;

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
  const { user } = useUser();

  const known = progress.known;
  const next = nextLesson(levels, user.latest);
  const nextRound = next ? rounds[`${next.level}.${next.round}`] : null;
  const nextLevel = next ? levels[String(next.level)] : null;
  const upcoming = next
    ? (index.byLesson[`${next.level}.${next.round}`] ?? { syllables: 0, words: 0 })
    : { syllables: 0, words: 0 };
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

      <Section title="Next up">
        {next && nextRound && nextLevel ? (
          <p className="m-0">
            <b className="uppercase">{nextLevel.name}</b> · {nextRound.name}
            {(nextRound.jamo ?? []).length > 0 && (
              <span className="ml-[0.24rem] font-korean text-[0.5rem] opacity-70">
                {nextRound.jamo?.map((jamo) => (jamo === "-" ? "ㅇ" : jamo)).join(" ")}
              </span>
            )}
            <span className="ml-[0.24rem]">
              completes{" "}
              <b className="text-brand-blue">{upcoming.syllables}</b> syllables and{" "}
              <b className="text-brand-blue">{upcoming.words}</b> words.
            </span>
          </p>
        ) : (
          <p className="m-0">
            Every letter is learned, so all {index.syllables.length} syllables and{" "}
            {index.words.length} words are readable.
          </p>
        )}
      </Section>

      <Section title="Letters">
        <p className="m-0 mb-[0.3rem] text-[15px] leading-[20px] opacity-55">
          In the order the course introduces them. Each block and word below is
          waiting on the letters still greyed out here.
        </p>
        <ul className="flex flex-wrap gap-x-[0.16rem] gap-y-[0.2rem]">
          {progress.letters.map((letter, i) => (
            <li key={letter.letter} className="flex w-[0.92rem] flex-col items-center">
              <span className="relative block h-[0.72rem] w-[0.72rem]">
                <Circle
                  fill={letter.known ? "white" : "#e7e0d1"}
                  className="absolute top-0 left-0 h-full w-full"
                  pop={letter.known ? 0.02 * i : false}
                  popScale={0.5}
                />
                <span
                  className={cn(
                    "relative z-1 flex h-full w-full items-center justify-center text-[0.36rem] leading-none font-bold",
                    letter.known ? "text-ink" : "text-ink/25",
                  )}
                >
                  {letter.letter}
                </span>
              </span>
              <span
                className={cn(
                  "mt-[0.05rem] text-[11px] leading-[12px] font-semibold lowercase",
                  letter.known ? "opacity-40" : "opacity-20",
                )}
              >
                {getJamoHint(letter.letter)}
              </span>
            </li>
          ))}
        </ul>
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

/**
 * A titled block under the stage, aligned with the title disc like the stats
 * page's sections so every "data" screen reads as one column.
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-[1.1rem] max-w-[760px] pl-[150px] tablet-down:mt-[1.2rem] tablet-down:max-w-none tablet-down:pr-[1.1rem] tablet-down:pl-[2.8rem]">
      <label className="mb-[0.1rem] text-brand-blue">{title}</label>
      {children}
    </section>
  );
}

/** The pill row that switches which state a collection shows. */
function FilterRow({
  value,
  counts,
  onChange,
  label,
}: {
  value: Filter;
  counts: UnlockCounts;
  onChange: (next: Filter) => void;
  label: string;
}) {
  const options: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.total },
    { value: "full", label: "Read", count: counts.full },
    { value: "partial", label: "Half-read", count: counts.partial },
    { value: "locked", label: "Locked", count: counts.locked },
  ];

  return (
    <div className="mb-[0.32rem] flex flex-wrap items-center gap-[0.1rem]" role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[4px] px-[9px] py-[4px] text-[12px] leading-[15px] font-bold uppercase tracking-[0.06em]",
              "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
              active ? "bg-brand-blue-soft text-brand-blue" : "text-ink/40 hover:text-ink/70",
            )}
          >
            {option.label}
            <span className="ml-[3px] opacity-60">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
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
    <Section title="Syllable blocks">
      <p className="m-0 mb-[0.3rem] text-[15px] leading-[20px] opacity-55">
        {ready ? banner(counts) : "Reading your saved progress…"} — a block turns
        white once every letter it is spelled with has come up in a lesson.
      </p>
      <FilterRow value={filter} counts={counts} onChange={setFilter} label="Filter syllables" />
      <Legend />
      <ul className="flex flex-wrap gap-x-[0.1rem] gap-y-[0.24rem]">
        {visible.map((item) => {
          const state = states[stateKey("syllable", item.input)];
          const status = state?.status ?? "locked";
          return (
            <li
              key={item.input}
              className="flex w-[1.3rem] flex-col items-center"
              title={`${item.input} — ${item.en} (${item.detail})${
                status === "full" ? "" : ` · needs ${(state?.missing ?? []).join(" ")}`
              }`}
            >
              <span className="relative block h-[0.92rem] w-[0.92rem]">
                <Circle
                  fill={status === "locked" ? "#e7e0d1" : "white"}
                  className="absolute top-0 left-0 h-full w-full"
                />
                <span
                  className={cn(
                    "relative z-1 flex h-full w-full items-center justify-center font-korean text-[0.4rem] leading-none font-bold",
                    status === "full"
                      ? "text-ink"
                      : status === "partial"
                        ? "text-ink/45"
                        : "text-ink/25",
                  )}
                >
                  {item.input}
                </span>
              </span>
              <span
                className={cn(
                  "mt-[0.05rem] w-full truncate text-center text-[11px] leading-[13px]",
                  status === "full" ? "opacity-45" : "opacity-25",
                )}
              >
                {status === "locked" ? "\u00a0" : item.en}
              </span>
            </li>
          );
        })}
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
  const [limit, setLimit] = useState(WORD_PAGE);

  const filtered =
    filter === "all"
      ? items
      : items.filter((item) => states[stateKey("word", item.input)]?.status === filter);
  const visible = filtered.slice(0, limit);

  return (
    <Section title="Words">
      <p className="m-0 mb-[0.3rem] text-[15px] leading-[20px] opacity-55">
        {ready ? banner(counts) : "Reading your saved progress…"} — syllables you
        can already read stay dark; the pale ones are still waiting on a letter.
      </p>
      <FilterRow value={filter} counts={counts} onChange={setFilter} label="Filter words" />
      <ul className="wide:columns-2 wide:gap-[1.6rem]">
        {visible.map((item) => {
          const state = states[stateKey("word", item.input)];
          const status = state?.status ?? "locked";
          return (
            <li
              key={item.input}
              className="flex items-baseline gap-[0.24rem] break-inside-avoid border-b border-ink/10 py-[0.09rem]"
            >
              <span
                className={cn(
                  "shrink-0 text-[0.5rem] leading-[0.68rem] font-bold",
                  status === "locked" && "opacity-30",
                )}
              >
                {(item.blocks ?? Array.from(item.input)).map((block, i) => (
                  <span
                    key={`${block}-${i}`}
                    className={cn(
                      "font-korean",
                      canRead(block, known).readable ? "text-ink" : "text-ink/25",
                    )}
                  >
                    {block}
                  </span>
                ))}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px] leading-[16px]",
                  status === "full" ? "opacity-45" : "opacity-25",
                )}
              >
                {item.en}
              </span>
              {status === "partial" && (
                <span className="shrink-0 text-[11px] leading-[14px] font-semibold text-brand-red/70">
                  needs {(state?.missing ?? []).join(" ")}
                </span>
              )}
              {item.detail && (
                <span className="shrink-0 text-[11px] leading-[14px] uppercase opacity-25">
                  {item.detail}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <ShowMore
        step={WORD_PAGE}
        shown={visible.length}
        total={filtered.length}
        onMore={() => setLimit(limit + WORD_PAGE)}
      />
    </Section>
  );
}

/** "Show more", with the running count so the collection's size stays honest. */
function ShowMore({
  step,
  shown,
  total,
  onMore,
}: {
  step: number;
  shown: number;
  total: number;
  onMore: () => void;
}) {
  if (shown >= total) {
    return total === 0 ? null : (
      <p className="mt-[0.24rem] mb-0 text-[11px] leading-[14px] uppercase tracking-[0.08em] opacity-30">
        that’s all {total}
      </p>
    );
  }

  return (
    <div className="mt-[0.28rem] flex items-baseline gap-[0.3rem]">
      <Button variant="link" size="none" onClick={onMore}>
        Show {Math.min(step, total - shown)} more
      </Button>
      <span className="text-[11px] leading-[14px] uppercase tracking-[0.08em] opacity-30">
        {shown} of {total}
      </span>
    </div>
  );
}
