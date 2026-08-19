# ALIGNMENT.md — when you change X, update Y

The contract for not drifting. Split out of `CLAUDE.md` so the front door stays a one-minute read
(per <https://tjakoen.github.io/standards/loop> §3); the rules themselves are unchanged.
After any change, sync everything in its row.

| You change… | …also update |
|---|---|
| **An action verb** (add/modify) | `contract.ts` (`ActionName` + `ACTIONS` + `accepts`) → reasoner branch → **unit test** (reasoner) + **integration test** (door path) → [AI-INTERFACE](https://tjakoen.github.io/grain/docs/ai-interface) (vocab) |
| **A surface kind** | `contract.ts` (`SurfaceKind`) → `ai-routes.ts` manifest targets → any page `data-surface` → tests |
| **A `RenderOp` kind/field** | `contract.ts` (`RenderOpKind`/`RenderOp`) → dispatcher `applyOp`/`applyType` (`ai-dispatch.js`) → [AI-INTERFACE](https://tjakoen.github.io/grain/docs/ai-interface) → tests |
| **A component** | follow CONVENTIONS §4 checklist (`.html`/`.css`/`.md`, tokens, AI-mode, `data-kind`/`data-accepts` if operable) → add a test for any behavior → it auto-appears in `/catalog` |
| **A design token / the theme** | `grain/packages/grain/styles/variables.css` only (never per-component) |
| **The hero desk or its surfaces** | the desk reasoner ↔ `tjakoen.github.io/` home-route surfaces → **e2e** (`tjakoen.github.io/e2e/`) |
| **The client dispatcher or a UI interaction** | `grain/packages/grain/scripts/ai-dispatch.js` → **e2e** (only tier that covers it) |
| **The static export / prerender** | keep it a *projection* of the running server (fetch, don't re-render) → `batch/export` (`bun run export`, framework-generic) → respect the exportable boundary (no operable `/intent`+SSE surfaces) → ARCHITECTURE §18 |
| **The doc map or the layer/route structure** (a canonical doc, a landing route, a docs route) | re-sync `/llms.txt` — the AI-facing index (`tjakoen.github.io/llms.ts`, a *projection* of `DOCS.md`; format in `batch/http/llms.ts`) → ARCHITECTURE §11.4. It's the AEO counterpart to `sitemap.xml`; a stale link there misdirects an AI crawler |
| **A module served to the browser** (`/modules`, or the client-side runtime) | it MUST be **client-safe** (ARCHITECTURE §19.2): no server-only imports (guard-enforced), **no secrets/tokens**, no server-required behavior — static-style only → say so wherever the mode is offered; the mechanism (`batch/http/modules.ts`) is `batch`, the client-door wiring is `grain/packages/grain/ai/*`, the mode switch is the composition root |
| **Layering / cross-layer deps** | re-verify import purity; if you reach across, add a port instead → CONVENTIONS §1/§10 |
| **Anything user-visible in behavior** | the matching doc (`ARCHITECTURE` / `GRAIN` / `AI-INTERFACE` / `DESIGN-SYSTEM` / `CONVENTIONS`) |
| **A concept doc** (`ARCHITECTURE`/`CONVENTIONS`/`GRAIN`/`AI-INTERFACE`) | the portfolio showcase that *renders* it — re-check the pitch/teaser sections still summarize it truly: the published [GRAIN](https://tjakoen.github.io/grain/docs/grain)+[AI-INTERFACE](https://tjakoen.github.io/grain/docs/ai-interface) docs → `/grain` (`tjakoen.github.io/view/pages/grain/GRAIN-PAGE.md`, `/grain/docs`); `ARCHITECTURE`+`CONVENTIONS` → `/batch` (`tjakoen.github.io/view/pages/batch/BATCH-PAGE.md`, `/batch/docs`). Docs are the single source; pages are trailheads, never forks |
| **A roadmap step** (land, drop, or re-sequence) | tick it in [`ROADMAP.md`](../ROADMAP.md) → sync the canonical layer plan for that track (Track A → `grain/CLAUDE.md` / `project/PROJECT-PLAN.md`; Track B → `batch`; Track C → `packages/mill/PLAN.md` (grain monorepo); Track D → `tjakoen.github.io/docs/architecture/PLAN.md`) |
| **A platform capability / feature** (add, drop, or re-tier) | update that layer's **tiered capabilities list** — the single source: [GRAIN](https://tjakoen.github.io/grain/docs/grain) §"What GRAIN gives you" / [ARCHITECTURE](https://tjakoen.github.io/batch/docs/architecture) §"What BATCH gives you" / `packages/mill/PLAN.md` §"What MILL gives you" → re-sync its teasers (the layer README + the `/grain`·`/batch` landing pages) as *projections*, never forks → [AUDIT.md](../AUDIT.md) check 11 (nothing buried). Heroes = the reasons the layer exists; useful-but-quiet features go under *Also*, never omitted |
| **A notable decision or non-obvious fact** | write a **memory** (see below) so the next session inherits it |
