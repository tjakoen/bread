# GRAIN showcase — plan (the portfolio's `/grain` section)

> Status: **v1 built (2026-07-01), relocated into the portfolio.** hero · grade-as-signal ·
> catalog-peek · how-it-works · footer (the components showcase was removed 2026-07-02 — the
> sidebar catalog is the reference) — served at **`/grain`** from
> `portfolio/pages/grain/index.html`, with e2e (`project/e2e/grain-page.e2e.ts`) and shots
> (`grain`, `grain-peek`). v2 (AI demo) + v3 (re-skin toggle) still to come.
>
> This is the GRAIN showcase, built *with* GRAIN — the portfolio's proof the framework is real
> (a consuming product re-skinning grain via its public seams). It introduces the system,
> demonstrates it (a labelled AI demo), and carries the catalog-peek sidebar. **Moved out of
> `grain/`** so the framework repo is just the framework: grain keeps **`/catalog`** as its own
> self-documentation; this narrative showcase is a portfolio section. See `PLAN.md`.
>
> **Hosting: GitHub Pages, root-served.** The portfolio is the **`tjakoen.github.io`** user site
> (domain root), so `/grain` (and future `/batch`) are subpaths of ONE root site — which is why
> absolute asset paths work (see Hosting below). Ships as a static `dist/` export
> (ARCHITECTURE §18 — a crawler over the running server, not a second renderer). No backend at
> runtime, so the AI demo runs client-side.

## Decisions (2026-07-01)

- **The GRAIN showcase is a portfolio section (`/grain`), not grain's own site.** grain repo =
  framework + `/catalog` self-doc; the narrative site lives in the portfolio that consumes it.
- **Neutral, default theme.** A consuming product re-skins via token overrides.
- **AI demo fidelity: same vocabulary, same dispatcher — client-side reasoner** *(revised
  2026-07-01; supersedes the earlier "reuse the real door + SSE" decision, which needs a server
  the static host doesn't have).* The "Watch the AI act" section keeps the honest parts — the
  `RenderOp` vocabulary and the real `ai-dispatch.js` dispatcher applying ops to the DOM — and
  swaps only the **transport**: server-backed (dev) it may use the real `/intent` → SSE door;
  on static GitHub Pages a **client-side reasoner emits the identical ops locally** and feeds
  the same dispatcher. One demo, both modes; the vocabulary stays real, not a fake animation.
  See [[interaction-door-pattern]] and "The AI demo" below.
- **AI-demo brain: scripted now, model-later.** Ship the deterministic scripted reasoner first
  (like `/loop` — reliable showcase, zero download). Design the reasoner as a seam so a real
  in-browser model (embeddings → optional local LLM) can drop in later as an upgrade tier.
- **Build order: v1 first ✅**, then v2 (AI demo), then v3 (re-skin toggle).
- **The catalog-peek EMBEDS `/catalog` (unchanged) in an iframe** — no batch/grain/catalog
  changes; the island stays in `grain/scripts/` (reusable doc affordance). See
  [[workspace-archetype-decision]].
- **Docs = the `docs/*.md` we already maintain, rendered — not new prose.** grain has three doc
  modes, each on its own surface: **pitch** (this showcase — why it exists, the idea), **component
  reference** (`/catalog` — auto-generated live specimens + props), **concepts / how-to-build**
  (`docs/GRAIN.md` + `docs/AI-INTERFACE.md` — the contract → one door → `RenderOp`s protocol,
  grade-as-signal, making a surface operable). The catalog *structurally can't* carry the
  AI-interaction story — that's a protocol, not a component — so publish the markdown docs through
  the portfolio's markdown content collection (`PLAN.md` piece 3) at `/grain/docs` (or a shared
  `/docs`). The showcase's **How it works** section stays a *teaser* that deep-links into the
  rendered docs. **One source, three consumers:** the same mds render the human docs page, get
  chunked into the AI demo's `knowledge.json` (so the desk can answer "how does the intent door
  work?"), and stay the repo docs kept synced by CLAUDE.md's alignment table. No new pipeline — the
  markdown collection we're building anyway. See [[interaction-door-pattern]] and `BATCH-PAGE.md`
  (batch takes the identical approach with `docs/ARCHITECTURE.md` + `docs/CONVENTIONS.md`).

## Persistent chrome (every section)

- Minimal top bar: **GRAIN** wordmark + tagline, a `demo` marker (clearly a demonstration),
  `⌘K` (`b-kbd` + the global palette island), and an **Inspect** toggle.
- **Catalog-peek sidebar** (`grain/scripts/catalog-peek.js`): hover any component anywhere → the
  embedded `/catalog` scrolls to its entry + highlights it. Maps rendered CSS class → catalog
  slug. The showcase is the "usage" layer; the catalog is the "specimen" layer; hover bridges.

### Catalog-peek sidebar — layout & behaviour (2026-07-02 refinement) — ✅ BUILT

Supersedes the v1 "slides in from the right as a fixed overlay" implementation. The sidebar is a
real layout member, not a drawer on top. Shipped 2026-07-02: `.page`/`.page__main` flex shell in
`portfolio/pages/grain/index.html`; `/catalog` responsive drawer in `batch/catalog/catalog.ts`;
e2e asserts the content-shift; shots `grain-peek` + new `grain-peek-menu`.

- **Shifts content, never overlays.** Opening the sidebar *pushes* the `.site` content aside
  (grid / margin shift), so nothing is covered. (v1 used `position: fixed` + `translateX` — replace.)
- **Scroll is contained to the sidebar.** Scrolling while pointing at the catalog scrolls *only*
  the catalog, never the page behind it (`overscroll-behavior: contain`; the iframe already keeps
  wheel events local, this stops any chaining).
- **The catalog's own menu is collapsed by default in sidebar context.** The embedded `/catalog`'s
  `.cat-nav` (Pages + Components) starts collapsed so the narrow sidebar spends its width on the
  specimen, not the menu.
- **When open, treat the sidebar as "mobile" (space is small).** Uncollapsing the catalog's menu
  makes it **take over the full sidebar** (a full-width nav-drawer over the main), then collapse
  back on selection — the small-screen pattern, not a cramped two-column split.
- **Where this lives:** points 3–4 are implemented as **`/catalog` becoming genuinely responsive
  at the batch layer** — at narrow widths `.cat-nav` collapses to a toggle that opens full-width
  over `.cat-main`. The narrow iframe inherits this automatically; real mobile catalog visitors get
  it too. Not a demo-only hack — a real catalog improvement (native responsive, no build). Point 1
  (content shift) + point 2 (scroll containment) live in the `/grain` page's own layout CSS.

### "One surface, both operators" — interactive + AI mode (2026-07-03) — ✅ BUILT (client-side v2)

The composed surface is now operable by **both operators**, reusing the loop demo's AI language
client-side (no server door → survives the static export; matches the v2 plan's tier-0 decision):

- **Human-operable.** Switch tabs / rail views, complete a task (the check `icon-button` flips its
  badge to done — your committed action, clean), and Ask + Send (appends your line clean + a grain
  AI reply that types in). Contained island `grain/scripts/surface-demo.js`, scoped to
  `[data-surface-demo]`.
- **AI mode — "▷ Watch the AI act".** A scripted AI drives the *same* controls under GRAIN's real
  **spotlight** (`.ai-backdrop`/`.ai-spotlit`/`.ai-acting-label` from `grain/ai/ai.css`, bundled in
  `/components.css`): it types into the Ask field (grain, dashed edge), "sends", streams a grain
  reply, then completes a task — narrated by the `action-badge` verb strip (reads → types →
  commits). Click the backdrop to stop. Reduced-motion → instant final state, no spotlight.
- This is the on-thesis payoff: **a human click and an AI action operate one surface through the
  same controls**, with the AI's presence shown (grain + spotlight). The AI run has 4 beats (reads →
  types into Ask → completes a task → drafts a new grain task — AI-authored stays grain). No mediated
  interrupt (it's a mini demo; backdrop-click stops). e2e covers human ops, the AI run outcome (grain
  reply + task done + drafted grain task), and the spotlight (with motion). Shot: `grain-ai-acting`.
- **Grade legibility (2026-07-03):** the Redaction grades differ by ink/halftone *texture*, invisible
  at body-text size (people read it as "the grade isn't changing" — but the fonts load and
  `--type-font` flips correctly). The grade-as-signal section now leads with a `.grade-show` specimen:
  the same line at `--text-3xl`, clean vs grain, so the texture actually reads. Rule: show grade at
  ≥`--text-2xl`.
- **Root grade fix (2026-07-03):** `data-grade` on a bare `<span>`/`<div>` set the CSS var but never
  applied the font (only type primitives like `p`/`li`/`.t` did) — so the hero signature, the
  grade-show line, and the legend word rendered *clean* despite `data-grade="grain"` (the reported
  inconsistency). Fixed at the root in grain.css: `[data-grade] { font-family: var(--type-font); }` —
  a graded element now renders in its grade, not just its covered descendants. Nested grades still
  inherit and the catalog's chrome-neutralize is unaffected (verified across loop + catalog).
- **Polish (2026-07-03):** chat messages sit in a **`chat-log`** container so you=right / AI=left
  read as a thread; Send bottom-aligns to the input; section rhythm tightened.

### GRAIN hardening pass (2026-07-03) — ✅ BUILT (first slice)

A review found the recurring mistakes were **silent-failure contracts** (mechanisms that quietly
no-op when misused). First slice = design the live traps out + add conformance tests:

- **Designed out:** (a) grade now applies on any element (`[data-grade]{font-family}` — see above);
  (b) **`chat-log`** is now a real grain container (`grain/components/organisms/chat-log`) so
  `chat-message`'s `align-self` can't silently misalign — chat-message.md documents the parent
  requirement; (c) the AI **click pulse** is self-sufficient (`.is-click` in `grain/ai/ai.css` no
  longer needs a sibling `.ai-spotlit`).
- **GRAIN conformance tests** (`project/e2e/grain-conformance.e2e.ts`): assert usage CONTRACTS in a
  real browser (computed style / geometry) — grade renders grain on a bare span, chat aligns in a
  chat-log, a pending input shows the dashed edge, reduced-motion stills the caret. On the grain
  split (CONVENTIONS §10) this becomes grain's own e2e harness.
- **Symmetry test** (`grain-page.e2e.ts`): completing a task by a human click and by the AI produce
  the *identical* result — the "one interface, both operators" thesis made testable.

### Components used in context + live simulations (2026-07-03) — ✅ BUILT

The page now **uses** the full grain component set in real compositions (not a specimen grid), so
hovering any element reveals it in the sidebar (MAP extended: `chat-message`, `t`→typography):

- **Grade-as-signal is live.** Two `demo-box`es loop: the AI reply **types in and stays grain**
  (provenance persists — `AI-INTERFACE.md` §5; the "resolve to clean" flourish was dropped, and
  `DESIGN-SYSTEM.md` §3 was corrected to match). The second shows a **human's** optimistic action
  settling (grain in-transit → clean committed) — settling is *yours*, never AI speech. The hero
  signature is a **trigger** `demo-box` (types on load + a "▷ replay").
- **"One surface, both operators"** — a real composed panel (rail `nav-item`s, `tab-bar`/`tab`,
  `chat-message`, `action-badge` verb strip, `list` + `badge` + `icon-button`, `input`/`button`/`kbd`).
  A believable interface, so every part bridges to its catalog entry.
- **`demo-box` primitive** (`grain/scripts/demo-box.js`): a reusable, contained scripted-demo island.
  A demo is markup + a `<script type="application/json" class="demo-box__steps">` step list
  (`type`/`attr`/`clear`/`text`/`wait`), with `data-demo="loop|trigger|once"`. Reduced-motion runs
  one instant pass (no typing, no waits, no loop) → sensible final state. Keeps demo JS out of pages.

### Entering & leaving the catalog (2026-07-03) — ✅ BUILT

- **Hero "Browse the components" opens the sidebar** (a `data-peek="open"` hook, not a link →
  hand-authored `.btn`, since `b-button` forwards only config props). The peek island now honours
  `data-peek` values `open` / `close` / `toggle`.
- **Sidebar → full page.** The peek header carries a **"Full page ↗"** link (`.catalog-peek__expand`
  → `/catalog`) so the peek expands into the full catalog in one click.
- **Catalog "← Back".** `/catalog` gained a `.cat-back` control (the component nav isn't an obvious
  exit); prefers real `history.back()`, falls back to `/`. **Hidden when embedded** in the peek
  iframe (`window.self !== window.top`) — the host supplies its own close/expand there. (batch layer.)
- **Bug fixed in passing:** the Input catalog example used `autofocus`, which stole focus and
  scroll-jumped `/catalog` on every load (and hung Playwright). Replaced with a `data-force="focus"`
  parallel on `.field__input` — the same static-pseudo-state convention the button already uses.
  Note: the site's global `scroll-behavior: smooth` makes chained link-nav→click flaky in Playwright;
  e2e reaches `/catalog` via settled `goto`s instead.

### Hover-to-peek: reveal one, cross-fade (2026-07-03, supersedes the scroll approach) — ✅ BUILT

Pointing at the main page drives the sidebar catalog (`grain/scripts/catalog-peek.js`). It used to
*scroll* the embedded catalog to the hovered entry, but a far entry scrolled wildly and the
Typography fallback ping-ponged up/down the long list. Now it **reveals one entry at a time**:

- **Single mode.** The catalog (batch) supports a `data-peek-single` mode: only the
  `.cat-doc.is-peek-active` entry renders, fading in (`cat-peek-fade`, off under reduced-motion).
  The peek island sets the mode on iframe load and toggles which entry is active — **no scrolling**,
  so distance is irrelevant. The full-page `/catalog` (no host) stays the single long list.
- **Pointer-only (desktop).** The reveal/fade is gated on `(hover: hover) and (pointer: fine)` —
  on touch it would be undrivable, so there the sidebar just shows the **full, scrollable catalog**
  (no single mode). e2e covers both.
- **Hold the last reveal.** Only hovering an actual component switches the entry; moving over prose
  or gaps holds the current one — so you can travel the pointer to the sidebar and scroll the
  revealed entry without it changing out from under you. (Dropped the Typography catch-all that used
  to thrash the reveal on every gap.)
- **No box outline.** The live switch already shows what you're pointing at, so the hovered element
  isn't outlined anymore.
- **Debounced.** The reveal is debounced (~70ms) so sweeping the pointer doesn't strobe the fade.
- **Nav still works in the sidebar.** In single mode, clicking a component link in the catalog's
  own (collapsible) nav activates that entry instead of hash-scrolling to a hidden one
  (`window.__catSetActive`).

### "No catalog items on the main page" (from `grain-demo-page-structure`) — ✅ RESOLVED 2026-07-02

The decision: the sidebar *is* the component reference, so **the main page is philosophy / whys, not
a components showcase** — don't embed catalog items there. The v1 **"The components"** specimens grid
that contradicted this has been **removed** (`index.html`; its `.specimens`/`.specimen`/`.mini-rail`
CSS too). The page is now hero · grade-as-signal · how-it-works · footer — still built *from* grain
components (the hero CTA is a real `b-button`, how-it-works a real `b-list`), so Inspect + hover
bridges each element to its sidebar-catalog entry (a hero hint points this out). **Still owed:** the
philosophy sections that should fill the page out — native-first, no-build, atomic/Brad Frost,
design-system tokens, charts (enumerated in `grain-demo-page-structure`); the page is intentionally
sparse until then.

## Sections (single scrolling page)

1. **Hero — the pitch.** "One interface. A person *and* an AI operate it through the same controls."
   Live micro-moment: a line settling grain → clean (the signature, read instantly).
2. **Grade-as-signal.** grain = AI / in-transit, clean = human / committed. Live: a human message
   (clean) beside the desk's (grain); a field that goes grain while the AI fills it. One-sentence why.
3. **Watch the AI act** — labelled *Demonstration*. A contained "desk" that acts through the
   vocabulary: spotlight → stream a grain line → draft a `b-list` plan → revise a line (backspace) →
   flip a `b-badge` → narrate steps as `action-badge`s. Interruptible (mediated stop). Uses the
   real dispatcher + `RenderOp` vocabulary; the reasoner runs **client-side** on the static host
   (see "The AI demo" below) — a human click and an AI decision are still the same `Intent` → ops.
4. ~~**The components.**~~ **Removed 2026-07-02** — no components showcase on the main page by
   design (the sidebar catalog is the reference). The page is still built *from* grain atoms so
   Inspect + hover bridges each element to its catalog entry. See the "no catalog items" note below.
5. **How it works.** One vocabulary (`contract.ts`) → one door (`/intent`) → `RenderOp`s over SSE;
   the self-describing manifest; no build step (BATCH). A small diagram. **Teaser only** —
   deep-links to the rendered concept docs (`docs/GRAIN.md` + `docs/AI-INTERFACE.md`) at
   `/grain/docs`; keep this section a summary, never a fork of those docs.
6. **Re-skin it.** Same components, different tokens — a live theme toggle (default e-ink ↔ an
   alternate palette) proving re-skin-by-token-override. "Never edit components."
7. **Footer.** Built on BATCH; links (`/catalog` = component reference, `/grain/docs` = rendered
   concept docs, repo); "this site is itself built with GRAIN."

## Hosting & static export (GitHub Pages)

Ships as a static `dist/` via ARCHITECTURE §18 (`bun run export`, when built) — a crawler over the
running server, not a second renderer. The portfolio pages (`/`, `/grain`) aren't in the sitemap
(served from `config.portfolioPagesDir`), so the export walks them explicitly alongside `/catalog`.

- **Root-hosting dissolves the subpath problem.** Every asset ref is absolute (`/styles`,
  `/scripts`, `/assets/sprite.svg`, the `/catalog` iframe). Those 404 under a *project* Pages
  subpath (`user.github.io/<repo>/`) — but the portfolio is the **`user.github.io` root site**, so
  `/grain` and `/batch` are subpaths of one root and absolute paths resolve. (If a repo/subpath
  host is ever used instead, the exporter must rewrite absolute→relative / inject `<base>` /
  honor a `PUBLIC_BASE_PATH`.)
- **`/search.json` (⌘K).** Not a linked asset — cmdk.js fetches it. Emit it (and `/sitemap.xml`,
  `/robots.txt`) as static files in the export, or the palette is empty (degrades gracefully).
- **Outbound links.** The footer/how-it-works link to operable/dynamic routes (`/loop`,
  `/ai/manifest`). On the static site those are shell-only or absent — keep `/grain` self-contained
  or point such links at the live/dev instance.

## The AI demo (v2) — client-side reasoner + model tiering

The hosted "Watch the AI act" section runs with **no backend**: keep the real `ai-dispatch.js`
dispatcher and the `RenderOp` vocabulary; replace only the server leg (`/intent` + SSE) with a
**client-side reasoner** that emits the same ops. Same demo works server-backed in dev and static
on Pages. The reasoner is a **seam** (`decide(intent) → RenderOp[]`) with tiers, gated on
weight/WebGPU with graceful fallback:

0. **Scripted (ship first).** Deterministic op sequence, like `/loop`'s stub. Zero download,
   reliable showcase. Proves the vocabulary end-to-end client-side.
1. **Embedding retrieval (~25MB, transformers.js MiniLM).** Semantic question→content match with a
   WASM fallback; real "runs in your browser" without generated prose. Retrieval does the real work.
2. **Local LLM (~250MB+, WebLLM SmolLM2/Qwen0.5B, WebGPU).** Real generated prose, grounded by
   tier-1 retrieval (RAG) so a 0.5B model doesn't hallucinate. Big first-load; the strongest flex.
   Progressive: load if WebGPU present, else fall back to tier 1 → tier 0 — the fallback is itself
   a nice engineering detail. **All three tiers are 100% static and keyless.**

Honest take (kept from the discussion): a local LLM is the coolest narrative but the weakest fit for
"lightweight + reliable"; the sweet spot without bloat is tier 1. Tier 0 is enough for a scripted
GRAIN showcase; tiers 1–2 are optional upgrades behind the seam. (This tiering matches `PLAN.md`'s
AI-demo decision — the portfolio-wide chat island is the same idea, generalized.)

## Build order

- **v1 ✅ (2026-07-01):** hero + grade-as-signal + components + catalog-peek + how-it-works + footer.
  At `portfolio/pages/grain/index.html`; e2e at `project/e2e/grain-page.e2e.ts` (portfolio home +
  3 showcase tests, green); shots `grain` + `grain-peek`. `tsc` + `bun test` green.
- **v2:** the "Watch the AI act" section — real dispatcher + `RenderOp` vocabulary, client-side
  reasoner (tier 0 scripted first; tiers 1–2 optional). See "The AI demo" above.
- **v3:** the re-skin theme toggle.
- **export:** `batch/export` (`bun run export`) → static `dist/` for Pages (ARCHITECTURE §18,
  `PLAN.md` piece 1) — emit `/search.json` + walk the portfolio pages.

## Already in place

- `grain/scripts/catalog-peek.js` — the peek island (hover → catalog scroll + highlight). *v1 fix:
  now keys off `[data-peek-root]` (was `.app-shell`, which the showcase doesn't have).*
- The shell components (`app-shell`, `side-rail`, `tab-bar`, `nav-item`, `tab`, `shell.js`) exist in
  grain and are used by the **product** dashboard (`/dashboard`); the showcase shows
  `tab-bar`/`nav-item` in the components section (raw markup — they're CSS-only patterns, no
  Atomic template).
- **`b-badge`/`b-list` are data-driven** (`data-field`/`each`) — they render blank from page
  attributes, so the showcase composes badges/lists as raw `.badge`/`.list` markup (peek still maps
  the classes). Prop-driven atoms (`b-button`, `b-input`, `b-kbd`, `b-icon`, `b-icon-button`) are
  used as tags; note button variant/size are the props `variant`/`size`, not `data-*`.
