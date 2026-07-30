---
id: a3-kb-ownership-seam
status: todo
track: A
depends: [a1-finish-interaction-layer]
touches: [tjakoen.github.io/docs/grain/AI-INTERFACE.md]
owner: ai
---

# Build the `/kb/*` ownership seam (the legitimate CRUD)

Direct-write routes for category-1 user ground-truth (knowledge base, notes, preferences) per
AI-INTERFACE §5b: clean grade, notify-not-gate SSE event, and the two guardrails enforced (no
generic endpoint; one path per datum). This is where "I still want CRUD for the knowledgebase"
lives, by design.

- [ ] direct-write `/kb/*` routes (clean grade)
- [ ] notify-not-gate SSE event
- [ ] guardrail: no generic endpoint
- [ ] guardrail: one path per datum
