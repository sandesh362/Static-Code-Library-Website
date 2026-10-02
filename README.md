# CodeShelf — Your Practical Code Library

A small, fast, **100% static** website for browsing and copying C/C++ practical
programs. Built with React + Vite, styled with plain CSS, and driven entirely by
one local data file.

There is **no backend, database, API, login, analytics or network request** for
content. Every program lives in `src/data/programs.js`, and the site renders
exactly what is written there.

Currently in the library — **Operating System**: FIFO Page Replacement,
LRU Page Replacement, FCFS Scheduling, SJF Scheduling.

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # dev server  -> http://localhost:5173
npm run build      # static build -> dist/
npm run preview    # serve the built site locally
npm run validate   # check the data file + code round-trip
npm test           # functional smoke test (jsdom)
```

`dist/` is plain HTML/CSS/JS with relative asset paths, so it can be dropped on
any static host (GitHub Pages, Netlify, Vercel, S3, `python -m http.server`, …)
with no configuration.

---

## Adding a program (the only file you need to touch)

Open `src/data/programs.js` and add one object. Nothing else changes — the home
page, subject page, navigation, search and the code viewer all read from this
file.

```js
export const subjects = [
  { id: 'operating-system', name: 'Operating System', icon: 'os', accent: 'indigo' },
  // add a new subject here when you need one
];

export const programs = [
  {
    id: 'fifo-page-replacement',        // unique, lower-case, hyphenated
    subjectId: 'operating-system',      // must match a subject id above
    title: 'FIFO Page Replacement',     // shown as the card + page title
    language: 'C',                      // 'C' or 'C++' → drives the badge
    filename: 'fifo.c',                 // optional, shown above the code
    description: '',                    // optional, only rendered when non-empty
    code: `#include <stdio.h>
int main()
{
    /* paste the exact source here */
    return 0;
}
`,
  },
];
```

Rules (all enforced by `npm run validate`):

* `id` must be unique across every program.
* `subjectId` must match an existing subject `id`.
* Every subject must contain at least one program — the UI never renders an
  empty category.
* `code` must be a non-empty string and is displayed **verbatim**. Do not
  re-indent or "fix" it: the Copy Code button returns exactly these bytes.
* Paste the code inside a template literal (backticks). If your code contains a
  backtick or `${`, escape it as `` \` `` and `\${`.

`icon` accepts `os | dsa | cn | dbms | other` and `accent` accepts
`indigo | emerald | sky | amber | rose | violet` (both optional, with fallbacks).

---

## How it works

| Concern | Implementation |
| --- | --- |
| Routing | Tiny hash router in `src/lib/useHashRoute.js` — `#/`, `#/subject/:id`, `#/subject/:id/program/:id`. No server rewrites needed. |
| Data | `src/data/programs.js` — subjects + programs, with `getSubject` / `getProgram` / `getProgramsForSubject` helpers. |
| Search | `src/lib/search.js` — offline, normalised (lower-case, accent-stripped) matching over titles, subject names and filenames. |
| Highlighting | `src/lib/highlight.js` — a dependency-free C/C++ tokenizer. It is a pure *partition* of the source string, so joining every token back together always reproduces the original code byte-for-byte (verified by `npm run validate` and `npm test`). |
| Copy | `src/lib/copyToClipboard.js` — Clipboard API with a `execCommand('copy')` textarea fallback, plus a visible error message if both fail. |
| Icons | Inline SVG set in `src/components/Icon.jsx` — no icon font, no requests. |
| Styling | Plain CSS with design tokens in `src/styles/` (`base`, `layout`, `code`). No CSS framework. |

### Pages

* **Home** — hero, search bar (`/` to focus, `Esc` to clear), subject cards.
  Typing switches the grid to ranked search results.
* **Subject** — breadcrumb, subject header, optional filter, program cards with
  the language badge and a *View Code* action.
* **Code viewer** — title, language badge, filename, line count, breadcrumb,
  back button, and a dark line-numbered code panel with a *Copy Code* button
  (plus a fixed bottom action bar on phones).

---

## Accessibility & responsiveness

* Semantic landmarks (`header`/`nav`/`main`/`footer`), a skip link, one `h1` per
  page, breadcrumb `nav` with `aria-current`.
* Every card is a real link, so the whole site is keyboard navigable; results
  support `↑`/`↓`; the mobile menu closes on `Esc`, outside click or navigation.
* `role="status"` live regions announce the number of search matches and
  whether the copy succeeded.
* Colour contrast of body, muted and accent text is ≥ 4.5:1; code token colours
  are ≥ 4.5:1 on the dark surface.
* `prefers-reduced-motion` disables all transitions and animations.
* Mobile-first CSS: single-column cards below 560px, a collapsible header nav
  below 760px, horizontally scrolling code blocks (never a sideways page),
  sticky line-number gutter, 44px+ touch targets, and `env(safe-area-inset-*)`
  padding on the fixed action bar. Layouts verified at 320 / 375 / 768 / 1440px.

---

## Project layout

```
index.html                     app shell
vite.config.js                 Vite config (base: './', no server-side code)
public/favicon.svg             brand mark
scripts/
  validate-data.mjs            data invariants + code round-trip check
  smoke-test.mjs               functional test (home → subject → code → copy)
  jsx-loader.mjs               lets Node import the .jsx sources for tests
src/
  main.jsx                     entry point
  App.jsx                      shell + routing + document title
  data/programs.js             ← YOUR PROGRAMS LIVE HERE
  lib/                         router, search, clipboard, highlighter, accents
  components/                  Header, Footer, Home, SubjectPage, CodeViewer,
                               CodeBlock, ProgramCard, SubjectCard, SearchBar,
                               NotFound, Icon
  styles/                      base.css, layout.css, code.css, index.css
```

Runtime dependencies: `react` and `react-dom`. Everything else is dev-only.
