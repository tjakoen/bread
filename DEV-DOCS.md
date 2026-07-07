# DEV-DOCS.md — the developer-docs plan

> Status: **canonical plan (2026-07-07).** Owns the "how a developer learns to build with this stack"
> deliverable — the task-oriented docs the stack is missing. Cross-cutting like [ROADMAP.md](ROADMAP.md)
> and [AUDIT.md](AUDIT.md), so it lives at the root; the content files it plans live *next to their
> layer* per [DOCS.md](DOCS.md). When a piece lands, tick it here and sync the layer doc + `/llms.txt`.

## The gap

Today's docs are almost all **explanation** (the *why* and the *contract*): PHILOSOPHY, ARCHITECTURE,
GRAIN, AI-INTERFACE, DESIGN-SYSTEM, plus CONVENTIONS (rules, not a walkthrough) and per-layer READMEs
(half a quickstart). There is a live **reference** in `/catalog` (component browser) and `contract.ts`
(vocabulary SSOT). What's missing is the whole task-oriented half: nothing walks a developer who found
`@tjakoen/grain` on GitHub from install to a working operable surface.

Mapped to [Diátaxis](https://diataxis.fr):

| Type | Orientation | Have? | Plan |
|---|---|---|---|
| **Explanation** | understand | ✅ rich | leave alone — link into it |
| **Reference** | look up | ⚠️ partial | render it; **generate** the vocab/endpoint/token parts from source |
| **How-to** | do a task | ❌ | write, one short guide per task |
| **Tutorial** | learn by building | ❌ | write the flagship: build an operable surface end-to-end |

**Audience: both, layered.** Consumer docs (build *on* the stack) are the public deliverable and part
of the pitch that the stack is real and reusable; a thin **Contribute** section sits on top and just
links the existing contributor docs (`CLAUDE.md` / `HACKING.md` / `CONVENTIONS.md`) rather than
re-documenting them.

## Principles (inherited, non-negotiable)

- **Docs are the single source; pages are projections, never forks.** The reference must *render* or
  *generate* from source, not copy it. (→ [CLAUDE.md](CLAUDE.md) "projections not forks", `philosophy-doc-and-ssot-map`.)
- **The vocabulary SSOT is `grain/ai/contract.ts`.** Any vocabulary reference is generated from it, so
  it can't drift. (→ CLAUDE.md "One vocabulary".)
- **Docs live next to the layer they document** so the repo split stays a straight move. (→ [DOCS.md](DOCS.md).)
- **Served by the existing MILL machinery** (`/grain/docs`, `/batch/docs` render the installed
  package's `docs/`) — no second render path.
- **The static export stays a projection** of the running server. (→ ARCHITECTURE §18.)

## Structure — one `/docs` hub, layer-local content

```
/docs  (new portfolio hub route — the learning path; indexes everything, owns nothing)
 ├─ Getting started   ← per layer, lifted from the READMEs, made copy-pasteable
 ├─ Tutorial          ← "build your first operable surface" (flagship)
 ├─ How-to guides     ← short, one task each
 ├─ Reference         ← GENERATED (vocab/endpoints/tokens) + the live /catalog
 └─ Contribute        ← thin: links CLAUDE.md · HACKING.md · CONVENTIONS.md
```

Files on disk (travel with the folder on the split):

```
batch/docs/GETTING-STARTED.md
batch/docs/guides/*.md
grain/docs/GETTING-STARTED.md
grain/docs/guides/*.md
grain/docs/TUTORIAL.md          (flagship — GRAIN is where "operable" lives)
```

The `/docs` hub itself is a portfolio surface (`tjakoen.github.io/`) — it stitches the layer docs into
one ordered path and links out to `/catalog` and the explanation docs. It **owns no prose**; every
paragraph lives in a layer `docs/` file and is rendered through MILL.

## The pieces

### 1. Tutorial — "build your first operable surface" (flagship)
`grain/docs/TUTORIAL.md`. From `bun install` to *the AI clicks a button and a `RenderOp` paints the
result*. One narrative: serve a static page → mark one surface operable (`data-kind` / `data-accepts`)
→ add the reasoner branch → drive it through `POST /intent` → watch grain settle to clean over SSE.
This is the doc that proves the pitch is buildable, not just describable.

### 2. How-to guides (short, task-scoped)
One task, one page, copy-pasteable. Candidate set:
- add a route
- add a `b-*` component (CONVENTIONS §4 as a walkthrough, not a re-statement)
- make a surface operable (`data-kind` / `data-accepts` + reasoner branch + the test tiers)
- add a `RenderOp` kind
- re-skin by overriding tokens (never editing components)
- consume `batch` / `grain` as Bun git deps
- static export + deploy to Pages

### 3. Reference — generated as a projection (BATCH idiom)
Like `llms.ts` and `sitemap` — emit it from source so it can't drift:
- **Vocabulary**: `ActionName` / `SurfaceKind` / `RenderOp` (+ `accepts`) generated from `grain/ai/contract.ts`.
- **Endpoints**: `POST /intent`, the SSE push channel, `/ai/manifest`.
- **Tokens**: the semantic token list from `grain/styles/variables.css`.
- **Components**: frame the live `/catalog` — it already *is* the component reference; don't fork it.

### 4. Contribute (thin)
Links, not prose: `CLAUDE.md` (operating rules) · `HACKING.md` (route→source map) · `CONVENTIONS.md`
(the build standard) · the per-layer `CLAUDE.md` non-negotiables. If a contributor needs more than a
pointer, the gap is in those docs — fix it there, not here.

## Sequence

1. ✅ **Hub route `/docs` + nav** — thin, links only what exists today. Proves the shape end-to-end. (`ba231c4`)
2. ✅ **Getting-started ×2** — lift from the READMEs, make it copy-pasteable, render through MILL. (`df9ec2e`)
3. **Tutorial** — the flagship. ← next
4. **How-to guides** — batch them; each is small.
5. **Generated reference tool** — vocab + endpoints + tokens as a projection of source.
6. **Contribute section** — links.
7. **Sync + gate** — per the CLAUDE.md "when you change X" table (below).

## Open decisions

- **Reference: generate now or defer?** Generating from `contract.ts` is the drift-proof-right way but
  is a small tool build. v1 can link the live `/catalog` + raw `contract.ts` and generate later. *Lean:
  ship v1 linked, generate at step 5.*
- **Hub route name:** `/docs` (matches `/grain/docs`, `/batch/docs`) vs `/develop` / `/learn`. *Lean:
  `/docs` as the hub; the layer explanation docs stay at `/{layer}/docs/*`.*

## Definition of done (sync map — from CLAUDE.md)

- **The doc map / a docs route changed** → re-sync [DOCS.md](DOCS.md) and `/llms.txt`
  (`tjakoen.github.io/llms.ts`, a projection of DOCS.md) + `sitemap.xml`.
- **A new route** → keep the static export a projection (`bun run export`); respect the exportable
  boundary (no operable `/intent`+SSE surfaces in the export).
- **Tests** per tier (CONVENTIONS §6): content/route tests for the hub + rendered pages; if the
  reference generator ships, a test that it matches `contract.ts`.
- **AUDIT** → add a check that the `/docs` hub links resolve and the reference hasn't drifted from source.
- `tsc` + `bun test` green, then **commit**.
