# Docs — where everything lives

A guide — for me and Claude — to where every doc lives while this stays a monorepo. Each doc sits
**next to the layer it documents**, so the eventual repo split (see [`SPLIT-PLAN.md`](SPLIT-PLAN.md))
is a straight move. There's no central `docs/` folder; the cross-cutting docs live at the root or in
`portfolio/`:

- [`PHILOSOPHY.md`](portfolio/PHILOSOPHY.md) — the *why* beneath the whole stack (lives in `portfolio/`). **Read first.**
- [`AUDIT.md`](AUDIT.md) — the whole-stack alignment runbook (layering purity, tokens, docs-synced); at the root.
- [`portfolio/standards/`](portfolio/standards/) — the personal, public, cross-repo standards for anything written under his byline: [`VOICE.md`](portfolio/standards/VOICE.md) (how prose reads), [`NOTE-STANDARD.md`](portfolio/standards/NOTE-STANDARD.md) (how a note/blog post is built), [`README-STANDARD.md`](portfolio/standards/README-STANDARD.md) (repo READMEs), [`CLAUDE.starter.md`](portfolio/standards/CLAUDE.starter.md) (seed for a per-repo `CLAUDE.md`).
- this map (`DOCS.md`, at the root).

For the whole-repo orientation + operating rules, start at [`CLAUDE.md`](CLAUDE.md). Each future-repo
folder also carries its own AI-onboarding `CLAUDE.md`, seeded from
[`portfolio/standards/CLAUDE.starter.md`](portfolio/standards/CLAUDE.starter.md), with that layer's
non-negotiables and hard-won lessons; they travel with the folder on the split:
[`batch`](batch/CLAUDE.md), [`grain`](grain/CLAUDE.md), [`project`](project/CLAUDE.md),
[`portfolio`](portfolio/CLAUDE.md), [`mill`](mill/CLAUDE.md).

## Where the layer docs live

| Doc | Lives in | What it is | Altitude |
|---|---|---|---|
| [ARCHITECTURE.md](batch/docs/ARCHITECTURE.md) | `batch/docs/` | The substrate's reasoning — no-build server-rendered hypermedia. Single source of truth for the stack. | Substrate |
| [CONVENTIONS.md](batch/docs/CONVENTIONS.md) | `batch/docs/` | The build standard — layering, components, tokens, the action vocabulary, the 3-tier testing bar. | Substrate |
| [GRAIN.md](grain/docs/GRAIN.md) | `grain/docs/` | The AI-interaction layer — a design system an AI can operate (surfaces, one vocabulary, render ops, manifest, grade-as-signal). | Layer |
| [AI-INTERFACE.md](grain/docs/AI-INTERFACE.md) | `grain/docs/` | GRAIN's detailed contract: intent + render-op envelopes, the SSE push channel, the manifest, the two write paths, the AI-acts protocol. | Contract |
| [DESIGN-SYSTEM.md](grain/docs/DESIGN-SYSTEM.md) | `grain/docs/` | The visual identity — *Bread*, monochrome e-ink. "Grade as signal" (grain = AI, clean = human). | Identity |
| [PROJECT-PLAN.md](project/PROJECT-PLAN.md) | `project/` | The product's master vision — the full ambient assistant and its differentiators. | Vision |
| [MVP.md](project/docs/MVP.md) | `project/docs/` | The current product slice — the AI task-manager dashboard. | Product slice |

## How they fit

```
Product:  PROJECT-PLAN ─ the destination (full assistant)
             └─ MVP    ─ the first slice (task manager dashboard)
Layer:    GRAIN        ─ the AI-operable interface
             ├─ AI-INTERFACE  ─ the contract: one door, render ops, manifest, AI-acts protocol
             └─ DESIGN-SYSTEM ─ the look + grade-as-signal (grain = AI · clean = human)
Substrate: BATCH (ARCHITECTURE) ─ no-build server-rendered hypermedia

   Product → built on → GRAIN → built on → BATCH
```

The running proof lives in [`../grain/`](grain/) + [`../project/`](project/).
