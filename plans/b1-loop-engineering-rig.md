---
id: b1-loop-engineering-rig
status: todo
track: B
depends: []
touches: []
owner: ai
---

# Loop Engineering rig — align the AI workflow with Osmani's five blocks

Per Addy Osmani's "Loop Engineering" (June 2026, [addyosmani.com/blog/loop-engineering](https://addyosmani.com/blog/loop-engineering/)):
stop hand-prompting the agent, design the system that prompts it. Audit of the current workflow
found 3 of 5 blocks already present (worktrees, external state via memory + plan boards, MCP
connectors) and two missing: **formalized skills** (the 5-dim audit was re-derived from memory 3×
in one week) and **automations** (every triage pass runs through the human's hands). The
writer/verifier sub-agent split exists only as a memory lesson, not an agent definition.

Full approved plan: `~/.claude/plans/eventual-cooking-trinket.md` (local, outside this repo).

**Decisions locked** (2026-07-13): first loop = BREAD triage (stranded local work, pin drift incl.
transitive, CI status, live smoke); runtime = manual self-paced `/loop` at session start — no cron,
no cloud; autonomy = **report-only** (writes a board, surfaces only new/changed findings with
evidence; zero repo writes — never edits, commits, pushes, or PRs).

**Where it lives**: everything under the workspace root `bread-repos/.claude/` (not this repo;
mirroring into bread is a later opt-in). Deliverables:

- [ ] skill `bread-triage` — one cheap loop tick across the six repos; board diff output contract; ScheduleWakeup pacing 1200–1800 s; hard report-only guardrails
- [ ] skill `bread-audit` — the on-demand 5-dimension deep audit, referencing [AUDIT.md](../AUDIT.md) as canon (never invoked by the loop)
- [ ] skill `pin-cascade` — the repin runbook: grain → mill/proof/pantry → portfolio last; nested-git bun-wall notes; bar = pushed + CI green + live-verified
- [ ] sub-agent `verifier` — read-only diff-vs-intent checker; investigate unexpected hunks before condemning (concurrent-session lesson)
- [ ] state board `boards/triage.md` — Open / Acknowledged (seeded with hardening-plan stranded-work set) / Log
- [ ] workspace `CLAUDE.md` glue naming the rig + kickoff one-liner (`/loop /bread-triage`)
- [ ] verification: ground-truth tick reproduces known reality; second tick reports "no new findings"; loop harness schedules+fires+stops; verifier smoke-test; zero writes outside `.claude/`

**Out of scope** (later opt-ins): cron/cloud scheduling, fix-mode / auto-PR autonomy, morning-brief
loop on Gmail/Calendar connectors, greenroom coverage, versioning the rig inside this repo.

**Guardrail canon** (Osmani): "A loop running unattended is also a loop making mistakes unattended."
Report-only first; promote to fix-mode only after the board has earned trust.
