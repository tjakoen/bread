# Personal AI Assistant & Second Brain — Working Plan

**One-line:** Personalized AI assistant and second brain. Works *for* you and *with* you.

**Philosophy:** Productivity tools force you to adjust to them; this inverts that. Built around one user (the author) first, perfected through daily use, generalized later only if it works. The dogfooding is the moat.

**Target user (v1):** Someone juggling multiple demanding roles (team lead + part-time professor + personal life) who needs proactive help making conscious trade-offs and staying aligned with their own goals — not another todo app.

**The four differentiators** (where invention effort goes; everything else is commodity scaffolding): the **correction loop**, the **trade-off ledger**, the **duty-to-warn override model**, and the **accountability-over-compliance stance**.

---

## 1. Guiding principles

1. **Perspective ≠ process.** Concerns (health, career, relationships) are perspectives one reasoner adopts, not separate agents. Separate processes are justified only by parallelism or persistent background work — never by topic.
2. **Triage ≠ judgment.** A cheap always-on gate decides *whether* something deserves attention; an expensive reasoner decides *what to do*. Never split a single judgment across two models.
3. **Judgment stays with the reasoner.** Background workers do mechanical work only (fetch, monitor, summarize, crawl) — never judgments the reasoner must second-guess.
4. **Separation buys clean context, not better reasoning.** Scoped namespaces sharpen retrieval; they don't make a weak model reason better.
5. **Everything learned is inspectable, editable, and expirable.** No opaque emergent behavior. Learned behavior lives as structured, human-readable rules.
6. **Accountability over compliance.** The product's value is keeping the user in check. A loop optimized purely on "did the user push back" stops doing its job exactly when it matters. Deliberate stance, not a detail.
7. **Local-first, model-agnostic.** Designed to run on local hardware; cloud is a v1 convenience behind an abstraction. Privacy is a selling point — but local ≠ secure (§11).
8. **Legibility comes from constrained, owned structure.** Anything exposed (rules, categories, traces, dashboards) stays legible only if its structure is a small, closed vocabulary reluctant to grow. "Everything visible" is its own black box. Everywhere: constrain structure, decay volume, surface what matters.
9. **The representation must *be* the thing, never a story about it.** Traces, readouts, graphs, profile bars all render the real state the reasoner acts on — never a separately-generated description that can drift.
10. **Propose, don't auto-commit.** Categorization, rule changes, conversation merges, config edits: the system proposes and shows; the user confirms. The confirmation step is the safety layer.

---

## 2. Architecture

**Gate (cheap, always-on):** triages incoming signals → `ignore` / `log` / `escalate`. Makes proactivity viable. Triage is classification, so it can run small.

**Reasoner (capable, the "brain"):** does the judgment — weighs concerns, decides what to surface and how urgently, proposes rules, emits traces. Invoked, not always-on. Has two depths, and the gate routes between them:
- **Light path:** general conversation / simple Q&A — no rule-writing, ledger, or lens machinery.
- **Heavy path:** the full life-management loop.
- One reasoner, shared memory/context — *not* a separate chatbot component (that would split-brain the casual and life-management sides).

**Lenses (the "pantheon," as perspectives not agents):** health, career, relationships, etc. Each is a scoped memory namespace plus injected, verified knowledge. On a multi-concern decision the reasoner consults the relevant namespaces and holds the tension inside one mind.

**Background workers (the only real separate processes — the "subconscious"):**
- **Research worker** — on a schedule, sources relevant material and writes **compact, verified, sourced tidbits/flashcards** (not raw articles) into the knowledge base, linked. Verification is load-bearing: an unverified source poisons every downstream judgment.
- **Presence/context watcher** — tracks desk presence, watches calendar for conflicts, fires events.
- **The gate** — always-on, small.

These provide the system's concurrency. The conscious stream (one conversation) is singular by design; the workers run in parallel like a subconscious, surfacing only what earns escalation.

**Scoped access:** the reasoner reaches workers and (later) external domains through scoped, least-privilege tokens — never full-context dumps. This is the surviving piece of the old inter-agent model; agent-to-agent *negotiation* is gone (no orchestration). Internal communication is plain structured data; there is no special "AI language."

---

## 3. Memory & conversation model

The failure of existing chatbots: the **conversation is the unit of storage**, so chats persist forever, pile up, and trap knowledge inside whichever session it was said in. Fix: separate the two jobs the chat was doing.

- **The knowledge base is the memory.** Conversations are a *working surface*, not storage. Durable content (facts, decisions, rules, tidbits) is **distilled out of every conversation into the knowledge base** — faithfully, visibly, correctably. Context is rebuilt per query by retrieval, not carried as an ever-growing blob.
- **Conversations are ephemeral by default, promotable to kept.** Most chats decay after a grace period once distilled. Any can be **kept** — named, organized, resumable — manually, or on the AI's proposal ("looks like a project you'll return to — keep it?"). Keeping is intentional, so the pile never forms; distillation is universal, so nothing important is lost.
- **One assistant, one continuous conscious conversation.** No "new chat" button. You move between subjects; the AI swaps working context to match.
- **Reference by default; resume only for unfinished work.** Referencing pulls distilled *conclusions* forward while you stay where you are — correct for anything finished. Resuming reloads a session's live, *undistilled* working state (rejected options and why, half-formed direction) — only meaningful for work that paused mid-thought. **The AI distinguishes them by whether the conversation was distilled/completed:** completed → reference; undistilled working state → offer resume. Resume is therefore rare and self-limiting.
- **Manual path:** browse the history/timeline, open a kept thread, and chatting on it continues from there.

Metaphor that fits this layer (the "brain"/"assistant" metaphors describe the *intelligence*, not memory): a **chief of staff** — most exchanges aren't kept as minutes but what matters is filed; a few live projects are reconvened; asking "what did we decide about X?" pulls the *file*, not the meeting transcript.

---

## 4. The correction loop

"It learns me" is a built feature, not an emergent hope.

**Flow:** system acts → user reacts (explicitly, *or* by silently/repeatedly ignoring — passive dismissal is feedback) → the **reasoner infers the general rule behind the specific complaint** and proposes it in plain language ("hold health nudges when work load is high, or just this week?") → user confirms/corrects **the rule** → it persists as a structured object.

Why rule-level, not incident-level: storing the literal complaint ("stop mentioning the gym") teaches the wrong lesson ("never mention gym") instead of the real one ("deprioritize health nudges under high load"), producing opposite-direction errors later.

**Rule object (to finalize):** `trigger → action → scope/duration → confidence`, plus human-readable description/reason, linked to the relevant task/calendar/project item. Visible in settings; user-owned.

**Three things the naive loop misses:**
- **Decay/revisiting** — rules expire or get re-tested, so corrections don't accumulate into a system that does nothing.
- **Passive signal** — silent dismissal feeds the loop; don't only learn from explicit complaints.
- **Corrections are hypotheses** — a confirmed rule is still a guess; watch whether it produces bad outcomes.

**Core tension:** distinguish "legitimately wrong to surface this" from "I don't want to hear it but told you to tell me anyway." Leans toward accountability partner over compliant assistant.

**The AI's self-profile.** The AI holds an editable profile of *itself* — disposition toward the user (suggestibility, assertiveness, nudge-aggressiveness, priority leanings) — surfaced as **readout gauges** (bars, or a radar chart for the priority balance). These display the *real* parameters the reasoner acts on (per Principle 9), not cosmetic numbers. You change them by interacting with the AI; the gauge then moves to confirm. Keep the set small and coarse. If a core disposition (e.g. assertiveness) is driven toward zero, the AI reflects that back ("you've turned my pushback down repeatedly — want me this passive, or rough stretch?") rather than silently becoming a yes-man.

---

## 5. The trade-off ledger

The likely killer feature. An explicit, reviewable record of what the user traded and whether it matched their stated priorities ("you chose work over sleep 22 of 30 days, against the priority you set"). Almost nobody builds this well. Given the user-sovereignty stance (§9), this is the system's **irreducible value**: when pushback can be fully overridden, the honest mirror is what remains, and it must never be falsifiable.

---

## 6. Interaction model — the disappearing interface

The system is ambient; the AI is the brain and **all surfaces are interaction modes it mediates** — chat, buttons, gestures, voice later. Chat is *one* modality, not the only one. Every interaction routes to the reasoner the same way: mediated, contestable, traced.

- **Voice/call (later):** an actual call when something is time-critical *and* the user is away from quieter channels.
- **Chat:** structured like a messaging app; reads as an assistant, not "an AI"; potentially integrated into platforms the user already uses.
- **Dashboard:** review, planning, config, docs, visualization. Not the primary surface.
- **Onboarding:** a conversation, not a form; produces the first version of priorities. Any personality prior is a throwaway the system eagerly overwrites — observed behavior beats any test.

---

## 7. Integration & extensibility

The assistant is the **sole integrator** of a multi-domain life (a future people-management platform, professor work, hobbies), collapsing them against one constraint: the user's finite day.

- **Domains push standardized signals up, never internals.** Deep two-way couplings turn into a knot; signals stay flexible. Each domain emits the same small shape (time demanded / hard deadlines / current load). Adding a domain = teaching it the signal, not rewiring the assistant.
- **Two layers, kept separate:** **MCP = transport** (the right standard for *reaching* domains; use the official TS SDK). **Owned signal schema = semantics** (what they *say*) — small, versioned, yours; borrow conventions (ISO 8601) but don't adopt a big standard wholesale.
- **Authority:** the assistant is integrator-of-last-resort; a domain reports up, never negotiates the schedule as a peer.
- **Security:** each MCP connection is another door into the aggregated box — scoped, least-privilege per connector.
- **Categorization integrity:** auto-sorting fails silently, so signals carry their domain where the source knows it; ambiguous inputs get a *proposed* category, and **if unsure, it asks**. The ask-threshold is itself learnable (asks more early, earns auto-filing as proposals are confirmed).

---

## 8. Storage & ownership

- **Docs-style library** (markdown files) for human-facing content — knowledge, notes, sourced tidbits, lens vaults. Storage format = legible format.
- **Embedded SQLite** for operational state — rules, signals, traces, ledger. Don't force operational state into prose.
- **Graph/visualizations render over both** — always views, never the source of truth.

**Three ownership categories** (same physical store, different edit rules — set by provenance at creation, never inferred):
1. **User ground-truth** (notes, source material, stated preferences) → **directly editable**; the AI defers.
2. **AI behavioral state** (rules, dispositions, escalation config, self-profile) → **interfaced through the AI only** (it's the sole writer; direct edits = back doors).
3. **AI reasoning artifacts** (conclusions, ledger entries, traces) → **contestable through conversation, never silently overwritten.** Direct-editing these would destroy the faithful-record property the audit/ledger/correction depend on. You contest → the AI re-reasons and updates, leaving a trace of the revision.

Sorting test: *"a fact I'm asserting, or a thought the AI had?"* The docs UI surfaces each item's tag so the user only edits what's theirs.

---

## 9. Control plane, transparency & override

**Interfacing, not operating.** The AI is the sole writer of its own behavioral state; all surfaces are ways of addressing it.
- **Config chat drives the UI live:** discussing a setting opens it and previews the change before commit (show-then-confirm). Trivial navigation auto-applies; anything modifying behavioral state waits for explicit confirmation.
- **Dashboard gestures/buttons are not direct writes** — they prompt the AI to reconsider and adjust. (Exception: editing user-owned docs, §8 category 1.)
- The chat-drives-UI effect also *teaches* the user how to do things themselves and visibly shows the AI acting.
- Benefit of single-writer: coherent state, no contradictory settings, every change traceable.

**Transparency — reachable vs. displayed.** "Everything on screen" is its own black box. The dashboard **triages its own contents** (rules firing most, low-confidence categorizations, trade-offs trending wrong, recent changes) and lets the rest recede. Everything stays **reachable** and editable via config chat. Reachable ≠ displayed. The assistant curates its own transparency.

**Override — duty to warn, never veto.** Single-writer must never trap the user; the user is the final say.
- "Reconsider this" invites judgment. "This is not a request" is obeyed **even while disagreeing**, logged (trace: *user overrode; I'd have kept it; noted*).
- The AI's only lever is making the **cost legible**, then complying ("this goes against the goals you set — sure?").
- **Friction proportional to consequence** (avoids warning fatigue): trivial → silent; meaningful → one confirm; foundational → deliberate, names what's affected.
- **Always asks scope** — *today / this week / permanent* — because the same words mean different things; "stop bugging me about sleep" almost always means "not tonight." Scope reuses the §4 decay machinery: a time-boxed override is a self-expiring rule. Even a confirmed "permanent" stays gently revisitable far later; firmness sets how rarely, never never.
- **Repeated overrides feed the correction loop** (update priorities, or back off and note the pattern) rather than looping identical warnings.

**User sovereignty (the resolving stance).** A user who overrides everything is exercising choice, fully logged; the system did its job. A system that degrades into "a nicer calendar" is an honest mirror of the user's own decisions, not a failure. This retires the "will the user tolerate pushback?" worry — that's the user's call by design. It also makes faithful logging *more* important: the ledger is what makes "that's on me" an informed statement.

---

## 10. Reasoning visualization (research/side project; also the logging+transparency layer)

Renders the AI's *actual* reasoning as a replayable, self-building concept graph — divergent paths shown and marked as abandoned with their why, committed path highlighted, boxes linking sources and showing outputs. Demoted from a v1 pillar to a side project, but it doubles as the behavior-logging/transparency layer and a debugging tool, and is a potential client-facing selling point.

- **Honesty (Principle 9):** it renders a real trace the reasoner writes, not a separate explainer. Same source as the reasoning; no gap to drift. Clutter solved by fading over time, not omission. Filter = causal influence, never presentability. "Hiding" only ever means low-level metadata behind nodes, never load-bearing factors. Render **afterward as replay** (not live) — kills the latency tension; "real-time" becomes faithful replay.
- **One trace, four uses:** visualization + audit log + ledger input + correction-loop input.
- **Fixed node/edge vocabulary** (small, closed): nodes *decision · reference · lens consultation · intermediate conclusion · output*; edges *led-to · references · depends-on · contradicts*.
- **Correction surface:** flag a specific node and give feedback ("this step was wrong, do better"). Higher-quality input than a vague complaint because it's *precise*. Still a behavior change, so it routes through the AI and is contestable. A crude "click a step, leave feedback" can ship before the animated graph.
- **Design-time commitment:** the reasoner must emit faithful structured traces from the start — not retrofittable.

---

## 10b. Technology feasibility & hardware floor (checked June 2026)

The plan's heaviest dependency is a local model that does reliable structured action and judgment. As of mid-2026 this holds, with a sharp size cliff that makes the gate/reasoner split a hardware necessity, not just a design preference.

- **Open-weight quality** is now sufficient for real on-device work, with functional built-in tool-calling in the better models.
- **Reliability cliff:** 7–8B models hallucinate tool calls and produce format errors; 14B is marginal; the reliable floor people run in production is **~24–32B** (a dense 27B is a common pick; a 24B has run an agent two weeks without a tool-calling failure). Some large MoE models benchmark well but loop on tool-calling chains.
- **Maps onto the architecture:** the **reasoner** must sit in the ~24–32B+ band (below it, tool-calling itself gets flaky — exactly what would corrupt traces and rules); the **gate** is classification, so it stays tiny.
- **Hardware floor:** reliable reasoner + the 64K+ context agents need means **32GB minimum, 48GB comfortable** unified memory; base 16GB won't do the reasoner tier. On Apple Silicon, memory bandwidth is the speed bottleneck; a ~35B MoE with few active params fits the band with context headroom (~13–40 tok/s — fine for an ambient assistant).
- **Hybrid escape hatch:** the model-agnostic boundary lets the reasoner point at a stronger cloud model for hard calls while routine work stays local — use deliberately (reintroduces egress).

Net: "can a local model do this" is retired into a spec (stay above ~24–32B / 32–48GB). Residual risks are sequencing, security of the aggregated box, and the items in §12.

---

## 10c. Tech stack & build order (v1)

- **Language:** TypeScript on Node. Cloud-first means calling APIs, not loading weights, so Python's ML stack isn't needed; TS's type system enforces the structured-object discipline (Principle 8) and unifies backend/agent/frontend.
- **Model strategy — cloud-first behind an abstraction (the critical rule):** start on a strong cloud model (retires the §10b cliff for v1). **Never call a provider directly from business logic** — every call goes through one `Model` interface (`reason()`, `triage()`, `embed()`) speaking the **OpenAI-compatible shape**, which both cloud and every local runtime (Ollama, LM Studio, vLLM) expose. Going local later is a base-URL + model-name change. This boundary is what makes "local-first" real; skip it and you've built a cloud product wearing local clothing.
- **Libraries, not a framework:** the valuable parts are exactly what no framework provides, and heavy frameworks push the orchestrated-swarm pattern this design rejected. Thin libraries for commodity bits (Vercel AI SDK for model calls; official TS MCP SDK later; a vector lib when needed), own code for the spine (gate, reasoner orchestration, rule store, trace emission, ledger). Escape hatch: a *thin* orchestration lib (LangGraph) only if hand-rolling starts reinventing wheels.
- **Storage:** markdown files (docs) + embedded SQLite (operational state). Vector index only when retrieval demands it.
- **Backend:** a plain Node server (Express/Fastify/Hono); the multi-input API is HTTP endpoints + webhooks. Background workers = scheduled Node jobs.
- **Frontend:** React/Next; visualization is a graph render (e.g. React Flow) over data the backend already emits.

**Single-interface boundary (load-bearing):** there is **one internal AI interaction layer**; the chatbot is its first client, the dashboard its second — same door. Building a separate dashboard→DB path recreates the back-door incoherence §9 prevents. The one direct-to-storage exception is user-owned docs.

**Build order — dashboard-with-chatbot as the first surface, but thin over a real engine, back-to-front:**
1. **AI interaction layer** — the single internal interface (gate→reasoner, rule store, ledger).
2. **Chatbot = first client**, in a minimal dashboard shell; proves the loop end-to-end.
3. **Grow the dashboard outward** — config, docs, visualization — each added only once the engine capability it surfaces exists.

**Sequencing rule:** never build a dashboard panel before the engine capability it surfaces exists.

**True first milestone:** one web page with a chat box that runs the real gate→reasoner loop against your real calendar/goals, writes a real rule to SQLite when corrected, and shows a real (ugly is fine) weekly ledger. The whole spine, nothing faked.

---

## 11. Deferred — deliberately, with caveats banked

- **Priorities ("the constitution").** From onboarding, refined via the same correction loop and rule objects (so priorities and corrections don't diverge). *Explicit and user-editable, never purely inferred.*
- **Escalation tiers (log/notify/call).** User-configurable; each rule states what it does and why. *Call tier starts conservative — one bad call loses trust.*
- **Rule-list legibility at scale.** Inspectability is real only while the list is reviewable. *Protect reviewability — decay, grouping, surfacing high-impact rules.*
- **Data scope.** Private/local, no hard limits yet. *Local ≠ secure; aggregation is the risk — don't casually sync the vault to a cloud drive.*
- **Specifics:** agent roster, research cadence, exact model picks, vector implementation. Figure out while building.

**The seam to watch:** every deferral is the same muscle — keeping the system legible and trustworthy as it scales. The author is the backstop for all of them while solo; none can rely on "the user will handle it" once shipped.

---

## 12. Open questions for the next audit

1. **Specific model picks** — reasoner (~24–32B band) and gate. Test specifically for *faithful structured trace emission while reasoning well* — can't be retrofitted.
2. **The hard accountability call** — how to tell "legitimately wrong to nag" from "user is resisting." (User-sovereignty means this affects warning *quality*, not who wins.)
3. **Rule object schema** — finalize.
4. **Signal schema** — finalize the minimal cross-domain shape.
5. **Security of the aggregated box** — highest-stakes deferral; needs a real answer (encryption at rest, backup hygiene, phone-client sync scope) before any non-solo use.
6. **Build-on-what** — evaluate existing local-first agent substrates so invention goes to the differentiators, not scaffolding.

*Retired since earlier audits: raw local-model feasibility (now a spec, §10b); "will the user tolerate pushback" (the user's call by design, §9).*

---

*Status: architecture coherent, v1 scoped, deferrals deliberate. Spine: one reasoner (light/heavy paths) + cheap gate + background workers; knowledge base as memory with ephemeral-by-default conversations; correction loop, trade-off ledger, duty-to-warn override. Throughline: one mind writes all behavioral state; every representation is the real thing; legibility from constrained structure; the user is never trapped and what they choose is theirs, faithfully recorded.*