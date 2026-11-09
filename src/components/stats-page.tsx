import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle } from "@/components/circle";
import { Figure } from "@/components/figure";
import type { Level, Round } from "@/data/types";
import { formatSeconds } from "@/lib/display";
import {
  completedLessons,
  computeStreaks,
  formatPercent,
  ratio,
  recentDays,
  totalCounts,
  type Counts,
  type DaySlice,
  type RoundRecord,
} from "@/lib/lifetime";
import { useUser } from "@/providers/user-store";
import { nextLesson } from "@/lib/resume";
import { cn } from "@/lib/utils";

interface StatsPageProps {
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}

/** Sunday-first initials, so the day discs need no locale formatting. */
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

const ACTIVITY_DAYS = 14;

/** `"1.2"` → `[1, 2]`, used only for course ordering. */
function parseRoundKey(key: string): [number, number] {
  const [level, round] = key.split(".");
  return [
    Number.parseInt(level ?? "0", 10) || 0,
    Number.parseInt(round ?? "0", 10) || 0,
  ];
}

function compareRoundKeys(a: string, b: string): number {
  const [aLevel, aRound] = parseRoundKey(a);
  const [bLevel, bRound] = parseRoundKey(b);
  return aLevel - bLevel || aRound - bRound;
}

/**
 * The learner's whole record, told in the same pieces the round summary uses:
 * a radial stage of white discs with uppercase labels, then a per-lesson
 * breakdown laid out like the course index.
 *
 * The record lives in `localStorage`, so the server renders the stage with
 * dashes and the numbers land once the saved profile has been read.
 */
export function StatsPage({ levels, rounds }: StatsPageProps) {
  const { user, ready } = useUser();
  const stats = user.stats;

  const totals = totalCounts(stats.days);
  const streaks = computeStreaks(stats.days);
  const days = recentDays(stats.days, ACTIVITY_DAYS);
  const lettersKnown = countKnownLetters(rounds, stats.rounds, user.latest);
  const practiced = Object.keys(stats.rounds).sort(compareRoundKeys);
  const nothingYet = ready && practiced.length === 0;

  const answers =
    totals.words + totals.misses + totals.quizCorrect + totals.quizWrong;
  const quizAttempts = totals.quizCorrect + totals.quizWrong;
  // Same destination as "Yes, keep going!" on the welcome-back prompt.
  const next = user.latest ? nextLesson(levels, user.latest) : null;
  const show = (value: number | string) => (ready ? value : "—");

  const actions = (
    <>
      <Button variant="bare" arrow="back" asChild>
        <Link to="/">Back</Link>
      </Button>
      <Button
        arrow="forward"
        data-autofocus="true"
        className="ml-[0.4rem]"
        asChild
      >
        {!user.latest ? (
          <Link to="/level/$level" params={{ level: "1" }}>
            Start
          </Link>
        ) : next ? (
          <Link
            to="/level/$level/round/$round"
            params={{ level: String(next.level), round: String(next.round) }}
          >
            Continue
          </Link>
        ) : (
          <Link to="/learnedeverything">Continue</Link>
        )}
      </Button>
    </>
  );

  return (
    <>
      <div className="stats radial mt-[30px] w-[1000px] wide:h-[660px] wide:min-h-[660px] tablet-down:mt-0 tablet-down:min-h-[520px] tablet-down:w-auto">
        {/*
         * On a wide screen every child of `.radial` is centred by the
         * stylesheet, so positions here are margins away from the middle of the
         * stage — the way the round summary lays its figures out. Below 900px
         * the same discs stack into two columns instead.
         */}

        {/* Title disc */}
        <div className="ml-[-228px] mt-[-56px] h-[298px] w-[298px] tablet-down:mt-[-136px] tablet-down:ml-0 tablet-down:h-[240px] tablet-down:w-[240px]">
          <Circle
            r={298}
            className="absolute top-0 left-0 h-[298px] w-[298px] tablet-down:h-[240px] tablet-down:w-[240px]"
            pop={0}
            popScale={0.5}
          />
          <div className="relative z-1 flex h-full w-full flex-col items-center justify-center text-center">
            <h1 className="m-0 text-[0.8888rem] leading-[0.95rem] font-semibold uppercase text-brand-blue tablet-down:text-[0.72rem] tablet-down:leading-[0.78rem]">
              Your&nbsp;Stats
            </h1>
            <p className="mt-[0.18rem] mb-0 text-[0.3333rem] leading-[0.46rem] uppercase opacity-50">
              {show(answers)} answers
              <br />
              on this device
            </p>
          </div>
        </div>

        {/* Headline figure — the round summary's "Words Read" bubble, one size up */}
        <Figure
          className="ml-[40px] mt-[-100px] text-[1.5rem] tablet-down:ml-[-86px] tablet-down:mt-[-6px] tablet-down:text-[1rem]"
          circle="h-[4.8rem] w-[4.8rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Words Read"
          labelClassName="-top-[0.1rem] -left-[0.55rem] tablet-down:-top-[0.26rem] tablet-down:-left-[0.3rem]"
          value={show(totals.words)}
          detail={
            totals.words + totals.misses === 0
              ? "none yet"
              : `${formatPercent(ratio(totals.words, totals.misses))} right`
          }
          tone="text-brand-blue"
        />

        {/* Warm-up quiz */}
        <Figure
          className="ml-[170px] mt-[60px] text-[1.1111rem] tablet-down:ml-[86px] tablet-down:mt-[-6px] tablet-down:text-[0.9rem]"
          circle="h-[3.6rem] w-[3.6rem] tablet-down:h-[3.2rem] tablet-down:w-[3.2rem]"
          label="Quiz"
          labelClassName="top-[0.1rem] -left-[0.4rem] tablet-down:top-[0.04rem] tablet-down:-left-[0.3rem]"
          value={show(
            formatPercent(ratio(totals.quizCorrect, totals.quizWrong)),
          )}
          detail={
            quizAttempts === 0
              ? "not taken"
              : `${totals.quizCorrect} of ${quizAttempts}`
          }
          tone="text-brand-purple"
        />

        {/* Rounds finished */}
        <Figure
          className="ml-[300px] mt-[132px] text-[0.95rem] tablet-down:ml-[-86px] tablet-down:mt-[104px] tablet-down:text-[0.85rem]"
          circle="h-[3rem] w-[3rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Rounds"
          labelClassName="top-[0.16rem] -left-[0.5rem] tablet-down:-left-[0.35rem]"
          value={show(totals.lessons)}
          detail={totals.lessons === 0 ? "none yet" : "completed"}
          tone="text-brand-green"
        />

        {/* Letters taught */}
        <Figure
          className="ml-[360px] mt-[-88px] text-[0.9rem] tablet-down:ml-[86px] tablet-down:mt-[104px] tablet-down:text-[0.8rem]"
          circle="h-[2.8rem] w-[2.8rem] tablet-down:h-[2.7rem] tablet-down:w-[2.7rem]"
          label="Letters"
          labelClassName="top-[0.2rem] -left-[0.5rem] tablet-down:-left-[0.42rem]"
          value={show(lettersKnown)}
          detail={`of ${countCourseLetters(rounds)}`}
          tone="text-brand-orange"
        />

        {/* Streak */}
        <Figure
          className="ml-[-150px] mt-[166px] text-[1.05rem] tablet-down:mt-[196px] tablet-down:ml-0 tablet-down:text-[0.85rem]"
          circle="h-[3.4rem] w-[3.4rem] tablet-down:h-[3rem] tablet-down:w-[3rem]"
          label="Streak"
          labelClassName="top-[0.1rem] -left-[0.5rem] tablet-down:-left-[0.4rem]"
          value={show(streaks.current)}
          detail={
            streaks.current === 0
              ? "practice today"
              : `${streaks.current === 1 ? "day" : "days"} · best ${streaks.longest}`
          }
          tone="text-brand-fire"
        />

        {/*
         * Centred on the stage's horizontal axis (`.radial > *` already pulls the
         * box back by half its own width), sitting below the discs with an even
         * gap above the discs and below the row.
         */}
        <div className="absolute top-[50%] left-[50%] mt-[286px] flex items-center justify-center tablet-down:hidden">
          {actions}
        </div>
      </div>

      {/* Below 900px the stage cannot hold the pair, so it flows underneath, centred. */}
      <div className="hidden items-center justify-center tablet-down:my-[1.5rem] tablet-down:flex">
        {actions}
      </div>

      {nothingYet ? (
        <div className="radial min-h-[220px] tablet-down:min-h-[180px]">
          <div className="w-[520px] -translate-x-1/2 -translate-y-1/2 text-center tablet-down:w-[300px]">
            <label className="text-brand-blue">Nothing recorded yet</label>
            <p className="mt-[0.15rem]">
              Match a letter in the warm-up quiz, or type a word, and it starts
              showing up here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Section title="Performance by lesson">
            <PracticeList
              practiced={practiced}
              stats={stats.rounds}
              levels={levels}
              rounds={rounds}
            />
          </Section>

          <Section title="Last two weeks">
            <ActivityDiscs days={days} />
          </Section>
        </>
      )}

      <p className="mt-[1.6rem] border-t border-ink/10 pt-[0.5rem] pb-[20px] text-[14px] leading-[22px] opacity-50 tablet-down:mx-[1.1rem] tablet-down:pb-[60px]">
        Recorded in this browser only — no account, no server. Practice
        somewhere else and that device keeps its own tally. Written, designed,
        and built by{" "}
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
 * A titled block under the stage. On a wide screen it starts where the title
 * disc does, so the whole page reads as one column; the badges on the lesson
 * rows hang into the gutter to its left.
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
      <label className="text-brand-blue">{title}</label>
      {children}
    </section>
  );
}

/** One level's practiced rounds, laid out like the course index rows. */
function PracticeList({
  practiced,
  stats,
  levels,
  rounds,
}: {
  practiced: string[];
  stats: Record<string, RoundRecord>;
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
}) {
  const byLevel = new Map<number, string[]>();
  for (const key of practiced) {
    const [level] = parseRoundKey(key);
    const list = byLevel.get(level) ?? [];
    list.push(key);
    byLevel.set(level, list);
  }

  return (
    <div className="flex flex-col gap-[1.2rem]">
      {[...byLevel.entries()].map(([levelNumber, keys]) => {
        const level = levels[String(levelNumber)];
        return (
          <div key={levelNumber}>
            <div className="relative block pb-[0.5rem] pl-[0.9rem] text-[0.5rem] font-black uppercase">
              <Badge className="absolute -top-[0.42rem] -left-[1.45rem] scale-75">
                {levelNumber}
              </Badge>
              <span className="relative z-5">
                {level?.name ?? `Level ${levelNumber}`}
              </span>
            </div>

            <div className="flex flex-col gap-[0.85rem]">
              {keys.map((key) => {
                const [, roundNumber] = parseRoundKey(key);
                const record = stats[key];
                const round = rounds[key];
                if (!record) return null;

                const wordAttempts = record.words + record.misses;
                const quizTries = record.quizCorrect + record.quizWrong;
                const accuracy = ratio(
                  record.words + record.quizCorrect,
                  record.misses + record.quizWrong,
                );

                return (
                  <div key={key} className="relative pl-[0.9rem]">
                    <Badge
                      variant="blue"
                      className="absolute top-[-0.3rem] left-[-1.6rem] scale-[0.5]"
                    >
                      {roundNumber}
                    </Badge>

                    <div className="flex items-baseline justify-between gap-[1rem]">
                      <span className="min-w-0 text-[0.5555rem] leading-[1.1] font-semibold uppercase">
                        {round?.name ?? `Round ${roundNumber}`}
                      </span>
                      <span className="shrink-0 whitespace-nowrap">
                        <span className="text-[0.6rem] leading-[0.6rem] font-black text-brand-green">
                          {formatPercent(accuracy)}
                        </span>
                        <span className="ml-[0.14rem] hidden text-[11px] uppercase opacity-40 tablet-down:inline xs:hidden">
                          accuracy
                        </span>
                      </span>
                    </div>
                    <span className="block text-[0.55rem] leading-[0.75rem] font-normal normal-case tracking-[0.06em] opacity-40">
                      {(round?.jamo ?? [])
                        .map((jamo) => (jamo === "-" ? "ㅇ" : jamo))
                        .join(" ")}
                    </span>

                    <div className="mt-[0.2rem] flex flex-wrap items-baseline gap-x-[0.8rem] gap-y-[0.1rem]">
                      <Fact
                        label="Words"
                        value={record.words}
                        detail={`${wordAttempts} tries`}
                        tone="text-brand-blue"
                      />
                      <Fact
                        label="Misses"
                        value={record.misses}
                        tone="text-brand-red"
                      />
                      <Fact
                        label="Quiz"
                        value={
                          quizTries === 0
                            ? "—"
                            : formatPercent(
                                ratio(record.quizCorrect, record.quizWrong),
                              )
                        }
                        detail={
                          quizTries === 0
                            ? "not taken"
                            : `${record.quizCorrect}/${quizTries}`
                        }
                        tone="text-brand-purple"
                      />
                      <Fact
                        label="Peeks"
                        value={record.peeks}
                        tone="text-brand-orange"
                      />
                      <Fact
                        label="Best"
                        value={
                          record.bestSeconds === undefined
                            ? "—"
                            : formatSeconds(record.bestSeconds)
                        }
                        detail={
                          record.lessons
                            ? `${record.lessons}× done`
                            : "unfinished"
                        }
                        tone="text-ink/75"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** One label + number pair in a lesson row, sat inline so rows stay compact. */
function Fact({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number | string;
  detail?: string;
  tone: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-[0.14rem] whitespace-nowrap">
      <span className="text-[11px] leading-[14px] uppercase opacity-40">
        {label}
      </span>
      <span className={cn("text-[17px] leading-[20px] font-bold", tone)}>
        {value}
      </span>
      {detail && (
        <span className="text-[11px] leading-[14px] opacity-30">{detail}</span>
      )}
    </span>
  );
}

/**
 * The last two weeks as discs — the app's number-in-a-circle motif, one disc per
 * day: white with the day's answers for days with practice, a pale disc for the
 * quiet ones.
 */
function ActivityDiscs({ days }: { days: DaySlice[] }) {
  const answers = (counts: Counts) =>
    counts.words + counts.misses + counts.quizCorrect + counts.quizWrong;

  return (
    <div className="mt-[0.3rem] flex items-start gap-[0.22rem] tablet-down:gap-[0.14rem]">
      {days.map((day) => {
        const total = answers(day.counts);
        const practiced = total > 0;
        return (
          <div
            key={day.key}
            className="flex flex-col items-center gap-[0.12rem]"
          >
            <div className="relative h-[0.92rem] w-[0.92rem] tablet-down:h-[0.78rem] tablet-down:w-[0.78rem]">
              <Circle
                fill={practiced ? "white" : "#e7e0d1"}
                className="absolute top-0 left-0 h-full w-full"
              />
              <div
                className={cn(
                  "relative z-1 flex h-full w-full items-center justify-center text-[0.32rem] leading-none font-black",
                  practiced ? "text-brand-blue" : "text-ink/25",
                )}
              >
                {practiced ? total : "·"}
              </div>
            </div>
            <span className="text-[11px] leading-[13px] uppercase opacity-40">
              {WEEKDAY_INITIALS[day.date.getDay()]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Every letter the course teaches — the denominator on the Letters disc. */
/**
 * Every letter the course teaches — the denominator on the Letters disc.
 *
 * `-` is the course's placeholder for a syllable with no initial consonant,
 * which is ㅇ, so it is counted as that letter and not as one of its own. That
 * keeps this figure on the same 40 letters the course, `/learnedemall` and the
 * unlocks page all report.
 */
function courseLetter(jamo: string): string {
  return jamo === "-" ? "ㅇ" : jamo;
}

function countCourseLetters(rounds: Record<string, Round>): number {
  const seen = new Set<string>();
  for (const round of Object.values(rounds)) {
    for (const jamo of round.jamo ?? []) seen.add(courseLetter(jamo));
  }
  return seen.size;
}

/**
 * Letters from lessons the learner has actually finished — the same rule the
 * unlocks page uses (`completedLessons`), so the two screens can never disagree.
 */
function countKnownLetters(
  rounds: Record<string, Round>,
  records: Record<string, RoundRecord>,
  latest: string | null,
): number {
  const done = completedLessons(records, latest);
  const seen = new Set<string>();

  for (const [key, round] of Object.entries(rounds)) {
    if (!done.has(key)) continue;
    for (const jamo of round.jamo ?? []) seen.add(courseLetter(jamo));
  }

  return seen.size;
}
