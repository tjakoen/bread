# Product docs — Personal AI Assistant

These docs describe **the product** being built: a personal AI assistant / second
brain, with an AI task manager as its first slice. They are separate from **the
stack** it's built on (BATCH — see [`../ARCHITECTURE.md`](../ARCHITECTURE.md) and
[`../README.md`](../README.md)).

> **The plan:** build this product on BATCH first, dogfood it, then extract the
> generic stack into its own repo once it's proven. Dogfooding is the moat.
> While building, the `poc/framework/` ↔ `poc/app/` boundary is kept clean so that
> extraction is a copy, not a rewrite.

> **Built so far (2026-06-30):** MVP build-order steps 1–2 — the one `/intent` door,
> server-push over SSE, the dispatcher island, optimistic→confirm→rollback, the
> self-harvested manifest, grade-as-signal, the Department of Time identity app-wide,
> the upgraded `/catalog` (Human/AI per component, grouped + searchable), and a global
> ⌘K palette. Reasoner is still a stub; next is step 3 (real model + the gate). See
> `AI-INTERFACE.md` §7, `MVP.md` §"Build Order", and `../ARCHITECTURE.md` §17.

## Reading order

| # | Doc | What it is | Altitude |
|---|-----|-----------|----------|
| 1 | [PROJECT-PLAN.md](./PROJECT-PLAN.md) | The master vision — the full ambient assistant, its principles, and the four differentiators (correction loop, trade-off ledger, duty-to-warn, accountability). | Vision |
| 2 | [MVP.md](./MVP.md) | The current slice — the AI task manager dashboard. What we build *now*, consistent with the master plan. | Product slice |
| 3 | [AI-INTERFACE.md](./AI-INTERFACE.md) | The mechanism that makes single-writer / one-door real: the action vocabulary (SSOT in `contract.ts`), intent + render-op envelopes, the SSE push channel, the self-harvested manifest, **the two write paths** (the door vs. direct category-1 writes), and grade-as-signal. | Contract / how |
| 4 | [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | The visual identity — *Department of Time*, a monochrome e-ink aesthetic. "Grade as signal" (grain = AI, clean = human) is implemented; AI-INTERFACE §5 ties it to the interaction layer. | Identity |

## How they fit

```
PROJECT-PLAN  ─ the destination (full assistant)
   └─ MVP     ─ the first slice (task manager dashboard)
        ├─ AI-INTERFACE  ─ HOW the AI drives the UI (single door, no back channel)
        └─ DESIGN-SYSTEM ─ how it LOOKS (and how the look encodes state)
              ↑ AI-INTERFACE and DESIGN-SYSTEM meet at: grade = commit state
                (grain = proposed/in-transit/uncommitted · clean = committed ground truth)
```

The running proof of the contract lives in [`../poc/`](../poc/) — see
[AI-INTERFACE.md §"Reference scaffold"](./AI-INTERFACE.md#reference-scaffold).
