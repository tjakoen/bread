# Docs — where everything lives

A guide — for me and Claude — to where every doc lives now that BREAD's layers are their own repos
(see [`SPLIT-PLAN.md`](SPLIT-PLAN.md) for how the split was executed). Plans and `CLAUDE.md` files
still sit **next to the layer they document**, in that layer's own repo, held here as a submodule;
the explanatory docs moved into the portfolio's docs home (below). There's no central `docs/` folder
for the umbrella; the cross-cutting docs live at the root or in `tjakoen.github.io/`:

- [`PHILOSOPHY.md`](tjakoen.github.io/PHILOSOPHY.md) — the *why* beneath the whole stack (lives in `tjakoen.github.io/`). **Read first.**
- [`AUDIT.md`](AUDIT.md) — the whole-stack alignment runbook (layering purity, tokens, docs-synced); at the root.
- [`ROADMAP.md`](ROADMAP.md) — the canonical execution plan (tracks per layer, the M★ live-model milestone, the honest-pitch bar); at the root.
- [`DEV-DOCS.md`](DEV-DOCS.md) — the plan for the developer docs (the task-oriented tutorial/how-to/reference half the stack is missing); at the root.
- [`tjakoen.github.io/standards/`](tjakoen.github.io/standards/) — the personal, public, cross-repo standards for how he builds and writes; every repo references this set, never forks it. Start at the [`README.md`](tjakoen.github.io/standards/README.md) index, then fetch only what you need: [`AI-DEVELOPMENT.md`](tjakoen.github.io/standards/AI-DEVELOPMENT.md) (building with an AI — the rulebook), [`SESSION-LOOP.md`](tjakoen.github.io/standards/SESSION-LOOP.md) (session mechanics, memory, handoff, model economy), [`VOICE.md`](tjakoen.github.io/standards/VOICE.md) (how prose reads), [`NOTE-STANDARD.md`](tjakoen.github.io/standards/NOTE-STANDARD.md) (how a note/blog post is built), [`FIGURES.md`](tjakoen.github.io/standards/FIGURES.md) (diagrams/charts), [`README-STANDARD.md`](tjakoen.github.io/standards/README-STANDARD.md) (repo READMEs), [`CLAUDE.starter.md`](tjakoen.github.io/standards/CLAUDE.starter.md) (seed for a per-repo `CLAUDE.md`).
- this map (`DOCS.md`, at the root).

For the whole-repo orientation + operating rules, start at [`CLAUDE.md`](CLAUDE.md). Each layer also
carries its own AI-onboarding `CLAUDE.md` in its repo, seeded from
[`tjakoen.github.io/standards/CLAUDE.starter.md`](tjakoen.github.io/standards/CLAUDE.starter.md), with that layer's
non-negotiables and hard-won lessons:
[`batch`](batch/CLAUDE.md), [`grain`](grain/CLAUDE.md), [`project`](project/CLAUDE.md),
[`portfolio`](tjakoen.github.io/CLAUDE.md), [`mill`](mill/CLAUDE.md). (`proof/` and `pantry/` carry
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
| [vocab-reference.ts](grain/ai/vocab-reference.ts) | `grain/ai/` | Generates the `/reference` page (actions, surface kinds, render ops, endpoints, token slots) from the real registries at request time — a projection, never hand-copied. | Contract |
| [GRAIN.md](https://tjakoen.github.io/grain/docs/grain) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | The AI-interaction layer — a design system an AI can operate (surfaces, one vocabulary, render ops, manifest, grade-as-signal). | Layer |
| [AI-INTERFACE.md](https://tjakoen.github.io/grain/docs/ai-interface) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | GRAIN's detailed contract: intent + render-op envelopes, the SSE push channel, the manifest, the two write paths, the AI-acts protocol. | Contract |
| [DESIGN-SYSTEM.md](https://tjakoen.github.io/grain/docs/design-system) | `tjakoen.github.io/docs/grain/` (rendered at `tjakoen.github.io/grain/docs/`) | The visual identity — *Sourdough*, monochrome e-ink. "Grade as signal" (grain = AI, clean = human). | Identity |
| [PLAN.md](mill/PLAN.md) | `mill/` | MILL — the Markdown→GRAIN CMS: its canonical plan + the "What MILL gives you" capability list. A layer *above* grain+batch (`batch → grain → mill`). | Layer |
| [PLAN.md](proof/PLAN.md) | `proof/` | PROOF — the AI plan board: its canonical plan. A **mountable layer** (plans-as-markdown → kanban projection; consumes MILL). Pieces 1–2 built (core + board) + `check`/`init` CLI. | Layer |
| [PLAN.md](pantry/PLAN.md) | `pantry/` | PANTRY — the installable dev-docs + AI cockpit **app** that composes batch+grain+mill+proof into one `bunx pantry` server. v2 built (home + board + framework docs + layer PLANs + reference + catalog + standards; host contract + `pantry init`/`INSTALL.md`). | App |
| [PROJECT-PLAN.md](project/PROJECT-PLAN.md) | `project/` | The product's master vision — the full ambient assistant. **PAUSED** (docs-only archive since 2026-07-05). | Vision |
| [MVP.md](project/docs/MVP.md) | `project/docs/` | The product slice — the AI task-manager dashboard. **PAUSED** (see above). | Product slice |

The **app + composition root** is [`tjakoen.github.io/`](tjakoen.github.io/) (the portfolio; it wires
batch + grain + mill and runs the site). Its own *how/what* docs — [`PLAN.md`](tjakoen.github.io/PLAN.md),
[`FEATURES.md`](tjakoen.github.io/FEATURES.md), the `/grain`·`/batch` landing-page plans, the demo
plan — live in `tjakoen.github.io/`, and the personal cross-repo standards in
[`tjakoen.github.io/standards/`](tjakoen.github.io/standards/). The root also carries the portable
[`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) (the repo-side companion to `standards/AI-DEVELOPMENT.md`).

## How they fit

```
Apps (compose the layers):
   tjakoen.github.io/ ─ the personal site — wires the layers, runs the site + /loop demo
   PANTRY             ─ the neutral, installable dev-docs + AI cockpit (bunx into any project)
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

The running proof lives in [`../tjakoen.github.io/`](tjakoen.github.io/) (the app + composition root),
on the [`../grain/`](grain/) + [`../batch/`](batch/) layers.
