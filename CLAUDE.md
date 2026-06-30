# CLAUDE.md — start here

Onboarding + operating rules for any AI (or human) joining this repo. Read this first,
then the docs it points to. Keep it accurate: if you change how the project works, update
this file too.

## What this is

A **no-build, server-rendered hypermedia** stack and a product built on it. Three layers,
one direction of dependency:

```
project/  the product — a personal AI assistant ("Department of Time") + its skin
   └─ grain/   GRAIN — an AI-interaction design system + its default theme (the look)
        └─ batch/   BATCH — the substrate (Bun · Atomic · TypeScript · CSS · htmx); no build step
```

The defining idea: a UI where **every surface is addressable and operable by both a human
and an AI through one shared vocabulary**, with the AI's presence shown as a visible signal
(*grain = AI*). A human click and an AI decision become the **same `Intent`**, flow through
**one door** (`POST /intent` → `grain/ai/interaction-layer.ts`), and return as **`RenderOp`s**
pushed over SSE. No privileged AI→DOM back channel.

## Start here (reading order)

1. **[CONVENTIONS.md](CONVENTIONS.md)** — the build standard (layering, components, tokens,
   the action vocabulary, the 3-tier testing bar, the extraction plan). **The rulebook.**
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — the substrate's reasoning (single source of truth).
3. **[docs/GRAIN.md](docs/GRAIN.md)** + **[docs/AI-INTERFACE.md](docs/AI-INTERFACE.md)** — the
   design system and the AI contract (surfaces, ops, manifest, the "AI acts" protocol).
4. **[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)** — the visual identity / grade-as-signal.

The SSOT for what's operable is **`grain/ai/contract.ts`** (`SurfaceKind`, `ActionName`,
`ACTIONS`, `RenderOp`). The composition root — the only place the three layers meet — is
**`project/server.ts`**. The reference screen is **`/loop`** (`project/pages/loop.html`).

## Commands

```bash
bun run dev        # hot-reload server (http://localhost:3000)
bun run check      # tsc --noEmit (must stay green)
bun run test       # unit + integration (bun test)
bun run test:e2e   # Playwright e2e (first run: bunx playwright install chromium)
bun run test:all   # everything
```

## Non-negotiables (see CONVENTIONS for the full rules)

- **Layering:** `batch` imports nothing inward; `grain` imports nothing from `batch` (only the
  `OpChannel` port); only `project/server.ts` wires the three. New design work goes in `grain`
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
| **An action verb** (add/modify) | `contract.ts` (`ActionName` + `ACTIONS` + `accepts`) → reasoner branch → **unit test** (reasoner) + **integration test** (door path) → `docs/AI-INTERFACE.md` (vocab) |
| **A surface kind** | `contract.ts` (`SurfaceKind`) → `ai-routes.ts` manifest targets → any page `data-surface` → tests |
| **A `RenderOp` kind/field** | `contract.ts` (`RenderOpKind`/`RenderOp`) → dispatcher `applyOp`/`applyType` (`ai-dispatch.js`) → `docs/AI-INTERFACE.md` → tests |
| **A component** | follow CONVENTIONS §4 checklist (`.html`/`.css`/`.md`, tokens, AI-mode, `data-kind`/`data-accepts` if operable) → add a test for any behavior → it auto-appears in `/catalog` |
| **A design token / the theme** | `grain/styles/variables.css` only (never per-component) |
| **The `/loop` demo or its surfaces** | `grain/ai/reasoner.ts` (the scripted demo) ↔ `project/pages/loop.html` surfaces → **e2e** (`project/e2e/`) |
| **The client dispatcher or a UI interaction** | `grain/scripts/ai-dispatch.js` → **e2e** (only tier that covers it) |
| **Layering / cross-layer deps** | re-verify import purity; if you reach across, add a port instead → CONVENTIONS §1/§10 |
| **Anything user-visible in behavior** | the matching doc (`ARCHITECTURE` / `GRAIN` / `AI-INTERFACE` / `DESIGN-SYSTEM` / `CONVENTIONS`) |
| **A notable decision or non-obvious fact** | write a **memory** (see below) so the next session inherits it |

**Definition of done:** code + the right test tier(s) (unit / integration / e2e per CONVENTIONS §6)
+ docs synced (this table) + `tsc` and `bun test` green + a memory if a decision was made.

## Memory

Claude Code keeps **per-project memories** (decisions, preferences, context) outside the repo;
they surface automatically at the start of each session. When you make a real decision or learn
something non-obvious, write one so the next session inherits it. If a recalled memory
contradicts the code, trust the code and fix the memory. (These are agent memory, not committed
files — durable, repo-worthy rules belong in `CONVENTIONS.md` or this file.)

## Working notes

- Commit/push only when asked; branch off `main` if you must (this is a private monorepo —
  the user often merges to `main` directly).
- Run from the repo root (relative paths in `project/config.ts` assume it).
- Bun lives at `~/.bun/bin` — `export PATH="$HOME/.bun/bin:$PATH"` if `bun` isn't found.
