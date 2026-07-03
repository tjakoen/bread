# AUDIT.md — the alignment audit runbook

A repeatable, whole-project audit that checks the repo still obeys **its own rules**. Run it before a
commit, after a big change, or whenever you (human or AI) want to confirm nothing has drifted from the
canon: **[CLAUDE.md](CLAUDE.md)** (operating rules + the "change X → update Y" table),
**[CONVENTIONS.md](batch/docs/CONVENTIONS.md)** (build standard), **[ARCHITECTURE.md](batch/docs/ARCHITECTURE.md)** (the
substrate), **[PHILOSOPHY.md](portfolio/PHILOSOPHY.md)** (the why). Those docs *define* "aligned"; this file is the
procedure for verifying it. It references them — it does not restate them (single source of truth).

## How to run it
1. **Read the canon first** (the four docs above). If a check here and a canon doc disagree, the canon wins — fix this file.
2. Work top to bottom. Each check has a **command** and a **pass bar**.
3. **Report findings** grouped by check — file:line, what's wrong, fix-or-flag. Never silently truncate.
4. **Done =** all green + every finding fixed or explicitly flagged (with a memory if it's a decision).

## The checks

### 1. Green gate (must pass)
```bash
bun run check        # tsc --noEmit → zero errors
bun test             # unit + integration → green
bun run test:e2e     # Playwright e2e → green   (or: bun run test:all)
```

### 2. Layering purity — CONVENTIONS §1
```bash
grep -rn "import" batch --include=*.ts | grep -iE "grain|/project"   # batch imports NOTHING inward → expect none
grep -rn "import" grain --include=*.ts | grep -i "batch"             # grain imports NOTHING from batch (only its OpChannel port) → expect none
```
Only `project/server.ts` wires the layers. New design-system work lives in `grain/` by default; `mill/`/`portfolio/` sit above grain (`batch → grain → mill`), consume, never reverse.

### 3. One vocabulary / no magic strings / SSOT — CONVENTIONS §3, AI-INTERFACE §1
- **No magic strings.** Any string referenced twice is a vocabulary → defined once (TS `const`/registry, or a single named-const block in a browser module). Verbs/surfaces come from `grain/ai/contract.ts`, referenced in TS; theming attrs/values/control-names come from the const block in `grain/scripts/theme.js`. The manifest is harvested, never hand-typed.
- **Cross-layer literals** (HTML attrs, CSS selectors, browser JS) are the only exception — single-sourced on the JS side **and drift-guarded at server startup**: the action vocabulary (`data-action`/`data-accepts` vs `ACTIONS`) and the theming vocabulary (theme flavors in markup vs `[data-theme="…"]` blocks in `variables.css`). Boot the app and confirm **zero `[accepts]`/`[theming]` drift warnings**.
- Smell-grep for re-typed literals: `rg -n 'data-(action|accepts|theme|color-scheme)="' ` and eyeball that JS/TS references go through a const, not a raw string.

### 4. Tokens only — CONVENTIONS §5
```bash
grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" grain/components project/components --include=*.css   # expect none — colors live in grain/styles/variables.css
```

### 5. Persona-neutral GRAIN — memory `grain-persona-neutral-and-audit`
```bash
grep -rn "the desk" batch grain --include=*.ts --include=*.css --include=*.html --include=*.md   # expect none
```
GRAIN is product-agnostic: "the desk" is the **product** persona and belongs only to `project/` + `portfolio/`. Sole allowed exception in grain: the `desk.stop` action name (rename deferred). `desktop` is a false positive.

### 6. Naming — memories `project-name-temporary`, `batch-rename-open-question`, org rule
- Product = **"Project"** (temporary) in docs; the old name lingers only in product UI (`project/pages/*`, `portfolio/pages`) pending a product-rename pass.
- GRAIN's default theme = **"Sourdough"** 🍞. BATCH = **B**un · **A**ddressable · **T**ypeScript · **C**SS · **H**tmx.
- Company name is **"Career Team"** — never other spellings. `grep -rniE "career[ -]?team" . && eyeball casing`.

### 7. Docs synced — CLAUDE.md "change X → update Y" table
For anything changed, walk its row (e.g. an action verb → `contract.ts` → reasoner → unit+integration tests → `docs/AI-INTERFACE.md`). **Docs are the single source; pages + the whitepaper are *projections* (teasers), never forks.**

### 8. Components — CONVENTIONS §4
Each has `.html` / `.css` / `.md` (+ `.ai.md` if it needs one); operable ones declare `data-kind` + `data-accepts`. It should auto-appear in `/catalog`.

### 9. Generated output not committed
`audit/` and `screenshots/` are generated (`bun run audit` / `bun run shots`) → gitignored, never committed.

### 10. Memory
Notable decisions/non-obvious facts are captured as agent memories so the next session inherits them.

### 11. Docs align with the platform's features — nothing buried
Each layer keeps a **tiered capabilities list** ("What X gives you": *Hero* + *Also*) as the single
source, and every real feature appears in it — headlined or explicitly listed, never omitted.
- **The lists exist and are current:** `grain/docs/GRAIN.md` §"What GRAIN gives you", `batch/docs/ARCHITECTURE.md` §"What BATCH gives you", `mill/PLAN.md` §"What MILL gives you (PLANNED)".
- **Walk the code → list:** does the platform *do* something the list doesn't name? (Scan `grain/ai/*`, `batch/http/*` + `batch/audit`, `mill/core`+`adapters`.) A shipped capability missing from its list = a finding (it's buried). A listed capability that no longer exists = a finding (stale).
- **Tiering sane:** heroes are the reasons the layer exists; useful-but-quiet features are under *Also*, not omitted. PLANNED items are marked as such (don't imply shipped).
- **Teasers are projections, not forks:** the README + landing-page (`/grain`, `/batch`) capability blurbs summarize the source list truly and don't add features the source doesn't have (ties to check 7).

## Report template
- **✅ Passing:** (list the checks that passed)
- **⚠️ Findings:** `file:line` — what — fix or flag
- **Deferred / accepted:** known items (e.g. `desk.stop` action name; product-UI titles → "Project")
