import { Link } from "@tanstack/react-router";
import { Circle } from "@/components/circle";
import type { UnlockItem, UnlockState } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

interface UnlockSyllableProps {
  item: UnlockItem;
  state: UnlockState | undefined;
}

/**
 * One syllable block in a collection grid: the disc, how it sounds, what it
 * means — and a link through to the block's own page.
 *
 * Shared by the unlocks page's syllable grid and the letter pages, so a block
 * looks and behaves the same wherever it is listed.
 */
export function UnlockSyllable({ item, state }: UnlockSyllableProps) {
  const status = state?.status ?? "locked";
  const missing = state?.missing ?? [];

  return (
    <li>
      <Link
        to="/unlocks/blocks/$block"
        params={{ block: item.input }}
        title={`${item.input} — ${item.roman} — ${item.en}${
          status === "full" ? "" : ` · needs ${missing.join(" ")}`
        }`}
        className={cn(
          "group/block flex w-[1.34rem] flex-col items-center rounded-[4px] outline-none",
          "transition-colors hover:bg-white/70 focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
        )}
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
                  : "text-ink/30",
            )}
          >
            {item.input}
          </span>
        </span>
        <span
          className={cn(
            "mt-[0.04rem] w-full truncate text-center text-[12px] leading-[13px] font-semibold",
            status === "full" ? "text-brand-blue/75" : "text-brand-blue/35",
            "transition-colors group-hover/block:text-brand-blue",
          )}
        >
          {item.roman}
        </span>
        <span
          className={cn(
            "w-full truncate text-center text-[11px] leading-[13px] tablet-down:text-[10px]",
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
