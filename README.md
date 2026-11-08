# Let’s Learn Hangul!

Interactive lessons that teach you to read Hangul, the Korean alphabet, in about an hour.

Originally written in 2016 as a React 15 + Baobab + Express + Gulp app (still in the git
history). This is a full port to a modern stack — same content, same lesson flow, same
visual design.

---

## Quick start (development)

Requires **Node 22+**.

```bash
npm install
npm run dev
```

Then open **<http://localhost:3001>**.

The dev server prints the URL on start; if 3001 is taken Vite picks the next free port.
Hot module replacement is on, and `src/routeTree.gen.ts` is regenerated automatically
whenever you add, move or rename a file in `src/routes/`.

### All scripts

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server with SSR + HMR on port 3001                          |
| `npm run build`     | Production build into `.output/` (Nitro server + client assets)      |
| `npm start`         | Serve the build: `node .output/server/index.mjs` (respects `PORT`)   |
| `npm run preview`   | `vite preview` against the Nitro build                               |
| `npm run typecheck` | `tsc --noEmit` over the whole project                                |

---

## Stack

| Concern        | Choice                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | [TanStack Start](https://tanstack.com/start) 1.x — SSR, streaming, server entry |
| Routing        | [TanStack Router](https://tanstack.com/router) — file-based, fully typed routes |
| UI primitives  | [shadcn/ui](https://ui.shadcn.com) components on Radix (`button`, `badge`, `input`, `tooltip`, `dialog`) |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com) with a custom `@theme`       |
| Animation      | Plain **CSS keyframes** + CSS transitions (no animation library)       |
| Audio          | [Howler](https://howlerjs.com), loaded lazily on first interaction     |
| Markdown       | react-markdown + remark-gfm + remark-breaks + rehype-raw                |
| Build          | Vite 8 + [Nitro](https://nitro.build) (`nitro/vite`) — one build, any host |
| Hosting        | Vercel (`tanstack-start` framework preset); Node/Netlify/Cloudflare work too |

---

## Deployment

The build is a single Nitro pipeline on top of TanStack Start, so deployment needs no custom
server code:

```bash
npm run build     # → .output/  (server + static assets)
npm start         # → node .output/server/index.mjs
```

**Vercel** — zero configuration as well:

- `vercel.json` pins the framework preset (`tanstack-start`), which is only needed when
  auto-detection fails (monorepos, a project that previously used another framework).
- On Vercel, Nitro detects the environment and emits the [Build Output
  API](https://vercel.com/docs/build-output-api/v3) layout — verified locally with
  `VERCEL=1 npm run build`, which produces:

  ```
  .vercel/output/config.json        # routes, asset caching, /__server function
  .vercel/output/functions/__server.func
  .vercel/output/static/…           # public/ assets
  ```

- Then either connect the repo in the dashboard (every push gets a preview URL) or run
  `vercel --prod` / `npx nitro deploy --prebuilt`.

Because the target comes from Nitro, the same repo also builds for a plain Node server
(`npm start`), Netlify and Cloudflare by changing only the environment.

## Architecture

### Rendering & data flow

Every page is **server-rendered** and then hydrated. Course content is static module data
(`src/data/*.ts`), so it is resolved in route loaders / `beforeLoad` rather than fetched
over the network:

- `src/routes/__root.tsx` — root loader returns `{ levels, rounds, geometric }`; renders the
  document shell, providers and the app chrome (constellation, footer, course index).
- `src/routes/level.$level.tsx` — `beforeLoad({ params })` returns the level bundle
  (`level`, `levels`, `rounds`, `shapes`, `jamos`, `words`, `geometric`) which all child
  routes read. This mirrors what the old Express server exposed at `/data/*.json`, but
  without a round trip.
- Markdown slides are split on `---` by `processText()` in `src/lib/text.ts`, exactly like
  the original server did.

### State

There is no global store library. Three React contexts cover the app:

| Provider | File | Responsibility |
| -------- | ---- | -------------- |
| `UserProvider` | `src/providers/user-store.tsx` | Saved progress + hints in `localStorage` (`lets-learn-hangul`), event history, and whether the course index overlay is open |
| `LevelDataProvider` | `src/providers/course-context.tsx` | The level bundle from `beforeLoad` plus typed access to the current route params, so any round screen can call `useRoundData()` |

### Exercise progress lives in the URL

Every exercise step is its own addressable page:

| Exercise | URLs |
| -------- | ---- |
| Warm-up quiz | `/level/1/round/2/pre`, `/pre/2`, `/pre/3`, `/pre/4` |
| Typing | `/level/1/round/2/learn`, `/learn/2` … `/learn/9` |

- The quiz order is derived **deterministically** from the round (`src/lib/quiz.ts`, seeded
  PRNG), so `/pre/3` always shows the same question — reload, back/forward and shared links
  all work.
- The typing exercise asks for `[…]/learn/$step` where the word is simply
  `[headword, ...words][step - 1]` (`getRoundWords`).
- The aggregate numbers for the summary (words read, misses, peeks, elapsed time) are the
  only thing kept out of the URL, in `sessionStorage` (`src/lib/stats.ts`), so
  `/complete` still reports real figures after a reload.

`useSession()` (`src/hooks/use-session.ts`) is a plain hook — no provider — that starts a
round's counters, records hits/misses/peeks into the saved profile, and navigates.

### Routes

URLs are identical to the 2016 site:

```
/                                  landing
/return                            "welcome back" prompt
/level/$level                      level intro ( + /intro/$levelIntro )
/level/$level/complete             level complete ( + /complete/$levelComplete )
/level/$level/round/$round         round intro ( + /intro/$roundIntro )
        …/letters                  letters overview ( + /letters/$letters )
        …/letter                   one letter at a time ( + /letter/$letter )
        …/headword                 round keyword ( + /headword/$headword )
        …/pre                      warm-up quiz
        …/ready                    "Ready?" screen that starts the session
        …/learn                    typing exercise (guarded: needs an active session)
        …/complete                 round summary ( + /complete/review, /complete/letters )
/learnedemall                      "you learned all 40 letters" milestone
/learnedeverything                 finale counter
/nowwhat                           share + further resources
/credits                           audio and photo credits
```

`src/routeTree.gen.ts` is generated by the TanStack Start plugin (on `dev`/`build`) and is
committed so `npm run typecheck` works on a fresh clone.

### Styling & animation

`src/styles/app.css` holds the design system:

- **Theme** — palette (`--color-butter`, `--color-brand-red`, …), font stacks and the
  `--radius-bubble` token, all carried over from the original `_colors.scss`.
- **Root font-size is `36px`** (`27px` on phones), which is why layout values are written in
  the original `rem`/`px` units instead of Tailwind’s spacing scale.
- **Breakpoints are declared in `px`** (`phone`, `tablet`, `wide`, `sm-desktop`, `desktop`)
  because rem-based media queries would scale with that 36px root.
- **`.radial`** is the ported Sass mixin: a relative box whose children are absolutely
  centred. It sets the individual `translate` property (not `transform`) so per-screen
  `translate-*` utilities override it the way the original `transform` rules did.
- **Transitions animate `translate`, `scale` and `opacity`**, never `transform` — Tailwind v4
  emits those as individual CSS properties, so `transition-transform` would silently do
  nothing. The shared “swipe up + fade” interaction (level/round indicator, logo, jamo
  table) uses `transition-[translate_200ms_ease-out,opacity_100ms_ease-in]`.
- **Entry animations are CSS keyframes** (`pop-in`, `pop-in-soft`, with a per-element
  `--pop-from` and `animation-delay`) because an animation runs exactly once per inserted
  element and cannot be restarted by a re-render.
- `scrollbar-gutter: stable` on `html` keeps the fixed header from shifting when an overlay
  opens.

### Assets

Everything the app serves at runtime lives in `public/` and is copied into `dist/client` by
the build: `audio/` (word and jamo clips plus `sprite.mp3` for the correct/wrong effects),
`images/`, `sounds/` and `favicon.ico`.

---

## Project layout

```
src/
├── routes/                 # file-based routes; URLs match the original site
│   ├── __root.tsx          # document shell, providers, app chrome
│   ├── level.$level.*      # level intro, round branch, level complete
│   └── learnedemall.tsx / learnedeverything.tsx / nowwhat.tsx / credits.tsx
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── *.tsx               # screens (landing, round-*, learned-*) and visuals
├── providers/              # user store, session state machines, level context
├── lib/                    # hangul, romanization, display ids, sound, markdown, helpers
├── data/                   # typed course content + shared data types
├── hooks/                  # global Enter-to-activate handler
└── styles/
    ├── app.css             # Tailwind theme, base typography, shared component classes
    └── data-uris.css       # arrow glyphs and social logos from the 2016 stylesheet
vercel.json                 # framework preset hint for Vercel
```

---

## Behaviour notes

- Progress is stored in `localStorage` under `lets-learn-hangul` and read after mount, so the
  server and client markup stay identical.
- Pressing <kbd>Enter</kbd> anywhere triggers the screen's primary action
  (`[data-autofocus]`), as in the original app.
- Romanization accepts every valid reading of a word; after three misses on the same word the
  answer is revealed and “Next” moves on (`src/lib/romanize.ts`, `src/lib/validation.ts`).
- Audio is only initialised after the first interaction, so nothing is downloaded on load.

## Credits

Written, designed and built by [Noah Burney](http://noahburney.net).
Pronunciations from [Forvo](http://forvo.com) — the full attribution list is on `/credits`.
