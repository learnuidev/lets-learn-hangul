import { Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackForwardButtons } from "@/components/back-forward-buttons";
import { BigJamo } from "@/components/big-jamo";
import { Circle } from "@/components/circle";
import { JamoTable } from "@/components/jamo-table";
import type { Jamo, Level, Round } from "@/data/types";
import { formatSeconds, getJamoHint } from "@/lib/display";
import { isMedial } from "@/lib/hangul";
import { keyMap } from "@/lib/collections";
import { readStats } from '@/lib/stats'
import { useUnlockIndex } from "@/hooks/use-unlocks";
import { cn } from "@/lib/utils";

interface RoundCompleteProps {
  level: Level;
  round: Round;
  rounds: Record<string, Round>;
  shapes: Record<string, string>;
  jamos: Record<string, Jamo>;
  geometric: Record<string, string>;
  step?: string;
}

/**
 * End-of-round report: the word/time/peek/miss summary, then a review of the
 * new letters and the full jamo table.
 */
export function RoundComplete({
  level,
  round,
  rounds,
  shapes,
  jamos,
  geometric,
  step,
}: RoundCompleteProps) {
  const navigate = useNavigate();

  const levelParam = String(level.level);
  const roundParam = String(round.round);
  const stats = readStats(`${levelParam}.${roundParam}`);
  const showingLetters = step === "letters";
  const showingReview = step === "review";
  const newJamos = round.jamo ?? [];

  const nextRound = rounds[`${levelParam}.${Number(roundParam) + 1}`];

  // What this round's new letters let the learner read for the first time. The
  // count is fixed once the round is done, so it stays right on a reload.
  const unlocks = useUnlockIndex(rounds).byLesson[`${levelParam}.${roundParam}`];
  const unlocked = unlocks ? unlocks.syllables + unlocks.words : 0;

  const current = parseFloat(`${levelParam}.${roundParam}`);
  const known = keyMap(
    Object.entries(rounds)
      .filter(([key]) => parseFloat(key) <= current)
      .flatMap(([, value]) => value.jamo ?? []),
  );

  const goOn = () => {
    if (newJamos.length && !showingLetters && !showingReview) {
      navigate({
        to: "/level/$level/round/$round/complete/$roundComplete",
        params: {
          level: levelParam,
          round: roundParam,
          roundComplete: "review",
        },
      });
    } else if (newJamos.length && showingReview) {
      navigate({
        to: "/level/$level/round/$round/complete/$roundComplete",
        params: {
          level: levelParam,
          round: roundParam,
          roundComplete: "letters",
        },
      });
    } else if (nextRound) {
      navigate({
        to: "/level/$level/round/$round",
        params: { level: levelParam, round: String(nextRound.round) },
      });
    } else {
      navigate({ to: "/level/$level/complete", params: { level: levelParam } });
    }
  };

  if (showingLetters || showingReview) {
    return (
      <div className="round__complete radial w-[1000px] desktop:-ml-[50px] desktop:h-[600px] phone:w-auto">
        <div className="round__complete__top absolute top-[40px] left-1/2 -ml-[463px] [translate:none] wide:max-[1275px]:-ml-[355px] tablet:top-[-130px] tablet:left-0 tablet:ml-0 phone:top-[1rem] phone:left-[1rem] phone:ml-0">
          <label className="relative z-5 mb-0 text-brand-blue">
            Round Complete!
          </label>
          {showingReview ? (
            <p className="relative z-5">
              You’ve learned&nbsp;{" "}
              {newJamos.length > 1 ? (
                <span>
                  <b>{newJamos.length}</b> new Hangul letters!
                </span>
              ) : (
                "a new Hangul letter!"
              )}
            </p>
          ) : (
            <p className="relative z-5">
              You now know <b>{Object.keys(known).length}</b> Hangul letters!
            </p>
          )}
          {showingReview && unlocked > 0 && unlocks && (
            <p className="relative z-5 mt-[0.12rem] text-[15px] leading-[20px] opacity-60">
              They unlock <b className="text-brand-blue">{unlocks.syllables}</b>{" "}
              syllables and <b className="text-brand-blue">{unlocks.words}</b>{" "}
              words — see{" "}
              <Link to="/unlocks" className="text-brand-blue">
                everything you can read
              </Link>
              .
            </p>
          )}
        </div>

        <BackForwardButtons>
          <Button
            arrow="forward"
            data-autofocus="true"
            className="absolute top-[240px] left-1/2 ml-[175px] tablet:top-[160px] tablet:ml-[20px]"
            onClick={goOn}
          >
            Continue
          </Button>
        </BackForwardButtons>

        <div className="transition-group block w-full mt-1">
          {showingLetters ? (
            <JamoTable
              geometric={geometric}
              jamos={jamos}
              newJamos={newJamos}
              known={known}
              className="mt-[20px] tablet:-mt-[220px] phone:mt-[110px]"
            />
          ) : (
            <Review round={round} shapes={shapes} />
          )}
        </div>
      </div>
    );
  }

  const finishedAt = stats?.completed || Date.now()
  const elapsed = stats?.started ? Math.max(0, Math.round((finishedAt - stats.started) / 1000)) : 0;

  return (
    <div className="round__complete radial w-[1000px] desktop:-ml-[50px] desktop:h-[600px] phone:w-auto">
      <div className="round__complete__title left-[54%] h-[298px] w-[298px] -translate-x-[140%] -translate-y-[75%] sm-desktop:left-1/2 sm-desktop:-translate-x-[85%] sm-desktop:-translate-y-[85%] tablet:-translate-x-[73%] tablet:-translate-y-[155%] phone:top-[280px] phone:left-1/2 phone:h-[180px] phone:w-[180px] phone:-translate-x-[65%] phone:-translate-y-[140%]">
        <Circle
          r={298}
          className="absolute top-0 left-0 phone:h-[180px] phone:w-[180px]"
          pop={0}
          popScale={0.5}
        />
        <img
          className="calligraphy absolute top-[10px] -left-[90px] block sm-desktop:top-[50px] sm-desktop:-left-[50px] sm-desktop:h-[180px] sm-desktop:w-[180px] phone:top-[37px] phone:-left-[20px] phone:h-[100px] phone:w-[100px]"
          width={230}
          height={230}
          src="/images/calligraphy/round-complete.svg"
          alt=""
        />
        <div className="relative z-1 pt-[98px] pl-[149px] phone:pt-[49px] phone:pl-[90px]">
          <h1 className="m-0 text-[1rem] leading-[1rem] uppercase text-brand-blue">
            Round Complete!
          </h1>
          <h2 className="m-0 -ml-[0.19rem] text-[1rem] leading-[1rem] font-semibold whitespace-nowrap uppercase">
            ‘{round.name}’
          </h2>
        </div>
      </div>

      <Stat
        className="round__complete__words left-[54%] text-[1.5rem] -translate-x-[0%] -translate-y-[105%] sm-desktop:translate-x-[60%] sm-desktop:-translate-y-[135%] tablet:-translate-x-[180%] tablet:-translate-y-[105%] phone:top-[280px] phone:left-1/2 phone:-translate-x-[85%] phone:-translate-y-[39%]"
        circle="h-[4.05rem] w-[4.05rem]"
        label="Words Read"
        value={stats?.words ?? 0}
      />

      <Stat
        className="round__complete__time left-[54%] text-[1.1111rem] -translate-x-[80%] translate-y-[55%] sm-desktop:translate-x-[12%] sm-desktop:translate-y-[8%] tablet:-translate-x-[50%] tablet:-translate-y-[112%] phone:top-[280px] phone:left-1/2 phone:translate-x-[54%] phone:-translate-y-[95%]"
        circle="h-[3.2222rem] w-[3.2222rem]"
        label="Time"
        value={formatSeconds(elapsed)}
        labelClassName="top-[11px]"
      />

      <Stat
        className="round__complete__peeks left-[54%] text-[1.1111rem] translate-x-[140%] translate-y-[67%] sm-desktop:-translate-x-[140%] sm-desktop:translate-y-[110%] tablet:translate-x-[20%] tablet:translate-y-[35%] phone:top-[280px] phone:left-1/2 phone:translate-x-[60%] phone:translate-y-[53%]"
        circle="h-[2.6111rem] w-[2.6111rem]"
        label="Peeks"
        value={stats?.peeks ?? 0}
        negative
        labelClassName="top-0"
      />

      <Stat
        className="round__complete__misses left-[54%] text-[0.8888rem] translate-x-[320%] -translate-y-[105%] sm-desktop:-translate-x-[390%] sm-desktop:translate-y-[115%] tablet:-translate-x-[147%] tablet:translate-y-[12%] phone:top-[280px] phone:left-1/2 phone:-translate-x-[52%] phone:translate-y-[171%]"
        circle="h-[2.1111rem] w-[2.1111rem]"
        label="Misses"
        value={stats?.misses ?? 0}
        negative
        labelClassName="-top-[2px] -left-[33px]"
      />

      <BackForwardButtons>
        <Button
          arrow="forward"
          data-autofocus="true"
          className="absolute top-[240px] left-1/2 ml-[175px] tablet:top-[160px] tablet:ml-[20px]"
          onClick={goOn}
        >
          Continue
        </Button>
      </BackForwardButtons>
    </div>
  );
}

function Stat({
  className,
  circle,
  label,
  value,
  negative,
  labelClassName,
}: {
  className?: string;
  circle: string;
  label: string;
  value: number | string;
  negative?: boolean;
  labelClassName?: string;
}) {
  return (
    <div className={cn("absolute", className)}>
      <Circle className={circle} pop={0.1} popScale={0.5} />
      <label className={cn("absolute top-[11px] -left-[20px]", labelClassName)}>
        {label}
      </label>
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[1em] leading-[1em] font-black",
          negative ? "text-brand-red" : "text-brand-blue",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Review({
  round,
  shapes,
}: {
  round: Round;
  shapes: Record<string, string>;
}) {
  return (
    <div className="round__complete__review flex flex-wrap justify-center tablet:-mt-[210px] phone:mt-0">
      {(round.jamo ?? []).map((jamo, i) => (
        <div
          className="round__complete__review__jamo relative h-[140px] w-[180px] phone:h-[125px] phone:w-[140px] [&>*]:absolute"
          key={jamo}
        >
          <Circle
            r={137}
            className="top-0 left-0 phone:left-[25px] phone:h-[91px] phone:w-[91px]"
            pop={i * 0.1}
          />
          <BigJamo
            shapes={shapes}
            jamo={jamo}
            className="top-[0.5555rem] left-[0.5555rem] h-[2.7777rem] w-[2.7777rem] phone:top-[9px] phone:left-[34px]"
            pop={i * 0.15}
          />
          <Badge
            variant={isMedial(jamo) ? "blue" : "default"}
            className="top-[2.7777rem] left-[2.7777rem] h-[1.5rem] w-[1.5rem] text-[0.5rem] leading-[1.5rem] phone:top-[66px] phone:left-[91px]"
          >
            {getJamoHint(jamo)}
          </Badge>
        </div>
      ))}
    </div>
  );
}
