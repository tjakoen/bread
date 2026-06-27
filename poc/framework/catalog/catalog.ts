// /framework/catalog/catalog.ts — a no-build "component catalog" (Storybook-style).
// Reads each component's co-located <name>.md, extracts the ```html fences, and
// builds one page where every documented state renders LIVE and shows copyable
// source. Dependency-free: a tiny line parser, no markdown library, no CDN.
//
// Authoring (stays this simple):
//   1. add the component's CSS to its .css (parallel data-force selectors for pseudo-states)
//   2. add <name>.md next to it: `# Name`, `## Group`, `### Panel`, then an
//      ```html fence per state/variant.
//   3. save, refresh /catalog — it appears with a side-nav entry.
import { readdirSync } from "fs";
import { join } from "path";

interface Panel { label: string; code: string; }
interface Group { label: string; panels: Panel[]; }
interface Doc { name: string; slug: string; intro: string; groups: Group[]; }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// minimal markdown: # title, ## group, ### panel, ```html fences, plain prose.
function parseDoc(md: string): Doc {
  const lines = md.split("\n");
  const doc: Doc = { name: "Untitled", slug: "untitled", intro: "", groups: [] };
  let group: Group | null = null;
  let pendingLabel = "";
  let intro: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      doc.name = line.slice(2).trim();
      doc.slug = slugify(doc.name);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      group = { label: line.slice(3).trim(), panels: [] };
      doc.groups.push(group);
      pendingLabel = "";
      i++; continue;
    }
    if (line.startsWith("### ")) {
      pendingLabel = line.slice(4).trim();
      i++; continue;
    }
    if (line.startsWith("```html")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { body.push(lines[i]); i++; }
      i++; // skip closing fence
      if (!group) { group = { label: "", panels: [] }; doc.groups.push(group); }
      group.panels.push({ label: pendingLabel, code: body.join("\n").trim() });
      continue;
    }
    // prose before the first group becomes the intro
    if (!group && line.trim()) intro.push(line.trim());
    i++;
  }
  doc.intro = intro.join(" ");
  return doc;
}

interface Sitemap { routes(): string[]; }

export function createCatalog(componentsDir: string, sitemap?: Sitemap) {
  let cache: string | null = null;

  function findDocs(dir: string, out: string[]) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) findDocs(full, out);
      else if (e.name.endsWith(".md")) out.push(full);
    }
  }

  function renderPanel(p: Panel): string {
    // live = author-controlled design-system markup (not user data) → inject raw
    return `<figure class="panel">
      ${p.label ? `<figcaption class="panel__label">${esc(p.label)}</figcaption>` : ""}
      <div class="panel__live">${p.code}</div>
      <div class="panel__src">
        <button class="panel__copy" type="button">Copy</button>
        <pre><code>${esc(p.code)}</code></pre>
      </div>
    </figure>`;
  }

  function renderDoc(d: Doc): string {
    const groups = d.groups.map(g => `
      ${g.label ? `<h3 class="cat-group">${esc(g.label)}</h3>` : ""}
      <div class="panel-grid">${g.panels.map(renderPanel).join("")}</div>`).join("");
    return `<section class="cat-doc" id="${d.slug}">
      <h2>${esc(d.name)}</h2>
      ${d.intro ? `<p class="cat-intro">${esc(d.intro)}</p>` : ""}
      ${groups}
    </section>`;
  }

  async function html(): Promise<string> {
    if (cache != null) return cache;
    const files: string[] = [];
    findDocs(componentsDir, files);
    files.sort();
    const docs = (await Promise.all(files.map(f => Bun.file(f).text()))).map(parseDoc);

    const componentNav = docs.map(d => `<a href="#${d.slug}">${esc(d.name)}</a>`).join("");
    const pageNav = (sitemap?.routes() ?? []).map(p => `<a href="${p}">${esc(p)}</a>`).join("");
    const main = docs.length
      ? docs.map(renderDoc).join("")
      : `<p>No <code>.md</code> docs found under the components dir.</p>`;

    cache = page(pageNav, componentNav, main);
    return cache;
  }

  function refresh() { cache = null; }
  return { html, refresh };
}

// the catalog shell — links the real design-system CSS so examples render for real
function page(pageNav: string, componentNav: string, main: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Component Catalog</title>
<link rel="stylesheet" href="/styles/variables.css">
<link rel="stylesheet" href="/styles/global.css">
<link rel="stylesheet" href="/components.css">
<style>
  body { margin: 0; }
  .cat { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
  .cat-nav { position: sticky; top: 0; align-self: start; height: 100vh; overflow: auto;
    padding: var(--space-6) var(--space-4); border-right: 1px solid var(--color-line); }
  .cat-nav h1 { font-size: var(--text-lg); margin: 0 0 var(--space-4); }
  .cat-nav__heading { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--color-muted); margin: var(--space-4) 0 var(--space-1); }
  .cat-nav a { display: block; color: var(--color-muted); text-decoration: none;
    padding: var(--space-1) 0; }
  .cat-nav a:hover { color: var(--color-primary); }
  .cat-main { padding: var(--space-8); max-width: 900px; }
  .cat-doc { margin-bottom: var(--space-8); scroll-margin-top: var(--space-4); }
  .cat-doc h2 { font-size: var(--text-2xl); margin: 0 0 var(--space-2); }
  .cat-intro { color: var(--color-muted); margin: 0 0 var(--space-6); }
  .cat-group { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--color-muted); margin: var(--space-6) 0 var(--space-3); }
  .panel-grid { display: grid; gap: var(--space-4);
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .panel { margin: 0; border: 1px solid var(--color-line); border-radius: var(--radius-md);
    overflow: hidden; background: var(--color-surface); }
  .panel__label { font-size: var(--text-xs); font-weight: var(--font-weight-semibold);
    text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted);
    padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-line); }
  .panel__live { padding: var(--space-6); display: flex; align-items: center; justify-content: center;
    background: var(--color-bg); }
  .panel__src { position: relative; border-top: 1px solid var(--color-line); }
  .panel__src pre { margin: 0; padding: var(--space-3); overflow-x: auto;
    font-size: var(--text-xs); line-height: var(--leading-normal); background: var(--gray-900); color: var(--gray-100); }
  .panel__copy { position: absolute; top: var(--space-2); right: var(--space-2);
    font-size: var(--text-xs); padding: var(--space-1) var(--space-2); cursor: pointer;
    border: 1px solid var(--color-line); border-radius: var(--radius-sm);
    background: var(--color-surface); color: var(--color-fg); }
  .panel__copy.copied { color: var(--color-success); border-color: var(--color-success); }
</style>
</head>
<body>
  <div class="cat">
    <aside class="cat-nav">
      <h1>Catalog</h1>
      <p class="cat-nav__heading">Pages</p>
      ${pageNav}
      <p class="cat-nav__heading">Components</p>
      ${componentNav}
    </aside>
    <main class="cat-main">
      ${main}
    </main>
  </div>
  <script>
    // copy a panel's source to the clipboard (no storage, no deps)
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".panel__copy");
      if (!btn) return;
      const code = btn.parentElement.querySelector("code").textContent;
      try { await navigator.clipboard.writeText(code); } catch {}
      btn.textContent = "Copied"; btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1200);
    });
  </script>
</body>
</html>`;
}
