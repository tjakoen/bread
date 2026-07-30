---
id: a4-couple-grade-to-provenance
status: todo
track: A
depends: [a1-finish-interaction-layer]
touches: [tjakoen.github.io/src/ai]
owner: ai
---

# Mechanically couple grade to provenance

The dispatcher should key `data-grade` off `op.provenance` (today `applyType` sets grain
unconditionally and `replace`/`append` trust the writer's HTML). Add a conformance test: an op with
`provenance:"ai"` *must* render grain. Also fix the semantic wobble where a human-initiated archive
returns `provenance:"ai"`.

- [ ] dispatcher keys `data-grade` off `op.provenance`
- [ ] conformance test: `provenance:"ai"` renders grain
- [ ] fix human-archive returning `provenance:"ai"`
