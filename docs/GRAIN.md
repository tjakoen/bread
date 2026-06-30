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
| **Surfaces** | every mutable region has a stable semantic address (`data-surface`) | markup + `grain/ai/contract.ts` |
| **Action vocabulary** | one closed set of verbs (the SSOT: `ActionName`/`SurfaceKind` + `ACTIONS`) | `grain/ai/contract.ts` |
| **The one door** | human click *and* AI decision become the same `Intent` → `POST /intent` → single writer | `grain/ai/interaction-layer.ts` |
| **Render ops** | the writer's only output: `replace/append/remove/flash/type/spotlight`, addressed to surfaces, pushed over SSE | `grain/ai/contract.ts`, `batch/http/stream.ts` |
| **Manifest** | the AI's instruction manual per screen — harvested from components, can't drift | `grain/ai/manifest.ts`, `grain/ai/accepts.ts` |
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

## Repo layout (monorepo, separated now)

The three concerns are already separate top-level directories — no Bun workspaces,
plain relative imports, one `package.json` + `tsconfig` at the root. They're polished
in place and will each become **their own repo** (GRAIN a package on BATCH) once the
product proves them; the boundary is kept clean so that split is a copy, not a rewrite.

```
batch/     substrate — render, http (incl. stream.ts SSE), assets, catalog, platform.
           Imports nothing from grain/project. Ships its own render-test fixtures.
grain/     this layer — ai/ (contract, interaction-layer, reasoner boundary, manifest,
           accepts), components/atoms/b-*, scripts/ (ai-dispatch, cmdk), styles/grain.css
           (the grade + spotlight MECHANISM). Ships no values, fonts, skin, or app.
project/   the app + skin — domain/data/services/routes/view, components (item/loop/…),
           pages, styles/ (Dept of Time values + @font-face), fonts, vendor, server.ts
           (the composition root — the one place batch + grain + project meet).
```

A key consequence the split forced (and a real reusability test): BATCH's
`render`/`catalog`/`style-bundle` and GRAIN's `accepts` accept **multiple component
roots**, so components compose across `grain/components` + `project/components`.

The detailed contract is **[AI-INTERFACE.md](./AI-INTERFACE.md)**; the visual identity
and grade mechanics are **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**. When extracting:
BATCH → its own repo; GRAIN → a repo depending on BATCH; the product → on GRAIN.
