# CONSOLIDATION.md — fold the composition root into the portfolio

**Status: planned, not started.** Owner decision (2026-07-05): the AI-assistant product (`project/`)
is paused; the **portfolio is the only thing we're building**. This plan makes the portfolio the
single app by absorbing the composition root, and retires `project/` as a separate concern.

**Execute as one focused pass in a dedicated session (fable), AFTER the current parallel thread
lands** — it rewrites the composition root + every e2e import path, so it collides hard with any
in-flight work in `project/`. Do not do it piecemeal.

## Why

`project/` does double duty today:
1. **The paused product** — Dept of Time: `/dashboard`, the item domain, `PROJECT-PLAN.md`, `MVP.md`.
   We aren't touching this.
2. **The composition root + the door** — `server.ts` (the ONLY place batch+grain+mill+portfolio
   wire), `config.ts`, the renderer, `ai-routes.ts` (`/intent`, `/stream`, `/ai/manifest`), the
   interaction layer + scripted reasoner, `tools/` (export/audit/screenshots), the whole `e2e/`
   suite. **This runs the portfolio and powers the /grain "watch the AI act" demo.**

So "delete project" really means: **move (2) into the portfolio, drop (1)'s product surfaces, and
preserve (1)'s vision docs.** A raw `rm -rf project` stops the site booting and kills the showcase.

Dependency check (2026-07-05): **nothing imports from `project/`** (it's the top consumer);
`project/server.ts` imports `../portfolio/content.ts`, and `config.ts` mounts
`./portfolio/components` + `./portfolio/pages`. So the portfolio is already the lower layer — the
composition root just needs to move up into it and flip the relative paths.

## Target structure

The portfolio becomes the reference **app** that consumes batch + grain + mill. Flat at the repo
root (per the split plan — memory `bread-stack-umbrella-and-splits`: portfolio → the
`tjakoen.github.io` repo). NOT nested `portfolio/tjakoen.github.io/`.

```
batch-stack/            (BREAD umbrella; batch/grain/mill split to their own repos later)
  batch/   grain/   mill/          (libraries — unchanged, consumed via ../ then git-deps)
  portfolio/                        (THE app; becomes the tjakoen.github.io repo on split)
    server.ts        ← was project/server.ts (the composition root)
    config.ts        ← was project/config.ts
    render.ts        ← was project/view/renderer.ts
    routes/ai-routes.ts, tools/{export,audit,screenshots}.ts, vendor/htmx.min.js
    demo/            ← the trimmed "watch the AI act" domain (see below)
    components/ pages/ notes/ content.ts standards/  (existing portfolio)
    e2e/             ← was project/e2e/
    package.json     (dev/check/test/export/shots/audit scripts)
```

(Folder rename `portfolio/` → `tjakoen.github.io/` is optional and can wait for the repo split;
keep `portfolio/` in the monorepo for now to minimize churn.)

## File-by-file

### MOVE — composition root + infra (→ portfolio/, rewrite imports)
- `project/server.ts` → `portfolio/server.ts` — flip paths: `./portfolio/*` → `./*`, `../batch|grain|mill` stays `../…`.
- `project/config.ts` → `portfolio/config.ts` — collapse `pagesDir` + `portfolioPagesDir` into one `pagesDir: "./pages"`; drop the project-pages fallback; `componentRoots` = grain + portfolio (drop `./project/components` unless demo comps move under portfolio).
- `project/view/renderer.ts` → `portfolio/render.ts`.
- `project/routes/ai-routes.ts` (+ `.integration.test.ts`) → `portfolio/routes/`.
- `project/tools/{export,audit,screenshots}.ts` → `portfolio/tools/` — update the DIST/route derivation to the merged pages dir.
- `project/vendor/htmx.min.js` → `portfolio/vendor/`.
- `project/e2e/*` → `portfolio/e2e/*` — path-only; specs already drive by URL.
- `project/package.json` scripts → merge into `portfolio/package.json` (or a root workspace script).

### MOVE — the demo domain (powers /grain + /loop showcase; trim the "product" framing)
Keep as `portfolio/demo/` (rename off "item"/"Dept of Time" is optional but nice):
- `data/in-memory-item-repository.ts` + `item-repository.ts`, `domain/item.ts`,
  `services/item-service.ts` + `item-views.ts`, `view/components.ts` (LoopCard).
- `components/molecules/{item-card,loop-card}`, `components/organisms/{item-list,empty-state}`.
- The scripted reasoner wiring stays in `server.ts`; the reasoner itself is grain (`grain/ai/reasoner.ts`).

### KEEP as portfolio pages
- `project/pages/loop.html` → `portfolio/pages/loop.html` — the canonical GRAIN "watch the AI act"
  demo (referenced by `grain-conformance`, `lamp-travel`, `loop` e2e). Stays in the Workspace tab.
- `project/pages/about.html` → `portfolio/pages/about.html` (the site's About/Contact; the status
  bar + rail already link `/about`).

### DROP (product-only; recoverable from git)
- `project/pages/dashboard.html` — the product task dashboard. Drop, or repurpose later as a
  portfolio "workspace" demo. Retire the **Workspace** tab's Overview→/dashboard entry if dropped.
- `project/pages/index.html` — shadowed by the portfolio home.
- `project/components/organisms/app-frame/*` — the product frame; the portfolio uses
  `portfolio-frame`. (`app-frame` still has the window-bar/status parity edits — discard.)

### PRESERVE (deferred product vision — do NOT lose)
- `project/PROJECT-PLAN.md`, `project/docs/MVP.md` → move to `portfolio/… /deferred-product/` or a
  clearly-marked archive; the assistant product resumes "after portfolio." `LICENSE`, `README.md`,
  `CLAUDE.md` for project → keep in git history (the split-plan already licenses project separately).

## Import-rewrite rules
- Within moved files: `../batch/…`, `../grain/…`, `../mill/…` stay (still siblings).
- `../portfolio/content.ts` → `./content.ts`; `./portfolio/components` → `./components`, etc.
- Any doc/string literal path (`"project/server.ts"`, `bun project/server.ts`) → `portfolio/server.ts`.

## Docs + memories to sync (this is most of the work)
- **CLAUDE.md** (root): the composition-root row + "run from repo root" + `bun run dev` target;
  `project/CLAUDE.md` retire/relocate.
- **batch/docs/ARCHITECTURE.md** + **CONVENTIONS.md**: every "project/server.ts is the composition
  root" reference → portfolio.
- **SPLIT-PLAN.md** / **DOCS.md** / **ROADMAP.md**: project's role.
- **AUDIT.md**: paths in the checks.
- Memories: `project-name-temporary`, `licensing-decision`, `bread-stack-umbrella-and-splits`,
  `repo-structure-reorg`, `the-editor-built` (server.ts path), any "composition root" mention.
- **grain persona-neutral check** stays green: the demo domain moving under portfolio is fine (grain
  must not gain product terms).

## Verification gate (same bar as always)
`bun run check` + `bun test` + full `bun run test:e2e` + `bun run shots` (eyeball) + `bun run export`
and **drive the static build** (the /grain client-door demo must still run). Boot the server and
confirm **zero `[accepts]`/`[theming]` drift warnings**. Then AUDIT.md end-to-end.

## Open decisions for the owner (settle before executing)
1. **/loop + /dashboard:** keep /loop as the GRAIN demo (recommended) and drop /dashboard? Or fold
   the demo entirely into /grain and retire both?
2. **Demo domain naming:** keep "items" or rename to something portfolio-native (e.g. the desk's
   own surface)? Rename is cheap during the move, costly later.
3. **Folder name:** keep `portfolio/` in the monorepo, or rename to `tjakoen.github.io/` now?
4. **Product archive:** where do `PROJECT-PLAN.md`/`MVP.md` live — an archive dir in the repo, or
   git history only?

## Bundled GRAIN refactors (do in the same fable pass — owner, 2026-07-05)
These are design-system layering fixes that pair naturally with the consolidation (all cross-cutting,
all "do it once, carefully"). Full detail in ROADMAP Track B.7 / B.8.

- **Move the catalog BATCH → GRAIN** (ROADMAP B.7). It's a design-system feature (browses grain
  components, renders their `.md`, HUMAN/AI grade toggle = grain vocabulary). Clean: `grain/ai/accepts.ts`
  already `fs`-harvests components for the manifest — the catalog does the same harvest. Move
  `batch/catalog/` → `grain/catalog/`; drop its `type Runtime` import (use `fs` like accepts.ts);
  inject the Pages-nav routes as a plain `string[]` instead of batch's `sitemap`; rewire the
  composition-root import. BATCH charter drops "the component catalog"; GRAIN's "self-documenting
  catalog" becomes literally true. Resolves the grade-toggle leak by construction.
- **Themes as reference files** (ROADMAP B.8). Split the inline flavor blocks out of
  `grain/styles/variables.css` into `grain/styles/themes/{baguette,brioche}.css` + an annotated
  `themes/_template.css`; keep the axis machinery + `:root` slots + dark block in variables.css.
  Load via the style bundle. Update DESIGN-SYSTEM §2 to point at the template.

## Sequencing
1. Current parallel thread lands (it's in `project/`-adjacent territory).
2. New **fable** session runs THIS plan as one atomic branch: move → rewrite → drop → the bundled
   grain refactors (catalog → grain, theme files) → doc-sync → verify → commit in logical chunks.
3. Then the "delete project" is real (the folder is empty of anything live).
