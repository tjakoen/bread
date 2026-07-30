---
id: a2-close-back-channels
status: done
track: A
depends: []
touches: [tjakoen.github.io/src/ai/desk-reasoner.ts]
owner: ai
---

# Close the accidental back channels

Done 2026-07-04. The *designed* seam stays (see a3); the accidental AI→DOM channels are gone, so
every write goes through `/intent`.

- [x] retire legacy generic CRUD routes (`/ui/items*`, `/api/items*`) — `routes.ts`, its test, and
      `/home` deleted; nav link, audit/screenshot entries, and the orphaned `toItemCardView` chain
      removed. Items now have exactly one write path.
- [x] rebuild the `/grain` showcase driver — `surface-demo.js` (the client-side AI→DOM channel)
      deleted; `/grain` loads the real `ai-dispatch.js`; "Watch the AI act" + Ask/Send post real
      Intents through `/intent` and render back over SSE.
- [x] make `demo.run`'s archive step write state through the service — triage archives a seeded
      fixture via `tools.archiveItem` and renders the committed card; re-runnable (idempotent).
