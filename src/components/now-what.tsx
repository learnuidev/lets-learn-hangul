import { useEffect, useState } from 'react'
import { Circle } from '@/components/circle'
import { Bragging } from '@/components/bragging'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { getFacebookShareUrl, getTwitterShareUrl } from '@/lib/social'

/** Post-course page: share the achievement and point at further resources. */
export function NowWhat() {
  // Share URLs depend on window.location (app id + redirect), so they are built
  // after mount to keep the server and client markup identical.
  const [shareUrls, setShareUrls] = useState<{ twitter: string; facebook: string } | null>(null)

  useEffect(() => {
    setShareUrls({ twitter: getTwitterShareUrl(), facebook: getFacebookShareUrl() })
  }, [])

  return (
    <div className="now-what">
      <Logo />

      <div className="now-what__social absolute top-[300px] left-1/2 -translate-x-[160px] -translate-y-[100px] [@media(max-width:1160px)and(min-width:901px)]:top-[340px] tablet:top-[240px] tablet:translate-x-[18px] tablet:translate-y-0 phone:-translate-x-[12px] phone:-translate-y-[140px]">
        <Circle
          r={320}
          className="absolute -top-[88px] -left-[182px] phone:-top-[40px] phone:-left-[100px] phone:h-[220px] phone:w-[220px]"
          pop={0}
          popScale={0.5}
        />
        <Bragging className="calligraphy absolute -top-[110px] -left-[288px] phone:-top-[3px] phone:-left-[145px] phone:h-[110px] phone:w-[135px]" />

        <div className="relative">
          <h1 className="m-0 text-[1rem] leading-[1rem] font-semibold uppercase phone:text-[0.8rem]">
            Brag&nbsp;to your&nbsp;friends!
          </h1>
        </div>

        <div className="now-what__social__buttons absolute top-[100px] -left-[75px] phone:top-[4px] phone:left-0">
          <Button asChild variant="twitter" className="absolute top-0 left-0 block">
            <a href={shareUrls?.twitter} target="_blank" rel="noreferrer">
              <span className="long">Share on Twitter</span>
              <span className="short hidden phone:inline">Tweet</span>
            </a>
          </Button>

          <Button
            asChild
            variant="facebook"
            className="absolute top-[60px] left-[29px] block phone:top-[118px] phone:left-0"
          >
            <a href={shareUrls?.facebook} target="_blank" rel="noreferrer">
              <span className="long">Share on Facebook</span>
              <span className="short hidden phone:inline">Post</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="now-what__resources absolute top-[300px] left-1/2 translate-x-[185px] translate-y-[-4px] [@media(max-width:1160px)and(min-width:901px)]:top-[340px] tablet:translate-x-[-220px] tablet:translate-y-[260px] phone:top-[330px] phone:inset-x-0 phone:translate-x-0 phone:translate-y-0 phone:px-[0.5rem]">
        <Circle
          r={171}
          className="absolute -top-[40px] -left-[70px] phone:hidden"
          pop={0.15}
          popScale={0.5}
        />

        <div className="now-what__resources__text relative z-1 w-[340px] text-[0.5rem] leading-[0.6666rem] phone:mx-auto phone:w-[270px]">
          <h3 className="mb-[0.25rem]">Want to keep learning Korean?</h3>
          <p className="my-[0.25rem]">
            Here are a few of my favorite online resources to get started:
          </p>
          <ul className="my-[0.25rem] pl-[10px]">
            <li className="list-none before:mr-[10px] before:content-['→']">
              <a href="http://www.talktomeinkorean.com">Talk To Me In Korean</a>
            </li>
            <li className="list-none before:mr-[10px] before:content-['→']">
              <a href="http://www.howtostudykorean.com">How to Study Korean</a>
            </li>
          </ul>
          <p className="font-korean font-normal">
            화이팅!
            <br />— 노아
          </p>
        </div>
      </div>
    </div>
  )
}
