import { Link } from "@tanstack/react-router";
import { JamoDisc } from "@/components/jamo-disc";
import { cn } from "@/lib/utils";

type DiscProps = Omit<React.ComponentProps<typeof JamoDisc>, "className">;

interface JamoLinkProps extends DiscProps {
  /** What the letter opens up, for the hover title. */
  title?: string;
  className?: string;
}

/**
 * A letter disc that leads to the letter's own page.
 *
 * The disc itself is unchanged — the link only adds a hit area and the hover and
 * focus states the other tiles have, so a row of letters reads the same whether
 * or not it is clickable.
 */
export function JamoLink({ title, className, ...disc }: JamoLinkProps) {
  return (
    <Link
      to="/unlocks/letters/$letter"
      params={{ letter: disc.letter }}
      title={title}
      className={cn(
        "group/letter block rounded-[5px] px-[0.06rem] pt-[0.06rem] pb-[0.04rem] outline-none",
        "transition-colors hover:bg-white/70 focus-visible:ring-[3px] focus-visible:ring-brand-blue/40",
        className,
      )}
    >
      <JamoDisc {...disc} />
    </Link>
  );
}
