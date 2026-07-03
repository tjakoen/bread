# SPLIT-PLAN.md — how this monorepo becomes many repos

> **This repo is temporary scaffolding.** `batch-stack` is a monorepo *for now* only because it's
> convenient to build the whole stack in one place while it's young. Each layer is designed to become
> its **own repo** once it's proven. This file is the map for that day — what splits out, what goes
> with it, and why the split is meant to be mechanical, not a rewrite.

## Why a monorepo now, separate repos later

The dependency direction is strict and one-way — each layer builds only on the layers below it:

```
batch  →  grain  →  { project · mill · portfolio }
```

The boundaries are already kept clean *on purpose* (relative imports, one composition root, no
cross-layer reaching — `grain` touches `batch` only through the `OpChannel` port). That discipline is
the whole point: when the time comes, each layer lifts out into its own repo with its dependencies
pointing *down* and nothing pointing back up. Building together now just keeps iteration fast while
the contracts are still moving.

## Target repos, and what travels with each

Docs are **already co-located** with their layer (each layer has its own `docs/`), so the split is
now a straight `git filter-repo` per folder — no doc-shuffling needed.

| Future repo | Folder that becomes the repo | Docs (already in place) |
|---|---|---|
| **batch** — the no-build substrate | `batch/` | `batch/docs/ARCHITECTURE.md` (SSOT), `batch/docs/CONVENTIONS.md` (build standard) |
| **grain** — the AI-interaction design system | `grain/` | `grain/docs/GRAIN.md`, `grain/docs/AI-INTERFACE.md`, `grain/docs/DESIGN-SYSTEM.md` |
| **project** *(name TBD)* — the assistant product | `project/` | `project/PROJECT-PLAN.md`, `project/docs/MVP.md` |
| **mill** — the Markdown→GRAIN CMS | `mill/` | `mill/PLAN.md`, `mill/README.md` |
| **portfolio** — the personal site | `portfolio/` (incl. `notes/`, `pages/`, `standards/`) | its own `README` / `PLAN` |

**Shared, doesn't belong to one repo:**
- **`portfolio/PHILOSOPHY.md`** — the "why" beneath the whole stack. Now lives in `portfolio/` (the
  public/narrative home; the whitepaper is its projection). Stays there or lands at the front-door
  repo, and is *projected* (linked, not forked) from the others. One source of truth, always.
- **`AUDIT.md`** (repo root) — the whole-stack alignment runbook (audits layering purity across all
  layers). Goes with `batch` (which defines the layering rules) at split time, or stays a top-level tool.
- **`DOCS.md`** (repo root) — the map of where every doc lives (a monorepo-only convenience; retired
  once the repos split).
- **`portfolio/standards/` (`VOICE.md`, `README-STANDARD.md`, `CLAUDE.starter.md`)** — personal, cross-repo
  standards. They're published on the portfolio (public) so every other repo can *reference* them by
  URL, and new repos copy in `CLAUDE.starter.md`. Long-term these may graduate to a personal
  dotfiles / `~/.claude` home so they're not tied to any product repo.

## What each new repo gets at birth

Per `portfolio/standards/CLAUDE.starter.md`:
1. Its own `CLAUDE.md` (from the starter) + a `README.md` with a **title emoji**, a curated **badge
   row**, and the **"built with Claude" footer**.
2. Only `README.md` + `CLAUDE.md` at the root; everything else under `docs/`.
3. Dependencies on lower layers become real package deps (or git submodules) instead of relative
   imports. `project/server.ts` — today the single composition root where batch+grain+project meet —
   becomes the product repo's entry, consuming the others as dependencies.

## Licensing (decided 2026-07-03)

Licenses are **already co-located** with each layer (like the docs), so they travel automatically
on the `git filter-repo` split. Each file lives at its future repo root.

| Future repo | License | Files in place |
|---|---|---|
| **batch**, **grain**, **mill** | **Apache-2.0** — permissive, with an explicit patent grant; the fit for frameworks published *for adoption* | `LICENSE` (verbatim Apache-2.0) + `NOTICE` (© 2026 Tjakoen Stolk) |
| **portfolio** | **Split**: code under Apache-2.0; **written content all rights reserved** | `LICENSE` (Apache-2.0, code only) + `NOTICE` (spells out the code/prose boundary — `notes/`, whitepaper, `PHILOSOPHY.md` etc. are © reserved) |
| **project** *(ex-"Department of Time")* | **Proprietary — all rights reserved. Not published.** Stays a private repo | `LICENSE` (proprietary notice) |

The product may **publicly credit and feature** BATCH/GRAIN/MILL — consuming Apache-2.0 frameworks
imposes nothing on the product's own source, and keeping the product closed imposes nothing on the
frameworks' open terms.

**Placeholder `package.json` per layer (added 2026-07-03, not yet consumed):** each layer now carries
its own `package.json` staged for the split — `@tjakoen/batch|grain|mill` (`Apache-2.0`), `portfolio`
(`Apache-2.0`, `private`), `project` (`UNLICENSED` + `private`). They're inert today (the root
`package.json` + relative imports still drive everything; each carries a `"//"` note saying so) and
exist so the `filter-repo` split yields a ready repo. **READMEs carry a badge row** (identity
`Made with Claude` + a *static* license badge linking to the local `LICENSE`/`NOTICE`). The license
badges are static-by-design: the dynamic `github/license/<user>/<repo>` badge needs a *published*
repo, so switch to it at publish time. A full curated badge row + footer + title emoji per
`standards/README-STANDARD.md` is still a separate pass.

## Cross-repo references

Links that currently cross layers (e.g. a grain doc pointing at `docs/ARCHITECTURE.md`) become links
to the *other repo* (or its published docs). The rule stays the same as today: **docs are the single
source; pages and sibling repos link to them, never fork them.**

## When

When a layer is "proven" — stable contracts, real tests, used by something above it without churn.
No fixed date; this is the checklist for the day it happens, not a deadline. Until then, keep the
boundaries clean so this stays a `git filter-repo` / move operation, not an untangling.
