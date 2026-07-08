# SPLIT-GATE-FIXES.md — pre-public gate remediation

Fix list from the pre-public split audit (2026-07-08). Severity-ranked. Split into **[AUTO]**
(being executed now by the audit thread via subagents) and **[OWNER]** (needs a human decision or
private data — left for you / the owner). Nothing here is committed; all edits are working-tree only.

## Session status — 2026-07-08 (all [AUTO] DONE, gate green)

**Executed + verified this session** (working-tree only, NOT committed — a concurrent live session
owns `standards/{AI-DEVELOPMENT,SESSION-LOOP}.md` + `plans/`, so staging is unsafe):
- L1 ✅ 6 license files (proof/, pantry/, root LICENSE+NOTICE) — Apache byte-identical to batch.
- L2 ✅ "Robert" name neutralized.
- S1 ✅ `/batch` e2e — stale baseline (commit 3d9f31c IA reorg), regenerated + passes.
- S2 ✅ status re-sync — llms.ts + /proof + /pantry pages + mill badge→live + topbar example.
- S3 ✅ proof/README.md + pantry/README.md created; emoji+footer on batch/grain/mill.
- **Gate: tsc clean, 255 unit/integration pass, 83/83 e2e pass.**

**Still open = the [OWNER] items below** (L1-pantry-license-ratify, L3, S4, S5, S6). Nothing else.

---


Guardrail respected throughout: `standards/{AI-DEVELOPMENT,SESSION-LOOP}.md` and `plans/` were NOT
touched (that live session owns them).

---

## 🔴 BLOCKERS — no repo goes public until these clear

### L1. Missing LICENSE/NOTICE files  **[AUTO — in flight]**
SPLIT-PLAN licensing table requires Apache-2.0 + NOTICE (© 2026 Tjakoen Stolk) on every framework
layer + the umbrella. Missing on: `proof/`, `pantry/`, and the repo root (BREAD umbrella).
- Being created: `proof/LICENSE`+`NOTICE`, `pantry/LICENSE`+`NOTICE`, root `LICENSE`+`NOTICE`,
  Apache text copied byte-for-byte from `batch/LICENSE`.
- **[OWNER] ratify pantry's license:** defaulted to Apache-2.0 (matches the framework layers; pantry
  is the installable composer app). Pantry is **absent from the SPLIT-PLAN licensing table entirely**
  ([SPLIT-PLAN.md:217-221](SPLIT-PLAN.md#L217)) — add its row and confirm the choice.

### L2. Private third-party name in a public file  **[AUTO — DONE]**
- `tjakoen.github.io/CONTENT-BACKLOG.md:91` named "PH Live CEO Robert" — violates the repo's own
  no-names guardrail (lines 9-10, 68). ✅ Neutralized to a consent-gated placeholder.

### L3. Umbrella git-history exposure  **[OWNER — destructive, split-day]**
Renaming `batch-stack` → BREAD as-is publishes the **entire monorepo history**, which includes:
- Deleted `project/` product code + `project/docs/MVP.md` / `PROJECT-PLAN.md` (licensed
  "proprietary, not published").
- Every pre-neutralization revision of career-sensitive content (incl. the "Robert" line above,
  which git remembers even after the working-tree fix).
- **42 of 201 commits carry `Co-Authored-By: Claude ...` trailers** — forbidden by repo policy
  (memory `no-claude-commit-attribution`).

Decision + action needed (choose one, then execute at split time):
- (a) `git filter-repo` the umbrella: drop `project/`, strip the Co-Authored-By trailers (message
  callback), optionally squash/scrub the pre-neutralization doc history; **or**
- (b) start the public BREAD repo from a fresh initial commit (no history carried).

Note the knock-on for L3 → see O3 (the ten-times-zero receipt leans on "every commit co-authored").

---

## 🟡 SHOULD-FIX — before or immediately after publish

### S1. e2e red — `/batch` visual baseline  **[AUTO — in flight, diagnosing]**
`tjakoen.github.io/e2e/visual.e2e.ts:45` fails (82/83 pass; tsc + 255 unit/integration green).
Subagent is determining stale-baseline vs real regression; will re-baseline only if benign,
otherwise report the regression for the main thread. Gate must be fully green before split.

### S2. Stale status copy (understates shipped work)  **[AUTO — in flight]**
Misleads readers + AI crawlers (CLAUDE.md sync-table row for `/llms.txt`).
- `tjakoen.github.io/llms.ts:28` PROOF "live board is next" → live SSE board is shipped.
- `tjakoen.github.io/llms.ts:29` PANTRY "v1 … reference/catalog next" → v2 shipped /reference,
  /catalog, /standards.
- `/proof` + `/pantry` landing pages repeat the same stale lines.
- `mill/README.md` `status: in_progress` badge while MILL is billed LIVE everywhere.
- `grain/components/organisms/topbar/topbar.md:25` literal "TJ's Desk" example → neutral placeholder.

### S3. README standard conformance  **[AUTO — in flight]**
- `proof/` and `pantry/` have **no README** — each is a public repo front page. Being created per
  `standards/README-STANDARD.md` (title emoji + badge row + footer), claims kept true to each PLAN.
- `batch/grain/mill` READMEs missing title emoji + text footer — being added.

### S4. Cross-repo `../` links break after the split  **[OWNER — split-day mechanical]**
These resolve fine in the monorepo *today* — do NOT rewrite now (would break the monorepo). Rewrite
to published URLs / package-resolved paths at `git filter-repo` time. Inventory:
- batch: `README.md:11,14`, `CLAUDE.md:20,26`, `docs/CONSUME-AS-GIT-DEPS.md:6,25,27,31`
- grain: `README.md:11,15`, `CLAUDE.md:21-32`, `PLAN.md:8`
- mill: `README.md:30,35,36`, `CLAUDE.md:26-27`, `PLAN.md:10,228`
- proof: `PLAN.md:9,10,14` · pantry: `PLAN.md:15`
Add this as an explicit split-day checklist item in SPLIT-PLAN.

### S5. Portfolio content not publish-ready  **[OWNER — content/data]**
- `tjakoen.github.io/pages/about.html:33-34` — LinkedIn link is `linkedin.com/in/REPLACE-ME` +
  TODO. Front-door page. **Needs the real handle** (or remove the link).
- **All 9 notes are `status: DRAFT`** yet listed in sitemap.xml + llms.txt, and `ten-times-zero` is
  the badge/footer link target of **every** repo README. Decide the publish set, flip statuses.
  Until the portfolio deploys, every framework README badge links to a 404.
- `tjakoen.github.io/notes/ten-times-zero.md:191-207` — receipts snapshot is 2026-07-03 (33 commits;
  repo now ~201). Its own comment says refresh before publishing: recompute counts + update the SVG
  bar widths/labels + aria-labels + the pull-quote. **Scope decision**: whole stack vs. portfolio app
  only (the comment flags this open question).

### S6. `/loop` scripted-reasoner disclosure  **[OWNER — voice call]**
`/loop` never states its reasoner is **scripted**, so a reader can assume a live model drives it
(M★ is unbuilt). Honest-pitch bar wants this explicit. Recommended: one line near the demo, e.g.
*"The reasoner here is a scripted demo; a live model wiring is the M★ milestone."* Owner should word
it to voice.

---

## 🟢 NICE
- `mill/README.md:6` status badge (folded into S2).
- Whitepaper em-dashes are citation titles only — no action.

---

## What passed clean (no action)
- **Secrets: CLEAN** — working tree + all 201 commits + sensitive filenames. No keys/tokens/.env/
  creds/private hosts. Single correct git author.
- **Client-safe boundary** holds (`batch/http/modules.ts` guard proven in tests; no external URLs in
  `grain/scripts/*.js`).
- AUDIT checks 2 (layering), 3 (drift guards — boot clean), 4 (tokens), 5 (persona, one doc nit in
  S2), 6 (naming — "Career Team" consistent), 9 (generated output gitignored), 10 (memory),
  11 (capabilities lists), 12 (dead knobs): all ✅.
- Honest-pitch bar holds: whitepaper scopes "existence proof" to architecture until M★; "one write
  path" matches code post-A.2; no unbacked "fast" adjectives on landing pages.

## Owner decision checklist (the gating ones)
1. L1 — confirm pantry = Apache-2.0 + add SPLIT-PLAN row.
2. L3 — umbrella history: filter-repo (drop project/ + strip trailers) **or** fresh init.
3. S5 — LinkedIn handle; which notes publish (flip DRAFT); ten-times-zero receipts refresh + scope.
4. O3/L3 tension — if trailers get stripped, reword ten-times-zero.md:253 ("every commit
   co-authored") so the receipt survives.
5. S6 — `/loop` scripted disclosure wording.
