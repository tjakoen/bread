# Product docs — Personal AI Assistant

These docs describe **the product** being built: a personal AI assistant / second
brain, with an AI task manager as its first slice. They are separate from **the
stack** it's built on (BATCH — see [`../ARCHITECTURE.md`](../ARCHITECTURE.md) and
[`../README.md`](../README.md)).

> **The plan:** build this product on BATCH + GRAIN first, dogfood it, then extract
> each into its own repo once proven. Dogfooding is the moat. The repo is a **monorepo**
> of four concerns — `batch/` (substrate), `grain/` (the AI design system, see
> [GRAIN.md](./GRAIN.md)), plus independent consumers `project/` (this product), `mill/` (a
> Markdown→GRAIN CMS, *planned*), and `portfolio/` (the personal site) — with clean
> boundaries, so the split is a copy, not a rewrite. These are **product** docs; for the
> whole-repo picture see [`../CLAUDE.md`](../CLAUDE.md), and for the *why*,
> [`../PHILOSOPHY.md`](../PHILOSOPHY.md).

> **Built so far (2026-06-30):** MVP build-order steps 1–2 — the one `/intent` door,
> server-push over SSE, the dispatcher island, optimistic→confirm→rollback, the
> self-harvested manifest, grade-as-signal, the Bread identity app-wide,
> the upgraded `/catalog` (Human/AI per component, grouped + searchable), and a global
> ⌘K palette. Reasoner is still a stub; next is step 3 (real model + the gate). See
> `AI-INTERFACE.md` §7, `MVP.md` §"Build Order", and `../ARCHITECTURE.md` §17.

## Reading order

| # | Doc | What it is | Altitude |
|---|-----|-----------|----------|
| 1 | [PROJECT-PLAN.md](./PROJECT-PLAN.md) | The master vision — the full ambient assistant, its principles, and the four differentiators (correction loop, trade-off ledger, duty-to-warn, accountability). | Vision |
| 2 | [MVP.md](./MVP.md) | The current slice — the AI task manager dashboard. What we build *now*, consistent with the master plan. | Product slice |
| 3 | [GRAIN.md](./GRAIN.md) | **The AI-interaction layer** — a design system + framework an AI can operate (surfaces, one action vocabulary, render ops, manifest, grade-as-signal, the AI-acts protocol). Built on BATCH; headed for its own repo. The umbrella for #4–5. | Layer |
| 4 | [AI-INTERFACE.md](./AI-INTERFACE.md) | GRAIN's detailed contract: the action vocabulary (SSOT in `contract.ts`), intent + render-op envelopes, the SSE push channel, the self-harvested manifest, the two write paths, grade-as-signal, the AI-acts protocol. | Contract / how |
| 5 | [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | The visual identity — *Bread*, a monochrome e-ink aesthetic. "Grade as signal" (grain = AI, clean = human) is GRAIN's signature, implemented. | Identity |

## How they fit

```
Product:  PROJECT-PLAN ─ the destination (full assistant)
             └─ MVP    ─ the first slice (task manager dashboard)
Layer:    GRAIN        ─ the AI-operable interface (own repo, later)
             ├─ AI-INTERFACE  ─ the contract: one door, render ops, manifest, AI-acts protocol
             └─ DESIGN-SYSTEM ─ the look + grade-as-signal (grain = AI · clean = human)
Substrate: BATCH (../ARCHITECTURE.md) ─ no-build server-rendered hypermedia

   Product → built on → GRAIN → built on → BATCH
```

The running proof lives in [`../grain/`](../grain/) + [`../project/`](../project/) —
see [AI-INTERFACE.md §"Reference scaffold"](./AI-INTERFACE.md#reference-scaffold).
