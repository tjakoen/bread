# Docs — where everything lives

A guide — for me and Claude — to where every doc lives now that BREAD's layers are their own repos
(see [`SPLIT-PLAN.md`](docs/history/SPLIT-PLAN.md) for how the split was executed, and the working notes in
[`CLAUDE.md`](CLAUDE.md) for the later de-submoduling). Plans and `CLAUDE.md` files still sit **next
to the layer they document**, in that layer's own repo (`batch` its own repo; `grain`/`mill`/`proof`/
`crumb` inside the `grain` monorepo) — `bread` itself no longer embeds them, it links out; the
explanatory docs moved into the portfolio's docs home (below). There's no central `docs/` folder
for the umbrella; the cross-cutting docs live at the root or in `tjakoen.github.io/`:

- [`PHILOSOPHY.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/PHILOSOPHY.md) — the *why* beneath the whole stack (lives in `tjakoen.github.io/`). **Read first.**
- [`AUDIT.md`](AUDIT.md) — the whole-stack alignment runbook (layering purity, tokens, docs-synced); at the root.
- [`ROADMAP.md`](ROADMAP.md) — the canonical execution plan (tracks per layer, the M★ live-model milestone, the honest-pitch bar); at the root.
- [`DEV-DOCS.md`](DEV-DOCS.md) — the plan for the developer docs (the task-oriented tutorial/how-to/reference half the stack is missing); at the root.
- [`tjakoen.github.io/standards/`](https://tjakoen.github.io/standards) — the personal, public, cross-repo standards for how he builds and writes; every repo references this set, never forks it. Start at the [`README.md`](https://tjakoen.github.io/standards/readme) index, then fetch only what you need: [`AI-DEVELOPMENT.md`](https://tjakoen.github.io/standards/ai-development) (building with an AI — the rulebook), [`SESSION-LOOP.md`](https://tjakoen.github.io/standards/session-loop) (session mechanics, memory, handoff, model economy), [`VOICE.md`](https://tjakoen.github.io/standards/voice) (how prose reads), [`NOTE-STANDARD.md`](https://tjakoen.github.io/standards/note-standard) (how a note/blog post is built), [`FIGURES.md`](https://tjakoen.github.io/standards/figures) (diagrams/charts), [`README-STANDARD.md`](https://tjakoen.github.io/standards/readme-standard) (repo READMEs), [`CLAUDE.starter.md`](https://tjakoen.github.io/standards/claude.starter) (seed for a per-repo `CLAUDE.md`).
- this map (`DOCS.md`, at the root).

For the whole-repo orientation + operating rules, start at [`CLAUDE.md`](CLAUDE.md). Each layer also
carries its own AI-onboarding `CLAUDE.md` in its repo, seeded from
[`tjakoen.github.io/standards/CLAUDE.starter.md`](https://tjakoen.github.io/standards/claude.starter), with that layer's
non-negotiables and hard-won lessons:
[`batch`](https://github.com/tjakoen/batch/blob/main/CLAUDE.md), [`grain`](https://github.com/tjakoen/grain/blob/main/CLAUDE.md), [`project`](https://github.com/tjakoen/project/blob/main/CLAUDE.md),
[`portfolio`](https://github.com/tjakoen/tjakoen.github.io/blob/main/CLAUDE.md), [`mill`](https://github.com/tjakoen/grain/blob/main/packages/mill/CLAUDE.md). (`proof/` and `pantry/` carry
their canonical `PLAN.md`; a per-folder `CLAUDE.md` follows when each grows past its plan.)

## Where the layer docs live

| Doc | Lives in | What it is | Altitude |
|---|---|---|---|
| [GETTING-STARTED.md](https://tjakoen.github.io/batch/docs/getting-started) | `tjakoen.github.io/docs/batch/` (rendered at `tjakoen.github.io/batch/docs/`) | Task-oriented: install, run, what BATCH gives you, next steps. Part of [DEV-DOCS.md](DEV-DOCS.md)'s `/docs` hub. | Substrate |
| [ARCHITECTURE.md](https://tjakoen.github.io/batch/docs/architecture) | `tjakoen.github.io/docs/batch/` (rendered at `tjakoen.github.io/batch/docs/`) | The substrate's reasoning — no-build server-rendered hypermedia; incl. the static export (§18) and no-build **client** modules + client-side runtime (§19, with the client-safe boundary). Single source of truth for the stack. | Substrate |
| [CONVENTIONS.md](https://tjakoen.github.io/batch/docs/conventions) | `tjakoen.github.io/docs/batch/` (rendered at `tjakoen.github.io/batch/docs/`) | The build standard — layering, components, tokens, the action vocabulary, the 3-tier testing bar. | Substrate |
| [GETTING-STARTED.md](https://tjakoen.github.io/grain/docs/getting-started) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | Task-oriented: install, the two layers (design system vs. AI door), the markup table, next steps. Part of [DEV-DOCS.md](DEV-DOCS.md)'s `/docs` hub. | Layer |
| [TUTORIAL.md](https://tjakoen.github.io/grain/docs/tutorial) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | The flagship developer-docs tutorial — build one operable surface end to end, using the real running `item.archive` example. Part of [DEV-DOCS.md](DEV-DOCS.md)'s `/docs` hub. | Layer |
| How-to guides (7) | `tjakoen.github.io/docs/batch/` + `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/batch/docs/` + `tjakoen.github.io/grain/docs/`) | Task-scoped: add a route, add a component, make a surface operable, add a RenderOp kind, re-skin via tokens, consume as a git dependency, static export + deploy. Listed at `/docs`; see [DEV-DOCS.md](DEV-DOCS.md) for the full file list. | Layer |
| [vocab-reference.ts](https://github.com/tjakoen/grain/blob/main/packages/grain/ai/vocab-reference.ts) | `grain/packages/grain/ai/` | Generates the `/reference` page (actions, surface kinds, render ops, endpoints, token slots) from the real registries at request time — a projection, never hand-copied. | Contract |
| [GRAIN.md](https://tjakoen.github.io/grain/docs/grain) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | The AI-interaction layer — a design system an AI can operate (surfaces, one vocabulary, render ops, manifest, grade-as-signal). | Layer |
| [AI-INTERFACE.md](https://tjakoen.github.io/grain/docs/ai-interface) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | GRAIN's detailed contract: intent + render-op envelopes, the SSE push channel, the manifest, the two write paths, the AI-acts protocol. | Contract |
| [DESIGN-SYSTEM.md](https://tjakoen.github.io/grain/docs/design-system) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | The visual identity — *Sourdough*, monochrome e-ink. "Grade as signal" (grain = AI, clean = human). | Identity |
| [GETTING-STARTED.md](https://tjakoen.github.io/mill/docs/getting-started) | `tjakoen.github.io/docs/mill/` (rendered at `tjakoen.github.io/mill/docs/`) | Task-oriented: install, what MILL gives you, next steps. | Layer |
| [ARCHITECTURE.md](https://tjakoen.github.io/mill/docs/architecture) | `tjakoen.github.io/docs/mill/` (rendered at `tjakoen.github.io/mill/docs/`) | MILL's reasoning — Markdown → GRAIN-pages rendering, the collection model. | Layer |
| [ADD-A-COLLECTION.md](https://tjakoen.github.io/mill/docs/add-a-collection) | `tjakoen.github.io/docs/mill/` (rendered at `tjakoen.github.io/mill/docs/`) | How-to: wire a new Markdown collection through MILL. | Layer |
| [PLAN.md](https://github.com/tjakoen/grain/blob/main/packages/mill/PLAN.md) | `grain/packages/mill/` | MILL — the Markdown→GRAIN CMS: its canonical plan + the "What MILL gives you" capability list. A layer *above* grain+batch (`batch → grain → mill`). | Layer |
| [GETTING-STARTED.md](https://tjakoen.github.io/proof/docs/getting-started) | `tjakoen.github.io/docs/proof/` (rendered at `tjakoen.github.io/proof/docs/`) | Task-oriented: install, what PROOF gives you, next steps. | Layer |
| [HOW-IT-WORKS.md](https://tjakoen.github.io/proof/docs/how-it-works) | `tjakoen.github.io/docs/proof/` (rendered at `tjakoen.github.io/proof/docs/`) | PROOF's reasoning — plans-as-markdown, the kanban projection. | Layer |
| [PLAN.md](https://github.com/tjakoen/grain/blob/main/packages/proof/PLAN.md) | `grain/packages/proof/` | PROOF — the AI plan board: its canonical plan. A **mountable layer** (plans-as-markdown → kanban projection; consumes MILL). Pieces 1–4 built + the mount seam (`createProofRoutes`); the board is LIVE over SSE (see the file's status line for the current count) + `check`/`init` CLI. | Layer |
| [GETTING-STARTED.md](https://tjakoen.github.io/crumb/docs/getting-started) | `tjakoen.github.io/docs/crumb/` (rendered at `tjakoen.github.io/crumb/docs/`) | Task-oriented: install, what CRUMB gives you, next steps. | Layer |
| [WRITE-A-TOUR.md](https://tjakoen.github.io/crumb/docs/write-a-tour) | `tjakoen.github.io/docs/crumb/` (rendered at `tjakoen.github.io/crumb/docs/`) | How-to: write a guided tour. | Layer |
| [`crumb/`](https://github.com/tjakoen/grain/tree/main/packages/crumb) | `grain/packages/crumb/` | CRUMB — the guided-tour layer. Live in production on the portfolio (`tjakoen.github.io`). | Layer |
| [GETTING-STARTED.md](https://tjakoen.github.io/pantry/docs/getting-started) | `tjakoen.github.io/docs/pantry/` (rendered at `tjakoen.github.io/pantry/docs/`) | Task-oriented: install, what PANTRY composes, next steps. | App |
| [WHAT-IT-COMPOSES.md](https://tjakoen.github.io/pantry/docs/what-it-composes) | `tjakoen.github.io/docs/pantry/` (rendered at `tjakoen.github.io/pantry/docs/`) | What PANTRY composes and why — batch+grain+mill+proof into one `bunx pantry` server. | App |
| [PLAN.md](https://github.com/tjakoen/pantry/blob/main/PLAN.md) | `pantry/` | PANTRY — the installable dev-docs + AI cockpit **app** that composes batch+grain+mill+proof into one `bunx pantry` server. Reshaped into a dev side-tool (board-forward home, stack pitch moved to `/about`); AI-retrieval (`/llms.txt`, `/knowledge.json`) + the whole-codebase mindmap (`/map`) are live (see the file's status line for the current state). | App |
| [PROJECT-PLAN.md](https://github.com/tjakoen/project/blob/main/PROJECT-PLAN.md) | `project/` | The product's master vision — the full ambient assistant. **PAUSED** (docs-only archive since 2026-07-05). Private repo. | Vision |
| [MVP.md](https://github.com/tjakoen/project/blob/main/docs/MVP.md) | `project/docs/` | The product slice — the AI task-manager dashboard. **PAUSED** (see above). Private repo. | Product slice |

The **app + composition root** is [`tjakoen.github.io/`](https://tjakoen.github.io/) (the portfolio; it wires
batch + grain + mill and runs the site). Its own *how/what* docs — [`PLAN.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/architecture/PLAN.md),
[`FEATURES.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/architecture/FEATURES.md), the `/grain`·`/batch` landing-page plans, the demo
plan — live in `tjakoen.github.io/`, and the personal cross-repo standards in
[`tjakoen.github.io/standards/`](https://tjakoen.github.io/standards) — including the repo-side
[`AI-REPO-STANDARD`](https://tjakoen.github.io/standards/ai-repo-standard), the companion to
`AI-DEVELOPMENT` (folded into the canon; referenced here, never forked).

## How they fit

```
Apps (compose the layers):
   tjakoen.github.io/ ─ the personal site — wires the layers, runs the site (hero desk = reference surface)
   PANTRY             ─ the neutral, installable dev-docs + AI cockpit (bunx into any project)
Layer:    CRUMB        ─ the guided-tour layer (batch → grain → crumb)
Layer:    PROOF        ─ the AI plan board (mountable; batch → grain → mill → proof)
Layer:    MILL         ─ the Markdown→GRAIN CMS (batch → grain → mill)
Layer:    GRAIN        ─ the AI-operable interface
             ├─ AI-INTERFACE  ─ the contract: one door, render ops, manifest, AI-acts protocol
             └─ DESIGN-SYSTEM ─ the look + grade-as-signal (grain = AI · clean = human)
Substrate: BATCH (ARCHITECTURE) ─ no-build server-rendered hypermedia
Product (PAUSED): PROJECT-PLAN / MVP ─ the assistant's vision, archived until it resumes as its own repo

   an app → uses → PROOF → MILL → built on → GRAIN → built on → BATCH
   (two apps on one stack: the portfolio is branded + personal, PANTRY is neutral + installable)
```

The running proof lives in [`tjakoen.github.io/`](https://tjakoen.github.io/) (the app + composition root),
on the [`grain/`](https://github.com/tjakoen/grain) + [`batch/`](https://github.com/tjakoen/batch) layers.
