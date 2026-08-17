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
       ├─ MILL/               the markdown CMS (LIVE — renders /notes + the layer docs; its OWN reusable project)
       ├─ proof/              PROOF — the AI plan board, a mountable layer (plans-as-markdown → kanban)
       ├─ pantry/             PANTRY — the installable dev-docs + AI cockpit app (`bunx pantry`)
       ├─ tjakoen.github.io/  THE personal-site app + the composition root
       └─ project/            the product — a personal AI assistant; **PAUSED**, docs-only archive
```

The **composition root folded into `tjakoen.github.io/` (2026-07-05)**: the portfolio is now THE app —
it wires batch + grain + mill and runs the site; the hero desk is the reference surface where you
watch the AI act. The portfolio *uses* MILL for its markdown content; MILL does not build it.
Dependency purity: `grain` imports nothing from `batch` except the `OpChannel` port; **MILL depends
on both, never the reverse** — a new layer above both, not an extension of either.

The defining idea: a UI where **every surface is addressable and operable by both a human
and an AI through one shared vocabulary**, with the AI's presence shown as a visible signal
(*grain = AI*). A human click and an AI decision become the **same `Intent`**, flow through
**one door** (`POST /intent` → `grain/ai/interaction-layer.ts`), and return as **`RenderOp`s**
pushed over SSE. No privileged AI→DOM back channel.

Fuller detail on each layer, and the paused-project history, is in [`DOCS.md`](DOCS.md) — the
full doc map.

## Start here (reading order)

1. **[PHILOSOPHY.md](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/PHILOSOPHY.md)** — the *why* (the beliefs the whole stack serves). **Read first.**
2. **[CONVENTIONS](https://tjakoen.github.io/batch/docs/conventions)** — the build standard (layering, components, tokens,
   the action vocabulary, the 3-tier testing bar, the extraction plan). **The rulebook.**
3. **[ARCHITECTURE](https://tjakoen.github.io/batch/docs/architecture)** — the substrate's reasoning (single source of truth).
4. **[GRAIN](https://tjakoen.github.io/grain/docs/grain)** + **[AI-INTERFACE](https://tjakoen.github.io/grain/docs/ai-interface)** — the
   design system and the AI contract (surfaces, ops, manifest, the "AI acts" protocol).
5. **[DESIGN-SYSTEM](https://tjakoen.github.io/grain/docs/design-system)** — the visual identity / grade-as-signal.
6. **[`proof/PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/proof/PLAN.md)** + **[`pantry/PLAN.md`](https://github.com/tjakoen/pantry/blob/main/PLAN.md)** — the plan board and the cockpit app.

The SSOT for what's operable is **`grain/ai/contract.ts`** (`SurfaceKind`, `ActionName`,
`ACTIONS`, `RenderOp`). The composition root — the only place the layers meet — is
**`tjakoen.github.io/server.ts`**. The reference surface is the **hero desk** (the home route `/`),
where a human and the AI drive the same door.

**Working mainly in one layer?** Each layer's repo carries its **own `CLAUDE.md`** —
[`batch/CLAUDE.md`](https://github.com/tjakoen/batch/blob/main/CLAUDE.md) and [`grain/CLAUDE.md`](https://github.com/tjakoen/grain/blob/main/CLAUDE.md) — with that layer's
non-negotiables and the hard-won *"don't repeat these"* lessons. Read the layer's file alongside this
one.

## This repo is the stack's control plane — run it

`bread` is a **map, not a monorepo**, but it is also the one place that operates the *whole stack*
at once. There is no app code to run here; the commands below drive PANTRY against this umbrella host
(its `plans/`, its docs, its layer pins). The per-layer `bun run dev/test/shots/audit` commands live
in each **layer's own repo**, not here.

```bash
bun run cockpit    # bunx pantry serve — the whole-stack cockpit: plans board, decision inbox, docs
bun run check      # bunx pantry check — doc-drift lint (dead references); CI-able, exits nonzero
bun run doctor     # bunx pantry doctor — kit compliance + staleness + layer-pin drift (the omnibus)
bun run deps       # bunx pantry deps — are the @tjakoen/* pins current with the layer sources on disk?
bun run plans:check # bunx proof check — validate the umbrella plan board
bun run deps:refresh # re-pin every layer to its latest (the fix when `deps` reports drift)
```

`deps` / `doctor`'s pin check reads the **sibling layer checkouts** (`../batch`, `../grain/packages/*`):
a pin behind its source is a chore that's **due** (surfaced), never a broken build. Run `deps:refresh`
to clear it. This is the umbrella's unique job — no single layer repo can answer "is the stack pinned
to what I actually have?"

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
- **Tests are part of the work.** `tsc` + `bun test` green before you call something done.

## Keep the vision aligned

The when-you-change-X-update-Y table lives in **[docs/ALIGNMENT.md](docs/ALIGNMENT.md)**. Open the row
for what you are changing before you change it — that table is the contract for not drifting.

**Definition of done:** code + the right test tier(s) (unit / integration / e2e per CONVENTIONS §6)
+ docs synced (that table) + `tsc` and `bun test` green + a memory if a decision was made + **commit**
(once the gate is green, commit the change — don't leave finished, verified work sitting uncommitted).

**When you fix something, fix its cause — not just the instance.** Anything flagged — a failing
check, a bug, a surface that didn't behave as expected, an AI that tripped — is first a signal about
the *docs or the architecture*, not a one-off. Ask *why it was possible* and close it at the source.
An operator tripping on the system measures the system's clarity, not just the operator's. The bar:
**this stack must be easy for a human and *even more* legible and operable for an AI**.

**Before committing / after a big change:** run the alignment audit — [AUDIT.md](AUDIT.md) (green
gate, layering purity, tokens-only, persona-neutral GRAIN, naming, docs-synced).

## Memory

Claude Code keeps **per-project memories** (decisions, preferences, context) outside the repo;
they surface automatically at the start of each session. When you make a real decision or learn
something non-obvious, write one so the next session inherits it. If a recalled memory
contradicts the code, trust the code and fix the memory. Durable, repo-worthy rules belong in the
published [CONVENTIONS](https://tjakoen.github.io/batch/docs/conventions) doc or this file.

## The rest

**Pre-flight: read [`ROADMAP.md`](./ROADMAP.md) before starting substantive work** — the canonical
execution plan; it says what's in flight so parallel sessions don't drift. Commit/push only when
asked. Run from the repo root. Bun lives at `~/.bun/bin`.

Working notes (the split history, the npm-registry move, where the personal standards live) and how
to **show the UI in a headless session** are in
**[docs/OPERATING-NOTES.md](docs/OPERATING-NOTES.md)**.

Querying the code graph: follow the published standard —
<https://tjakoen.github.io/standards/graph>. Short version: `graphify query "<symbol>"` before you
fan out grep, symbol names not English prose, and `graphify update .` after edits (AST-only, no API
cost). This repo carries a graph at `graphify-out/`.
