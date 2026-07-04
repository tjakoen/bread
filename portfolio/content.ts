// portfolio/content.ts — piece 4: the portfolio's MILL wiring (consumer-owned).
//
// Three collections flow through MILL's live content route (mill/serve.ts):
//   /notes       + /notes/:slug   ← portfolio/notes/*.md   (the portfolio's own content)
//   /grain/docs  + /grain/docs/:slug ← the INSTALLED @tjakoen/grain package's docs/
//   /batch/docs  + /batch/docs/:slug ← the INSTALLED @tjakoen/batch package's docs/
//
// Layer docs are package-resolved on purpose (packageDocsSource → import.meta.resolve):
// in the monorepo that lands on the sibling grain/docs/, post-split on the git-dep —
// same code both eras, zero copied files. NEVER a `../grain/docs` relative path
// (../SPLIT-PLAN.md § "Layer docs travel inside the package").
//
// The chrome wraps every content page in the BREAD workspace shell (portfolio-frame);
// the injected renderPage composes that tag — and any escape-hatch <b-…> tags an author
// wrote in the Markdown — at request time.
import {
  createMillRoutes, dirSource, packageDocsSource,
  type MillRequestHandler, type PageChrome,
} from "../mill/serve.ts";
import { escapeHtml } from "../mill/core/engine.ts";

// ---- link resolution --------------------------------------------------------
// Docs cross-link each other as relative .md paths (./AI-INTERFACE.md,
// ../../batch/docs/ARCHITECTURE.md). Rewrite the ones we render; leave the rest
// (README/PHILOSOPHY/plan files have no rendered page — the export's dead-link
// warning keeps us honest about those).
const mdSlug = (file: string) => file.replace(/\.md$/, "").toLowerCase();

function docsLink(currentPrefix: string) {
  return (href: string): string => {
    const [path, frag = ""] = href.split(/(#.*)$/, 2);
    const cross = path.match(/(?:^|\/)(grain|batch)\/docs\/([A-Za-z0-9._-]+)\.md$/);
    if (cross) return `/${cross[1]}/docs/${mdSlug(cross[2])}${frag}`;
    const local = path.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
    if (local) return `${currentPrefix}/${mdSlug(local[1])}${frag}`;
    return href;
  };
}

// Notes link to each other as bare siblings (why-i-teach.md) or note:slug (MILL's default).
function notesLink(href: string): string {
  if (href.startsWith("note:")) return "/notes/" + href.slice(5);
  const [path, frag = ""] = href.split(/(#.*)$/, 2);
  const local = path.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
  if (local) return `/notes/${mdSlug(local[1])}${frag}`;
  return href;
}

// ---- the BREAD-shell chrome ---------------------------------------------------
// Mirrors the hand-written portfolio pages (pages/mill/index.html): same head, same
// app-shell + portfolio-frame skeleton, so content pages ARE portfolio pages.
function shellChrome(inject: string): PageChrome {
  return ({ title, description, body, collection }) => {
    const screen = collection.prefix.split("/")[1] ?? "notes";   // /notes → notes, /grain/docs → grain
    const section = collection.prefix === "/grain/docs" ? ` data-section="grain"` : "";
    return `<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ""}
  <link rel="stylesheet" href="/styles/variables.css">
  <link rel="stylesheet" href="/styles/global.css">
  <link rel="stylesheet" href="/styles/grain.css">
  <link rel="stylesheet" href="/components.css">
  <script src="/scripts/shell.js" defer></script>
  <script type="module" src="/scripts/ai-dispatch.js"></script>
</head>
<body data-screen="${escapeHtml(screen)}">
  <div class="app-shell"${section} data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main">
      <div class="board">${body}</div>
    </main>
  </div>
${inject}</body>
</html>`;
  };
}

/**
 * The portfolio's content routes, ready to mount at the composition root:
 *   const serveContent = createPortfolioContentRoutes(renderPage, GLOBAL_ASSETS);
 *   …in fetch(): const hit = await serveContent(pathname); if (hit) return hit;
 */
export function createPortfolioContentRoutes(
  compose?: (html: string) => Promise<string>,
  inject = "",
): MillRequestHandler {
  return createMillRoutes({
    compose,
    chrome: shellChrome(inject),
    collections: [
      {
        prefix: "/notes",
        title: "Notes",
        description: "Long-form notes — how this stack got built, how I teach, and what broke along the way.",
        source: dirSource("portfolio/notes"),
        adapter: { resolveLink: notesLink },
      },
      {
        prefix: "/grain/docs",
        title: "GRAIN docs",
        description: "The GRAIN design system's own docs, rendered from the installed package — never copied.",
        source: packageDocsSource("@tjakoen/grain/docs/GRAIN.md"),
        adapter: { resolveLink: docsLink("/grain/docs") },
      },
      {
        prefix: "/batch/docs",
        title: "BATCH docs",
        description: "The BATCH substrate's own docs, rendered from the installed package — never copied.",
        source: packageDocsSource("@tjakoen/batch/docs/ARCHITECTURE.md"),
        adapter: { resolveLink: docsLink("/batch/docs") },
      },
    ],
  });
}
