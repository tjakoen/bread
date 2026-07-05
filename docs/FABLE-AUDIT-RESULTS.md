# Fable audit results — 2026-07-05

Full run of the [AUDIT.md](../AUDIT.md) runbook by Claude (Fable 5), plus a targeted
adversarial review of the 2026-07-04 landings (client-side door, traveling lamp, editor
tabs/rail restyle, hover-wash, MILL pieces 3–4). Report follows the AUDIT.md template.
Every finding below was **fixed in this session** unless marked deferred — commits at the end.

## ✅ Passing

- **1. Green gate** — `tsc --noEmit` 0 errors · 138 unit/integration pass · 61 e2e pass
  (52 pre-existing + 9 new editor-shell) · export verified by driving the static build with
  Playwright (welcome framed + live Recent + baked status; /notes exported; /grain runs the
  full demo through the client door and releases; AI reply stays grain).
- **2. Layering purity** — batch imports nothing inward (one grep hit = a comment); grain
  imports nothing from batch. Clean.
- **3. One vocabulary / drift guards** — server boot produced **zero** `[accepts]`/`[theming]`
  warnings.
- **4. Tokens only** — no hardcoded colors in `grain/`, `project/`, or `tjakoen.github.io/` component
  CSS.
- **5. Persona-neutral GRAIN** — no "the desk" in batch/grain (known `desk.stop` exception
  stands).
- **6. Naming** — "Career Team" casing clean; Sourdough/BATCH naming clean.
- **9. Generated output** — `screenshots/`, `audit/`, `dist/` all gitignored.
- **Traveling lamp (review)** — clean: one fixed `.ai-lamp`, target never restyled, zero
  per-kind lit CSS anywhere, `--ai-focus-move` mechanically consumed (transitions animate
  properties `place()` actually mutates — lesson 9 satisfied), scroll-behavior fix present,
  motion covered by `lamp-travel.e2e.ts`.
- **Client-side door structure (review)** — layering pure (`client-door.ts` imports only
  grain-internal modules), client-safe boundary holds (no server-only imports, no secrets),
  loopback ready-by-construction, module freeze proven end-to-end, unit tests present.
- **MILL 3–4 structure (review)** — grade guardrail on both output paths, slug traversal
  double-safe, docs package-resolved (no `../grain/docs` anywhere), `escapeHtml` coverage
  complete on traced interpolations.

## ⚠️ Findings → fixed

**Docs contradicting decisions**
1. `grain/CLAUDE.md`, `batch/CLAUDE.md`, `batch/docs/CONVENTIONS.md`,
   `tjakoen.github.io/standards/CLAUDE.starter.md` — still ordered the `Co-Authored-By: Claude`
   trailer; contradicts the 2026-07-04 no-attribution decision (enforced in settings, history
   scrubbed). **Fixed:** all four now state no AI trailers; the receipt is the README badge.

**Export / sitemap (the known finding, fixed at cause)**
2. `/notes`, `/notes/:slug`, `/grain/docs/*`, `/batch/docs/*` were live content pages missing
   from the export allowlist (flagged as dead links) — content pages must export per
   ARCHITECTURE §18. **Fixed at source:** MILL routes are enumerable (`listMillRoutes`,
   SLUG-filtered) → `listPortfolioContentRoutes` feeds BOTH the export allowlist and the
   server sitemap. Bonus finding: the server `/sitemap.xml` also omitted all portfolio pages —
   now covers everything the server serves (generic `extraRoutes` seam on `createSitemap`,
   batch stays vocabulary-agnostic). Export: 21/21 pages, content dead-links gone.
3. ROADMAP **B.6d** owed the user-facing client-safe-boundary comms. **Fixed:** /grain "How it
   works" gained "Two door transports, one contract" (client-safe by contract, no secrets,
   server-needing behavior absent on the static copy). B.6d ticked done.

**Check 11 — capabilities lists (12 findings, all fixed)**
4. `mill/README.md` badge + status said "planned — nothing is built" while pieces 1–4 are live.
5. `/mill` page flag said "Planned · only the plan exists so far".
6. ARCHITECTURE §19.3 heading said "planned" while its own status block said built + tested.
7. ARCHITECTURE §11.4 documented the old `createSitemap` signature (no `extraRoutes`).
8. **Client-side door buried** — GRAIN's headline landing of the day absent from "What GRAIN
   gives you" (now a listed capability; the /grain teaser no longer runs ahead of the SSOT).
9. **Theming system buried** — the two axes / 3 flavors / FOUC guard absent from the list.
10. DESIGN-SYSTEM had **no theming-axes section** (memory claimed §2 covered it; it didn't —
    now documented).
11. Workspace-shell primitives + ⌘K palette + demo-box unlisted (now under *Also*).
12. ARCHITECTURE's export hero bullet omitted the module-graph freeze and still claimed
    operable surfaces are always inert (client-door exception now stated).
13. `mill/PLAN.md` — ContentSource port / package-resolved docs / `listMillRoutes` unlisted.

**Adversarial review of the 2026-07-04 landings**
14. `grain/scripts/ai-dispatch.js` — the 3s no-`ready` fallback silently re-opened the
    lesson-6 early-op-drop window. **Fixed:** warns loudly + comment states the deliberate
    degraded-mode tradeoff.
15. `grain/scripts/ai-dispatch.js` — `/intent` fetch never checked `res.ok`: a door-level 500
    left the trigger stuck in `data-commit="pending"` until the 20s safety timeout. **Fixed:**
    non-ok throws → the catch clears the trigger.
16. `tjakoen.github.io/content.ts` — comment claimed the export dead-link warning covers relative
    `.md` leftovers; it only sees root-absolute hrefs. **Fixed:** comment states the truth
    (KNOWN GAP note).
17. `mill/serve.ts` — `listMillRoutes` could list slugs the router 404s. **Fixed:**
    SLUG-filtered.
18. *(found while building)* MILL content pages never received the global HEAD inject —
    missing `theme-boot.js` = FOUC gap on /notes + docs pages. **Fixed:** chrome accepts
    `injectHead`; composition root passes `GLOBAL_HEAD`.

## Deferred / accepted (flagged, not fixed)

- `desk.stop` action name in grain (rename deferred — standing exception).
- Product-UI titles pending the product rename ("Project" temporary).
- Review nits, accepted: MILL index re-parses frontmatter per request (live dev only; export
  freezes it); `/grain/docs/GRAIN` vs `/grain/docs/grain` case-duplicate serves (SEO nit, no
  canonical tag); collection-prefix 404 shadows nested namespaces (latent, current prefixes
  unaffected); lamp `scroll`/`resize` listeners never detached (singleton — harmless);
  `--ai-focus-move` reused for pane retraction (one-rhythm reuse, minor token-promise drift).
- Page-view counter and any other status-bar number: **never faked** — hidden until a real
  mechanism exists (DEMO-PLAN.md §8).

## Session commits

| Commit | What |
|---|---|
| `4687e9d` | Portfolio plan: THE EDITOR — the site as one editor window |
| `85bd635` | Export + sitemap: MILL content routes enumerable from one source |
| `fadbc89` | Audit truth pass: B.6d comms, capabilities lists, stale status, no trailers |
| `12764f1` | GRAIN: THE EDITOR primitives — app-window, status-bar, honest presence |
| `2499538` | MILL + content: SLUG-filter listed routes, live Recent feed, head inject |
| `9e0d03e` | Portfolio + project: THE EDITOR — the whole site as one editor window |
| `6b1dc9e` | Standards: AI-DEVELOPMENT.md (owner's playbook, split into its own commit) |
| `ca29ada` | Portfolio: DEMO-PLAN.md — the handoff plan for the desk demos |
