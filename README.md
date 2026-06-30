# BATCH

**B**un · **A**tomic · **T**ypeScript · **C**SS · **H**tmx

A no-build, server-rendered hypermedia stack — and a working reference app that
proves it out. No client framework, no bundler, no template language. Just web
standards, a runtime, and ~600 lines of glue.

> **Status:** proof-of-concept / personal reference architecture. The whole thing
> runs (`tsc` green, tests pass), but it's built to think with, not to ship to prod
> as-is. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full reasoning — it's
> the single source of truth.

> **Two layers in this repo.** This README + [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> are **the stack** (BATCH — generic, the future standalone repo). [`docs/`](./docs/)
> is **the product** being built on it first — a personal AI assistant / second brain.
> The plan: build the product, dogfood it, then extract the stack. The
> `poc/framework/` ↔ `poc/app/` boundary is kept clean so that extraction is a copy,
> not a rewrite. Start at [`docs/README.md`](./docs/README.md).

---

## The bet

Most web stacks answer "how do I build a UI?" with a client framework, a build
pipeline, and a state-sync problem. BATCH bets you can delete all three for a large
class of apps (dashboards, internal tools, second-brain surfaces) and lean on the
platform instead:

- **No build step.** Bun runs TypeScript directly (type-stripping). The "build"
  that turns source into HTML lives in the *server*, composing on every request —
  edit, refresh, done.
- **Server-rendered hypermedia.** Pages and fragments are HTML. htmx handles the
  interactions. The browser never sees a component tag.
- **Atomic components, one file each.** A component's `.html` is simultaneously the
  designer's mockup, the production template, and the documentation of its own
  bindings. Its `.css` sits right next to it.
- **Standards first, native second, library last.** The composition engine uses
  Bun's native `HTMLRewriter` (the Cloudflare Workers API) for parsing/escaping —
  the scariest job is done by the platform, not hand-rolled.

The cost is honest and documented: rich client interactions (drag-drop, optimistic
UI, offline) fight the grain, and progressive enhancement is partial. The trade is
taken on purpose.

---

## What's interesting in here

Even if you never use it, a few ideas might be worth stealing:

- **One composition engine, ~120 lines.** Components are hyphenated HTML tags
  (`<b-button>`, `<item-card>`) expanded server-side in two passes — bind data,
  then expand children. Data binding is a handful of attributes (`data-field`,
  `data-bind-*`, `data="path"`, `each="path"`); there's nothing else to learn.
- **Vanilla CSS, one class per element.** Variants are *attributes*, not stacked
  utility classes: `<b-button variant="soft" size="lg">`, styled by
  `.btn[data-variant="soft"]`. Design tokens are two-layered (raw palette
  primitives → semantic aliases); components touch only semantic tokens, so a
  one-line primitive edit re-themes everything.
- **Co-located everything, bundled by the framework.** Component CSS is gathered
  into one `/components.css` at request time. Component docs (`<name>.md`) generate
  a live **Storybook-style catalog** at `/catalog` — every state rendered live with
  copyable source — with zero dependencies and no build.
- **One sitemap, three uses.** Page routes are derived from the `pages/` tree and
  feed the catalog's nav, `/sitemap.xml`, and `/robots.txt`.
- **Native cross-document View Transitions.** Page navigation is real `<a href>`
  loads that *animate* — `@view-transition { navigation: auto }`, no client router.
- **Clean architecture, exercised.** Domain → services → routes, with storage
  behind an `ItemRepository` port (in-memory wired; SQL/REST are one-adapter swaps)
  and the runtime behind a platform port. `/framework` has **zero** imports from
  `/app` — delete the app and the engine is reusable.
- **Erasable-only TypeScript.** No `enum`, no parameter properties — stays inside
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
cd poc
bun install
bun run dev        # http://localhost:3000  — hot reload, no build
bun test           # the test suite
bun run check      # tsc --noEmit (erasable-only)
```

Then visit:

| Route | What |
|---|---|
| `/` | entrance |
| `/home` | the Items app (htmx CRUD) |
| `/about` | a second page (try the animated nav) |
| `/catalog` | the live component catalog |
| `/api/items` | the same data as JSON |
| `/sitemap.xml`, `/robots.txt` | derived from the pages tree |

---

## Project layout

```
ARCHITECTURE.md          # the single source of truth — read this
poc/
├── framework/           # the reusable engine — zero app knowledge
│   ├── render/          #   the ~120-line composition engine
│   ├── http/            #   static, pages, sitemap, validation
│   ├── assets/          #   component CSS bundler
│   ├── catalog/         #   the /catalog generator
│   └── platform/        #   runtime port + Bun adapter + hot reload
├── app/                 # what you build — domain, data, services, routes, views
├── frontend/            # standards-only, no build
│   ├── components/       #   one folder per component: .html + .css (+ .md)
│   ├── pages/            #   flat .html files; folders only group subpages
│   ├── styles/           #   design tokens + global base
│   └── vendor/htmx.min.js
└── server.ts            # composition root — the only place framework + app meet
```

---

## A note on "open it as a file"

You can't open a composed page as a bare `file://` and have it render — and that's
a web-platform limit, not a missing feature. Composing a custom tag needs its
template at render time, which means a server, a (blocked) `file://` fetch, or
inlined templates (a build). BATCH puts that work in the **server**, which *is* the
no-build step. So pages are previewed on localhost; individual component `.html`
files still open standalone as mockups. The full reasoning is in `ARCHITECTURE.md`
(§0.5).

---

## License

Personal reference project. Use the ideas freely.
