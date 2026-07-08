---
id: a6-pre-model-hardening
status: todo
track: A
depends: [a1-finish-interaction-layer]
touches: [grain/ai/reasoner.ts, grain/scripts/ai-dispatch.js]
owner: ai
---

# Pre-model hardening

Harden the seams before a real model lands in them.

- [ ] reasoner verb-handler registry (the if-chain won't scale past ~10 verbs)
- [ ] make the dispatcher's 20s safety timeout configurable (a real model run will exceed it)
- [ ] upgrade the boot drift-guard from `console.warn` to fail-fast (opt-out flag for dev)
