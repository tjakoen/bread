# SPLIT-PLAN.md — how this monorepo becomes the **BREAD stack**

> **This repo becomes `BREAD` — a permanent umbrella, not disposable scaffolding.** Today
> `batch-stack` is a monorepo because it's convenient to build the whole stack in one place while it's
> young. On the split it doesn't dissolve — it *becomes* the **BREAD** umbrella: a thin public repo that
> holds the three framework layers as **git submodules** plus the shared cross-cutting docs. The two
> consumers (the product and the personal site) leave entirely, into their own repos. This file is the
> map for that day — what splits where, how the pieces import each other, and the naming.

## The name: BREAD 🍞

The stack is **BREAD** — a one-word name in the `LAMP` / `MEAN` / `MERN` lineage, so it reads instantly
as "a web stack." It also closes the baking metaphor the layers already use:

```
BATCH (dough / substrate)  →  milled by MILL from  GRAIN (the design system)
        →  baked in the  BREAD stack  →  served as a theme:  Sourdough (default), Rye, Brioche…
```

- **BREAD** — the umbrella / the stack (this repo, renamed from `batch-stack`).
- **BATCH · GRAIN · MILL** — the three framework layers (submodules).
- **Sourdough** — GRAIN's **default theme** (renamed from "Bread", which is now the *stack* name).
  Themes are named as **bread varieties**, a scalable system. **GRAIN will ship 3 default themes:**
  **Sourdough** (warm monochrome e-ink, the default), a **clean/Notion** theme (crisp white-light /
  black-dark), and a **third** (names for #2 and #3 TBD — see the theme proposal). Themes are token
  re-skins, so `grade-as-signal` survives every theme × light/dark. **Accent color = full support,
  one signature hue** (decided; being wired in a parallel thread): a single `--color-accent` slot
  reaches links, focus, `::selection`, and the primary button fill — one brand knob, palette
  otherwise closed (success/danger stay monochrome). **Sourdough stays hueless** (`--color-accent =
  ink`). Needs a one-time component wiring; after that, accented themes are pure token overrides.
  Detailed theming/accent plan: `tjakoen.github.io/PLAN.md`.
- *(`Bakery` was the runner-up umbrella name; `BREAD` won for the `___ stack` fit.)*

**Positioning / tagline** (the umbrella's description doubles as the stack's pitch):

> **BREAD — *one vocabulary, two operators.*** A no-build, AI-native web stack:
> **batch** (substrate) · **grain** (design system) · **mill** (CMS).

"Vibecoding" is **not** the flag — it lives one layer down as a discovery/SEO hook (repo topics, meta
tags, body copy), so the serious framing leads and the hot term still does its traffic job.

## Target topology

```
BREAD/                      ← umbrella (public repo, was batch-stack)
├─ batch/                   ← submodule → its own public repo
├─ grain/                   ← submodule → its own public repo
├─ mill/                    ← submodule → its own public repo
└─ (root, stays here)       PHILOSOPHY · ARCHITECTURE/CONVENTIONS map · ROADMAP · AUDIT · standards/ · DOCS.md

tjakoen.github.io/          ← portfolio, its own PUBLIC repo (the personal site / front door)
project/                    ← its own PRIVATE repo (the product; not a submodule)
```

Dependency direction stays strict and one-way — each layer builds only on the layers below it:

```
batch  →  grain  →  mill        (and grain touches batch only through the OpChannel port)
             ↘        ↘
              consumed by → project (private) · portfolio = tjakoen.github.io (public)
```

The boundaries are already kept clean on purpose (relative imports today, one composition root, no
cross-layer reaching). That discipline is what makes the split a mechanical `git filter-repo` per
folder, not a rewrite — and after the split the **package dependency graph enforces the layering for
you** (grain's `package.json` simply doesn't depend on `@tjakoen/batch`, so a stray import fails to
resolve).

## What splits where, and what travels with each

Docs and licenses are **already co-located** with their layer, so each is a straight `git filter-repo`.

| Becomes | From folder | Kind | Docs (already in place) |
|---|---|---|---|
| **BREAD** (umbrella) | this repo's root | public | `PHILOSOPHY.md`, `ROADMAP.md`, `AUDIT.md`, `DOCS.md`, `standards/` |
| **batch** — no-build substrate | `batch/` | public submodule | `batch/docs/ARCHITECTURE.md` (SSOT), `batch/docs/CONVENTIONS.md` |
| **grain** — AI-interaction design system | `grain/` | public submodule | `grain/docs/GRAIN.md`, `AI-INTERFACE.md`, `DESIGN-SYSTEM.md` |
| **mill** — Markdown→GRAIN CMS | `mill/` | public submodule | `mill/PLAN.md`, `mill/README.md` |
| **portfolio** → `tjakoen.github.io` | `tjakoen.github.io/` | own public repo | its own `README` / `PLAN` |
| **project** *(name TBD)* — the assistant product | `project/` | own **private** repo | `project/PROJECT-PLAN.md`, `project/docs/MVP.md` |

**MILL is framed as GRAIN's companion CMS** (grain keeps the single web landing page; MILL is a section
on it, not its own front door) — but it **stays architecturally a layer *above* both** (`batch → grain →
mill`), depending on both, never the reverse. The framing is marketing; the layering is unchanged. That
MILL exists is still the proof BATCH + GRAIN compose into a real, reusable tool.

**Shared, lives at the BREAD root (doesn't belong to one layer):** `PHILOSOPHY.md` (the "why", projected
— linked, not forked — from the layers), `AUDIT.md` (whole-stack alignment runbook), `DOCS.md` (doc map),
`standards/` (`VOICE.md`, `README-STANDARD.md`, `CLAUDE.starter.md` — cross-repo personal standards).

## How the consumers import the stack (the no-build win)

Bun runs TypeScript **directly** — no bundle step — so a cross-repo import resolves to the dependency's
`.ts` source and is transpiled on the fly, exactly like a relative import today. **Splitting changes
where the source lives, not how it runs.**

- **Server-side code (TS):** each consumer gets its own composition root (today's `tjakoen.github.io/server.ts`
  role, one per consumer) that imports `@tjakoen/batch` / `@tjakoen/grain` (portfolio also `@tjakoen/mill`)
  and wires them. Consume via **Bun git dependencies** — `"@tjakoen/grain": "github:tjakoen/grain#main"`.
  No `npm publish`, works for private repos, and `bun.lockb` pins the resolved commit for reproducibility.
- **Assets (CSS / HTML templates / client JS):** not imported — *served*. The consumer's BATCH server
  mounts them from the installed package dir (resolved via `import.meta.resolve`); the transpile-on-request
  module server (`batch/http/modules.ts`) already serves TS to the browser this way. **One real task:**
  each layer's `package.json` needs an `exports`/`files` map exposing its `styles/`, `components/`,
  client-script, **and `docs/`** dirs. **Staged ahead of time** — the `exports`/`files` maps already sit
  in `grain/package.json` and `batch/package.json` (inert until git-dep consumption). See the next
  section for why `docs/` is on that list.
- **Day-to-day workflow (solo dev):** consumers point at `#main` and run **`bun update` every run**
  (bake it into the dev/deploy script: `"dev": "bun update @tjakoen/grain @tjakoen/batch && bun run
  server.ts"`) — always latest, zero version bookkeeping. Reproducibility comes from the lockfile.
- **When editing the framework itself:** use **`bun link`** (symlink the local checkout into the
  consumer) for live edits — same feel as the monorepo. `link` and `bun update` don't coexist (an update
  drops the symlink), so don't `bun update` while linked. Add a `bun run bootstrap` per consumer to
  (re)establish links after a fresh clone.
- **Versioning:** none needed for private use beyond the lockfile. Once contracts stabilize, start
  lightweight **git tags** (`git tag vX.Y.Z`) so upgrades are deliberate — that's the entire "release"
  ceremony (no npm, no GitHub Releases, no artifacts).

The one seam vs. a monorepo: **atomic cross-repo commits/version-sync**. A change spanning framework +
consumer is two commits in two repos; the mismatch risk lives at the *pinned-version boundary*, not in
the live (linked) dev loop. Habit: commit the framework, then `bun update` the consumer to catch up.

## Layer docs travel inside the package (no copy, no submodule)

The portfolio renders two layers' docs on their showcase pages — grain's `docs/GRAIN.md` +
`AI-INTERFACE.md` at **`/grain/docs`**, and batch's `docs/ARCHITECTURE.md` + `CONVENTIONS.md` at
**`/batch/docs`** (that's the full set; `mill` has no docs page, `project` is private). Those `.md` files
live in the grain/batch **repos**, but the portfolio is a **separate repo** (`tjakoen.github.io`) — so the
worry is "how does a detached repo keep an always-fresh copy of another repo's docs?"

**Answer: it doesn't keep a copy at all.** The docs are already co-located with their layer, and the
portfolio already installs that layer as a **Bun git dependency**. So the `docs/` folder ships *inside the
installed package* (that's the only reason `docs/` is in each layer's `exports`/`files` map above). MILL's
content collection resolves them straight from the package — `import.meta.resolve('@tjakoen/grain/docs')` /
`@tjakoen/batch/docs` — exactly the mechanism already used to serve each layer's CSS and components.

- **Same code, both eras.** In the monorepo, `import.meta.resolve('@tjakoen/grain/docs')` resolves to the
  sibling `grain/docs/` folder; post-split it resolves into the git-dep checkout. The MILL wiring never
  changes across the split. **Wire it this way from the start (MILL piece 4) — never against a literal
  `../grain/docs` relative path**, which would break on the split and reintroduce the copy problem.
- **Always synced, zero drift.** `bun update` (already baked into the dev/deploy script) pulls the docs
  fresh from `#main` on every run. The lockfile pins the exact commit for reproducibility. No files are
  duplicated into the portfolio repo, no `git submodule update --remote`, no `git subtree pull`.
- **Why not a submodule / subtree?** A submodule pins a commit (not "always synced" without an extra
  `update --remote` step) and re-expresses a dependency the git-dep already models. A subtree literally
  copies the docs into the portfolio's history — the exact copy-drift problem this avoids. Both are
  strictly more machinery than the package dep, for no gain here.

### What to change at split time (this track)

Almost nothing — the design is already split-safe. At the split:

1. **Verify the `exports`/`files` maps** in `grain/package.json` + `batch/package.json` still list
   `./docs/*` (staged now; see the import section above). Nothing to add unless a new doc dir appears.
2. **Add each layer's git-dep** to the portfolio's `package.json`
   (`"@tjakoen/grain": "github:tjakoen/grain#main"`, same for `batch`) and bake `bun update` into its
   dev/deploy script (the shared workflow above).
3. **Confirm MILL's `/grain/docs` + `/batch/docs` collections resolve via `import.meta.resolve`**, not a
   relative sibling path. If they were (wrongly) wired to `../grain/docs` during monorepo development,
   flip them to the package specifier — this is the one line that would otherwise break.
4. **GitHub Pages build:** the Action runs `bun install` (pulls the docs with the deps) → `bun run
   export` → deploy, so the exported doc pages are current at every build. No extra fetch step.

That's the whole migration for docs: it rides the same git-dep + `bun update` path as every other
cross-layer asset.

## The static front door (`tjakoen.github.io`)

GitHub Pages serves static files only, so the personal site is built by **`bun run export`** — a static
projection of the running server (ARCHITECTURE §18): landing page, GRAIN showcase content, rendered docs.
Operable `/intent` + SSE surfaces (the live "watch the AI act" demo, `/loop`) are **not** exportable;
they ship as their exported/recorded projection (the `bun run shots` gallery) for now. The genuinely-live
grain demo on static hosting is a later upgrade via the **client-side door** (the client-runtime work —
runs the scripted demo entirely in the browser, no server) or a small live host linked from the site.

## What each new repo gets at birth

Per `standards/CLAUDE.starter.md`:
1. Its own `CLAUDE.md` (from the starter) + a `README.md` with a title emoji, a curated badge row, and
   the "built with Claude" footer.
2. Only `README.md` + `CLAUDE.md` at the root; everything else under `docs/`.
3. Dependencies on lower layers become real package deps (git deps, above) instead of relative imports.

## Licensing (decided 2026-07-03 — unchanged by the umbrella model)

Licenses are already co-located, so they travel on the `git filter-repo` split.

| Repo | License | Files in place |
|---|---|---|
| **BREAD** (umbrella), **batch**, **grain**, **mill** | **Apache-2.0** — permissive, patent grant; the fit for frameworks published for adoption | `LICENSE` (Apache-2.0) + `NOTICE` (© 2026 Tjakoen Stolk) |
| **portfolio** (`tjakoen.github.io`) | **Split**: code Apache-2.0; **written content all rights reserved** | `LICENSE` (Apache-2.0, code only) + `NOTICE` (code/prose boundary) |
| **project** *(ex-"Department of Time")* | **Proprietary — all rights reserved. Not published.** Private repo | `LICENSE` (proprietary notice) |

The product may publicly credit and feature BATCH/GRAIN/MILL — consuming Apache-2.0 frameworks imposes
nothing on the product's own source, and keeping the product closed imposes nothing on the frameworks.

Placeholder `package.json` per layer (`@tjakoen/batch|grain|mill`, Apache-2.0; `portfolio` private;
`project` UNLICENSED + private) are staged for exactly the git-dep consumption above. They're inert
today (the root `package.json` + relative imports still drive everything).

## Open follow-ups (queued, not yet executed)

- **Theme rename Bread → Sourdough** across GRAIN (`variables.css`, `DESIGN-SYSTEM.md`, `GRAIN.md`,
  `grain/README.md`, `b-text.ai.md`, and every "Bread"-theme ref) + adopt themes-as-bread-varieties.
- **Umbrella rename** `batch-stack` → `BREAD` (repo/dir name, root `README.md`, this file's home,
  `CLAUDE.md` framing) — do at split time or as a naming pass.
- **`exports`/`files` maps** per layer `package.json` (the one real import-plumbing task above).
- **`bun run bootstrap`** (link setup) + the `bun update`-prefixed dev/deploy scripts per consumer.
- Curated badge row + footer + title emoji per `standards/README-STANDARD.md` per repo.
- Open elsewhere: BATCH's `A=` meaning (see `batch-rename-open-question`); the product's real name.

## Cross-repo references

Links that currently cross layers become links to the other repo (or its published docs). The rule
holds: **docs are the single source; pages and sibling repos link to them, never fork them.**

## When

When a layer is "proven" — stable contracts, real tests, used by something above it without churn. No
fixed date; this is the checklist for the day, not a deadline. Until then, keep the boundaries clean so
this stays a `git filter-repo` / move operation, not an untangling.
