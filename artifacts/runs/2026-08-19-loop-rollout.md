---
title: The control plane gets the one thing it was missing
date: 2026-08-19
status: complete
lane: gated
branch: main
skills: [conformance, loop-standard, voice]
scope: [CLAUDE.md, artifacts/runs/]
touched: [CLAUDE.md, artifacts/runs/README.md, artifacts/runs/2026-08-19-loop-rollout.md]
plans: []
gates:
  - "bunx pantry check | pass, exit 0, 19 pages, 0 problems"
diffstat: 1 file modified, 2 files added. No source touched.
unpushed: "0 | nothing committed here."
doctor: 21 checks, 0 failing, 3 due at the start and 4 due at the close.
verifiedBy: nobody yet. This is the author's own account.
---

This repo already had the fullest kit in the estate: CLAUDE.md, the AGENTS.md symlink,
pantry.config.json, plans/, and the only AUDIT.md anywhere. It had no run ledger. That is now
the only piece that changed, plus a short section in CLAUDE.md naming where a run's findings land.

## Gate output, verbatim

```
19 pages, 0 problems
OK
CHECK_EXIT=0
```

Worth noting for the estate: bunx pantry check works here, because this repo carries
@tjakoen/pantry as a dependency. The machine-level session-start hook carries a comment claiming
bunx pantry always fails. It fails where the package is not a dependency, which is most repos, and
succeeds here. The comment overstates it.

## Two flags carried by name

- **Layer pins are four behind**: batch 0.2.0 against 0.2.1, grain 0.1.12 against 0.1.23, mill 0.2.0
  against 0.4.0, proof 0.1.2 against 0.1.4. deps:refresh is the fix and it was outside this
  envelope, since it changes a lockfile rather than a kit file.
- **AUDIT.md is present with no dated audit report**, so the audit reads as overdue. Running it was
  not this run's job.

## What was not done

Nothing committed, nothing pushed. No source touched. The audit was not run and the pins were not
bumped, both named above rather than quietly skipped.

## What needs human eyes

Two decisions, neither of them this run's to make. Whether to bump the four layer pins now or wait
for a release window, and whether the overdue AUDIT.md run is worth scheduling given this repo is a
control plane rather than a product. Both are cheap to do and neither is urgent, which is exactly the
combination that leaves a flag sitting for three sessions.

Underneath both: the session-start doctor does run here, because this repo sits beside the PANTRY
clone and can resolve it. Four of the eight repos in this rollout cannot, and that is the estate-level
problem this run found.
