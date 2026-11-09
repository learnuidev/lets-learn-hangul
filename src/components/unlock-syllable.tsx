import { Link } from "@tanstack/react-router";
import { Circle } from "@/components/circle";
import type { UnlockItem, UnlockState } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

interface UnlockSyllableProps {
  item: UnlockItem;
  state: UnlockState | undefined;
}

/**
 * One syllable block on the collection's 100px module: the disc, the block, how
 * it sounds, what it means — and a link through to the block's own page.
 *
 * Shared by the unlocks page's syllable grid and the letter pages, so a block
 * looks and behaves the same wherever it is listed.
 */
export function UnlockSyllable({ item, state }: UnlockSyllableProps) {
  const status = state?.status ?? "locked";
  const missing = state?.missing ?? [];

  return (
    <li className="w-[100px] tablet-down:w-[20%]">
      <Link
        to="/unlocks/blocks/$block"
        params={{ block: item.input }}
        title={`${item.input} — ${item.roman} — ${item.en}${
          status === "full" ? "" : ` · needs ${missing.join(" ")}`
        }`}
        className={cn(
          "group/block flex h-[100px] w-full flex-col items-center justify-center rounded-[4px] outline-none",
          "transition-colors hover:bg-white/70 focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
          "tablet-down:h-[72px]",
        )}
      >
        <span className="relative block h-[64px] w-[64px] tablet-down:h-[42px] tablet-down:w-[42px]">
          <Circle
            fill={status === "locked" ? "#e7e0d1" : "white"}
            className="absolute top-0 left-0 h-full w-full"
          />
          <span
            className={cn(
              "relative z-1 flex h-full w-full items-center justify-center font-korean text-[26px] leading-none font-bold tablet-down:text-[17px]",
              status === "full"
                ? "text-ink"
                : status === "partial"
                  ? "text-ink/45"
                  : "text-ink/30",
            )}
          >
            {item.input}
          </span>
        </span>
        <span
          className={cn(
            "mt-[3px] w-full truncate text-center text-[13px] leading-[15px] font-semibold tablet-down:mt-[2px] tablet-down:text-[11px] tablet-down:leading-[13px]",
            status === "full" ? "text-brand-blue/75" : "text-brand-blue/35",
            "transition-colors group-hover/block:text-brand-blue",
          )}
        >
          {item.roman}
        </span>
        <span
          className={cn(
            "w-full truncate text-center text-[11px] leading-[13px] tablet-down:text-[10px] tablet-down:leading-[12px]",
            status === "full" ? "opacity-45" : "opacity-25",
            "transition-opacity group-hover/block:opacity-70",
          )}
        >
          {item.en}
        </span>
      </Link>
    </li>
  );
}
