import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Circle } from "@/components/circle";
import { Figure } from "@/components/figure";
import { JamoLink } from "@/components/jamo-link";
import { Section } from "@/components/section";
import { SyllableGroup, WordGroup } from "@/components/unlock-group";
import { useUnlocks } from "@/hooks/use-unlocks";
import type { Level, Round } from "@/data/types";
import { getJamoHint } from "@/lib/display";
import { nextLessonToTake, parseLessonKey } from "@/lib/resume";
import { stateKey, type UnlockItem, type UnlockKind } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

interface UnlocksLetterPageProps {
  /** The letter from the URL, e.g. `ㄱ`. */
  letter: string;
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}

/** One letter's own page: what it is spelled into, and how much of that is open. */
export function UnlocksLetterPage({ letter, levels, rounds }: UnlocksLetterPageProps) {
  const { index, progress, ready } = useUnlocks(rounds);

  const show = (value: number | string) => (ready ? value : "—");
  const next = nextLessonToTake(levels, progress.done);

  const entry = progress.letters.find((item) => item.letter === letter);
  if (!entry) {
    return <UnlocksLetterMissing letter={letter} total={progress.letters.length} />;
  }

  const known = entry.known;
  // Both are fixed by the course, not by the saved profile, so neither is dashed
  // while the profile loads.
  const position = progress.letters.indexOf(entry) + 1;
  const total = progress.letters.length;

  const syllables = index.syllablesForLetter[letter] ?? [];
  const words = index.wordsForLetter[letter] ?? [];

  /**
   * Split one collection the same way a block's page splits its words: what is
   * readable now, what only this letter is holding back, and the rest.
   */
  const split = (items: readonly UnlockItem[], kind: UnlockKind) => {
    const groups = {
      read: [] as UnlockItem[],
      almost: [] as UnlockItem[],
      rest: [] as UnlockItem[],
    };
    for (const item of items) {
      const itemState = progress.state[stateKey(kind, item.input)];
      if (itemState?.status === "full") groups.read.push(item);
      else if (
        itemState?.status === "partial" &&
        itemState.missing.length === 1 &&
        itemState.missing[0] === letter
      ) {
        groups.almost.push(item);
      } else {
        groups.rest.push(item);
      }
    }
    return groups;
  };

  const syllableGroups = split(syllables, "syllable");
  const wordGroups = split(words, "word");
  const almost = syllableGroups.almost.length + wordGroups.almost.length;

  // Which blocks carry this letter — the ones each word calls out in blue.
  const blocksWithLetter: ReadonlySet<string> = new Set(
    syllables.map((syllable) => syllable.input),
  );

  // The lesson that introduces this letter, and the letters that arrive with it.
  const lessonRound = rounds[entry.lesson];
  const [lessonLevelNumber] = parseLessonKey(entry.lesson);
  const lessonLevel = lessonRound ? levels[String(lessonLevelNumber)] : undefined;
  const siblings = Array.from(
    new Set(index.course.lettersByLesson[entry.lesson] ?? []),
  ).filter((other) => other !== letter);

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
        {/* The letter itself, in the same disc the collection and stats use. */}
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
                known ? "text-ink" : "text-ink/30",
              )}
            >
              {letter}
            </span>
            <span
              className={cn(
                "mt-[0.14rem] text-[0.5rem] leading-[0.6rem] font-semibold lowercase",
                known ? "text-brand-blue" : "text-brand-blue/55",
              )}
            >
              {getJamoHint(letter)}
            </span>
            <span className="mt-[0.08rem] text-[0.3333rem] leading-[0.44rem] uppercase opacity-50">
              letter {position} of {total}
            </span>
            <span className="mt-[0.16rem] text-[0.3rem] leading-[0.4rem] uppercase tracking-[0.06em] opacity-40">
              {known ? "learned" : "not yet"}
            </span>
          </div>
        </div>

        <Figure
          className="ml-[40px] mt-[-100px] text-[1.5rem] tablet-down:ml-[-86px] tablet-down:mt-[-6px] tablet-down:text-[1rem]"
          circle="h-[4.8rem] w-[4.8rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Syllables"
          labelClassName="-top-[0.1rem] -left-[0.62rem] tablet-down:-top-[0.26rem] tablet-down:-left-[0.42rem]"
          value={show(syllableGroups.read.length)}
          detail={`of ${syllables.length}`}
          tone="text-brand-blue"
        />

        <Figure
          className="ml-[170px] mt-[60px] text-[1.1111rem] tablet-down:ml-[86px] tablet-down:mt-[-6px] tablet-down:text-[0.9rem]"
          circle="h-[3.6rem] w-[3.6rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Words"
          labelClassName="top-[0.1rem] -left-[0.42rem] tablet-down:top-[0.04rem] tablet-down:-left-[0.3rem]"
          value={show(wordGroups.read.length)}
          detail={`of ${words.length}`}
          tone="text-brand-purple"
        />

        <Figure
          className="ml-[300px] mt-[132px] text-[0.95rem] tablet-down:ml-[-86px] tablet-down:mt-[104px] tablet-down:text-[0.85rem]"
          circle="h-[3rem] w-[3rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Almost"
          labelClassName="top-[0.16rem] -left-[0.5rem] tablet-down:-left-[0.44rem]"
          value={show(almost)}
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

      <Section title="Taught in">
        <p className="m-0">
          {lessonRound && lessonLevel ? (
            <>
              <Link
                to="/level/$level/round/$round"
                params={{
                  level: String(lessonLevel.level),
                  round: String(lessonRound.round),
                }}
                className="text-brand-blue"
              >
                {lessonLevel.name} · {lessonRound.name}
              </Link>{" "}
              — {known ? "learned." : "not learned yet."}
            </>
          ) : (
            <>The lesson that introduces this letter is no longer in the course.</>
          )}
        </p>
        {siblings.length > 0 && (
          <>
            <p className="m-0 mt-[0.26rem] mb-[0.16rem] text-[15px] leading-[20px] opacity-55">
              In the same lesson:
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-x-[0.24rem] gap-y-[0.16rem] pl-0">
              {siblings.map((sibling, i) => (
                <li key={sibling}>
                  <JamoLink
                    letter={sibling}
                    known={progress.known.has(sibling)}
                    delay={progress.known.has(sibling) ? 0.04 * i : false}
                    size="large"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section title={`Syllable blocks with ${letter}`}>
        <p className="m-0 mb-[0.4rem] text-[15px] leading-[20px] opacity-55">
          {syllables.length === 0
            ? "No syllable block in the collection is spelled with this letter."
            : `${syllables.length} ${syllables.length === 1 ? "block uses" : "blocks use"} this letter — ${show(syllableGroups.read.length)} readable now, ${show(syllableGroups.almost.length)} one letter away.`}
        </p>
        <SyllableGroup title="Read now" blocks={syllableGroups.read} progress={progress} />
        <SyllableGroup
          title="One letter away"
          blocks={syllableGroups.almost}
          progress={progress}
        />
        <SyllableGroup
          title="Still needs letters"
          blocks={syllableGroups.rest}
          progress={progress}
        />
      </Section>

      <Section title={`Words with ${letter}`}>
        <p className="m-0 mb-[0.4rem] text-[15px] leading-[20px] opacity-55">
          {words.length === 0
            ? "No word in the collection is spelled with this letter."
            : `${words.length} ${words.length === 1 ? "word uses" : "words use"} this letter — ${show(wordGroups.read.length)} readable now, ${show(wordGroups.almost.length)} one letter away.`}
        </p>
        <WordGroup
          title="Read now"
          words={wordGroups.read}
          progress={progress}
          highlight={blocksWithLetter}
        />
        <WordGroup
          title="One letter away"
          words={wordGroups.almost}
          progress={progress}
          highlight={blocksWithLetter}
        />
        <WordGroup
          title="Still needs letters"
          words={wordGroups.rest}
          progress={progress}
          highlight={blocksWithLetter}
        />
      </Section>

      <p className="mt-[1.6rem] border-t border-ink/10 pt-[0.5rem] pb-[20px] text-[14px] leading-[22px] opacity-50 tablet-down:mx-[1.1rem] tablet-down:pb-[60px]">
        Everything here is spelled with {letter} somewhere. Back to{" "}
        <Link to="/unlocks" className="text-brand-blue">
          everything you can read
        </Link>
        .
      </p>
    </>
  );
}

/** A letter the course never teaches — only reachable by typing a URL. */
function UnlocksLetterMissing({ letter, total }: { letter: string; total: number }) {
  return (
    <>
      <div className="radial mt-[30px] w-[1000px] wide:h-[380px] wide:min-h-[380px] tablet-down:mt-0 tablet-down:min-h-[300px] tablet-down:w-auto">
        <div className="ml-[-228px] mt-[-40px] h-[240px] w-[240px] tablet-down:mt-[-100px] tablet-down:ml-0">
          <Circle r={240} className="absolute top-0 left-0 h-[240px] w-[240px]" pop={0} popScale={0.5} />
          <div className="relative z-1 flex h-full w-full flex-col items-center justify-center px-[1rem] text-center">
            <span className="font-korean text-[1.3rem] leading-none font-bold opacity-25">
              {letter.slice(0, 1)}
            </span>
            <span className="mt-[0.14rem] text-[0.3333rem] leading-[0.46rem] uppercase opacity-50">
              not a course letter
            </span>
          </div>
        </div>
      </div>

      <Section title="Nothing here">
        <p className="m-0">
          “{letter}” isn’t one of the {total} letters this course teaches. Cluster
          finals such as ㄳ and ㄺ are never taught as letters — level 5 introduces
          them as pronunciation rules, and the collection reads them as the two
          consonants they are made of. Pick a letter from{" "}
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
