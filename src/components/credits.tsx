import { Logo } from '@/components/logo'
import type { Credit } from '@/data/types'

/** Attribution page for the audio and photography used in the course. */
export function Credits({ credits }: { credits: Credit[] }) {
  return (
    <div className="credits pb-[5rem]">
      <Logo />

      <div className="credits__audio">
        <h5>Pronunciations from Forvo</h5>
        <div className="columns-4 gap-[40px] text-[16px] leading-[24px]">
          {credits.map((credit, i) => (
            <div className="credit break-inside-avoid" key={`${credit.word}-${credit.user}-${i}`}>
              <a href={credit.url} target="_blank" rel="noreferrer">
                {credit.word} by {credit.user}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="credits__images">
        <h5>Photos</h5>
        <div className="columns-4 gap-[40px] text-[16px] leading-[24px]">
          <div className="credit break-inside-avoid">
            <a
              href="https://www.flickr.com/photos/msgfoodblog/6149570148/in/dateposted/"
              target="_blank"
              rel="noreferrer"
            >
              Kimchi by Jin Li
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
