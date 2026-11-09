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
| Runtime        | [TanStack Redact](https://tanstack.com/redact/latest) — a smaller drop-in React runtime (see [Runtime](#runtime)) |
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

### Runtime

[TanStack Redact](https://tanstack.com/redact/latest) replaces the React runtime at build
time: `redact()` in `vite.config.ts` redirects `react` / `react-dom` imports to Redact's own
implementation, so the app keeps writing ordinary React — components, hooks, Context,
`createRoot`, `hydrateRoot` — while shipping a smaller, synchronous runtime. React and React
DOM stay installed; nothing in `src/` imports Redact directly.

Two configuration details are deliberate:

- **Feature flags stay at the default full set.** The optional `nano` preset (and
  `portal: false`) would break Radix's dialog and tooltip, which render through
  `createPortal`, and Start needs hydration, context, Suspense, lazy, memo and `forwardRef`.
- **`ssr.noExternal` is enabled for `build` only.** Bundling server dependencies is what lets
  Redact reach their `react` imports. During `vite dev` the same setting makes Vite's SSR
  module runner inline CJS packages such as `tslib` (via `react-remove-scroll` ← Radix),
  whose default export it cannot interop, and every route 500s.

Verified against the production build and the dev server: SSR on every route, hydration with
no console errors, client-side navigation, controlled inputs, form submission, and portaled
dialog/tooltip content.

### State

There is no global store library. Three React contexts cover the app:

| Provider | File | Responsibility |
| -------- | ---- | -------------- |
| `UserProvider` | `src/providers/user-store.tsx` | Saved progress + hints in `localStorage` (`lets-learn-hangul`), event history, the lifetime stats record, and whether the course index overlay is open |
| `LevelDataProvider` | `src/providers/course-context.tsx` | The level bundle from `beforeLoad` plus typed access to the current route params, so any round screen can call `useRoundData()` |

### Stats

Both halves of a round are recorded: every warm-up quiz answer (`round-prelearn.tsx`) and every
word typed, missed, peeked at or finished in the typing exercise (`use-session.ts`). They land
in two shapes, both inside the saved profile, so `/stats` never needs a server:

| Bucket | Shape | Used for |
| ------ | ----- | -------- |
| `stats.days` | one `{ words, misses, peeks, lessons, quizCorrect, quizWrong }` per local day | totals, the daily streak, the last-two-weeks discs |
| `stats.rounds` | the same counters per `level.round`, plus `lastAt` and `bestSeconds` | performance per lesson |

- `src/lib/lifetime.ts` holds all of it as pure functions — `incrementLifetime`,
  `computeStreaks`, `totalCounts`, `recentDays` — so the provider stays a thin `setState`
  wrapper and the logic is testable without a DOM.
- `bestSeconds` comes from the round's `sessionStorage` attempt record at
  `completeSession()`, and only ever ratchets down.
- A profile written before this feature existed has `history` but no `stats`, so
  `normalizeLifetime` replays that log into the new buckets on first load and writes the
  result back — earlier practice keeps counting, and the replay is not repeated every load.
  The replay understands every recorded event type (`word-hit`, `word-miss`, `peek`,
  `session-complete`, `quiz-correct`, `quiz-wrong`). Quiz answers were only recorded from
  this feature onward, so a profile whose quiz practice predates it starts at zero there:
  the figures appear once a quiz is played again.
- `history` is capped at `HISTORY_LIMIT` (500) entries. Lifetime numbers live in `stats`; the
  log is only a recent-activity trail, and without a cap it would grow until `localStorage`
  gave out.

### One progress page, two tabs

`/stats` and `/unlocks` are the same page with a different tab open. Both routes render
`src/components/progress-page.tsx`, which puts the tab strip on top and then hands off to
`stats-page.tsx` or `unlocks-page.tsx`; each tab keeps its own `.radial` stage and sections, so
neither had to be re-laid-out to be merged.

- The tabs are real links (`src/components/progress-tabs.tsx`), so every section keeps its own
  URL, back/forward works, and a shared link opens the section it names.
- They are built from the `Button` primitive: the open tab is `variant="default"` (the blue-soft
  fill), the others `variant="quiet"` — the same box, radius and type as every other control, so
  switching tabs moves nothing.
- Adding a section is one route file, one entry in `PROGRESS_TABS`, and one view in
  `progress-page.tsx`; nothing else in the app needs to know the record was split up.
- One corner icon (`progress-link.tsx`, bottom-left) opens the page on its first tab and is
  hidden while the record is open. It probably goes without saying that the numbers appear
  after hydration: the record only exists in the browser.

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

### Unlocks

`/unlocks` answers a different question from `/stats`: not *what have I practised* but *what
can I read now*. The course teaches 40 letters one round at a time, so every syllable block
and every word sits on that timeline, and `src/lib/unlocks.ts` derives the whole collection
from the saved profile:

| State | Meaning |
| ----- | ------- |
| **read** | every letter it is spelled with has been taught |
| **half-read** | some of its letters are known; the rest are listed as `needs ㄹ ㅓ` |
| **locked** | none of its letters have come up yet |

- `src/data/korean.ts` — 987 syllable blocks and 2,308 words with English glosses,
  **generated** from the Korean dataset in the `mandarino-client` repo by
  `node scripts/build-korean-data.mjs` (its header documents the source layout). The module is
  committed, like `course.ts`, and only the unlocks route imports it, so it rides in its own
  chunk instead of the shared bundle.
- `src/data/translation-fixes.json` — hand-written corrections to those glosses, keyed by the
  Korean spelling. The generator applies them, so a correction is never lost to a rebuild, and a
  key that no longer matches an entry fails the build instead of failing silently. Lesson words
  live in `words.ts` and are corrected there directly.
- Each item stores the lesson that teaches the **last** of its letters — the lesson that makes
  it readable. That one number orders the page (easiest first) and groups the collection.
- Cluster finals (ㄳ, ㄺ, ㅄ, …) are the one exception: the course never introduces them as
  letters — level 5 introduces them as *pronunciation* rules — so they are read as the two
  consonants they are built from (ㄺ needs ㄹ and ㄱ). Everything else waits for its own
  lesson: ㅆ, ㅉ, ㄲ, ㅘ and ㅢ are all taught as letters.
- Pronunciations come from the app's own romanizer (`romanizeIdeal` in
  `src/lib/romanize.ts`), so the collection, the round screens and the typing exercise can
  never disagree about how a block is read. That entry point is the cheap half of
  `getRomanizations`: it skips the regexps and the cartesian product of every acceptable
  spelling, which only the typing exercise needs — all 3,300 items cost ~10 ms instead of
  ~140 ms, without holding tens of thousands of candidate strings in memory.
- **Only lessons actually finished teach letters** (`completedLessons` in `src/lib/lifetime.ts`):
  `stats.rounds[key].lessons > 0`, plus `latest` for profiles saved before that record existed.
  `latest` is *not* expanded into “every lesson before it” — nothing stops a learner from
  opening a late round directly, and doing so must not credit them with the course ahead of
  it. Finishing “Oppa!” from a fresh profile unlocks ㅃ·ㄸ·ㄲ, not the alphabet.
- The two counters that mention a number (the round-complete “They unlock …” line and the
  “Next up” line) go through `gainForLesson`, which asks what those letters make readable
  against the letters known *now*. Taken in order that equals the lesson's own total; taken
  out of order it reports what actually opened — and 0, with a pointer back to earlier
  lessons, when nothing did.
- Every block in the grid opens `/unlocks/blocks/$block` — the block big, its letters as
  discs, and every word it is spelled into, split into **Read now**, **One letter away** and
  **Still needs letters**. That split, and the highlighted block inside each word, come from
  the same derived state; the reverse index (`wordsForBlock`) is built once with the rest of
  the collection.
- The whole collection is drawn on one module: a **100px cell** on a 1000px column, the same
  width and rhythm as the round summary's letter table and the `.radial` stage above it.
  Letters are ten across (`UnlockLettersTable` — the round-end `JamoTable` grid, geometric
  glyphs, red consonants and blue vowels, ghosts for the letters not learned yet, romanisation
  revealed on hover), and syllable blocks and words are ten across in the same 100px cell, so
  the three grids line up column for column. Each section keeps its own colours: the
  collection's white/pale discs and blue romanizations for blocks; for words the spelling
  (dark where the learner can already read it), blue pronunciation, gloss, and the letters
  still missing in red beside the CEFR band. "Show more" moves in whole rows, 100 words and 80
  blocks at a time. Prose inside a wide section is capped at 640px (`SectionProse`) so the
  line length stays readable.
- Two filters, one direction (`src/components/filters.tsx`): the **state** pills (All / Read /
  Half-read / Locked) above the list, and a **CEFR level** dropdown (`LevelSelect`,
  A1/A2/B1/B2) at the right-hand end of the Words title row. The pills always count the whole
  collection — picking a level never rewrites them. The dropdown is the finer read: its counts
  follow the selected state, so "Locked" reports its own A1/A2/B1/B2 split
  (`All 298, A1 115, A2 78, B1 52, B2 53`). The grid is the intersection of the two. The level
  dropdown is also on a letter's and a block's page, over that page's own words.
- Every letter in that grid opens `/unlocks/letters/$letter` — the same stage and the same three-way
  split, asked of a letter instead: the blocks and words spelled with it (**Read now**,
  **One letter away** — only this letter is holding them back — and **Still needs letters**),
  the figures those counts feed, and the letters that arrive with it in the same lesson.
  `syllablesForLetter` and `wordsForLetter` are the reverse of each item's `letters`, built in
  the same pass as `wordsForBlock`. A letter the course never teaches (a cluster final such as
  ㄳ, or anything typed into the URL) gets the same "not here" page a missing block gets.

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
/stats                             progress page, stats tab (what you have practised)
/unlocks                           progress page, unlocks tab (what you can read)
/unlocks/blocks/$block             one syllable block, and every word using it
/unlocks/letters/$letter           one letter, and every block and word using it
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
│   └── stats.tsx / unlocks.*.tsx   # one progress page + its block and letter pages
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── *.tsx               # screens (landing, round-*, learned-*) and visuals
├── providers/              # user store, session state machines, level context
├── lib/                    # hangul, romanization, display ids, sound, markdown, helpers
├── data/                   # typed course content + shared data types
├── hooks/                  # Enter-to-activate, and the unlock derivation
└── styles/
    ├── app.css             # Tailwind theme, base typography, shared component classes
    └── data-uris.css       # arrow glyphs and social logos from the 2016 stylesheet
scripts/
└── build-korean-data.mjs   # regenerates src/data/korean.ts from the mandarino dataset
vercel.json                 # framework preset hint for Vercel
```

---

## Behaviour notes

- Progress is stored in `localStorage` under `lets-learn-hangul` and read after mount, so the
  server and client markup stay identical.
- **A lesson counts once it has been finished**, everywhere: the course index dims every
  lesson that is not in `completedLessons()`, except the earliest unfinished one — the lesson
  the learner should take next. Finishing a late round out of order therefore lights up that
  round and the gap, not the twenty-one lessons behind it. `nextLessonToTake()` in
  `src/lib/resume.ts` is the single source of that target, so the index, the welcome-back
  prompt, `/stats` and `/unlocks` cannot disagree about where a learner belongs.
- Pressing <kbd>Enter</kbd> anywhere triggers the screen's primary action
  (`[data-autofocus]`), as in the original app.
- Romanization accepts every valid reading of a word; after three misses on the same word the
  answer is revealed and “Next” moves on (`src/lib/romanize.ts`, `src/lib/validation.ts`).
- Words are romanized one jamo slot per character, so a word with a non-Hangul character in
  the middle (`로봇이 아니다`, `읽은 책`) needs a slot the jamo list does not have. The reading
  list is now built as the scan fills it instead of being pre-sized from the jamo count, which
  used to throw `Cannot read properties of undefined` on exactly those three course words.
- Audio is only initialised after the first interaction, so nothing is downloaded on load.

## Credits

Written, designed and built by [Noah Burney](http://noahburney.net).
Pronunciations from [Forvo](http://forvo.com) — the full attribution list is on `/credits`.
