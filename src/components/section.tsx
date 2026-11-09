/**
 * A titled block under a `.radial` stage, aligned with the title disc.
 *
 * The stats, unlocks, block and letter screens are all one column of these, so
 * the heading, the indent and the max width only exist in one place.
 */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-[1.1rem] max-w-[760px] pl-[150px] tablet-down:mt-[1.2rem] tablet-down:max-w-none tablet-down:pr-[1.1rem] tablet-down:pl-[2.8rem]">
      <label className="mb-[0.1rem] text-brand-blue">{title}</label>
      {children}
    </section>
  );
}
