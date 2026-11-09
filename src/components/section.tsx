import { cn } from "@/lib/utils";

/**
 * A titled block under a `.radial` stage.
 *
 * The stats, unlocks, block and letter screens are all one column of these, so
 * the heading, the indent and the max width only exist in one place. `wide`
 * drops the indent and opens the column to the 1000px the collection's grids
 * are drawn on — the same width as the stage above them.
 */
export function Section({
  title,
  wide = false,
  className,
  children,
}: {
  title: string;
  /** Lay the section out on the full 1000px grid column instead of the text column. */
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "mt-[1.1rem]",
        wide
          ? "w-[1000px] tablet-down:mt-[1.2rem] tablet-down:w-auto tablet-down:pr-[1.1rem] tablet-down:pl-[1.1rem]"
          : "max-w-[760px] pl-[150px] tablet-down:mt-[1.2rem] tablet-down:max-w-none tablet-down:pr-[1.1rem] tablet-down:pl-[2.8rem]",
        className,
      )}
    >
      <label className="mb-[0.1rem] text-brand-blue">{title}</label>
      {children}
    </section>
  );
}

/** Running prose inside a wide section: long lines are hard to read at 1000px. */
export function SectionProse({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("m-0 max-w-[640px] text-[15px] leading-[20px] opacity-55", className)}>
      {children}
    </p>
  );
}
