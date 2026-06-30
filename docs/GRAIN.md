# GRAIN — an interface an AI can operate

**GRAIN** is the AI-interaction layer: a design system *and* framework where every UI
surface is **addressable** and **operable by both a human and an AI through one shared
vocabulary**, and where the AI's presence — its authorship and its actions — is a
**visible signal**. It is named for that signal: *grain = AI* (the Redaction grain
grade), clean = human.

It is built **on [BATCH](../ARCHITECTURE.md)** (the no-build, server-rendered hypermedia
substrate) but is a distinct concern: BATCH answers "how do I render and serve
components with no build step"; GRAIN answers "how does an AI drive that UI, visibly,
through the same door a human uses."

## The pieces

| Piece | What it is | Where |
|---|---|---|
| **Surfaces** | every mutable region has a stable semantic address (`data-surface`) | markup + `contract.ts` |
| **Action vocabulary** | one closed set of verbs (the SSOT: `ActionName`/`SurfaceKind` + `ACTIONS`) | `app/ai/contract.ts` |
| **The one door** | human click *and* AI decision become the same `Intent` → `POST /intent` → single writer | `app/ai/interaction-layer.ts` |
| **Render ops** | the writer's only output: `replace/append/remove/flash/type/spotlight`, addressed to surfaces, pushed over SSE | `contract.ts`, `framework/http/stream.ts` |
| **Manifest** | the AI's instruction manual per screen — harvested from components, can't drift | `app/ai/manifest.ts`, `framework/render/accepts.ts` |
| **Grade-as-signal** | grain = AI / in-transit, clean = human / committed — one inherited switch | `DESIGN-SYSTEM.md` §3, `AI-INTERFACE.md` §5 |
| **The "AI acts" protocol** | spotlight the surface, it enters AI-mode by kind (button → working, input → composed clean, text → grain), act, hand back — mediated, never force-killed | `AI-INTERFACE.md` §5c |

## How it stacks

```
Product (the assistant) + Department of Time identity
   └─ GRAIN   — the AI-operable interface (this doc)
        └─ BATCH — no-build hypermedia substrate (../ARCHITECTURE.md)
```

The detailed contract is **[AI-INTERFACE.md](./AI-INTERFACE.md)** (envelopes, manifest,
the two write paths, the AI-acts protocol); the visual identity and grade mechanics are
**[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**.

## Roadmap

GRAIN and BATCH will each become **their own repo** — GRAIN as a package built on BATCH —
once the first product (the assistant) ships and proves them. Until then they live
together here and are polished in place. The boundary is already kept clean so the split
is a copy, not a rewrite:

- **BATCH (substrate)** — `poc/framework/*` plus the generic additions GRAIN relies on
  (`http/stream.ts` SSE hub, `render/accepts.ts` harvester, `pages.ts` asset-injection,
  binary static types). These import nothing from the app.
- **GRAIN (this layer)** — `poc/app/ai/*` (the door, contract, reasoner boundary,
  manifest), the dispatcher island `poc/frontend/scripts/ai-dispatch.js`, the grade
  tokens/atom in `poc/frontend/styles/*`, and the `data-surface`/`data-action`/
  `data-accepts` conventions on components.
- **Product** — the domain, the pages, the *Department of Time* skin.

When extracting: BATCH → its own repo; GRAIN → a repo depending on BATCH; the product →
a repo depending on GRAIN.
