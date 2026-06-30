# GRAIN — an interface an AI can operate

**GRAIN** is the AI-interaction layer: a design system *and* framework where every UI
surface is **addressable** and **operable by both a human and an AI through one shared
vocabulary**, and where the AI's presence — its authorship and its actions — is a
**visible signal**. It is named for that signal: *grain = AI* (the Redaction grain
grade), clean = human.

It runs **on a substrate** — [BATCH](../ARCHITECTURE.md) (no-build, server-rendered
hypermedia) is the reference one — but it is **substrate-agnostic**: `grain/` imports
nothing from `batch/`. It depends only on a small **port** (`OpChannel`, below), which
BATCH's SSE hub satisfies structurally. BATCH answers "how do I render and serve
components with no build step"; GRAIN answers "how does an AI drive that UI, visibly,
through one door" — and would answer it the same on a different substrate.

## Substrate contract — what GRAIN needs to run

GRAIN is portable if its host provides three things (BATCH provides all three; another
substrate could):

1. **A push channel** — the `OpChannel` port (`push(session, event, data)`): how render
   ops reach a client. BATCH = SSE; could be a WebSocket hub, etc. *(GRAIN imports the
   interface from its own `contract.ts`, never from the substrate.)*
2. **A renderer that understands GRAIN's binding vocabulary** — components use
   `data-field` / `data-bind-*` / `slot-tag` / `each` / `data`. BATCH's composition
   engine implements this; a different substrate must too. *(This is the one real
   remaining coupling — it lives in the markup conventions, not in code imports.)*
3. **A filesystem** to harvest `data-kind` / `data-accepts` for the manifest (any JS
   runtime; not BATCH-specific).

Everything else GRAIN needs (the write capability, the render-a-surface function) is
**injected** by the composition root, so GRAIN names no concrete dependency.

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
and grade mechanics are **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**; the hands-on usage
reference (substrate contract, binding vocabulary, token slots, wiring) lives in the
package itself, **[`../grain/README.md`](../grain/README.md)**. When extracting:
BATCH → its own repo; GRAIN → a repo on a substrate (BATCH the reference); product → on GRAIN.
