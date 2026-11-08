import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackForwardButtons } from '@/components/back-forward-buttons'
import { Circle } from '@/components/circle'
import type { Level } from '@/data/types'

interface LevelCompleteProps {
  level: Level
  levels: Record<string, Level>
  levelParam: string
}

/** Celebratory screen once every round in a level is done. */
export function LevelComplete({ level, levels, levelParam }: LevelCompleteProps) {
  const navigate = useNavigate()
  const nextLevel = levels[String(Number(levelParam) + 1)]

  const continueOn = () => {
    if (nextLevel && nextLevel.level === 5) navigate({ to: '/learnedemall' })
    else if (nextLevel) navigate({ to: '/level/$level', params: { level: String(nextLevel.level) } })
    else navigate({ to: '/learnedeverything' })
  }

  return (
    <div className="level__complete radial mt-[1rem] phone:[&>*]:top-[265px]">
      <Circle
        r={128}
        className="level__complete__circle h-[460px] w-[460px] phone:left-[20%] phone:h-[400px] phone:w-[400px]"
        pop={0}
        popScale={0.55}
      />

      <div className="level__complete__inner w-[500px] -translate-x-[104px] -translate-y-[57%] phone:w-[90%] phone:-translate-x-[140px] [&_h1]:w-[20px] [&_h1]:font-semibold [&_h1]:uppercase">
        <h1>
          <b>Level&nbsp;Complete!</b>
          <br />
          <span style={{ whiteSpace: 'nowrap' }}>“{level.name}”</span>
        </h1>
      </div>

      <div className="level__complete__level -translate-x-[193px] -translate-y-[200px] phone:translate-x-1/2 phone:-translate-y-[168px]">
        <Badge>{levelParam}</Badge>
      </div>
      <label className="level__complete__level-label -translate-x-[230px] -translate-y-[184px] phone:-translate-x-[5px] phone:-translate-y-[157px]">
        Level
      </label>

      <BackForwardButtons className="level__complete__continue translate-x-[110px] translate-y-[140px]">
        <Button arrow="forward" data-autofocus="true" onClick={continueOn}>
          Continue
        </Button>
      </BackForwardButtons>
    </div>
  )
}
