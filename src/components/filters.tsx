import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { levelsOf, type UnlockItem } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterPillsProps {
  options: readonly FilterOption[];
  value: string;
  onChange: (next: string) => void;
  /** Group label for screen readers. */
  label: string;
  className?: string;
}

/**
 * The collection's state switch — All, Read, Half-read, Locked — as a row of
 * pills. Each pill carries its own count, so the row doubles as a summary of
 * what is behind it.
 */
export function FilterPills({ options, value, onChange, label, className }: FilterPillsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-[0.1rem]", className)}
      role="group"
      aria-label={label}
    >
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

/** `"all"` means no band filter. */
export const ALL_LEVELS = "all";

interface FilterSelectProps {
  /** What is being filtered — shown before the dropdown. */
  label: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (next: string) => void;
  className?: string;
}

/** One filter as a dropdown, for the right-hand end of a section's title row. */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-[0.12rem]", className)}>
      <span className="text-[11px] leading-[14px] uppercase tracking-[0.08em] opacity-30">
        {label}
      </span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "cursor-pointer appearance-none rounded-[5px] bg-white/70 py-[5px] pr-[26px] pl-[10px]",
            "text-[12px] leading-[15px] font-bold tracking-[0.06em] uppercase text-brand-blue",
            "outline-none transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count.toLocaleString("en-US")})
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-[7px] h-[12px] w-[12px] opacity-45"
        />
      </span>
    </label>
  );
}

interface LevelSelectProps {
  /**
   * The words being listed. The bands are read off the *other* filter's result,
   * so the two filters can never promise a word the other has filtered out.
   */
  words: readonly UnlockItem[];
  value: string;
  onChange: (next: string) => void;
  className?: string;
}

/** The CEFR band dropdown: A1, A2, B1, B2, with how many words carry each. */
export function LevelSelect({ words, value, onChange, className }: LevelSelectProps) {
  const options = useMemo<FilterOption[]>(() => {
    const levels = levelsOf(words);
    return [
      { value: ALL_LEVELS, label: "All", count: words.length },
      ...levels.map(({ level, count }) => ({ value: level, label: level, count })),
    ];
  }, [words]);

  // A single band is nothing to switch between.
  if (options.length < 2) return null;

  return (
    <FilterSelect
      label="level"
      value={value}
      options={options}
      onChange={onChange}
      className={className}
    />
  );
}

/** Whether a word survives the current band filter. */
export function matchesLevel(item: UnlockItem, level: string): boolean {
  return level === ALL_LEVELS || item.level === level;
}
