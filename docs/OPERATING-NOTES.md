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

## Running the gates in containers

The gates run in a Linux container, never against whatever happens to be installed on the host. The
composition is [`compose.yml`](../compose.yml) in this repo, which reaches sideways into the sibling
checkouts, so it assumes the estate layout: bread beside grain, batch, pantry and the portfolio.

```sh
MSYS_NO_PATHCONV=1 docker compose --profile gates run --rm gates-pantry
MSYS_NO_PATHCONV=1 docker compose up -d portfolio   # http://localhost:3001
MSYS_NO_PATHCONV=1 docker compose up -d pantry      # http://localhost:4400
```

Each gate installs from the frozen lockfile, then runs the typecheck, the tests and the linter, so a
gate can never pass against a dependency tree nobody committed. Gates sit behind a profile because
they are one-shot commands that must exit, and a gate that starts itself is one nobody asked for.

The baselines, measured 2026-09-15, so a lower number reads as a regression rather than a local
quirk:

| Repository | Result |
| --- | --- |
| pantry | 669 pass, 0 fail |
| portfolio | 618 pass, 0 fail |
| grain | 691 pass, 0 fail |
| batch | 60 pass, 0 fail |

**Why not a host run.** Windows cannot create a symlink without Developer Mode, and the test fixtures
build one. On the host, `pantry/doctor.test.ts` was 1 pass and 104 fail, every failure an `EPERM`
raised before an assertion ran. The same suite in a container is 105 pass, 0 fail. A red suite on the
host here tells you nothing about the code, which is the worst shape a signal can take.

**`MSYS_NO_PATHCONV=1` is not optional from Git Bash.** Without it MSYS rewrites a container path
such as `-w /app` into a Windows path and the run dies before it starts.

**Dependencies live in named Docker volumes, not on the host.** A Linux-built binary can therefore
never collide with a host-side `bun` run. The trade is that an editor on the host resolves no imports
for these repositories; run `bun install` there too if you want that, and the two stay independent.

**grain builds its own image.** Its mermaid diagram test drives a real browser, so it uses
[`docker/bun-playwright.Dockerfile`](../docker/bun-playwright.Dockerfile) rather than the stock bun
image. That file's tag must match the Playwright version grain resolves, because the browser build is
keyed to the driver; Playwright prints the exact tag it wants when they drift.

**Line endings matter here.** `core.autocrlf` must not be left on. With it on, every clone lands with
CRLF terminators while the repositories store LF, which silently failed three of grain's parity
tests: their regexes anchor on a newline and cannot match a carriage return, so they reported a
function as missing that was present and unchanged. None of the repositories carries a
`.gitattributes`, so this is currently a property of the machine rather than of the code.
