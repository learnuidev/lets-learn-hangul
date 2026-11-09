import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Circle } from "@/components/circle";
import { Figure } from "@/components/figure";
import { JamoLink } from "@/components/jamo-link";
import { Section } from "@/components/section";
import { WordGroup } from "@/components/unlock-group";
import { useUnlocks } from "@/hooks/use-unlocks";
import type { Level, Round } from "@/data/types";
import { nextLessonToTake, parseLessonKey } from "@/lib/resume";
import { stateKey } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

interface UnlocksBlockPageProps {
  /** The syllable block from the URL, e.g. `버`. */
  block: string;
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}

/**
 * One syllable block's own page: every word it appears in, split by whether the
 * learner can read it yet.
 *
 * The words come from the reverse index in `src/lib/unlocks.ts`; the three
 * groups answer the two questions the collection raises — what has opened, and
 * what is closest to opening.
 */
export function UnlocksBlockPage({ block, levels, rounds }: UnlocksBlockPageProps) {
  const { index, progress, ready } = useUnlocks(rounds);

  const item = index.blockByInput[block];
  const show = (value: number | string) => (ready ? value : "—");
  const next = nextLessonToTake(levels, progress.done);

  if (!item) {
    return (
      <UnlocksMissing block={block} total={index.syllables.length} />
    );
  }

  const state = progress.state[stateKey("syllable", item.input)];
  const status = state?.status ?? "locked";
  const missing = state?.missing ?? [];

  const words = index.wordsForBlock[block] ?? [];
  const read = words.filter(
    (word) => progress.state[stateKey("word", word.input)]?.status === "full",
  );
  const almost = words.filter((word) => {
    const wordState = progress.state[stateKey("word", word.input)];
    return wordState?.status === "partial" && wordState.missing.length === 1;
  });
  const readSet = new Set(read.map((word) => word.input));
  const almostSet = new Set(almost.map((word) => word.input));
  const rest = words.filter(
    (word) => !readSet.has(word.input) && !almostSet.has(word.input),
  );

  // The lesson that teaches the last of this block's letters.
  const lessonRound = rounds[item.lesson];
  const [lessonLevelNumber] = parseLessonKey(item.lesson);
  const lessonLevel = lessonRound ? levels[String(lessonLevelNumber)] : undefined;

  const actions = (
    <>
      <Button variant="bare" arrow="back" asChild>
        <Link to="/unlocks">Unlocks</Link>
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
        {/* The block itself, in the same disc the collection and stats use. */}
        <div className="ml-[-228px] mt-[-56px] h-[298px] w-[298px] tablet-down:mt-[-136px] tablet-down:ml-0 tablet-down:h-[240px] tablet-down:w-[240px]">
          <Circle
            r={298}
            className="absolute top-0 left-0 h-[298px] w-[298px] tablet-down:h-[240px] tablet-down:w-[240px]"
            pop={0}
            popScale={0.5}
          />
          <div className="relative z-1 flex h-full w-full flex-col items-center justify-center px-[1rem] text-center">
            <span
              className={cn(
                "font-korean text-[1.5rem] leading-none font-bold",
                status === "full"
                  ? "text-ink"
                  : status === "partial"
                    ? "text-ink/55"
                    : "text-ink/30",
              )}
            >
              {block}
            </span>
            <span
              className={cn(
                "mt-[0.12rem] text-[0.5rem] leading-[0.6rem] font-semibold",
                status === "locked" ? "text-brand-blue/55" : "text-brand-blue",
              )}
            >
              {item.roman}
            </span>
            <span className="mt-[0.08rem] text-[0.3333rem] leading-[0.44rem] uppercase opacity-50">
              {item.en}
            </span>
            <span className="mt-[0.16rem] text-[0.3rem] leading-[0.4rem] uppercase tracking-[0.06em] opacity-40">
              {status === "full" ? "readable" : status === "partial" ? "half-read" : "locked"}
            </span>
          </div>
        </div>

        <Figure
          className="ml-[40px] mt-[-100px] text-[1.5rem] tablet-down:ml-[-86px] tablet-down:mt-[-6px] tablet-down:text-[1rem]"
          circle="h-[4.8rem] w-[4.8rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Words"
          labelClassName="-top-[0.1rem] -left-[0.44rem] tablet-down:-top-[0.26rem] tablet-down:-left-[0.3rem]"
          value={show(read.length)}
          detail={`of ${words.length}`}
          tone="text-brand-blue"
        />

        <Figure
          className="ml-[170px] mt-[60px] text-[1.1111rem] tablet-down:ml-[86px] tablet-down:mt-[-6px] tablet-down:text-[0.9rem]"
          circle="h-[3.6rem] w-[3.6rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Letters"
          labelClassName="top-[0.1rem] -left-[0.42rem] tablet-down:top-[0.04rem] tablet-down:-left-[0.3rem]"
          value={show(item.letters.filter((letter) => progress.known.has(letter)).length)}
          detail={`of ${item.letters.length}`}
          tone="text-brand-green"
        />

        <Figure
          className="ml-[300px] mt-[132px] text-[0.95rem] tablet-down:ml-[-86px] tablet-down:mt-[104px] tablet-down:text-[0.85rem]"
          circle="h-[3rem] w-[3rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Almost"
          labelClassName="top-[0.16rem] -left-[0.5rem] tablet-down:-left-[0.44rem]"
          value={show(almost.length)}
          detail="off by one"
          tone="text-brand-orange"
        />

        <div className="absolute top-[50%] left-[50%] mt-[286px] flex items-center justify-center tablet-down:hidden">
          {actions}
        </div>
      </div>

      <div className="hidden items-center justify-center tablet-down:my-[1.5rem] tablet-down:flex">
        {actions}
      </div>

      <Section title="Letters">
        <ul className="m-0 flex list-none flex-wrap gap-x-[0.24rem] gap-y-[0.16rem] pl-0">
          {item.letters.map((letter, i) => (
            <li key={letter}>
              <JamoLink
                letter={letter}
                known={progress.known.has(letter)}
                delay={progress.known.has(letter) ? 0.04 * i : false}
                size="large"
                title={`${letter} — every block and word it spells`}
              />
            </li>
          ))}
        </ul>
        <p className="m-0 mt-[0.26rem]">
          {status === "full" ? (
            <>You know every letter in this block, so you can read it.</>
          ) : (
            <>
              Still missing{" "}
              <b className="text-brand-red">{missing.join(" ")}</b>
              {lessonRound && lessonLevel ? (
                <>
                  {" "}
                  — {missing.length === 1 ? "it comes" : "they come"} up in{" "}
                  <Link
                    to="/level/$level/round/$round"
                    params={{
                      level: String(lessonLevel.level),
                      round: String(lessonRound.round),
                    }}
                    className="text-brand-blue"
                  >
                    {lessonLevel.name} · {lessonRound.name}
                  </Link>
                  .
                </>
              ) : (
                "."
              )}
            </>
          )}
        </p>
      </Section>

      <Section title={`Words with ${block}`}>
        <p className="m-0 mb-[0.4rem] text-[15px] leading-[20px] opacity-55">
          {words.length === 0
            ? "No word in the collection is spelled with this block on its own."
            : `${words.length} ${words.length === 1 ? "word uses" : "words use"} this block — ${read.length} readable now, ${almost.length} one letter away.`}
        </p>
        <WordGroup title="Read now" words={read} progress={progress} highlight={block} />
        <WordGroup
          title="One letter away"
          words={almost}
          progress={progress}
          highlight={block}
        />
        <WordGroup
          title="Still needs letters"
          words={rest}
          progress={progress}
          highlight={block}
        />
      </Section>

      <p className="mt-[1.6rem] border-t border-ink/10 pt-[0.5rem] pb-[20px] text-[14px] leading-[22px] opacity-50 tablet-down:mx-[1.1rem] tablet-down:pb-[60px]">
        Pronunciations follow the same rules the lessons teach. Back to{" "}
        <Link to="/unlocks" className="text-brand-blue">
          everything you can read
        </Link>
        .
      </p>
    </>
  );
}

/** A block that is not in the collection — only reachable by typing a URL. */
function UnlocksMissing({ block, total }: { block: string; total: number }) {
  return (
    <>
      <div className="radial mt-[30px] w-[1000px] wide:h-[380px] wide:min-h-[380px] tablet-down:mt-0 tablet-down:min-h-[300px] tablet-down:w-auto">
        <div className="ml-[-228px] mt-[-40px] h-[240px] w-[240px] tablet-down:mt-[-100px] tablet-down:ml-0">
          <Circle r={240} className="absolute top-0 left-0 h-[240px] w-[240px]" pop={0} popScale={0.5} />
          <div className="relative z-1 flex h-full w-full flex-col items-center justify-center px-[1rem] text-center">
            <span className="font-korean text-[1.3rem] leading-none font-bold opacity-25">
              {block.slice(0, 3)}
            </span>
            <span className="mt-[0.14rem] text-[0.3333rem] leading-[0.46rem] uppercase opacity-50">
              not in the collection
            </span>
          </div>
        </div>
      </div>

      <Section title="Nothing here">
        <p className="m-0">
          “{block}” isn’t one of the {total} syllable blocks in the collection.
          Every block is a single modern Hangul syllable — pick one from{" "}
          <Link to="/unlocks" className="text-brand-blue">
            the unlocks page
          </Link>
          .
        </p>
        <Button variant="bare" arrow="back" className="mt-[0.4rem]" asChild>
          <Link to="/unlocks">Back to unlocks</Link>
        </Button>
      </Section>
    </>
  );
}
