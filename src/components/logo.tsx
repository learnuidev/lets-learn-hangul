import { Link } from '@tanstack/react-router'
import { Circle } from '@/components/circle'
import { LandingBrushTitle } from '@/components/landing-brush-title'
import { cn } from '@/lib/utils'

/** Same swipe-up cross-fade used by the level/round indicator. */
const swipe = 'swipe-swap'

/**
 * The little "Let's Learn Hangul!" badge that sits in the top-left corner.
 * Hovering swipes the brush wordmark up and fades the English lockup in beneath
 * it — the same gesture as the level/round indicator.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'logo radial group',
        'absolute top-[10px] left-[5px] block h-[140px] w-[140px] min-h-0',
        'text-[22px] leading-[24px] text-inherit no-underline',
        'z-10',
        'phone:top-0 phone:left-[-5px] phone:h-[80px] phone:w-[80px] phone:text-[14px] phone:leading-[16px]',
        className,
      )}
    >
      <Circle r={109} className="logo__circle phone:h-[54px] phone:w-[54px]" />

      <div className="logo__beta-tag absolute top-[34%] left-[93%] rounded-[3px] bg-brand-red-soft px-[6px] py-[4px] text-[12px] leading-[12px] font-black uppercase text-brand-red opacity-70 phone:hidden">
        Beta
      </div>

      <LandingBrushTitle
        className={cn(
          'logo__korean w-[140px] [translate:-57%_-53%]',
          'group-hover:[translate:-57%_calc(-53%_-_16px)] group-hover:opacity-0',
          'phone:h-[80px] phone:w-[80px]',
          swipe,
        )}
        width={140}
        height={140}
        animate={false}
      />

      <div
        className={cn(
          'logo__english pointer-events-none w-[140px] opacity-0',
          '[translate:-20%_calc(-50%_+_16px)]',
          'group-hover:[translate:-20%_-50%] group-hover:opacity-100',
          'phone:w-[80px]',
          swipe,
        )}
      >
        Let’s
        <br />
        Learn
        <br />
        <b>Hangul!</b>
      </div>
    </Link>
  )
}
