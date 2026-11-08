# Let’s Learn Hangul!

Interactive lessons that teach you to read Hangul, the Korean alphabet, in about an hour.

Originally written in 2016 as a React 15 + Baobab + Express + Gulp app. This is a
complete port to a modern stack — same content, same lesson flow, same visual design.

## Stack

| Concern     | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | [TanStack Start](https://tanstack.com/start) (SSR + server routes) |
| Routing     | [TanStack Router](https://tanstack.com/router) — file-based routes |
| UI          | [shadcn/ui](https://ui.shadcn.com) primitives + Radix          |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com) with a custom theme |
| Animation   | [Motion](https://motion.dev) (springs) + CSS transitions       |
| Audio       | [Howler](https://howlerjs.com)                                 |
| Markdown    | react-markdown + remark-gfm + remark-breaks + rehype-raw       |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build into dist/
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

Requires Node 22+.

## Project layout

```
src/
├── routes/            # file-based routes (URLs mirror the original site)
│   ├── __root.tsx     # document shell, providers, app chrome
│   ├── index.tsx      # landing
│   ├── level.$level.* # level intro, round branch, level complete
│   ├── learnedemall.tsx / learnedeverything.tsx / nowwhat.tsx / credits.tsx
├── components/        # screens (landing, round-*, learned-*) and visuals
│   └── ui/            # shadcn/ui primitives (button, badge, input, tooltip, dialog)
├── providers/
│   ├── user-store.tsx     # saved progress + hints (localStorage) and course index
│   ├── session-store.tsx  # the learn/warm-up session state machines
│   └── course-context.tsx # level bundle + route params for round screens
├── lib/               # hangul, romanization, display ids, sound, markdown, helpers
├── data/              # typed course content (course, jamos, words, shapes, …)
└── styles/app.css     # Tailwind theme, base typography, shared component classes
```

## Notes on the port

- **Design tokens** live in the `@theme` block of `src/styles/app.css`
  (`--color-butter`, `--color-brand-red`, `--radius-bubble`, …). The document root
  is `36px` (`27px` on phones), which is why layout values are written in the
  original `rem`/`px` units rather than Tailwind's spacing scale.
- **Breakpoints** are declared in `px` on purpose (`phone`, `tablet`, `wide`,
  `sm-desktop`, `desktop`) — rem-based media queries would scale with that 36px root.
- **Centring** uses the `.radial` component class, which sets the individual
  `translate` property so Tailwind's `translate-*` utilities override it per screen.
  For the same reason, hover/enter transitions animate `translate`, `scale` and
  `opacity` (not `transform`), since Tailwind v4 emits individual properties.
- **Progress and hints** persist to `localStorage` under `lets-learn-hangul`, and a
  global Enter-key handler still activates the screen's `[data-autofocus]` action.
- **Data** is static module content, resolved in route loaders/`beforeLoad` so pages
  render on the server.

## Credits

Written, designed and built by [Noah Burney](http://noahburney.net).
Pronunciations from [Forvo](http://forvo.com); see `/credits` for the full list.
