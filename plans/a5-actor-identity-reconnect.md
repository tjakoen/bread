---
id: a5-actor-identity-reconnect
status: todo
track: A
depends: [a1-finish-interaction-layer]
touches: [tjakoen.github.io/src/ai]
owner: ai
---

# Actor identity + reconnect

Already decided (AI-INTERFACE §5d): actor-id stable across tabs/reloads, turn-status on `/stream`
connect, `desk.stop` re-keyed to actor. Closes the any-client-can-join-any-session hole and is the
same seam the real assistant needs.

- [ ] stable actor-id across tabs/reloads
- [ ] turn-status on `/stream` connect
- [ ] `desk.stop` re-keyed to actor
