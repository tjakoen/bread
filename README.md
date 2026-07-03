# 🍞 BREAD

### *One vocabulary, two operators.*

A **no-build, AI-native web stack** — where every surface is addressable and operable by both a
human and an AI through one shared vocabulary, and the AI's presence is a visible signal.

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](./portfolio/notes/ten-times-zero.md)
![Bun](https://img.shields.io/badge/Bun-1.3-000?logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![No build step](https://img.shields.io/badge/build_step-none-2ea44f)
![Runtime deps](https://img.shields.io/badge/runtime_deps-0-2ea44f)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)

---

**BREAD** is the umbrella for a three-layer stack. The name rides the `LAMP` / `MEAN` lineage — one
word that reads as "a web stack" — and it closes the baking metaphor the layers already use:

```
BATCH  (dough / the substrate)
  └─ milled by  MILL  from  GRAIN  (the design system + its default theme, "Sourdough")
        └─ baked in the  BREAD  stack  →  served as a theme (Sourdough today; more varieties planned)
```

The defining idea: a human click and an AI decision become the **same `Intent`**, flow through
**one door**, and return as render operations pushed over SSE. No privileged AI→DOM back channel —
the AI operates the UI the same way you do, and you can watch it happen (*grain = AI*).

## The three layers

Each layer builds only on the layers below it (`batch → grain → mill`), and each is headed for its
own public repo (a **submodule** of this umbrella). See [`SPLIT-PLAN.md`](./SPLIT-PLAN.md).

| Layer | What it is | Start reading |
|---|---|---|
| 🥖 **[BATCH](./batch/)** | The no-build substrate — Bun · Addressable · TypeScript · CSS · htmx. Server-rendered hypermedia, no bundler, no template language. | [`batch/docs/ARCHITECTURE.md`](./batch/docs/ARCHITECTURE.md) |
| **[GRAIN](./grain/)** | The AI-interaction design system + its default theme (**Sourdough**) — atoms/molecules/organisms, tokens, and *grade-as-signal* (grain = AI, clean = human). | [`grain/docs/GRAIN.md`](./grain/docs/GRAIN.md) |
| **[MILL](./mill/)** | Markdown → GRAIN-pages CMS *(planned)* — feed it `.md` + images, it renders GRAIN pages. GRAIN's companion, built on both layers. | [`mill/PLAN.md`](./mill/PLAN.md) |

**Consumers** (their own repos, not part of the umbrella): **`portfolio/`** → the personal site
(`tjakoen.github.io`), and **`project/`** → a private AI-assistant product. They import the stack;
they don't fork it.

## The bet

Most web stacks answer "how do I build a UI?" with a client framework, a build pipeline, and a
state-sync problem. BREAD bets you can delete all three for a large class of apps and lean on the
platform — while making the result **legible and operable by an AI, not just a human**:

- **No build step.** Bun runs TypeScript directly; the "build" that turns source into HTML lives in
  the *server*, composing on every request. Edit, refresh, done.
- **Server-rendered hypermedia.** Pages and fragments are HTML; htmx handles interactions. The
  browser never sees a component tag.
- **One vocabulary, two operators.** Verbs and surfaces live in one registry. A human and an AI act
  through the *same* primitives — provable by construction, not bolted on as a chatbot in a corner.
- **Grade as signal.** The AI's presence shows up as *typography* (the grain grade), so its work is
  visible and auditable. No hidden back channel.
- **Built on the platform, not a framework.** The browser's own primitives do the work: native
  **View Transitions** animate page navigation, **`<dialog>`** powers modals, **`<details>`** powers
  disclosures, **`:has()`** / **`color-mix()`** drive behavior and theming. The rule is *prefer the
  primitive over reinventing it in JS* — so the only client JS shipped is the one `/intent` dispatcher.

The cost is honest and documented: rich client interactions (drag-drop, optimistic UI, offline)
fight the grain. The trade is taken on purpose. The full *why* is in
[`portfolio/PHILOSOPHY.md`](./portfolio/PHILOSOPHY.md).

## Quick start

Needs [Bun](https://bun.sh) (pinned `1.3.x`). Today this is a monorepo (splitting into submodules
per [`SPLIT-PLAN.md`](./SPLIT-PLAN.md)); run from the repo root.

```sh
bun install
bun run dev        # http://localhost:3000  (hot reload, no build)
bun run check      # tsc --noEmit (must stay green)
bun run test       # unit + integration
```

Then visit:

| Route | What |
|---|---|
| `/loop` | the AI interaction-loop demo — the reference screen (GRAIN) |
| `/grain` | the GRAIN showcase: grade-as-signal, live, driven through the real door |
| `/catalog` | the live component catalog (Human/AI toggle, search) |
| `/sitemap.xml`, `/robots.txt` | derived from the pages tree |

## Where to read next

- **[`CLAUDE.md`](./CLAUDE.md)** — orientation + operating rules (incl. the "when you change X,
  update Y" matrix). Any AI or human joining starts here.
- **[`portfolio/PHILOSOPHY.md`](./portfolio/PHILOSOPHY.md)** — the beliefs the whole stack serves.
- **[`batch/docs/CONVENTIONS.md`](./batch/docs/CONVENTIONS.md)** — the build standard (layering,
  components, tokens, the action vocabulary, the 3-tier testing bar).
- **[`DOCS.md`](./DOCS.md)** — the full map of where every doc lives.
- **[`ROADMAP.md`](./ROADMAP.md)** — the canonical execution plan.

## License

Apache-2.0 for the framework layers (BATCH · GRAIN · MILL). The personal site's written content is
all-rights-reserved; the product is proprietary and unpublished. Details in
[`SPLIT-PLAN.md`](./SPLIT-PLAN.md#licensing).

---

🤖 **Built by one chronically disorganized human and one alarmingly tidy AI.** I make the calls,
Claude does the typing, and I take most of the credit. People throw "vibe coder" around like it is
an insult, so I counted, and it turns out I am the kind that shows up with receipts. **I don't
prompt and pray. I prompt and prove.**
[Here's how I actually work with AI (numbers and all) →](./portfolio/notes/ten-times-zero.md)
