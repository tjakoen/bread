---
id: a7-m-star-wire-model
status: todo
track: A
depends: [a1-finish-interaction-layer, a3-kb-ownership-seam, a4-couple-grade-to-provenance, a5-actor-identity-reconnect, a6-pre-model-hardening]
touches: [grain/ai/reasoner.ts, grain/ai/contract.ts]
owner: human
---

# M★ — wire the model

**The one milestone that changes what this is.** One real model (even small, even two verbs) reads
`/ai/manifest`, emits a `source:"ai"` Intent through `POST /intent`, is validated against the
registry, and its work renders grain over SSE. The day this runs, the project stops being a
choreographed simulation and becomes the existence proof the whitepaper claims. Nothing in any other
track matters more.

Behind the existing `Reasoner` seam: read manifest → choose action → emit Intent → RenderOps. Start
with `task.capture` + `say.*`. The manifest gets its first real consumer, which will also tell us if
the "index of the possible" is actually sufficient. Then shrink the whitepaper's §6
implementation-status limitation.

- [ ] model reads `/ai/manifest`, chooses an action
- [ ] emits `source:"ai"` Intent → validated → RenderOps render grain over SSE
- [ ] start with `task.capture` + `say.*`
- [ ] update whitepaper §6 limitation
