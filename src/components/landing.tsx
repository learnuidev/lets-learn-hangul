import { motion } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { LandingBrushTitle } from '@/components/landing-brush-title'
import { useUser } from '@/providers/user-store'

/** Landing screen: the intro circle, brush title and the "Let's go!" button. */
export function Landing() {
  const navigate = useNavigate()
  const { user, startHistory } = useUser()
  const latest = user.latest

  const go = () => {
    if (latest) navigate({ to: '/return' })
    else navigate({ to: '/level/$level', params: { level: '1' } })
  }

  return (
    <div className="landing radial phone:[&>*]:top-[300px]">
      <motion.div
        className="landing__circle h-[11.6666rem] w-[11.6666rem] rounded-[600px] bg-white phone:h-[8rem] phone:w-[8rem] phone:-translate-x-1/2 phone:-translate-y-[8rem]"
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
      />

      <LandingBrushTitle className="landing__brush-title -translate-x-full -translate-y-[62%] phone:h-[7rem] phone:w-[7rem] phone:-translate-x-[103%] phone:-translate-y-[8.25rem]" />

      <div className="landing__inner w-[10rem] translate-x-0 -translate-y-[60%] phone:-translate-x-1/2 phone:-translate-y-[6.25rem]">
        <h1 className="mb-[0.5rem] w-[20px] font-semibold uppercase phone:mb-[3rem] phone:ml-[50%]">
          Let’s Learn <b>Hangul!</b>
        </h1>
        <p className="mb-[0.5rem] phone:translate-x-[1rem]">
          Learn to read Hangul, the simple, beautiful Korean alphabet.
        </p>
        <p className="mb-[0.5rem] phone:translate-x-[1rem]">
          <i>It only takes about an hour. Really.</i>{' '}
        </p>
      </div>

      <Button
        arrow="forward"
        className="translate-y-[3.8888rem] phone:translate-y-[5.3888rem]"
        onMouseDown={startHistory}
        onClick={go}
        data-autofocus="true"
      >
        Let’s go!
      </Button>
    </div>
  )
}
