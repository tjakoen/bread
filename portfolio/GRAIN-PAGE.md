# GRAIN showcase — plan (the portfolio's `/grain` section)

> Status: **v1 built (2026-07-01), relocated into the portfolio.** hero · grade-as-signal ·
> components · catalog-peek · how-it-works · footer — served at **`/grain`** from
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
  (batch takes the identical approach with `ARCHITECTURE.md` + `CONVENTIONS.md`).

## Persistent chrome (every section)

- Minimal top bar: **GRAIN** wordmark + tagline, a `demo` marker (clearly a demonstration),
  `⌘K` (`b-kbd` + the global palette island), and an **Inspect** toggle.
- **Catalog-peek sidebar** (`grain/scripts/catalog-peek.js`): hover any component anywhere → the
  embedded `/catalog` scrolls to its entry + highlights it. Maps rendered CSS class → catalog
  slug. The showcase is the "usage" layer; the catalog is the "specimen" layer; hover bridges.

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
4. **The components.** A compact real composition of the atoms/molecules (button, input, badge, list,
   icon, kbd, tabs, nav, cards). Each hover-links to the catalog. "Full reference → /catalog."
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
