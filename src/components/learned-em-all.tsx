import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Circle } from '@/components/circle'
import { Confetti } from '@/components/confetti'
import { Congratulations } from '@/components/congratulations'

/** Milestone after level four: every Hangul letter has been introduced. */
export function LearnedEmAll({ geometric }: { geometric: Record<string, string> }) {
  const navigate = useNavigate()

  return (
    <div className="learned-em-all min-h-[650px] phone:min-h-0 phone:overflow-hidden">
      <Confetti geometric={geometric} />

      <div className="learned-em-all__title absolute top-[320px] left-1/2 w-[480px] -translate-x-[240px] -translate-y-[50px] phone:top-[190px] phone:left-[20px] phone:w-auto phone:translate-x-0">
        <Circle
          r={474}
          className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 phone:h-[240px] phone:w-[240px] phone:-translate-x-[30%] phone:-translate-y-[55%]"
          pop={0}
          popScale={0.4}
        />
        <Congratulations className="learned-em-all__title__calligraphy absolute top-0 left-0 -translate-x-[66%] -translate-y-[92%] phone:h-[86px] phone:w-[220px] phone:-translate-x-[10%] phone:-translate-y-full" />
        <h1 className="relative m-0 text-brand-red">Congratulations!</h1>
        <p className="relative">You’ve learned all 40 Hangul letters!</p>
      </div>

      <div className="learned-em-all__more absolute top-[300px] left-1/2 w-[340px] translate-x-[160px] translate-y-[50px] phone:top-[300px] phone:right-[20px] phone:left-auto phone:w-[300px] phone:translate-x-0 phone:-translate-y-[20px] phone:text-right">
        <Circle
          r={252}
          className="absolute top-1/2 left-0 -translate-x-[78px] -translate-y-1/2 phone:h-[180px] phone:w-[180px] phone:translate-x-[192px] phone:-translate-y-[48%]"
          pop={0.2}
          popScale={0.4}
        />
        <h3 className="relative m-0 mb-[10px] text-[0.6666rem]">But wait, there’s more!</h3>
        <p className="relative text-[0.5833rem] leading-[1.2]">
          Learn a few special pronunciation rules and you’ll really be able to read Korean like a
          pro.
        </p>
        <Button
          arrow="forward"
          data-autofocus="true"
          className="relative"
          onClick={() => navigate({ to: '/level/$level', params: { level: '5' } })}
        >
          Go to final level
        </Button>
      </div>
    </div>
  )
}
