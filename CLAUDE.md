# CLAUDE.md — start here

Onboarding + operating rules for any AI (or human) joining this repo. Read this first,
then the docs it points to. Keep it accurate: if you change how the project works, update
this file too.

## What this is

A **no-build, server-rendered hypermedia** stack and the things built on it. One direction of
dependency — each layer builds only on the layers below it:

```
batch/   BATCH — the substrate (Bun · Addressable · TypeScript · CSS · htmx); no build step
  └─ grain/   GRAIN — an AI-interaction design system + its default theme (the look) + the catalog
       ├─ MILL/               the markdown CMS (PLANNED; its OWN reusable project) — feed it .md + images, it renders GRAIN pages
       ├─ tjakoen.github.io/  THE app + the composition root — this personal site (BATCH + GRAIN); *uses MILL* for its notes/blog
       └─ project/            the product — a personal AI assistant ("Project"); **PAUSED** — now a docs-only archive (see below)
```

The **composition root folded into `tjakoen.github.io/` (2026-07-05)**: the portfolio is now THE app —
it wires batch + grain + mill and runs the site + the `/loop` "watch the AI act" demo. `project/` is
**paused**: its code (server, domain, pages) moved into the portfolio or was dropped; the folder now
holds only the product's vision docs (`PROJECT-PLAN.md`, `docs/MVP.md`) until the assistant resumes as
its own repo. `MILL/` and `tjakoen.github.io/` are consumers of `grain` + `batch`. The portfolio is
its own custom app — **MILL doesn't *build* it**; the portfolio just *uses* MILL to manage its
markdown content (the notes/blog), while its bespoke surfaces (hero desk, calendar, etc.) are its own
work. Dependency purity: `grain` imports nothing from `batch` except the `OpChannel` port; **MILL
depends on both `grain` (components) and `batch` (substrate), never the reverse — so MILL is an
*extension of neither*, a new layer above both** (`batch → grain → MILL`). MILL's core is
framework-agnostic (a Markdown→components engine driven by a render adapter); the BATCH+GRAIN adapter
is the default. That MILL exists at all is part of the pitch: it's BATCH + GRAIN proving they compose
into a real, reusable tool. **Canonical MILL plan: `mill/PLAN.md`.**

The defining idea: a UI where **every surface is addressable and operable by both a human
and an AI through one shared vocabulary**, with the AI's presence shown as a visible signal
(*grain = AI*). A human click and an AI decision become the **same `Intent`**, flow through
**one door** (`POST /intent` → `grain/ai/interaction-layer.ts`), and return as **`RenderOp`s**
pushed over SSE. No privileged AI→DOM back channel.

## Start here (reading order)

1. **[PHILOSOPHY.md](tjakoen.github.io/PHILOSOPHY.md)** — the *why* (the beliefs the whole stack serves). **Read first.**
2. **[CONVENTIONS.md](batch/docs/CONVENTIONS.md)** — the build standard (layering, components, tokens,
   the action vocabulary, the 3-tier testing bar, the extraction plan). **The rulebook.**
3. **[ARCHITECTURE.md](batch/docs/ARCHITECTURE.md)** — the substrate's reasoning (single source of truth).
4. **[grain/docs/GRAIN.md](grain/docs/GRAIN.md)** + **[grain/docs/AI-INTERFACE.md](grain/docs/AI-INTERFACE.md)** — the
   design system and the AI contract (surfaces, ops, manifest, the "AI acts" protocol).
5. **[grain/docs/DESIGN-SYSTEM.md](grain/docs/DESIGN-SYSTEM.md)** — the visual identity / grade-as-signal.

The SSOT for what's operable is **`grain/ai/contract.ts`** (`SurfaceKind`, `ActionName`,
`ACTIONS`, `RenderOp`). The composition root — the only place the layers meet — is
**`tjakoen.github.io/server.ts`**. The reference screen is **`/loop`** (`tjakoen.github.io/pages/loop.html`).

**Working mainly in one layer?** The future-repo folders carry their **own `CLAUDE.md`** —
[`batch/CLAUDE.md`](batch/CLAUDE.md) and [`grain/CLAUDE.md`](grain/CLAUDE.md) — with that layer's
non-negotiables and the hard-won *"don't repeat these"* lessons (the silent-failure contracts, the
control lifecycle, "use the vocabulary, don't reinvent it"). Read the layer's file alongside this
one; on the split it travels with the folder. The full doc map is [`DOCS.md`](DOCS.md).

## Commands

```bash
bun run dev        # hot-reload server (http://localhost:3000)
bun run check      # tsc --noEmit (must stay green)
bun run test       # unit + integration (bun test)
bun run test:e2e   # Playwright e2e (first run: bunx playwright install chromium)
bun run test:all   # everything
bun run shots      # capture UI screenshots (+ a gallery) — see "Seeing the UI" below
bun run audit      # perf + SEO/AEO baseline (Playwright) → audit/report.md + report.json
```

## Seeing the UI (headless / remote)

There's no display in a remote/headless session, so to *show the user* what the UI looks
like: run `bun run shots` (Playwright drives chromium against a freshly-booted app and
captures the key screens **and states** — the desk mid-act with the spotlight, the ⌘K
palette — to `screenshots/`, plus a self-contained `screenshots/gallery.html`). Then
**publish `screenshots/gallery.html` as an Artifact** and give the user the link — that's
the channel they can view remotely. Add/adjust shots in `tjakoen.github.io/tools/screenshots.ts`.
Use this whenever the user asks to "see" something or you've changed anything visual.

## Non-negotiables (see CONVENTIONS for the full rules)

- **Layering:** `batch` imports nothing inward; `grain` imports nothing from `batch` (only the
  `OpChannel` port); only `tjakoen.github.io/server.ts` wires the three. New design work goes in `grain`
  by default; domain-only work in `project`.
- **One vocabulary:** verbs/surfaces live in `grain/ai/contract.ts` — reference the registry in
  TS, never magic strings (HTML/browser-JS literals are the only exception, drift-guarded).
- **Tokens only:** no hardcoded colors; components read semantic `var(--token)`s. Re-skin by
  overriding tokens, never editing components.
- **AI-mode idiom:** in-transit reads grain via `[data-commit="pending"]` (live) / `[data-grade="grain"]`
  (static); express per-component but key off those.
- **Tests are part of the work** (below). `tsc` + `bun test` green before you call something done.

## Keep the vision aligned — when you change X, update Y

This is the contract for not drifting. After any change, sync everything in its row:

| You change… | …also update |
|---|---|
| **An action verb** (add/modify) | `contract.ts` (`ActionName` + `ACTIONS` + `accepts`) → reasoner branch → **unit test** (reasoner) + **integration test** (door path) → `grain/docs/AI-INTERFACE.md` (vocab) |
| **A surface kind** | `contract.ts` (`SurfaceKind`) → `ai-routes.ts` manifest targets → any page `data-surface` → tests |
| **A `RenderOp` kind/field** | `contract.ts` (`RenderOpKind`/`RenderOp`) → dispatcher `applyOp`/`applyType` (`ai-dispatch.js`) → `grain/docs/AI-INTERFACE.md` → tests |
| **A component** | follow CONVENTIONS §4 checklist (`.html`/`.css`/`.md`, tokens, AI-mode, `data-kind`/`data-accepts` if operable) → add a test for any behavior → it auto-appears in `/catalog` |
| **A design token / the theme** | `grain/styles/variables.css` only (never per-component) |
| **The `/loop` demo or its surfaces** | `grain/ai/reasoner.ts` (the scripted demo) ↔ `tjakoen.github.io/pages/loop.html` surfaces → **e2e** (`tjakoen.github.io/e2e/`) |
| **The client dispatcher or a UI interaction** | `grain/scripts/ai-dispatch.js` → **e2e** (only tier that covers it) |
| **The static export / prerender** | keep it a *projection* of the running server (fetch, don't re-render) → `batch/export` (`bun run export`, framework-generic) → respect the exportable boundary (no operable `/intent`+SSE surfaces) → ARCHITECTURE §18 |
| **A module served to the browser** (`/modules`, or the client-side runtime) | it MUST be **client-safe** (ARCHITECTURE §19.2): no server-only imports (guard-enforced), **no secrets/tokens**, no server-required behavior — static-style only → say so wherever the mode is offered; the mechanism (`batch/http/modules.ts`) is `batch`, the client-door wiring is `grain/ai/*`, the mode switch is the composition root |
| **Layering / cross-layer deps** | re-verify import purity; if you reach across, add a port instead → CONVENTIONS §1/§10 |
| **Anything user-visible in behavior** | the matching doc (`ARCHITECTURE` / `GRAIN` / `AI-INTERFACE` / `DESIGN-SYSTEM` / `CONVENTIONS`) |
| **A concept doc** (`ARCHITECTURE`/`CONVENTIONS`/`GRAIN`/`AI-INTERFACE`) | the portfolio showcase that *renders* it — re-check the pitch/teaser sections still summarize it truly: `grain/docs/GRAIN.md`+`AI-INTERFACE.md` → `/grain` (`tjakoen.github.io/GRAIN-PAGE.md`, `/grain/docs`); `ARCHITECTURE`+`CONVENTIONS` → `/batch` (`tjakoen.github.io/BATCH-PAGE.md`, `/batch/docs`). Docs are the single source; pages are trailheads, never forks |
| **A roadmap step** (land, drop, or re-sequence) | tick it in [`ROADMAP.md`](./ROADMAP.md) → sync the canonical layer plan for that track (Track A → `grain/CLAUDE.md` / `project/PROJECT-PLAN.md`; Track B → `batch`; Track C → `mill/PLAN.md`; Track D → `tjakoen.github.io/PLAN.md`) |
| **A platform capability / feature** (add, drop, or re-tier) | update that layer's **tiered capabilities list** — the single source: `grain/docs/GRAIN.md` §"What GRAIN gives you" / `batch/docs/ARCHITECTURE.md` §"What BATCH gives you" / `mill/PLAN.md` §"What MILL gives you" → re-sync its teasers (the layer README + the `/grain`·`/batch` landing pages) as *projections*, never forks → [AUDIT.md](AUDIT.md) check 11 (nothing buried). Heroes = the reasons the layer exists; useful-but-quiet features go under *Also*, never omitted |
| **A notable decision or non-obvious fact** | write a **memory** (see below) so the next session inherits it |

**Definition of done:** code + the right test tier(s) (unit / integration / e2e per CONVENTIONS §6)
+ docs synced (this table) + `tsc` and `bun test` green + a memory if a decision was made.

**When you fix something, fix its cause — not just the instance.** Anything flagged — a failing
check, a bug, a surface that didn't behave as expected, an AI (or a person) that tripped — is first a
signal about the *docs or the architecture*, not a one-off. Before you move on, ask *why it was
possible* and close it at the source: sharpen the contract, design the mistake out, or fix the doc
that misled — so the next person or AI can't repeat it. An operator tripping on the system measures
the system's clarity, not just the operator's; if you (an AI) got it wrong building here, suspect the
docs/design first. The bar it's all held to: **this stack must be easy for a human and *even more*
legible and operable for an AI** — that's the point of the whole thing (→ [PHILOSOPHY.md](tjakoen.github.io/PHILOSOPHY.md),
the two lead bets; the worked-through lessons: [grain/CLAUDE.md](grain/CLAUDE.md) §5, [batch/CLAUDE.md](batch/CLAUDE.md)).

**Before committing / after a big change:** run the alignment audit — [AUDIT.md](AUDIT.md) (a repeatable
runbook: green gate, layering purity, tokens-only, persona-neutral GRAIN, naming, docs-synced).

## Memory

Claude Code keeps **per-project memories** (decisions, preferences, context) outside the repo;
they surface automatically at the start of each session. When you make a real decision or learn
something non-obvious, write one so the next session inherits it. If a recalled memory
contradicts the code, trust the code and fix the memory. (These are agent memory, not committed
files — durable, repo-worthy rules belong in `batch/docs/CONVENTIONS.md` or this file.)

## Working notes

- **Pre-flight: read [`ROADMAP.md`](./ROADMAP.md) before starting substantive work** — the
  canonical execution plan (per-layer tracks, the M★ live-model milestone, the honest-pitch bar);
  it says what's in flight so parallel sessions don't drift.
- Commit/push only when asked; branch off `main` if you must (this is a private monorepo —
  the user often merges to `main` directly).
- **This monorepo is temporary scaffolding** — each layer becomes its own repo once proven.
  The map for that split (what goes where) is [`SPLIT-PLAN.md`](./SPLIT-PLAN.md).
- **Personal cross-repo standards** (writing voice, the note/blog template, README badges, a starter
  `CLAUDE.md`) live in [`tjakoen.github.io/standards/`](./tjakoen.github.io/standards/) — public + reusable in any
  repo. Writing anything under his byline? `VOICE.md` (how it reads) + `NOTE-STANDARD.md` (how a note
  is built) are the rulebook.
- Run from the repo root (relative paths in `tjakoen.github.io/config.ts` assume it).
- Bun lives at `~/.bun/bin` — `export PATH="$HOME/.bun/bin:$PATH"` if `bun` isn't found.
