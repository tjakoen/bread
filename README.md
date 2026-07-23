# 🍞 BREAD

### *One vocabulary, two operators.*

A **no-build, AI-native web stack**, where every surface is addressable and operable by both a
human and an AI through one shared vocabulary, and the AI's presence is a visible signal.

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)
![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=white)
![No build step](https://img.shields.io/badge/build_step-none-2ea44f)
![Runtime deps](https://img.shields.io/badge/runtime_deps-0-2ea44f)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)

---

**BREAD** is the umbrella for a five-layer stack (`batch → grain → mill → proof → crumb`) plus
**PANTRY**, the app that composes them. The name rides the `LAMP` / `MEAN` lineage (one word that
reads as "a web stack") and it closes the baking metaphor the layers already use:

```
BATCH  (dough / the substrate)
  └─ milled by  MILL  from  GRAIN  (the design system + its default theme, "Sourdough")
        └─ boarded by  PROOF  (the AI plan board, a mountable layer above MILL)
        └─ guided by  CRUMB  (guided tours, a mountable layer above GRAIN)
              └─ baked in the  BREAD  stack  →  composed into an app by PANTRY (`bunx pantry`) or the portfolio
```

The defining idea: a human click and an AI decision become the **same `Intent`**, flow through
**one door**, and return as render operations pushed over SSE. No privileged AI→DOM back channel:
the AI operates the UI the same way you do, and you can watch it happen (*grain = AI*).

This repo is a **map, not a monorepo**: it links to where each layer actually lives and tells the
story. The full manifesto lives at **<https://tjakoen.github.io/bread/>**; read it there rather
than in duplicate here.

## The stack

Each layer builds only on the layers below it. `batch` is its own repo; `grain`, `mill`, `proof`,
and `crumb` live together in the [`grain`](https://github.com/tjakoen/grain) monorepo
(`packages/{grain,mill,proof,crumb}`), published individually as `@tjakoen/*` on GitHub Packages.
(The stack was originally split into one repo per layer, then partly reconsolidated into the grain
monorepo: see [`SPLIT-PLAN.md`](./SPLIT-PLAN.md) for that history.)

| Layer | What it is | Code | Docs / landing |
|---|---|---|---|
| 🥖 **BATCH** | The no-build substrate: Bun · Addressable · TypeScript · CSS · htmx. Server-rendered hypermedia, no bundler, no template language. | [github.com/tjakoen/batch](https://github.com/tjakoen/batch) | [tjakoen.github.io/batch](https://tjakoen.github.io/batch/) · [architecture →](https://tjakoen.github.io/batch/docs/architecture) |
| **GRAIN** | The AI-interaction design system + its default theme (**Sourdough**): atoms/molecules/organisms, tokens, and *grade-as-signal* (grain = AI, clean = human). | [packages/grain](https://github.com/tjakoen/grain/tree/main/packages/grain) | [tjakoen.github.io/grain](https://tjakoen.github.io/grain/) · [GRAIN →](https://tjakoen.github.io/grain/docs/grain) |
| **MILL** | Markdown → GRAIN-pages CMS: feed it `.md` + images, it renders GRAIN pages. GRAIN's companion, built on both layers. Live: `/notes`, `/grain/docs`, `/batch/docs` render through it. | [packages/mill](https://github.com/tjakoen/grain/tree/main/packages/mill) | [tjakoen.github.io/mill](https://tjakoen.github.io/mill/) · [`PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/mill/PLAN.md) |
| **PROOF** | The AI plan board: plans are markdown files; the board is a live projection of them. A mountable layer built on MILL (plans-as-markdown → kanban). | [packages/proof](https://github.com/tjakoen/grain/tree/main/packages/proof) | [tjakoen.github.io/proof](https://tjakoen.github.io/proof/) · [`PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/proof/PLAN.md) |
| **CRUMB** | Guided tours: a mountable layer built on GRAIN. Live in production on the portfolio. | [packages/crumb](https://github.com/tjakoen/grain/tree/main/packages/crumb) | no landing yet (package dir is the entry point) |

**The apps** (their own repos, not part of the umbrella): **`tjakoen.github.io/`** → the personal
site: it wires batch + grain + mill and runs the site + `/loop` demo. It *uses* the stack; it
doesn't fork it. **PANTRY** → the installable dev-docs + AI cockpit app: `bunx pantry` composes
batch + grain + mill + proof into one server for any project. **`project/`** (a private AI-assistant
product) is **paused**, a docs-only archive until it resumes as its own repo.

## The bet

Most web stacks answer "how do I build a UI?" with a client framework, a build pipeline, and a
state-sync problem. BREAD bets you can delete all three for a large class of apps and lean on the
platform, while making the result **legible and operable by an AI, not just a human**. The full
*why*, with all the detail, lives at **[tjakoen.github.io/bread](https://tjakoen.github.io/bread/)**
and in [`PHILOSOPHY.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/PHILOSOPHY.md).

## Quick start

Needs [Bun](https://bun.sh) (pinned `1.3.x`). There's nothing to clone here: `bread` is a map, not
code. To run the stack yourself, clone the two source repos:

```sh
git clone https://github.com/tjakoen/batch.git
git clone https://github.com/tjakoen/grain.git   # holds grain, mill, proof, crumb
```

To run the actual running site, clone
[`tjakoen/tjakoen.github.io`](https://github.com/tjakoen/tjakoen.github.io) instead:

```sh
bun install && bun run dev             # http://localhost:3000  (hot reload, no build)
```

Then visit (on the running site):

| Route | What |
|---|---|
| `/loop` | the AI interaction-loop demo, the reference screen (GRAIN) |
| `/grain` | the GRAIN showcase: grade-as-signal, live, driven through the real door |
| `/catalog` | the live component catalog (Human/AI toggle, search) |
| `/sitemap.xml`, `/robots.txt` | derived from the pages tree |

## Where to read next

- **[tjakoen.github.io/bread](https://tjakoen.github.io/bread/)**, the canonical manifesto: the
  full story, the bet, and the why. Start here.
- **[`CLAUDE.md`](./CLAUDE.md)**: orientation + operating rules (incl. the "when you change X,
  update Y" matrix). Any AI or human joining starts here.
- **[CONVENTIONS](https://tjakoen.github.io/batch/docs/conventions)**: the build standard (layering,
  components, tokens, the action vocabulary, the 3-tier testing bar).
- **[`DOCS.md`](./DOCS.md)**: the full map of where every doc lives.
- **[`ROADMAP.md`](./ROADMAP.md)**: the canonical execution plan.
- **[`SPLIT-PLAN.md`](./SPLIT-PLAN.md)** (historical): how the stack split into per-layer repos, and
  how `grain`/`mill`/`proof`/`crumb` later reconsolidated into the `grain` monorepo.

## License

Apache-2.0 for the framework layers (BATCH · GRAIN · MILL · PROOF · CRUMB) and the PANTRY app. The
personal site's written content is all-rights-reserved; the product is proprietary and unpublished.
Details in [`SPLIT-PLAN.md`](./SPLIT-PLAN.md#licensing).

---
🤖 **Built with Claude. I don't prompt and pray, I prompt and prove.** Every commit here is co-authored with an AI, on purpose. [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
