import { useEffect, useState } from 'react'
import { GeometricJamo } from '@/components/geometric-jamo'
import { sample } from '@/lib/collections'
import { isBrowser } from '@/lib/env'

const jamos =
  'ㅇ ㄹ ㅗ ㄱ ㅅ ㅇ ㅣ ㅅ ㄷ ㅎ ㅋ ㅗ ㄱ ㅍ ㅏ ㅡ ㅍ ㅎ ㅌ ㅅ ㅓ ㄹ ㄴ ㅗ ㅏ ㅡ ㅂ ㅇ ㅅ ㅁ ㅣ ㅇ ㅓ'.split(
    ' ',
  )

type CoordSets = Record<string, number[][]>

const coordSets: CoordSets = {
  landing: [
    [87, -320], [-116, -368], [283, -250], [422, -381], [504, -206], [338, -53], [544, 45],
    [292, 159], [-374, -268], [-337, -473], [-420, -82], [-341, 94], [-538, 93], [-170, 268],
    [-409, 287], [105, 292], [-55, 444], [-289, 464], [377, 427], [564, 293], [42, -529],
    [233, -431], [-552, -413], [-622, -202], [709, -371], [460, -535], [767, -112], [812, 203],
    [680, 487], [-633, 478], [-740, 281], [-792, -21], [-819, -383], [-936, 143], [-944, -186],
    [-441, 654], [178, 587], [-147, 660], [513, 657], [942, 430], [915, -292], [-912, 417],
    [-743, 681], [-279, 870], [140, 854], [802, 749], [483, 895], [1059, 3], [-1147, -62],
    [-606, 954], [-985, 695], [-1055, -445], [-1171, 346], [981, -510], [1289, -205],
    [1197, 254], [1005, 633], [732, 1097], [270, 1062], [-74, 1038], [-373, 1016],
    [-811, 930], [-1144, 554], [-1168, 159],
  ],
  landingSmall: [
    [-10, -274], [125, -246], [193, -150], [174, -5], [272, -63], [248, 95], [-192, -109],
    [-195, 122], [211, 228], [288, 328], [261, 471], [-161, 540], [-77, 175], [211, -252],
    [-209, -289], [-115, -240], [-245, -44], [-254, -199], [-156, 2], [-266, 60], [-261, 217],
    [-264, 365], [-32, 470], [129, 467], [286, -246], [-169, 237], [-201, 331], [-28, 308],
    [104, 290], [74, 419], [-93, 414], [-206, 434], [204, 366],
  ],
  nowwhat: [
    [-9, 251], [-253, 258], [106, -164], [-19, -296], [269, -277], [363, -100], [487, -239],
    [604, -57], [530, 197], [735, 163], [355, 323], [102, 426], [-162, 442], [-483, 398],
    [-442, 163], [-512, -53], [-643, 123], [-697, -230], [-436, -294], [-787, -44], [-758, 372],
    [-628, 603], [-328, 609], [-11, 645], [336, 605], [611, 470], [833, 348], [884, -23],
    [827, -224], [-991, -219], [-933, 151], [-881, 588], [-461, 808], [-126, 839], [249, 844],
    [588, 757], [901, 633], [1052, 169], [1103, -165],
  ],
  nowwhatSmall: [
    [-90, -285], [102, -290], [195, -203], [164, -27], [-146, -16], [-205, -104], [-206, 85],
    [110, 164], [201, 105], [-32, 233], [-185, 257], [-91, 359], [101, 313], [55, 427],
    [-203, 430],
  ],
}

interface ConstellationProps {
  geometric?: Record<string, string>
  page: 'landing' | 'nowwhat'
}

/**
 * The drifting field of outlined jamo behind the landing and finale screens.
 * One jamo is swapped for another every 200ms, and hovering a glyph re-rolls it.
 */
export function Constellation({ geometric, page }: ConstellationProps) {
  const [stateJamos, setStateJamos] = useState<string[]>(jamos)
  const [small, setSmall] = useState(false)

  useEffect(() => {
    if (!isBrowser()) return
    const check = () => setSmall(window.innerWidth <= 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setStateJamos((current) => {
        const next = current.slice()
        next[i++ % jamos.length] = sample(jamos)
        return next
      })
    }, 200)
    return () => clearInterval(timer)
  }, [])

  const setName = `${page}${small ? 'Small' : ''}`
  const coords = coordSets[setName] ?? []

  return (
    <div className="constellation">
      <div className="constellation__center absolute top-[300px] left-1/2">
        {geometric &&
          coords.map(([x, y], index) => (
            <div
              className="constellation__jamo absolute z-300 block -translate-x-1/2 -translate-y-1/2 phone:[&_svg]:size-[90px]"
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() =>
                setStateJamos((current) => {
                  const next = current.slice()
                  next[index % jamos.length] = sample(jamos)
                  return next
                })
              }
              key={`${x}-${y}`}
            >
              <GeometricJamo
                geometric={geometric}
                jamo={stateJamos[index % stateJamos.length]}
                fill={false}
                size={140}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
