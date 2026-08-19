# OPERATING-NOTES.md — working notes + showing the UI

The depth behind `CLAUDE.md`. Split out so the front door stays a one-minute read.

## Seeing the UI (headless / remote)

There's no display in a remote/headless session, so to *show the user* what the UI looks
like: run `bun run shots` (Playwright drives chromium against a freshly-booted app and
captures the key screens **and states** — the desk mid-act with the spotlight, the ⌘K
palette — to `screenshots/`, plus a self-contained `screenshots/gallery.html`). Then
**publish `screenshots/gallery.html` as an Artifact** and give the user the link — that's
the channel they can view remotely. Add/adjust shots in `tjakoen.github.io/tools/screenshots.ts`.
Use this whenever the user asks to "see" something or you've changed anything visual.

## Working notes

- **Pre-flight: read [`ROADMAP.md`](../ROADMAP.md) before starting substantive work** — the
  canonical execution plan (per-layer tracks, the M★ live-model milestone, the honest-pitch bar);
  it says what's in flight so parallel sessions don't drift.
- Commit/push only when asked; branch off `main` if you must (this repo is public, and it is a map
  rather than a monorepo; the user often merges to `main` directly).
- **The split is complete, then partly re-consolidated (2026-07-19), then de-submoduled
  (2026-07-23).** `batch` is its own repo. `grain` is a **monorepo** holding
  `packages/{grain,mill,proof,crumb,grain-mcp}` — mill + proof are no longer separate repos (their standalone
  repos are archived), and grain/mill/proof/crumb/batch are published to the **public npm registry**
  as `@tjakoen/{batch,grain,mill,proof,crumb}` (moved off GitHub Packages 2026-07-30 — its registry
  demanded a `read:packages` token even for public packages, so every newcomer had to mint a PAT
  before installing; npmjs needs nothing). Consumers pin the published versions, not github SHAs, and
  carry **no committed `.npmrc`** — a scope mapping there would reinstate the token requirement.
  `bread` no longer holds `batch`/`grain` as submodules — it's a pure map/manifesto repo that links
  out.
  The original split map is [`SPLIT-PLAN.md`](history/SPLIT-PLAN.md) (historical).
- **Personal cross-repo standards** (writing voice, the note/blog template, README badges, a starter
  `CLAUDE.md`) are homed in the portfolio at `tjakoen.github.io/standards/`, published at
  <https://tjakoen.github.io/standards> — referenced, never forked. Writing
  anything under his byline? [VOICE](https://tjakoen.github.io/standards/voice) (how it reads) +
  [NOTE-STANDARD](https://tjakoen.github.io/standards/note-standard) (how a note is built) are the rulebook.
- Run from the repo root (relative paths in `tjakoen.github.io/config.ts` assume it).
- Bun lives at `~/.bun/bin` — `export PATH="$HOME/.bun/bin:$PATH"` if `bun` isn't found.
