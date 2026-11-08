import { Badge } from '@/components/ui/badge'
import { SmallWord } from '@/components/small-word'
import { useUser } from '@/providers/user-store'

interface YouAreHereProps {
  level?: string
  round?: string
}

const itemClass = 'group/item absolute block top-[0.5555rem] h-[1.52rem] phone:top-[8px]'

const swipe = 'transition-[translate_200ms_ease-out,opacity_100ms_ease-in]'

const wordClass = `absolute block translate-y-0 opacity-100 group-hover/item:-translate-y-[16px] group-hover/item:opacity-0 ${swipe}`

const labelClass = `absolute top-[0.2222rem] left-[1.1111rem] translate-y-[16px] text-[0.58rem] font-black uppercase text-ink opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 ${swipe}`

/** Level / round indicator; clicking it opens the course index. */
export function YouAreHere({ level, round }: YouAreHereProps) {
  const { toggleIndex } = useUser()

  return (
    <div
      className="you-are-here absolute top-0 left-full z-10 -ml-[140px] cursor-pointer text-center text-[14px] font-extrabold phone:-ml-[91px]"
      onClick={toggleIndex}
    >
      <span className={`you-are-here__level left-[-2.7777rem] w-[2.5rem] phone:left-[-2.5rem] ${itemClass}`}>
        <Badge className="absolute top-0 left-0 h-[1rem] w-[1rem] text-[0.6rem] leading-[1.8]">
          {level || '1'}
        </Badge>
        <SmallWord
          word="level"
          className={`left-[0.8333rem] top-[0.1666rem] phone:h-[33px] phone:w-[42px] ${wordClass}`}
        />
        <span className={labelClass}>Level</span>
      </span>
      <span className={`you-are-here__round left-[0.27777rem] w-[3rem] ${itemClass}`}>
        <Badge
          variant="blue"
          className="absolute top-0 left-0 h-[1rem] w-[1rem] text-[0.6rem] leading-[1.8]"
        >
          {round || '1'}
        </Badge>
        <SmallWord
          word="round"
          className={`left-[0.8333rem] top-[0.3rem] phone:h-[27px] phone:w-[53px] ${wordClass}`}
        />
        <span className={labelClass}>Round</span>
      </span>
    </div>
  )
}
