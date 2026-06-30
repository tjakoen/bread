# AI Task Manager — MVP Dashboard Functionality & Architecture

**Status**: Design phase — functionality first
**Stack**: TypeScript. Model access is **cloud-first for v1, behind a single OpenAI-compatible `Model` boundary**; local (Ollama et al.) is a base-URL + model-name swap later. Operational state in embedded SQLite; user docs/knowledge as markdown.

---

## Scope Note (read first)

This MVP is an **AI task manager** — the task-management slice of the larger personal-assistant / second-brain system. That bigger system is the destination, not the current target. Two consequences worth stating plainly so this doc doesn't look like it contradicts the master plan:

- **The dashboard is central *here*, but not the primary surface of the full system.** In the full system the assistant is ambient and chat-led; the dashboard is for review/planning/config. For *this slice* we are deliberately building the dashboard surface first.
- **The Calendar is one view among several** — a window onto tasks that have a time dimension. We are **not building a calendar app**. Recurrence engines, invites, timezone math, ICS sync are out of scope unless they directly serve the task loop.
- **Lenses are deferred to flat tags** (see Tags section). Lenses (scoped memory namespaces) are v1-spine in the full plan; this MVP slice approximates them with tags and preserves the migration seam. Stated here so a reader of both docs knows lenses don't yet exist as namespaces.

---

## Core Architecture: The AI Is the Sole Writer

This is the principle everything falls out of — the inverse of a normal CRUD app.

**The AI owns the data and the view. The user proposes; the AI disposes.** The user doesn't mutate state directly. They **express intent** (chat, or a manual interaction — click, drag, check off); that intent goes to the AI, the **single writer** that decides what the state becomes and what renders. One writer means write races effectively vanish: no contended resource, just the reasoner handling one intent at a time, having already checked what's in view.

### Three ownership categories (this governs every edit affordance)

Same physical store, different edit rules, set by provenance at creation — never inferred:

1. **User ground-truth** — notes, source material, stated preferences (the knowledge base). **Directly editable; the AI defers.** This is the user's raw input *to* the AI's reasoning, not something to gatekeep. The one direct-write path.
2. **AI behavioral state** — rules, dispositions, escalation config. **Interfaced through the AI only.** The AI is the sole writer; a direct edit would be a back door. Dashboard buttons here are *intent to reconsider*, not writes.
3. **AI reasoning artifacts** — conclusions, ledger entries, traces. **Contestable through conversation only, never silently overwritten, and with no direct-edit affordance at all.** You contest → the AI re-reasons and updates, leaving a trace of the revision. Direct-editing these would destroy the faithful-record property the ledger and correction loop depend on.

Sorting test: *"a fact I'm asserting, or a thought the AI had?"* The UI surfaces each item's category so the user only directly edits what's category 1.

### One interface, one path

The AI acts through the **same vocabulary of frontend actions a human has** — no privileged backdoor. If the AI can do it, a human could trigger the same; and vice versa. There is **one internal AI interaction layer**; the chat sidebar is its first client, the dashboard its second — same door. A separate dashboard→DB path would recreate the back-door incoherence the single-writer rule exists to prevent. (Only category-1 docs bypass this.)

This action vocabulary is a contract: it's what the frontend exposes and what the AI is allowed to invoke, and "see if it's possible with the interfaces given" is a real check the AI performs.

> **The contract is specified in [AI-INTERFACE.md](./AI-INTERFACE.md).** It defines the
> two registries (addressable *surfaces*, the closed *action* vocabulary), the *intent*
> envelope both human and AI produce, the *render ops* the single writer emits, the SSE
> push channel that lands AI-initiated change without a refresh, and the self-generating
> *manifest* the AI reads. A working reference loop runs in the monorepo (see that doc §7).

---

## The Interaction Flow

Every interaction — chat or manual — runs the same loop:

1. **See the request** — a chat message, or a manual interaction on the dashboard.
2. **Check what's in view** — current screen, current state.
3. **Check the element** — what was touched / referred to.
4. **Decide what to do.**
5. **Check it's possible** with the interface vocabulary available.
6. **Trigger the frontend change** — the UI reflects/animates it.
7. **Do the backend work** — write to the database, adjust behavioral state.
8. **Confirm the action landed** — the reasoner verifies its own write succeeded and the view reflects it; if not, roll back.
9. **Feed back to the user** — a chat reply, a sound, a flash on the element. (Modality TBD — see Open Questions.)

### Gate triages; the reasoner judges (and has two depths)

This respects the master plan's hard line — **triage ≠ judgment, and a single judgment is never split across two models.**

- **Gate (cheap, always-on)** does **triage only**: classify the incoming signal and route it. It never decides *what to do* and never writes anything.
- **Reasoner** does all judgment, at one of two depths, chosen by the gate's routing:
  - **Light path** — trivial / simple actions (check off a task, a quick question). Fast; safe to act **optimistically** — animate immediately.
  - **Heavy path** — consequential actions (a reschedule that may conflict, a rule change). **Decide first, then animate the confirmed result**, so the UI never shows something that gets corrected a half-second later.

One model owns each judgment end-to-end; nothing second-guesses it. There is **no "heavy reviews what the gate did"** pattern — that would split a judgment.

### Keeping it snappy while the reasoner thinks

Waiting is part of the design, not something to hide. The heavy path can take a few seconds even locally (network latency is gone, but a capable model on consumer hardware is still slow). While it works, show a **conversational acknowledgment / thinking indicator** ("On it — checking your week…"). That acknowledgment is conversation, not a competing judgment, so it doesn't violate the no-split rule. Optimistic action on the light path is what carries the instant-feeling UX; raw local speed alone wouldn't.

**Rollback:** if step 8 fails or the backend rejects the write, undo the frontend change and tell the user.

---

## Layout

Split view:

- **Right sidebar — AI chat (collapsible).** This is **the one continuous conversation**, not a multi-session chat app: no "new chat" button. The user moves between subjects; the AI swaps working context. (Reference-by-default; resume only matters for unfinished, undistilled work — largely beyond this MVP, but the sidebar shouldn't be built as throwaway sessions.) Collapses by sliding off right, giving the dashboard full width.
- **Left panel — the dashboard.** The working surface. The user interacts here and the AI updates it in real time. Both kinds of change flow through the same loop above.

---

## Views

### Tasks (primary)
The core surface. Tasks with status, priority, time estimate, optional due/scheduled time, tags.
- **Capture**: say it or type it; the AI places it intelligently (when, how long, conflicts, recurrence if implied).
- **Edit / reschedule / reprioritize**: expressed as intent → AI re-evaluates placement and surfaces conflicts (heavy path, decide-then-animate).
- **Mark complete**: light path, optimistic; AI logs it, compares actual vs. estimated, learns.
- **Board mode** (optional): Backlog / Scheduled / In Progress / Done; moving a card is intent the AI processes.

### Calendar (a view, not the product)
A time-axis view onto time-dimensioned tasks. Drag-to-reschedule is intent → AI validates and surfaces cost. No standalone calendar features.

### Knowledge Base / Memory (the direct-write exception — category 1)
The user's ground-truth notes, context, preferences. **Direct add/edit/delete, straight to storage, not through the AI.** The AI reads this to inform every decision; it does not own or gate it. *(How this coexists with the AI door on the frontend — the two write paths chosen by ownership category, with no generic direct-write endpoint — is specified in [AI-INTERFACE.md](./AI-INTERFACE.md) §5b.)*

### Rules & Patterns (category 2 — AI-interfaced)
Behavioral rules the AI operates under and patterns it has inferred. The AI proposes; the user accepts / rejects / edits **as intent through the AI** — never a direct backend write. v1 can be largely read + accept/reject; richer editing later.

### Trade-off Ledger (category 3 — contestable only, no edit affordance)
An honest, non-falsifiable record of decisions and their cost ("chose work over the gym 22 of 30 days, against your stated priority"). **No direct-edit controls.** The user can **contest an entry in conversation** → the AI re-reasons and revises, leaving a trace. This faithfulness is the point: when pushback can override everything, the honest mirror is the system's irreducible value. Read + contest only.

### Settings
Work hours, protected/deep-work blocks, task categories, AI behavior (verbosity, how aggressively it flags overcommitment), export. Behavior settings are category 2 — interfaced through the AI.

---

## Tags, Not Lenses (with a forward seam)

Tasks and knowledge get **flat string tags** (`health`, `work`, `deep-work`). No taxonomy, no namespaces — premature structure for the MVP.

**Forward seam:** a lens in the full system is a *memory namespace* — a scope the AI reasons within. A **tag can later be promoted to a lens/namespace without re-tagging anything**, because the tag value already carries the grouping. Build flat tags now; don't paint over this seam; don't build namespace machinery yet.

---

## The Task Loop (what the MVP actually is)

Other task apps fail because they don't *think*. The differentiator is the loop, not the screens:

**capture → AI places intelligently → user sees it → user completes → AI learns**

Memory / Rules / Ledger are **not** standalone CRUD screens to build first — they are **surfaces the AI populates** that make the loop smart. Build the loop end-to-end first, then deepen.

Key workflows:
- **Frictionless capture** — intent in, AI decides placement, user sees it, can nudge.
- **Overcommitment guard** — the AI won't silently let the user overbook; it flags and surfaces the trade-off. **Duty to warn, never veto** — the user is never blocked; the AI's only lever is making the cost legible, then complying. It **asks scope** (today / this week / permanent), and a time-boxed override is a self-expiring rule.
- **Reschedule with honest conflict surfacing** — "Thursday 2pm works" vs. "you're already at 8h that day — sure?"
- **Completion → learning** — actual vs. estimated feeds the correction loop; corrections are proposed as plain-language rules and confirmed, never auto-committed.

---

## Feature Prioritization

### MVP — the loop, end to end
- Task capture (chat + manual) routed through the single AI interaction layer.
- AI placement / scheduling with overcommitment flagging (duty-to-warn, scope-asking).
- Mark complete → AI logs + learns; corrections proposed as confirmable rules.
- Reschedule with conflict surfacing.
- Knowledge base: direct add/edit/delete (the category-1 exception).
- Rules as read / accept-reject (category 2). Ledger as read / contest-in-conversation (category 3, no edit).
- Chat sidebar as the one continuous conversation, on the same action vocabulary.
- Gate triage → light (optimistic) / heavy (decide-then-animate) routing, with thinking-state feedback and clean rollback.

### Soon after
- Richer rule editing (still AI-mediated).
- Search across tasks + knowledge.
- Board view, recurring tasks.
- More feedback modalities; the AI self-profile gauges.

### Deferred (or out of scope for MVP)
- **Conflict resolution** — single-writer makes write races moot until multi-device sync exists. Revisit only then.
- Lenses as namespaces (tags suffice; seam preserved).
- Reasoning-graph visualization, voice/call tier, escalation tiers, priorities "constitution."
- Mobile, themes, calendar-app features, bulk import/export.

---

## Success Criteria (measure the loop, not CRUD)

The MVP is ready when:
- Capturing a task takes ~5 seconds and the AI places it sensibly.
- The AI flags overcommitment and surfaces the trade-off instead of silently accepting it.
- Rescheduling surfaces real conflicts and their cost.
- Completing a task feeds learning (estimates improve; corrections become confirmable rules).
- Direct knowledge-base edits work and demonstrably inform AI decisions.
- The ledger is faithful and can only be contested in conversation, never quietly edited.
- The light path feels instant; the heavy path never blocks the UI; failures roll back cleanly.
- TJ actually uses it daily over the alternatives. That's the real bar.

---

## Open Questions (figure out as we go)

- **Feedback modality** (step 9): chat, sound, element flash, or a mix — per action type.
- **Light vs. heavy routing thresholds**: which actions the gate routes to the optimistic light path vs. decide-first heavy path.
- **Acknowledgment UX**: what the thinking-state looks like so a slow heavy-path call never feels broken.
- **Contest UX for the ledger**: how a user invokes "that entry's wrong" in conversation and sees the traced revision.

---

## Build Order

The master plan says engine-first, nothing faked. You want to play with the frontend first. The reconciliation, stated as a conscious decision rather than a contradiction:

**Stub only the action-vocabulary plumbing to prove the feel — never a judgment-bearing panel before its real engine capability exists.**

1. **Shell** — split layout (dashboard + collapsible chat-as-one-conversation).
2. **Action-vocabulary plumbing, stubbed** — prove the optimistic → confirm → feedback → rollback flow with canned responses. This is the "play with the frontend" step; no real judgment yet. *(Specified in [AI-INTERFACE.md](./AI-INTERFACE.md); a running reference loop is in the monorepo — see that doc §7.)*
3. **Wire the single AI interaction layer** — gate triage → reasoner (light/heavy), against the real cloud model behind the `Model` boundary.
4. **Task loop, real** — capture → placement → complete → learn, running the real loop, writing real rules to SQLite, showing a real (ugly is fine) ledger.
5. **Knowledge base** — category-1 direct-write surface.
6. **Rules (accept/reject) and Ledger (contest-only)** — once the engine emits them.
7. **Settings.**

**Sequencing rule:** never build a dashboard panel before the engine capability it surfaces exists. The stub in step 2 is plumbing, not faked judgment — the distinction that keeps this honest to the plan.

**Progress (2026-06-30).** **Step 1 (shell)** and **step 2 (stubbed action-vocabulary plumbing)** are built and verified in the monorepo: the one `/intent` door, server-push over SSE, the dispatcher island, optimistic → confirm → rollback, grade-as-signal, and a self-harvested manifest — running end-to-end on a stand-in domain (`item.archive` ≈ `task.complete`, plus `say.*` text demos). The design-system identity is applied app-wide. **Next is step 3:** swap the stub reasoner for the real model behind the `Model` boundary and add the gate (triage → light/heavy). Still stubbed/unbuilt: real judgment, the gate, heavy-path "thinking" UI, the `/kb/*` direct-write surface (step 5), and the chat client.

---

*This document defines what the MVP task manager does and how it behaves, consistent with the master plan's single-writer / single-interface / triage-≠-judgment / duty-to-warn principles. The interface mechanics (action vocabulary, intent/render-op envelopes, push channel, manifest) are specified in [AI-INTERFACE.md](./AI-INTERFACE.md); the visual identity in [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md); the stack it all runs on in [../ARCHITECTURE.md](../ARCHITECTURE.md).*