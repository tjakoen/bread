# ROADMAP.md — from choreographed simulation to existence proof

> Status: **canonical execution plan (2026-07-03; frame updated 2026-07-06).** Written after a
> full-stack audit (4-agent deep dive: GRAIN code-vs-claims, BATCH, MILL, adversarial prior-art
> sweep) — findings in agent memory `stack-audit-2026-07`. This file is the *what-next*; the layer
> plans ([mill/PLAN.md](mill/PLAN.md), [proof/PLAN.md](proof/PLAN.md),
> [project/PROJECT-PLAN.md](project/PROJECT-PLAN.md),
> [tjakoen.github.io/PLAN.md](tjakoen.github.io/PLAN.md)) stay canonical for their layers, and
> [SPLIT-PLAN.md](SPLIT-PLAN.md) stays the repo-split map. When a step lands, tick it here and
> sync the layer doc.
>
> **Update (2026-07-05):** the composition root folded into `tjakoen.github.io/` (now THE app) and
> the AI-assistant product (`project/`) is **paused** — a docs-only archive. Where a track below
> says "domain work in `project/`", read it as the app (`tjakoen.github.io/`) until the product
> resumes as its own repo.

## The frame (how we now position everything)

The industry is converging on "software that AI can read and use" from every side — Astryx
(agent-*ready*: AI **authors** UIs at dev time), Builder.io Agent-Native (agent-*native*: agent and
UI share **actions** at runtime), the agent-UI protocols (standardized **channels**). Competitors
validate the market; we say so out loud and lead with it. Our point on that road, stated precisely:

> **Agent-operable, not just agent-ready** — a human and an AI operate the *same* closed vocabulary
> through *one* door, **and the surface itself shows whose hand did what** (grade-as-signal,
> stamped at the door, persisting after commit).

Symmetry and the single writer are no longer individually novel (Agent-Native ships both);
**provenance-as-grade coupled to the door is the load-bearing differentiator.** Every pitch, page,
and doc leads with the convergence story and lands on that differentiator. The whitepaper
([tjakoen.github.io/notes/whitepaper-one-vocabulary.md](tjakoen.github.io/notes/whitepaper-one-vocabulary.md),
revised 2026-07-03) is the argued version.

## The one milestone that changes what this *is*

**M★ — a live model drives the vocabulary end-to-end.** One real model (even a small one, even two
verbs) reads `/ai/manifest`, emits a `source:"ai"` `Intent` through `POST /intent`, gets validated
against the registry, and its work renders grain over SSE. The day this runs, the project stops
being a rigorously choreographed simulation and becomes the existence proof the whitepaper claims.
Everything in Track A builds *toward* it; nothing in any other track matters more.

Sequencing decision (owner, 2026-07-03): **the modality is finished first, the model arrives into a
contract, not a scaffold.** So M★ closes Track A rather than opening it.

---

## Track A — GRAIN: finish the modality, then wire the model

*Order matters; each step hardens the contract the model will land in.*

1. **Finish the UI interaction layer** (in progress — owner). Complete the control lifecycle,
   spotlight/takeover, console narration per [AI-INTERFACE.md](grain/docs/AI-INTERFACE.md) §5.
2. **Close the accidental back channels** ✅ (2026-07-04) (the *designed* seam stays — see 3):
   - ~~Retire the legacy generic CRUD routes (`/ui/items*`, `/api/items*`)~~ **Done** — `routes.ts`,
     `routes.test.ts`, and the `/home` page deleted; app-frame nav link, audit/screenshot entries,
     and the orphaned `toItemCardView`→`/ui/items` chain removed. Items now have exactly one write
     path (`/intent`). Legitimate direct-write CRUD returns as the `/kb/*` seam (step 3).
   - ~~Rebuild the `/grain` showcase driver~~ **Done** — `tjakoen.github.io/scripts/surface-demo.js` (the
     client-side AI→DOM channel) deleted; `/grain` now loads the real `ai-dispatch.js` and its
     "Watch the AI act" (→ `demo.run`) and Ask/Send (→ `chat.send`) post real Intents through
     `/intent` and render back over SSE. The reasoner branches a `/grain` scenario on `intent.screen`.
     Consequence: the demo is an operable surface, so on the static export it runs through the
     CLIENT-side door (§19.3, B.6 — shipped 2026-07-04) instead of going inert.
   - ~~Make `demo.run`'s archive step actually write state through the service~~ **Done** — the
     triage step archives a seeded fixture (`ITM-demo-1`, excluded from the task list) via
     `tools.archiveItem` and renders the committed card; re-runnable (idempotent).
3. **Build the `/kb/*` ownership seam** (the *legitimate* CRUD): direct-write routes for
   category-1 user ground-truth (knowledge base, notes, preferences) per AI-INTERFACE §5b — clean
   grade, notify-not-gate SSE event, and the two guardrails enforced (no generic endpoint; one
   path per datum). This is where "I still want CRUD for the knowledgebase" lives, by design.
4. **Mechanically couple grade to provenance**: the dispatcher should key `data-grade` off
   `op.provenance` (today `applyType` sets grain unconditionally and `replace`/`append` trust the
   writer's HTML). Add a conformance test: an op with `provenance:"ai"` *must* render grain.
   Also fix the semantic wobble where a human-initiated archive returns `provenance:"ai"`.
5. **Actor identity + reconnect** (already decided, §5d): actor-id stable across tabs/reloads,
   turn-status on `/stream` connect, `desk.stop` re-keyed to actor. Closes the
   any-client-can-join-any-session hole and is the same seam the real assistant needs.
6. **Pre-model hardening**: reasoner verb-handler registry (the if-chain won't scale past ~10
   verbs); make the dispatcher's 20s safety timeout configurable (a real model run will exceed
   it); upgrade the boot drift-guard from `console.warn` to fail-fast (opt-out flag for dev).
7. **M★ — wire the model.** Behind the existing `Reasoner` seam: read manifest → choose action →
   emit Intent → RenderOps. Start with `task.capture` + `say.*`. The manifest gets its first real
   consumer, which will also tell us if the "index of the possible" is actually sufficient.
   Then update the whitepaper's §6 implementation-status limitation — that's the day it shrinks.

## Track B — BATCH: export + honesty fixes (owner is on export)

1. ~~**`batch/export`**: crawl-and-freeze projection of the running server per ARCHITECTURE §18 —
   fetch, don't re-render.~~ **Done (2026-07-04, Tier 1).** Generic engine `batch/export/export.ts`
   + caller `tjakoen.github.io/tools/export.ts` (`bun run export`); pages→`dist/<route>/index.html`, assets
   verbatim, `PUBLIC_BASE_PATH`/`PUBLIC_ORIGIN` for subpath/root hosts, and the exportable boundary
   enforced by a dead-internal-link warning. Tier 2 (prerender of `hx-trigger="load"`) deferred.
   Unblocks MILL's hosting adapter and the portfolio deploy; the ~8 stale references are now true.
2. **Fix binary serving** in [batch/http/static.ts](batch/http/static.ts): `.text()` corrupts
   binaries and the MIME map has no images — `server.ts` already routes around it for fonts, and
   a picture-led portfolio hits this immediately. Serve bytes, extend the MIME map, add a test.
3. **Test the core**: the render engine has 4 tests (all security) — add coverage for `each=`,
   nested composition, props/slots, cache refresh; `catalog.ts` (385 LOC, own markdown parser)
   has zero. CONVENTIONS' own bar ("colocated tests for any branching logic") applies to batch too.
4. **README + CLAUDE.md truth pass**: batch/README.md describes a `frontend/` layout that doesn't
   exist and a stale test count; batch/CLAUDE.md claims batch "knows RenderOps, the door" (it
   doesn't — that's grain, and the code is *purer* than the doc says). (Doc fixes applied
   2026-07-03; keep them true.)
5. **Benchmarks before adjectives**: run the multi-target `bun run audit` comparison (memory:
   `framework-comparison-methodology`) before the `/batch` page prints "fast".
6. **Client-side runtime — "no-build client modules"** (headliner, spans BATCH→GRAIN→project; design
   in ARCHITECTURE §19). Lets a static-style page (the portfolio) run the door client-side, no backend.
   - a. ~~**BATCH primitive**: `batch/http/modules.ts` — serve any `.ts` to the browser transpiled
     on request (transpile-on-*request*, the mirror of Bun's transpile-on-execute), with the
     **client-safe import guard** (refuses server-only imports with a loud throwing stub).~~ **Done +
     tested (2026-07-04);** proven end-to-end (a browser imports the real `contract.ts`, no build).
     First payoff owed: retire the islands' re-declared verb literals by importing the real `contract.ts`.
   - b. ~~**GRAIN client-door wiring**: run `createInteractionLayer` in-browser against a **loopback
     `OpChannel`** → the dispatcher's `applyOp`; no `POST /intent`, no SSE. Same door, same ops.~~
     **Done (2026-07-04):** `grain/ai/client-door.ts` (unit-tested) + the dispatcher's transport seam
     (`<body data-ai-transport="client">` → dynamic-import the door, both `/intent` call sites routed
     through one `sendIntent`, the `ready` gate satisfied by construction). The module server now
     serves an all-`.js` browser-facing graph (`.js` URL → `.ts` source; relative specifiers
     rewritten) so frozen files carry a JS MIME type on any static host.
   - c. ~~**Export integration**: §18 export freezes the transpiled client modules into `dist/`.~~
     **Done (2026-07-04):** `exportSite({ moduleEntries })` walks the relative import graph from each
     entry and freezes it (transpile-at-export); `transformPage` lets the caller stamp the static
     copy's transport marker. `/grain`'s "Watch the AI act" + chat run fully on the static build —
     verified end-to-end (Playwright vs a static file server), server-door path regression-checked.
   - d. ~~**The opt-in + the safety comms**: composition-root mode switch (server-door | client-door);
     surface the **client-safe boundary** (ARCHITECTURE §19.2 — static-only, no secrets/tokens, no
     server-required behavior) wherever the mode is offered. This must be communicated well, not buried.~~
     **Done (2026-07-04):** the mode switch lives in `tjakoen.github.io/tools/export.ts` (`CLIENT_DOOR_PAGES`),
     the boundary is stated in `client-door.ts`, and the /grain "How it works" section carries the
     user-facing comms ("Two door transports, one contract" — client-safe by contract, no secrets,
     server-needing behavior absent on the static copy).
   - e. **Client-side caching** (owner, 2026-07-04): GRAIN renders client-side (the client door) and
     ships as a static export, so the browser cache IS the perf story there — server memoization
     doesn't reach it. Three pieces: (1) HTTP cache semantics on everything the client re-fetches —
     ETag/revalidate on `/components.css`, `/styles/*`, `/scripts/*` in dev; long-lived/immutable on
     the export's frozen module graph (`/modules/*` is `no-cache` today — right for dev, wrong for
     the static host); (2) a **manifest snapshot cache** in the client door — cache per screen,
     invalidate on applied `RenderOp`s (the index-vs-snapshot model, not a refetch per run);
     (3) view preferences stay `localStorage` (theme.js — already GRAIN's client cache). The header
     mechanism is BATCH (`static.ts`/`modules.ts`/export); the manifest policy is GRAIN (`ai/*`).
   *Prefs-helper verdict (2026-07-06, THE EDITOR v3):* each island persists its own key inline (~3
   lines: dotted `grain.<island>.<thing>` + try/catch, per `tabs.js`) — after v3 we're at ~6 keys
   (rail-collapsed, aside-hidden, console-hidden, tabs.open, **xray.on**, **shell.console-open**). A
   shared helper would force self-contained IIFE islands to import a module; **only build one if the
   keys proliferate past ~6.**
7. **Move the CATALOG to GRAIN** — ✅ **DONE (2026-07-05, commit 46b7964).** Moved `batch/catalog/`
   → `grain/catalog/`; dropped the batch `Runtime` dependency (reads `fs` directly like accepts.ts);
   replaced the batch `sitemap` param with a plain `pages:()=>string[]` thunk (grain/catalog imports
   nothing from batch); rewired the composition root; BATCH's charter dropped "the component catalog"
   and GRAIN's "self-documenting catalog" is now literally true (mechanism + content both grain).
   Original plan retained below for reference. The
   catalog is a design-system feature, not substrate: it browses GRAIN's components, renders their
   `.md` docs, and carries a HUMAN/AI **grade** toggle (grade = GRAIN vocabulary) — the grade-toggle
   "leak" was the symptom; the whole feature belongs in grain. Feasible + clean: `grain/ai/accepts.ts`
   ALREADY harvests components via `fs` (`readdirSync`/`readFileSync`) for the manifest — the catalog
   does the identical harvest, so it's the same layer. The only BATCH couplings are shallow:
   `batch/catalog/catalog.ts` imports `type Runtime` (drop → use `fs` directly like accepts.ts) and
   the optional `sitemap` for the Pages nav (inject a plain `string[]` from the composition root).
   Move `batch/catalog/` → `grain/catalog/`; rewire the composition-root import; BATCH's charter drops
   "the component catalog" and GRAIN's "self-documenting catalog" capability becomes literally true
   (mechanism + content both grain). Cross-cutting — do it in the **portfolio consolidation** pass
   (shipped 2026-07-05; see git history), not mid-flight.

8. **Themes as reference files** — ✅ **DONE (2026-07-05, commit eb58392).** Baguette + Brioche split
   into `grain/styles/themes/{baguette,brioche}.css` + annotated `_template.css`; variables.css keeps
   the axis machinery + `:root` + dark block and `@imports` the flavors; boot drift-guard scans
   `themes/*.css` too; DESIGN-SYSTEM §2 points at the template. Original plan below. Today all flavors live inline in
   `grain/styles/variables.css` (`:root` default + dark + `[data-theme="baguette"]`/`"brioche"`
   blocks) — no clear per-theme template for someone authoring their own. Split: keep the axis
   machinery + `:root` (the canonical list of overridable slots) + the dark block in variables.css;
   move each flavor to `grain/styles/themes/{baguette,brioche}.css`; add an annotated
   `themes/_template.css` ("copy me → override these accent slots × light/dark"). Load them via the
   style bundle / links. Low-risk (CSS only) but touches the theme system — sequence with the other
   grain moves. Update DESIGN-SYSTEM §2 (the theming axes) to point at the template as the reference.

9. **Export completeness — the API/DB-then-static story** (owner, 2026-07-05). The portfolio exports
   cleanly today because it's content plus a client-door demo, but the substrate's promise is broader:
   *any* BATCH app can choose static or server. Make that honest by closing three gaps, all foreshadowed
   in ARCHITECTURE §18 (the four-bucket rule now written there):
   - a. **Tier-2 prerender** (designed in §18, unbuilt): for a data-backed read (`hx-trigger="load"`
     hitting `/ui/*`), fetch the fragment at export time, inline it, strip the trigger — so a page whose
     data is *the same for everyone at build time* freezes complete instead of shipping a `Loading…`
     shell that XHRs a backend that isn't there. This is what lets a DB-backed page be static (a
     build-time **snapshot**, explicitly not live data).
   - b. **Declarative export disposition**: today the boundary is a hand-maintained pair of sets in
     `tjakoen.github.io/tools/export.ts` (`OPERABLE`, `CLIENT_DOOR_PAGES`). A route should declare its own bucket
     (content | operable | snapshot | dynamic) so the export derives the allowlist instead of the caller
     hardcoding it — same "projection, not a fork" discipline the crawler already follows.
   - c. **Hybrid deploy as a first-class topology**: document (and smooth the ergonomics of) the real
     end-state for an app with genuine per-request/per-user work — content + snapshots on a CDN, the
     live routes on a running Bun server, one codebase. The honest ceiling: a page can be frozen only if
     its bytes are identical for everyone at build time; anything else stays on the server.
   Verified 2026-07-05 that Tier-1 export of the portfolio works end-to-end (23/23 routes, served at 200,
   the new note renders); the missing piece for the *deploy* is the GitHub Actions workflow YAML
   (checkout → setup-bun → `bun install` → `bun run export` with `PUBLIC_ORIGIN` set → upload + deploy
   Pages), which no repo currently carries.

## Track C — MILL: a content plugin for GRAIN, deliberately small

*Reframed (owner, 2026-07-03): MILL is the stack's content layer — "a plugin for GRAIN" — not a
standalone CMS play. Publishing it stays fine; competing with Eleventy is a non-goal.*

1. **Minimal proof-of-value only** (mill/PLAN.md pieces 1–4): parser → node→tag map → layout wrap →
   `/notes` + `/notes/:slug` live on BATCH. Defer mermaid→SVG, RSS, filtering, docs rendering.
   *Pieces 1–2 landed 2026-07-03: the framework-agnostic core engine (hand-rolled parser + total
   node→handler adapter port) + the BATCH+GRAIN reference adapter, unit-tested. Pieces 3–4 landed
   2026-07-04: the live content route (`mill/serve.ts`) + portfolio wiring (`/notes`, `/grain/docs`,
   `/batch/docs`), docs package-resolved via workspaces — Track C item 1 done.*
2. **The missing piece that actually serves the thesis — AI-facing outputs**: the same `.md`
   emits human pages *and* `knowledge.json` (RAG corpus) *and* SEO/AEO surface (meta/OG, JSON-LD,
   llms.txt) *and* `data-surface` addresses on rendered content so the assistant can spotlight and
   navigate notes. "AI-operable ≈ AI-answerable" is MILL's one open lane no incumbent occupies —
   it's now in the plan (added 2026-07-03), not just in memory.
3. **Prereqs to schedule honestly**: ~~grain needs code-block, figure, and callout components~~
   (built 2026-07-03 — `atoms/code-block`, `molecules/figure`, `molecules/callout`, + a `--font-mono`
   token; a markdown renderer can't render a technical note without them); the hosting adapter needs
   `batch/export` (Track B.1); mermaid→SVG (FIGURES.md hard requirement) needs a dependency
   decision — it's heavy, so it's explicitly deferred, not implied.

## Track D — Positioning & paper (mostly done 2026-07-03)

1. ~~Whitepaper: cite Agent-Native + Astryx, convergence-led framing, narrowed novelty,
   implementation-status limitation~~ (done — see §8 third pass).
2. Portfolio pages (`/grain`, `/batch`) get the same convergence-first framing: "the industry is
   building agent-ready and agent-native; this is agent-*operable*, with provenance in the
   surface." Pages are teasers of the docs, never forks.
3. After M★: re-run the prior-art sweep (the ground moves monthly), then the user-study track
   (§5 H1–H3) becomes the next real evidence step.

## Track E — PROOF: the AI plan board (2026-07-08 — pieces 1–4 + mount seam built; board LIVE over SSE)

Plans-as-markdown (`plans/` + minimal frontmatter) rendered as a kanban board; injectable into any
project via `bunx proof init` (scaffold + CLAUDE.md contract + hook set). Own top-level project,
sibling of `mill/`, first library consumer of MILL. **Canonical plan: [proof/PLAN.md](proof/PLAN.md)**
(the design law: files = SSOT, board = projection, AI never maintains the board). Sequencing: after
Track A's M★ push — it competes with nothing above it. Companion blog note drafted:
`tjakoen.github.io/notes/where-were-we.md`.

## Track F — PANTRY: the installable dev-docs + AI cockpit (2026-07-08 — v1 built + install-verified)

The **app** that composes the layers (BATCH·GRAIN·MILL·PROOF) into one server you `bunx` into any
project: renders the framework docs, the project's PROOF plan board, the generated reference, and the
catalog — everything addressable and AI-answerable in one place, for the AI (and human) building
there. Neutral, project-agnostic sibling of the portfolio (two apps, one stack). Settles "does PROOF
need a server?" — no: **PROOF is a mountable layer; PANTRY is the server.** Requires the PROOF split
(`createProofRoutes`, mirroring MILL) — do it after PROOF's layer (Tracks E pieces 3–4) settles.
**Canonical plan: [pantry/PLAN.md](pantry/PLAN.md)** (includes the root tidy-up structure).

## Definition of "the pitch is honest"

- No page or doc says "one write path" while generic CRUD routes ship (Track A.2/A.3 resolve this).
- No demo labeled "the AI acts" bypasses the door (A.2).
- "Existence proof" is only claimed for what runs: architecture today, operation after M★.
- Adjectives ("fast", "found") appear only after `bun run audit` numbers exist (B.5).
