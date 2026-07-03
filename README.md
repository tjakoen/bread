# 🥖 BATCH

**B**un · **A**ddressable · **T**ypeScript · **C**SS · **H**tmx

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](./portfolio/notes/ten-times-zero.md)
![Bun](https://img.shields.io/badge/Bun-1.3-000?logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![No build step](https://img.shields.io/badge/build_step-none-2ea44f)
![Runtime deps](https://img.shields.io/badge/runtime_deps-0-2ea44f)
![Atomic Design](https://img.shields.io/badge/design-atomic-ff6b6b)

A no-build, server-rendered hypermedia stack, and a working reference app that
proves it out. No client framework, no bundler, no template language. Just web
standards, a runtime, and ~600 lines of glue.

> **Status:** proof-of-concept / personal reference architecture. The whole thing
> runs (`tsc` green, tests pass), but it's built to think with, not to ship to prod
> as-is. Read [`batch/docs/ARCHITECTURE.md`](./batch/docs/ARCHITECTURE.md) for the full reasoning; it's
> the single source of truth.

> **Four concerns in this repo (monorepo).** `batch/` is **the stack** (BATCH, the
> generic no-build substrate this README + [`batch/docs/ARCHITECTURE.md`](./batch/docs/ARCHITECTURE.md)
> describe). `grain/` is **GRAIN**, the AI-interaction design system built on BATCH
> ([`grain/docs/GRAIN.md`](./grain/docs/GRAIN.md)). On top sit three independent consumers: `project/`,
> **the product**, a personal AI assistant; `mill/`, **MILL**, a Markdown→GRAIN CMS (a
> reusable layer above grain; *planned*); and `portfolio/`, the personal site, a custom
> BATCH+GRAIN app that *uses* MILL for its content. `project/server.ts` is the composition
> root. No Bun workspaces: relative imports, one root `package.json` + `tsconfig`. Each is
> headed for its own repo once proven; the boundaries are kept clean. The *why* lives in
> [`PHILOSOPHY.md`](./portfolio/PHILOSOPHY.md); start reading at [`CLAUDE.md`](./CLAUDE.md) or
> [`DOCS.md`](./DOCS.md).

> **New here (AI or human)?** Start at [`CLAUDE.md`](./CLAUDE.md): the orientation +
> operating rules (incl. the "when you change X, update Y" matrix). Then
> [`CONVENTIONS.md`](./batch/docs/CONVENTIONS.md), the build standard: layering, component authoring,
> the action vocabulary, tokens, and the three-tier testing bar (unit · integration · e2e).

---

## The bet

Most web stacks answer "how do I build a UI?" with a client framework, a build
pipeline, and a state-sync problem. BATCH bets you can delete all three for a large
class of apps (dashboards, internal tools, second-brain surfaces) and lean on the
platform instead:

- **No build step.** Bun runs TypeScript directly (type-stripping). The "build"
  that turns source into HTML lives in the *server*, composing on every request:
  edit, refresh, done.
- **Server-rendered hypermedia.** Pages and fragments are HTML. htmx handles the
  interactions. The browser never sees a component tag.
- **Atomic components, one file each** (atoms → molecules → organisms, the method
  [Brad Frost](https://atomicdesign.bradfrost.com/) named). A component's `.html` is
  simultaneously the designer's mockup, the production template, and the documentation of
  its own bindings. Its `.css` sits right next to it.
- **Standards first, native second, library last.** The composition engine uses
  Bun's native `HTMLRewriter` (the Cloudflare Workers API) for parsing/escaping:
  the scariest job is done by the platform, not hand-rolled.

The cost is honest and documented: rich client interactions (drag-drop, optimistic
UI, offline) fight the grain, and progressive enhancement is partial. The trade is
taken on purpose.

---

## What's interesting in here

Even if you never use it, a few ideas might be worth stealing:

- **One composition engine, ~120 lines.** Components are hyphenated HTML tags
  (`<b-button>`, `<item-card>`) expanded server-side in two passes: bind data,
  then expand children. Data binding is a handful of attributes (`data-field`,
  `data-bind-*`, `data="path"`, `each="path"`); there's nothing else to learn.
- **Vanilla CSS, one class per element.** Variants are *attributes*, not stacked
  utility classes: `<b-button variant="soft" size="lg">`, styled by
  `.btn[data-variant="soft"]`. Design tokens are two-layered (raw palette
  primitives → semantic aliases); components touch only semantic tokens, so a
  one-line primitive edit re-themes everything.
- **Co-located everything, bundled by the framework.** Component CSS is gathered
  into one `/components.css` at request time. Component docs (`<name>.md`) generate
  a live **Storybook-style catalog** at `/catalog` (every state rendered live with
  copyable source) with zero dependencies and no build.
- **One sitemap, three uses.** Page routes are derived from the `pages/` tree and
  feed the catalog's nav, `/sitemap.xml`, and `/robots.txt`.
- **Native cross-document View Transitions.** Page navigation is real `<a href>`
  loads that *animate*: `@view-transition { navigation: auto }`, no client router.
- **Clean architecture, exercised.** Domain → services → routes, with storage
  behind an `ItemRepository` port (in-memory wired; SQL/REST are one-adapter swaps)
  and the runtime behind a platform port. `/framework` has **zero** imports from
  `/app`: delete the app and the engine is reusable.
- **Erasable-only TypeScript.** No `enum`, no parameter properties; stays inside
  the subset Bun/Node can run without transpiling.

---

## A page, in full

Pages compose components; the styling/markup detail lives inside each component.

```html
<body>
  <main class="container">
    <app-header active="items" />
    <h1>Items</h1>

    <form class="add-form" hx-post="/ui/items" hx-swap="none">
      <b-input name="name" label="Name" required />
      <b-input name="description" label="Description" required />
      <b-button label="Add" type="submit" />
    </form>

    <div id="list" hx-get="/ui/items" hx-trigger="load, refresh">Loading…</div>
  </main>
</body>
```

The server expands `<app-header>`, `<b-input>`, `<b-button>` into plain HTML;
`/ui/items` returns HTML fragments; htmx swaps them in. Same `ItemService` also
serves `/api/items` as JSON for programmatic consumers.

---

## Quick start

Needs [Bun](https://bun.sh) (pinned `1.3.x`).

```sh
bun install
bun run dev        # http://localhost:3000  (hot reload, no build)
bun test           # the test suite
bun run check      # tsc --noEmit (erasable-only)
```

Then visit:

| Route | What |
|---|---|
| `/` | entrance |
| `/home` | the Items app (htmx CRUD) |
| `/loop` | the AI interaction-loop demo (GRAIN) |
| `/catalog` | the live component catalog (Human/AI toggle, search) |
| `/api/items` | the same data as JSON |
| `/sitemap.xml`, `/robots.txt` | derived from the pages tree |

---

## Project layout (monorepo)

```
CLAUDE.md · README.md · SPLIT-PLAN.md   # entry points at root (SPLIT-PLAN = the future repo-split map)
AUDIT.md · DOCS.md       # AUDIT = whole-stack runbook; DOCS.md = the map of where every doc lives
portfolio/PHILOSOPHY.md  # the shared *why* (lives with the public/narrative material)
portfolio/standards/     # personal, cross-repo standards (public): VOICE.md + README-STANDARD.md + CLAUDE.starter.md
batch/                   # the reusable substrate, zero grain/project knowledge
├── docs/                #   ARCHITECTURE.md (SSOT) + CONVENTIONS.md (build standard)
├── render/              #   the composition engine (multi-root) + test fixtures
├── http/                #   static, pages, sitemap, stream (SSE), validate, errors
├── assets/              #   component CSS bundler   ├── catalog/  the /catalog generator
└── platform/            #   runtime port + Bun adapter + hot reload
grain/                   # GRAIN, the AI design system (built on batch)
├── docs/                #   GRAIN.md + AI-INTERFACE.md + DESIGN-SYSTEM.md
├── ai/                  #   contract (SSOT), interaction-layer, reasoner, manifest, accepts
├── components/atoms/    #   the b-* primitives
├── scripts/             #   ai-dispatch.js (dispatcher) + cmdk.js (⌘K palette)
└── styles/grain.css     #   the grade + spotlight mechanism
project/                 # the app + skin (built on grain)
├── CLAUDE.md · PROJECT-PLAN.md   # onboarding + the product's master vision
├── docs/                #   MVP.md (the current slice)
├── domain|data|services|routes|view|config
├── components/          #   item-card, loop-card, app-header, …
├── pages/               #   flat .html; folders only group subpages
├── styles/              #   Bread tokens + @font-face, base skin
├── fonts/ vendor/       #   self-hosted Redaction · vendored htmx
└── server.ts            #   composition root: the only place batch+grain+project meet
package.json · tsconfig.json   # one each, at the root (no workspaces)
```

---

## A note on "open it as a file"

You can't open a composed page as a bare `file://` and have it render, and that's
a web-platform limit, not a missing feature. Composing a custom tag needs its
template at render time, which means a server, a (blocked) `file://` fetch, or
inlined templates (a build). BATCH puts that work in the **server**, which *is* the
no-build step. So pages are previewed on localhost; individual component `.html`
files still open standalone as mockups. The full reasoning is in `batch/docs/ARCHITECTURE.md`
(§0.5).

---

## License

Personal reference project. Use the ideas freely.

---

🤖 **Built by one chronically disorganized human and one alarmingly tidy AI.** I make the calls,
Claude does the typing, and I take most of the credit. People throw "vibe coder" around like it is
an insult, so I counted, and it turns out I am the kind that shows up with receipts. **I don't
prompt and pray. I prompt and prove.**
[Here's how I actually work with AI (numbers and all) →](./portfolio/notes/ten-times-zero.md)
