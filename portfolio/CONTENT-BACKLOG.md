# Portfolio — content backlog

> Status: **captured, not written.** The list of *content pieces* to author for the portfolio
> (companion to [PLAN.md](PLAN.md) = the *how* and [FEATURES.md](FEATURES.md) = the *what*).
> These are writing/asset tasks, not code. All content is authored as **Markdown + images** and
> rendered by the CMS (see memory `portfolio-cms-separate-project`); pages are trailheads.
>
> **Guardrails (read before writing any of this — memory `portfolio-content-backlog-guardrails`):**
> the repo is **public**. The PH Live dispute is told **neutrally, no names, lessons-forward**.
> Company name is **Career Team**. People name-drops = public professional info + LinkedIn only.

## Information architecture (decisions — memory `portfolio-content-architecture`)

- **Résumé main page**, each **experience clickable → its tagged notes** (`/notes?tag=…`).
- **Lessons-learned** tabbed by role (dev manager / tech lead / educator).
- **Goals**, **"get to me"**, **Calendar / the grind**, **biggest-challenge note**,
  **why I love educating**, **knowledge-sharing**.

## Experience notes (blog-style, the user's own voice + photos)

- [ ] **Career Team** — building AI "personalities" out of the top 2 tech leads for code reviews;
      talks given representing the company. *(Company name: "Career Team".)*
- [ ] **PH Live** — made myself CTO, built the team + platform; the hard exit (**neutral, no names,
      lessons-forward**); show the platform (was publicly available, so fine to show).
- [ ] **Educator** — the classes taught; the platform built to make teaching easier (link it);
      talks; thesis paneling + advising; **4 semesters × ~120 students**; *why* (not for money —
      unpaid); the master's story (wanted an MBA, too expensive → chose **cybersecurity**: initially
      not the draw, but it's the elusive-to-me piece, has lots of depth, and aligns with the goal of
      being a **systems architect**).
- [ ] **The business I tried and failed to start** — lessons learned.
- [ ] **TaskForce** — marketing-manager era (with photos).
- [ ] **Family resort** — why I shifted careers.
- [ ] **Toroclous** — first job; recruited in 3rd year, before graduation.
- [ ] **Best thesis** award.
- [ ] **Org president**.
- [ ] **Technical projects** — GRAIN, BATCH, the CMS, etc.
- [ ] **People I worked with** — what they contributed, LinkedIn links (e.g. PH Live CEO Robert).

## Standalone sections

- [x] **Origin story** — how the project happened: never finding "the thing" → stable job leaves room
      to build for myself → INTROWEB teaching accident + Coding2GO rekindles native HTML/CSS → "AI that
      manages me" (Project) → BATCH (no-build) → GRAIN (design system) → portfolio + static
      export → MILL. **DRAFT** in the user's voice at `notes/origin-story.md`; needs the user's
      voice/edits + photos. (Personal blog-style companion to the technical-projects note.)
- [ ] **Lessons learned** (tabs): *as a dev manager / tech lead / educator* — e.g. trust the people
      you hire · learn the fundamentals · never stop learning · do what you love.
- [ ] **Goals**: CTO of a proper (non-startup) company · CEO · start my own business.
- [ ] **Calendar / the grind**: ~16h/day (full-time job + educating + master's); tagline ≈ *grind now
      so I can relax by 30; pushing myself; titles to my name*.
- [ ] **Biggest challenge**: time & energy management — love the work; no margin for error (illness /
      low mood → dominoes); at the limit of stretch; grateful to enjoy it. *(Honest, first-person.)*
- [ ] **Why I love educating.**
- [ ] **Knowledge sharing**: books / YouTube channels / sites I rate — and *why* / how they shaped me.

## White paper

- [x] **GRAIN + BATCH whitepaper — DRAFT written** at `notes/whitepaper-one-vocabulary.md`
      ("One Vocabulary, Two Operators"), a research-doc *projection* of `PHILOSOPHY.md` with cited
      sources (AG-UI/MCP-UI/MCP Apps, GUI-agent surveys, Anthropic Computer Use, WebArena/OSWorld,
      Horvitz, Lieberman, Signifiers/HATEOAS, C2PA, Carbon for AI). To be linked from `/grain`.
      **TODO** (draft §8): (1) 2nd verified research pass on provenance / generative-UI / accessibility /
      intent-based clusters; (2) dedicated prior-art search for the exact novelty; (3) user-study design
      for the two benefit claims; (4) the user's voice/edits. See memory `whitepaper-draft-and-positioning`.

## Open follow-ups

- SEO **+ AEO/AIEO**: research concrete wins for the statically-served pages — the stack is
  machine-readable by design, so being AI-operable ≈ being AI-answerable (memory `seo-aeo-first-class`).
- Reconcile `PLAN.md` "rendering in the live app" with the CMS-as-separate-project decision.
- **MILL must render `mermaid` code blocks to inline SVG at render/export time** (server-side, no client
  JS) — the whitepaper (`notes/whitepaper-one-vocabulary.md`) uses Mermaid diagrams, and served pages
  must stay zero-framework-JS to honor the no-build thesis (Mermaid source in the `.md`, static SVG on the wire).
- **Framework comparison / Evaluation** (public proof of native-first + no-build): same reference app
  across htmx / Astro / Next.js, measured by a multi-target `bun run audit`; lead with client-JS-shipped
  + no-build + deps (categorical), corroborate with perf numbers, publish the bench repo, state where
  others win. Becomes the whitepaper's Evaluation section (memory `framework-comparison-methodology`).
