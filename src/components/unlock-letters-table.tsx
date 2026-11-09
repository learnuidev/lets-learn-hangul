import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GeometricJamo } from "@/components/geometric-jamo";
import { JAMO_TABLE_ORDER } from "@/components/jamo-table";
import { getJamoHint } from "@/lib/display";
import { isMedial } from "@/lib/hangul";
import { cn } from "@/lib/utils";

/** Same swipe-up cross-fade as the round summary's table. */
const swipe = "swipe-swap";

interface UnlockLettersTableProps {
  /** The geometric shapes, as the round summary's table draws them. */
  geometric: Record<string, string>;
  /** Letters the learner has actually finished the lesson for. */
  known: ReadonlySet<string>;
  /** Hover title for one letter — what it opens up. */
  title?: (letter: string) => string;
  className?: string;
}

/**
 * The whole alphabet as the round summary reveals it: 10 across, geometric
 * glyphs, red for consonants and blue for vowels, ghosts for the letters still
 * to come. Hovering (or tapping) swipes the glyph up and fades the
 * romanization in; opening a letter leads to everything it spells.
 *
 * The grid is the same component-sized table as `JamoTable`, but its cells are
 * links rather than audio buttons, and "learned" (rather than "new") is what
 * lights a letter up.
 */
export function UnlockLettersTable({
  geometric,
  known,
  title,
  className,
}: UnlockLettersTableProps) {
  const [active, setActive] = useState<string | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = (letter: string) => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    setActive(letter);
  };

  // Touch needs an explicit release; hover clears on mouse leave.
  const releaseSoon = () => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => setActive(null), 500);
  };

  return (
    <div
      className={cn(
        "flex w-[1000px] flex-wrap tablet-down:w-full",
        className,
      )}
    >
      {JAMO_TABLE_ORDER.map((letter) => {
        const learned = known.has(letter);
        const shown = active === letter;
        return (
          <Link
            key={letter}
            to="/unlocks/letters/$letter"
            params={{ letter }}
            title={title?.(letter)}
            className={cn(
              "group/letter relative flex h-[100px] w-[100px] items-center justify-center",
              "rounded-[4px] outline-none transition-colors hover:bg-white/70",
              "focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
              "tablet-down:h-[72px] tablet-down:w-[20%]",
              !learned && "opacity-10 hover:bg-transparent hover:opacity-30",
            )}
            onMouseEnter={() => activate(letter)}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => {
              activate(letter);
              releaseSoon();
            }}
          >
            <GeometricJamo
              jamo={letter}
              geometric={geometric}
              className={cn(
                "relative z-5 h-[60px] w-[60px] translate-y-0 tablet-down:h-[44px] tablet-down:w-[44px]",
                "group-hover/letter:-translate-y-[16px] group-hover/letter:opacity-0",
                swipe,
                shown && "-translate-y-[12px] opacity-0",
              )}
            />
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 left-1/2",
                "text-[0.8888rem] leading-none font-black text-brand-red tablet-down:text-[0.6rem]",
                "[translate:-50%_calc(-50%_+_16px)] opacity-0",
                "group-hover/letter:[translate:-50%_-50%] group-hover/letter:opacity-100",
                shown && "[translate:-50%_-50%] opacity-100",
                isMedial(letter) && "text-brand-blue",
                swipe,
              )}
            >
              {getJamoHint(letter)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
