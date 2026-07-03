# Portfolio site — plan

> Status: **planned, not built.** A personal portfolio — a **custom BATCH + GRAIN** site that
> **uses MILL** (my markdown CMS) to manage its markdown content: the notes/blog *and* the rendered
> BATCH/GRAIN docs — deployed **free and zero-ops** to GitHub Pages via GitHub Actions.
> The site doubles as the strongest possible proof the stack works: it's AI-first design served
> as plain static files, with a lightweight AI demo that runs entirely in the visitor's browser.

## The core constraint (why this plan exists)

BATCH has **no build step** because it renders **live at request time** (`Bun.serve` per-request
page render, runtime-built `/components.css`, SSE). "No build" is *not* the same as "static" —
there's no `dist/` sitting around to host. GitHub Pages serves only static files, and GitHub
Actions is a CI runner (ephemeral jobs, killed when the workflow ends) — neither can host a
persistent process.

**So: to ship on Pages for free, we must *add* the export step BATCH deliberately omits** — a
prerender crawl that boots the app, walks its routes, and writes static files.

## Decisions (2026-07-01)

- **Host: GitHub Pages, own repo, free + zero-ops.** No container, no always-on server.
- **Add a prerender/export step** → produces a static `dist/` from the live app. Everything a
  portfolio shows (pages, `/components.css`, `/catalog`, `/search.json`, `/sitemap.xml`, fonts,
  assets) is a plain GET and prerenders cleanly. The live-only surfaces (`POST /intent`, `/stream`
  SSE) do **not** come along — see the AI demo decision for how we sidestep that.
- **Build the export as a reusable BATCH capability** (`batch/export`), not a one-off script.
  Rationale: it's a pure-substrate concern (crawl sitemap → write files), it fits BATCH's
  extraction philosophy, and any BATCH site — this portfolio (with its `/grain` showcase and
  future `/batch` section), and others later — gets free Pages hosting from the same tool. The
  portfolio repo only needs the workflow YAML.
- **Content is markdown-in-the-repo; MILL renders it into GRAIN pages; export freezes them.**
  All personalized site data — the Notes stream + long-form posts (see [FEATURES.md](FEATURES.md)),
  and the rendered `docs/*.md` — lives as **`.md` files (+ images) in the public repo**, so the site
  is maintained by *editing content, not HTML*. The renderer is **MILL**, promoted from "a content
  route inside the BATCH app" to its **own top-level project** (memory: portfolio-cms-separate-project).
  - **Definition — MILL = "Markdown In, Living Layouts"** *(canonical plan: [`mill/PLAN.md`](../mill/PLAN.md); this is the consumer view)*: a **standalone, reusable, open-source CMS**.
    Feed it `.md` + images and it renders **GRAIN** pages on the theme. It is the **fourth top-level
    project** alongside `batch/`, `grain/`, `project/`, `portfolio/`, and it **depends on GRAIN (its
    components) and BATCH (the substrate), never the reverse** — a new layer *above* both
    (`batch → grain → MILL`), an **extension of neither** (the ARCHITECTURE + CLAUDE.md layering
    diagrams were updated to note this concern this pass). **The portfolio is MILL's first consumer** —
    a custom BATCH + GRAIN site that **uses MILL only for its *content*** (the Notes/blog + the
    rendered BATCH/GRAIN docs); the portfolio's own surfaces (hero desk, calendar, etc.) are bespoke
    BATCH + GRAIN work, not MILL's. MILL *enhances* the portfolio; it doesn't build it.
  - **How it runs here (this is the reconciliation):** MILL renders **live on the BATCH app at request
    time** — a content route parses frontmatter and renders the `/notes` index + each `/notes/:slug`
    permalink (and the `docs/*.md` pages) through GRAIN. The `batch/export` crawl then **projects**
    those to static like any other page. So MILL is the *renderer*, mounted in the live app — **not** a
    separate build-time re-render. This keeps the static-export principle intact: *export is a
    projection of the running server, not a second renderer that could drift* (memory:
    static-export-decision). "When we build the static page, GRAIN renders the mds into pages" = the
    export freezing what MILL already serves live.
  - **Consequence — one content source, many consumers:** the same mds render the human Notes pages,
    are chunked into `knowledge.json` for the AI's RAG ("the desk is aware of my posts", free), and
    (for `docs/*.md`) publish the doc pages. Authoring = commit: edit a `.md` → the Action reboots the
    app, crawls, deploys. Backlog + content model live in `portfolio/CONTENT-BACKLOG.md`.
- **AI demo: Path B — runs entirely in the browser, no backend, no secret.** Purpose: answer
  questions about me from my fixed portfolio content. It's a portfolio *showcase*, so the "the
  assistant is running in *your* browser, nothing server-side" narrative is worth real weight.
- **No API key ever ships.** GitHub/Actions secrets are **build-time only**; a static site has no
  server at request time to hold a key. Baking a key into client JS = publishing the key. The
  runtime touches no model API — inference happens locally in the visitor's browser.
- **Target: a tiny local generative model (WebLLM), grounded on my content (RAG).** A small
  instruct model (e.g. SmolLM2-360M / Qwen2.5-0.5B / Llama-3.2-1B, ~250MB–800MB quantized, cached
  after first load) runs client-side via WebGPU and generates the answers. Accepted tradeoffs
  *because this is just a portfolio demo*: a big first-load download and a WebGPU-capable-browser
  requirement.
- **It must be grounded, not freewheeling.** A sub-1B model knows nothing about me and will
  hallucinate, so we retrieve the relevant portfolio chunks and put them in the prompt (RAG). The
  model only *phrases* facts we hand it — retrieval does the real work, the model makes it
  conversational.
- **AI is an enhancement, never a requirement (grain philosophy).** The portfolio is a **fully
  usable plain-hypermedia site** with no AI at all — real nav, real content pages, real links
  (progressive-enhancement HARD RULE, see FEATURES.md). So the ladder degrades to *the real site*,
  never to a fake-AI imitation: load the generative model *iff* WebGPU is present; optionally a light
  **embeddings** retrieval tier (real semantic match via transformers.js ~20–30MB) where it genuinely
  helps; otherwise **gracefully drop the AI** and let the visitor browse/search the content as
  hypermedia. **Dropped: lexical/keyword "pseudo-AI" retrieval** — it imitates AI badly and isn't
  worth shipping. When the AI *is* present it queries the content and drives the **same UI
  interactions a human would** (one door / RenderOps), not a side chat.
- **The demo showcases GRAIN, not raw model horsepower.** The win is *presentation*: the question
  is answered by "the desk" — spotlight, grain text streaming in, settling to clean
  (grade-as-signal). A retrieval bot that *looks* like the desk thinking sells the design system
  better than a heavyweight LLM in a plain box.
- **Organizing concept: the site is a populated productivity app — Notes · Calendar · Contacts —
  with the desk as the assistant that operates them.** (See FEATURES.md "Organizing concept" for the
  full framing + the desk's "lamp on paper" visual.) It's chosen because a surface-dense suite is
  the strongest proof of the north star (every surface addressable + AI-operable), and it's the
  payload for the workspace archetype already in the tree. Consequences that shape *this* plan:
  (a) naming resolves to **`/notes`** (the content collection below renders `/notes` + `/notes/:slug`);
  (b) a **Calendar** view (talks + roles as a timeline) and a **Contacts** card (mailto + socials +
  vCard) join the route set — both static-safe (read-only render / static file); (c) the desk must
  be able to *operate* those views, which needs the **surface-vocabulary extension** in Pieces to
  build. Hard constraint from FEATURES anti-features: **structural + GRAIN-austere, never
  skeuomorphic app chrome** (the "lamp/paper/desk" is tokens + CSS on existing spotlight hooks, not
  imagery). Feasibility verified against the tree 2026-07-01 — the desk behaviour (travel, stream,
  settle, revise, offline-graceful interrupt) already exists in `grain/scripts/ai-dispatch.js`; only
  the two pieces below are genuinely new.
- **Docs = the `docs/*.md` we already maintain, rendered — not new prose (portfolio-wide).** Each
  showcase section splits into three doc modes, each on its own surface: **pitch** (the narrative
  showcase page), **component reference** (`/catalog` — grain only, auto-generated specimens), and
  **concepts / how-to-build** (rendered `docs/*.md`). grain publishes `docs/GRAIN.md` +
  `docs/AI-INTERFACE.md` at `/grain/docs`; batch publishes `docs/ARCHITECTURE.md` + `docs/CONVENTIONS.md` at
  `/batch/docs`. The vehicle is the **markdown content collection (piece 3)** — no new pipeline, no
  new prose. The showcase's concept sections are *teasers* that deep-link into these. Consequence,
  free: the same mds are the human docs pages, the AI demo's `knowledge.json` (RAG), and the repo
  docs kept synced by CLAUDE.md's alignment table — one source, three consumers. See
  `GRAIN-PAGE.md` and `BATCH-PAGE.md`.

## Architecture at a glance

```
Build time (GitHub Actions — no secret needed; the model runs at runtime, not here)
  portfolio content (.md + images) ──▶ chunk (+ optional embeddings) ──▶ knowledge.json (RAG corpus)
  live BATCH app  (MILL renders .md ──▶ GRAIN pages) ──▶ batch/export crawl ──▶ dist/ (static HTML + CSS + assets)
                                                                                └─ + knowledge.json + chat island JS

Runtime (visitor's browser — pure static, no key, no backend)
  WebGPU present?
    yes ──▶ load tiny LLM (WebLLM) ─┐
                                     ├─▶ retrieve relevant chunks (RAG) ──▶ generate grounded answer
    no  ──▶ embeddings / lexical ───┘        └─────────────────────────▶ or surface the passage directly
                                                          │
                                                          ▼
                                            render through GRAIN
                                        (spotlight → grain text → clean)
```

The honest limits of the AI demo: on the generative path, first load is a few hundred MB (cached
after) and it needs WebGPU; answers are only as good as a sub-1B model grounded on my content.
On the fallback path it surfaces the most relevant passage rather than freshly-worded prose. All
paths are fully static, keyless, and controllable — fine for a showcase.

## Does the architecture already support this? (verified 2026-07-01)

Checked the whole tree against this plan. **No architectural blocker; two findings make it
better than assumed:**

- **Export is clean — rendering is deterministic.** `renderPage` (`batch/render/render.ts`) and
  `makePageServer` (`batch/http/pages.ts`) take only a pathname and produce byte-stable HTML — no
  per-request headers/cookies/query/time/random. So crawl-and-write Just Works. Gaps to handle in
  the exporter (not blockers):
  - `createSitemap` (`batch/http/sitemap.ts`) walks only `config.pagesDir` `.html` files — it
    **misses the portfolio pages `/` and `/grain`** (served from `config.portfolioPagesDir`) and
    every non-HTML GET. The exporter needs an **explicit allowlist**: `/components.css`,
    `/catalog`, `/search.json`, `/sitemap.xml`, `/robots.txt`, `/ai/manifest?screen=…`, plus the
    portfolio pages (`/`, `/grain`).
  - Static assets are plain directory copies via `config.assetDirs` (`/styles`, `/vendor`,
    `/scripts`, `/assets`) + `config.fontsDir` (binary woff2) — copy them into `dist/` verbatim.
  - The boot-and-fetch seam already exists: `project/tools/screenshots.ts` spawns the server and
    waits for the port. The exporter reuses that pattern.
  - Data-driven fragments (`/ui/loop`, `/api/items`) freeze at build time to whatever the seed
    data is — fine for a portfolio; just be aware they're snapshots, not live.
- **The AI demo reuses the REAL vocabulary — the dispatcher isn't coupled to SSE.** `applyOp()` in
  `grain/scripts/ai-dispatch.js` is a pure `(RenderOp) → DOM` function; SSE is just one caller.
  And `chat.send` + a `chat-log` surface **already exist** in `grain/ai/contract.ts`. So the local
  model emits the same `RenderOp`s (`append` the user bubble → `type` grain tokens → `type {done}`
  to settle → optional `spotlight`) into the same dispatcher. We get grade-as-signal, streaming,
  and the spotlight for free — the demo is the genuine protocol with the **reasoner** swapped
  (server stub → in-browser WebLLM) and the **transport** swapped (SSE → local emit loop).
  - **Small enabling refactor:** today `applyOp` lives inside `ai-dispatch.js` alongside the
    `EventSource` wiring. Extract `applyOp` (+ the timing constants `TYPE_MS`/`SETTLE_MS`/`HOLD_MS`
    from `grain/ai/reasoner.ts`) into a shared module both the SSE path and the local chat island
    import. Per CLAUDE.md's alignment table, touching the dispatcher means updating the **e2e**
    tier — budget for that.
  - **Layering stays clean:** the chat island lives in `grain/scripts/` (reusable, AI-first, like
    `cmdk.js`); the portfolio supplies the app-specific `inference()` (the WebLLM instance) and the
    RAG lookup. Nothing portfolio-specific leaks into the framework, so extraction stays clean.

## Pieces to build

1. **`batch/export`** (in the batch-stack repo) — boot the app (reuse the `screenshots.ts` spawn +
   wait-for-port seam), enumerate routes = sitemap `.html` pages **+ the portfolio pages (`/`,
   `/grain`) + an explicit allowlist** (`/components.css`, `/catalog`, `/search.json`, `/sitemap.xml`, `/robots.txt`,
   `/ai/manifest?screen=…`), fetch each, and copy `config.assetDirs` + `config.fontsDir` verbatim
   into `dist/`. Ship with a test (per CONVENTIONS §6).
2. **Extract a shared `applyOp` module** (GRAIN) — pull `applyOp` + the timing constants out of
   `grain/scripts/ai-dispatch.js` into a module both the SSE path and the chat island import.
   Enables the demo to reuse the real presentation machinery. Touches the dispatcher → update the
   **e2e** tier (CLAUDE.md alignment table).
3. **MILL — the standalone Markdown→GRAIN CMS** (its own top-level project, **not** a `batch`
   capability; memory: portfolio-cms-separate-project). Reads `.md` files + images with frontmatter
   (`title`/`date`/`type`/`photos`) from a content dir and renders GRAIN pages: mounts a content
   route on the live BATCH app for the **`/notes`** index (newest-first, category-filterable) + each
   **`/notes/:slug`** permalink (and the `docs/*.md` pages). Export (piece 1) freezes these like any
   page; RAG prep (piece 4) reads the same mds. MILL stays framework-generic (no portfolio-specific
   fields) and depends only on GRAIN + BATCH — the portfolio is its first consumer. Includes:
   scaffold the `mill/` project folder, move the md→pages rendering there, and update the
   ARCHITECTURE + CLAUDE.md layering diagram (3→4 layers).
4. **Build-time RAG corpus prep** — a script that reads portfolio content (incl. the feed mds) and
   produces a static `knowledge.json` (content chunked for retrieval, optionally with precomputed
   embeddings). No secret needed — the model runs at runtime, not here. Output is static.
5. **The chat island** (`grain/scripts/`) — WebGPU capability probe + WebLLM loader (with a
   download-progress UI) + RAG retrieval over `knowledge.json` + the fallback ladder. It **emits
   real `RenderOp`s** (`append` user bubble → `type` grain tokens → `type {done}` settle →
   optional `spotlight`) into the shared `applyOp` — reusing `chat.send`/`chat-log` and
   grade-as-signal rather than a bespoke UI. The portfolio supplies the `inference()` fn; nothing
   app-specific lives in the island. No runtime API calls; weights load from a CDN or `dist/`.
6. **The portfolio content + pages** — composed from GRAIN components on the default theme (or a
   re-skin via token override). The actual "about me / projects / contact" material; also the
   source the RAG corpus is built from. Drops in the island via a `<script defer>` + a
   `<div data-surface="chat-log">`.
7. **GitHub Actions workflow** — install Bun → build `knowledge.json` → run `batch/export` →
   publish `dist/` with `actions/deploy-pages`. (Add a `CNAME` if a custom domain comes later.)
8. **Surface-vocabulary extension for the productivity apps** (GRAIN) — so the desk can *operate*
   Notes/Calendar/Contacts, not just chat. Add `notes` · `calendar` · `contacts` to `SurfaceKind`
   in `grain/ai/contract.ts` (+ any new verbs in `ACTIONS`/`accepts`), a reasoner branch per verb,
   and the tests (**unit** on the reasoner + **integration** on the door path), then sync
   `docs/AI-INTERFACE.md` — the full CLAUDE.md alignment-table row. The dispatcher already targets
   any `[data-surface]` and the spotlight already travels, so no `ai-dispatch.js` change is needed
   beyond piece 2's extraction. *This is one of only two genuinely-new pieces the concept adds.*
9. **The productivity views + the desk "lamp on paper" skin** — the `/calendar` view (talks + roles
   as a timeline rendered from the same content mds) and the `/contact` Contacts card (mailto +
   socials + a downloadable `.vcf`), both static-safe; plus the desk's rest→wake→write→settle look
   as **CSS on existing hooks** (`.ai-backdrop` / `.ai-spotlit` / `.is-click` / grain tokens / serif
   grain face — no new machinery). Keep it structural + GRAIN-austere per the anti-feature guardrail.
10. **The site-wide companion + Navigate by AI** (FEATURES: "Navigate by AI") — the hero desk *docks*
    into a corner **grain companion** on the rest of the site (same entity minimized; ⌘K
    summons/expands it), and it carries the menu. "Navigate by AI" = the client companion maps a NL
    request → the matching nav link and drives **`spotlight{click}`** to pulse it like a real click
    (`ai-dispatch.js:73`, `contract.ts:79`) before the page loads — **no new `/intent` verb** (nav
    stays plain hypermedia per memory: interaction-door-pattern). Hard rule: a real, always-visible
    `<nav>` of plain links is the source of truth and the companion is a **disclosure wrapping that
    same `<nav>`** — so it degrades to normal navigation when the model/WebGPU/JS is absent. Only new
    code: the client-side NL→link mapping (lives in the RAG island) + the docking CSS. Guardrail: not
    a support-widget bubble (anti-features).

## Open questions / next steps

- **Content first or scaffold first?** Decide whether to draft the portfolio content (sections,
  copy, projects) or stand up the export pipeline + empty shell first.
- **Which WebLLM model** — SmolLM2-360M (lightest) vs Qwen2.5-0.5B vs Llama-3.2-1B (best quality
  for the size). Balance download size against answer quality on grounded, short answers.
- **Where model weights load from** — a CDN (HuggingFace/MLC prebuilt) vs vendored into `dist/`
  (self-contained but hits GitHub's 100MB/file + repo/bandwidth limits). Probably CDN.
- **Fallback retrieval: embeddings vs lexical** — transformers.js embeddings (~25MB, semantic) vs
  plain keyword match (few KB). The generative path may reuse whichever for its RAG retrieval too.
- **Where the chat island lives** — grain vs. a portfolio-local component — and how the build-time
  `knowledge.json` step hooks into `batch/export`.

## Notes

- **This folder (`portfolio/`) is a temporary home.** The portfolio moves to its own repo later,
  once the framework is solid enough to depend on. Develop it here against live BATCH + GRAIN;
  extract when stable. This is exactly why the export tooling lives in **`batch/export`** and not
  in the portfolio — it must travel with the framework so the portfolio (and any other BATCH
  site) can consume it after the split. Keep the portfolio importing only through BATCH/GRAIN's
  public seams so the extraction stays clean (nothing portfolio-specific leaks into the framework).
- **The GRAIN showcase now lives here, at `/grain`** (`portfolio/pages/grain/index.html`) — moved
  out of `grain/` so the framework repo is just the framework. grain keeps `/catalog` as its own
  self-documentation; the narrative showcase is a portfolio section. See `GRAIN-PAGE.md`.
- **The BATCH showcase is the companion section, at `/batch`** — the pitch for the substrate
  (no-build, request-time render, one-vocabulary/one-door). No catalog (batch has no components);
  its reference layer is rendered docs at `/batch/docs`. Planned, built after `/grain` +
  the export pipeline. See `BATCH-PAGE.md`.
- **Course-platform landing page at `/course-platform`** (`portfolio/pages/course-platform/`) — a
  single **showcase-only** page for an *external* project, the GitHub-native course platform
  (github.com/tjakoen/github-native-course-platform). Unlike `/grain` and `/batch`, it is **NOT a
  stack section and ships NO docs** — the full write-up lives in that repo's own README; this page is
  just a visual trailhead (screenshots + gifs) that links out. It's the same *pattern* as the other
  pages (a custom BATCH + GRAIN page composed from GRAIN components, export-frozen), but for a
  separate personal project rather than a layer of this stack. Distinct from the résumé's *technical
  projects* / *educator* notes, which describe it in prose — this is its own picture-led landing.
  Planned, not built.
