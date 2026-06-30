// /framework/catalog/catalog.ts — a no-build "component catalog" (Storybook-style).
// Each component is documented by `<name>.md` (the Human view); an optional
// `<name>.ai.md` adds the AI view. A per-component Human/AI toggle swaps which view
// renders (not just its styling). The sidebar groups components by atomic-design
// layer (the directory under components/) as collapsible dropdowns, with a live
// search filter. Dependency-free: a tiny line parser, no markdown library, no CDN.
import { readdirSync } from "fs";
import { join } from "path";

interface Panel { label: string; code: string; }
interface Group { label: string; panels: Panel[]; }
interface Doc { name: string; slug: string; intro: string; groups: Group[]; }
interface Component { layer: string; slug: string; name: string; human: Doc; ai: Doc | null; }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// minimal inline markdown for prose: `code`, **bold**, *italic*, [text](url).
// Escapes first, then injects safe tags — author-controlled docs only.
const inline = (s: string) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*|#[^)]*)\)/g, '<a href="$2">$1</a>');

// atomic-design layers render in this order; unknown dirs fall to the end.
const LAYER_ORDER = ["atoms", "molecules", "organisms"];
const rank = (layer: string) => { const i = LAYER_ORDER.indexOf(layer); return i < 0 ? 99 : i; };

// minimal markdown: # title, ## group, ### panel, ```html fences, plain prose.
function parseDoc(md: string): Doc {
  const lines = md.split("\n");
  const doc: Doc = { name: "Untitled", slug: "untitled", intro: "", groups: [] };
  let group: Group | null = null;
  let pendingLabel = "";
  const intro: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# ")) { doc.name = line.slice(2).trim(); doc.slug = slugify(doc.name); i++; continue; }
    if (line.startsWith("## ")) { group = { label: line.slice(3).trim(), panels: [] }; doc.groups.push(group); pendingLabel = ""; i++; continue; }
    if (line.startsWith("### ")) { pendingLabel = line.slice(4).trim(); i++; continue; }
    if (line.startsWith("```html")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { body.push(lines[i]); i++; }
      i++; // skip closing fence
      if (!group) { group = { label: "", panels: [] }; doc.groups.push(group); }
      group.panels.push({ label: pendingLabel, code: body.join("\n").trim() });
      continue;
    }
    if (!group && line.trim()) intro.push(line.trim());
    i++;
  }
  doc.intro = intro.join(" ");
  return doc;
}

interface Sitemap { routes(): string[]; }

export function createCatalog(componentsDir: string, sitemap?: Sitemap) {
  let cache: string | null = null;
  let comps: Component[] | null = null;

  function findMd(dir: string, out: string[]) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) findMd(full, out);
      else if (e.name.endsWith(".md")) out.push(full);
    }
  }

  // Discover components per layer, pairing <name>.md (human) with <name>.ai.md (ai).
  async function discover(): Promise<Component[]> {
    const comps: Component[] = [];
    const layers = readdirSync(componentsDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
    for (const layer of layers) {
      const mds: string[] = [];
      findMd(join(componentsDir, layer), mds);
      const byBase = new Map<string, { human?: string; ai?: string }>();
      for (const p of mds) {
        const file = p.split(/[\\/]/).pop() ?? "";
        const isAi = file.endsWith(".ai.md");
        const base = file.replace(/\.ai\.md$/, "").replace(/\.md$/, "");
        const slot = byBase.get(base) ?? {};
        if (isAi) slot.ai = p; else slot.human = p;
        byBase.set(base, slot);
      }
      for (const slot of byBase.values()) {
        if (!slot.human) continue;   // a component must have a human doc as its base
        const human = parseDoc(await Bun.file(slot.human).text());
        const ai = slot.ai ? parseDoc(await Bun.file(slot.ai).text()) : null;
        comps.push({ layer, slug: human.slug, name: human.name, human, ai });
      }
    }
    comps.sort((a, b) => (rank(a.layer) - rank(b.layer)) || a.name.localeCompare(b.name));
    return comps;
  }

  const getComps = async (): Promise<Component[]> => (comps ??= await discover());

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

  const renderGroups = (groups: Group[]) => groups.map(g => `
    ${g.label ? `<h3 class="cat-group">${esc(g.label)}</h3>` : ""}
    <div class="panel-grid">${g.panels.map(renderPanel).join("")}</div>`).join("");

  const renderView = (doc: Doc, view: "smooth" | "grain") => `<div class="cat-doc__view" data-view="${view}">
    ${doc.intro ? `<p class="cat-intro">${inline(doc.intro)}</p>` : ""}
    ${renderGroups(doc.groups)}
  </div>`;

  function renderDoc(c: Component): string {
    const ai = c.ai ?? c.human;   // no .ai.md → AI view re-uses the human panels, grain-flipped
    return `<section class="cat-doc" id="${c.slug}" data-grade="smooth" data-layer="${c.layer}">
      <header class="cat-doc__head">
        <h2>${esc(c.name)}</h2>
        <div class="grade-toggle" role="group" aria-label="Interaction mode for ${esc(c.name)}">
          <button type="button" class="grade-toggle__btn is-on" data-grade-set="smooth">Human</button>
          <button type="button" class="grade-toggle__btn" data-grade-set="grain">AI</button>
        </div>
      </header>
      ${renderView(c.human, "smooth")}
      ${renderView(ai, "grain")}
    </section>`;
  }

  // a flat list of components for external indexes (e.g. global search)
  async function entries(): Promise<Array<{ name: string; slug: string; layer: string }>> {
    return (await getComps()).map((c) => ({ name: c.name, slug: c.slug, layer: c.layer }));
  }

  async function html(): Promise<string> {
    if (cache != null) return cache;
    const list = await getComps();

    const byLayer = new Map<string, Component[]>();
    for (const c of list) { if (!byLayer.has(c.layer)) byLayer.set(c.layer, []); byLayer.get(c.layer)!.push(c); }
    const navGroups = [...byLayer.entries()].map(([layer, list]) => `
      <details class="cat-nav__group" open>
        <summary>${esc(cap(layer))}</summary>
        ${list.map(c => `<a href="#${c.slug}" data-name="${esc(c.name.toLowerCase())}">${esc(c.name)}</a>`).join("")}
      </details>`).join("");

    const pageNav = (sitemap?.routes() ?? []).map(p => `<a href="${p}">${esc(p)}</a>`).join("");
    const main = list.length ? list.map(renderDoc).join("") : `<p>No <code>.md</code> docs found under the components dir.</p>`;

    cache = page(pageNav, navGroups, main);
    return cache;
  }

  function refresh() { cache = null; comps = null; }
  return { html, entries, refresh };
}

// the catalog shell — links the real design-system CSS so examples render for real
function page(pageNav: string, navGroups: string, main: string): string {
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
  .cat { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
  .cat-nav { position: sticky; top: 0; align-self: start; height: 100vh; overflow: auto;
    padding: var(--space-6) var(--space-4); border-right: 1px solid var(--color-line); }
  .cat-nav h1 { font-size: var(--text-lg); margin: 0 0 var(--space-3); }
  .cat-search { width: 100%; box-sizing: border-box; margin-bottom: var(--space-4);
    padding: var(--space-1) var(--space-2); font-family: var(--font-smooth); font-size: var(--text-sm);
    color: var(--ink); background: transparent; border: 1px solid var(--ink); border-radius: var(--radius-sm); }
  .cat-search::placeholder { color: var(--ink-faint); }
  .cat-nav__heading { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--color-muted); margin: var(--space-4) 0 var(--space-1); }
  .cat-nav__group { margin-bottom: var(--space-2); }
  .cat-nav__group > summary { cursor: pointer; list-style: none; padding: var(--space-1) 0;
    font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-muted); }
  .cat-nav__group > summary::-webkit-details-marker { display: none; }
  .cat-nav__group > summary::before { content: "▸ "; }
  .cat-nav__group[open] > summary::before { content: "▾ "; }
  .cat-nav a { display: block; color: var(--color-muted); text-decoration: none; padding: var(--space-1) 0; }
  .cat-nav a:hover { color: var(--ink); text-decoration: underline; }
  .cat-main { padding: var(--space-8); max-width: 900px; }
  .cat-doc { margin-bottom: var(--space-8); scroll-margin-top: var(--space-4); }
  .cat-doc h2 { font-size: var(--text-2xl); margin: 0 0 var(--space-2); }
  .cat-doc__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
  .grade-toggle { display: inline-flex; border: 1px solid var(--ink); border-radius: var(--radius-sm); overflow: hidden; }
  .grade-toggle__btn { font-family: var(--font-smooth); font-size: var(--text-xs); text-transform: uppercase;
    letter-spacing: 0.08em; padding: var(--space-1) var(--space-3); cursor: pointer;
    background: transparent; color: var(--ink); border: 0; }
  .grade-toggle__btn.is-on { background: var(--ink); color: var(--paper); }
  /* Human/AI: show exactly one view, chosen by the section's data-grade */
  .cat-doc__view[data-view="grain"] { display: none; }
  .cat-doc[data-grade="grain"] .cat-doc__view[data-view="smooth"] { display: none; }
  .cat-doc[data-grade="grain"] .cat-doc__view[data-view="grain"] { display: block; }
  /* the toggle re-grades only the rendered component PREVIEWS — never the catalog's
     own chrome (titles, prose, labels, code). Neutralise the section-wide grain that
     the global [data-grade] rule would cascade, then re-apply grain to .panel__live. */
  .cat-doc[data-grade="grain"] { --type-font: var(--font-smooth); }
  .cat-doc__view[data-view="grain"] .panel__live { --type-font: var(--font-grain); }
  .cat-intro { color: var(--color-muted); margin: 0 0 var(--space-6); }
  .cat-intro code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.88em;
    background: var(--paper-2); padding: 0 0.3em; border-radius: 2px; color: var(--ink); }
  .cat-intro strong { color: var(--ink); font-weight: var(--font-weight-semibold); }
  .cat-intro a { color: var(--ink); }
  .cat-group { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--color-muted); margin: var(--space-6) 0 var(--space-3); }
  .panel-grid { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .panel { margin: 0; border: 1px solid var(--color-line); border-radius: var(--radius-md);
    overflow: hidden; background: var(--color-surface); }
  .panel__label { font-size: var(--text-xs); font-weight: var(--font-weight-semibold);
    text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted);
    padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-line); }
  .panel__live { padding: var(--space-6); display: flex; align-items: center; justify-content: center; background: var(--color-bg); }
  .panel__src { position: relative; border-top: 1px solid var(--color-line); }
  .panel__src pre { margin: 0; padding: var(--space-3); overflow-x: auto;
    font-size: var(--text-xs); line-height: var(--leading-normal); background: var(--ink); color: var(--paper); }
  .panel__copy { position: absolute; top: var(--space-2); right: var(--space-2);
    font-size: var(--text-xs); padding: var(--space-1) var(--space-2); cursor: pointer;
    border: 1px solid var(--color-line); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-fg); }
  .panel__copy.copied { border-color: var(--ink); }
</style>
</head>
<body>
  <div class="cat">
    <aside class="cat-nav">
      <h1>Catalog</h1>
      <input class="cat-search" type="search" placeholder="Search components…" aria-label="Search components">
      <p class="cat-nav__heading">Pages</p>
      ${pageNav}
      <p class="cat-nav__heading">Components</p>
      ${navGroups}
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

    // Human/AI toggle: set data-grade on the component's section → swaps the visible view.
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".grade-toggle__btn");
      if (!b) return;
      const doc = b.closest(".cat-doc");
      if (!doc) return;
      doc.setAttribute("data-grade", b.dataset.gradeSet);
      doc.querySelectorAll(".grade-toggle__btn").forEach((x) => x.classList.toggle("is-on", x === b));
    });

    // sidebar search: filter component links; hide empty groups; open groups while searching.
    const search = document.querySelector(".cat-search");
    if (search) search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll(".cat-nav__group").forEach((group) => {
        let any = false;
        group.querySelectorAll("a").forEach((a) => {
          const hit = !q || (a.dataset.name || "").includes(q);
          a.style.display = hit ? "" : "none";
          if (hit) any = true;
        });
        group.style.display = any ? "" : "none";
        if (q) group.open = true;
      });
    });
  </script>
  <script src="/scripts/cmdk.js" defer></script>
</body>
</html>`;
}
