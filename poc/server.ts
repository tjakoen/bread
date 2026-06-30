// /server.ts — the ONLY place /framework and /app meet
import { join, normalize, resolve, sep } from "path";
import { config } from "./app/config.ts";
import { bunRuntime } from "./framework/platform/bun-runtime.ts";
import { watchComponents } from "./framework/platform/watch.ts";
import { makeStatic } from "./framework/http/static.ts";
import { makePageServer } from "./framework/http/pages.ts";
import { createSitemap } from "./framework/http/sitemap.ts";
import { createStyleBundle } from "./framework/assets/style-bundle.ts";
import { createCatalog } from "./framework/catalog/catalog.ts";
import { createStream } from "./framework/http/stream.ts";
import { createAccepts } from "./framework/render/accepts.ts";
import { InMemoryItemRepository } from "./app/data/in-memory-item-repository.ts";
import { ItemService } from "./app/services/item-service.ts";
import { renderPage, refresh } from "./app/view/renderer.ts";
import { buildRoutes } from "./app/routes/routes.ts";
import { buildAiRoutes } from "./app/routes/ai-routes.ts";
import { makeStubReasoner } from "./app/ai/reasoner.ts";
import { createInteractionLayer } from "./app/ai/interaction-layer.ts";
import { LoopCard } from "./app/view/components.ts";
import { toLoopCardView } from "./app/services/item-views.ts";
import { surfaceId, ACTIONS, type Surface } from "./app/ai/contract.ts";
import type { Item } from "./app/domain/item.ts";

// --- seed a couple of items so the POC has something to show ---
const seed: Item[] = [
  { id: "ITM-seed-1", name: "Read the architecture", description: "BATCH reference",
    status: "active", createdAt: new Date("2026-06-25"), updatedAt: new Date("2026-06-25") },
  { id: "ITM-seed-2", name: "Ship the POC", description: "in-memory, no build step",
    status: "archived", createdAt: new Date("2026-06-26"), updatedAt: new Date("2026-06-26") },
];

// --- wire the graph here, and ONLY here ---
const repo = new InMemoryItemRepository(seed);      // placeholder storage
const service = new ItemService(repo);
const serveAsset = makeStatic(bunRuntime, config.frontendDir);    // global assets: /styles, /vendor
// global command palette injected on every page (⌘K) — platform-wide search island
const GLOBAL_ASSETS = `<script src="/scripts/cmdk.js" defer></script>`;
const servePage = makePageServer(bunRuntime, config.pagesDir, renderPage, GLOBAL_ASSETS);   // folder-per-page tree, rendered through the engine
const styles = createStyleBundle(config.componentsDir);          // co-located component CSS → one bundle
const sitemap = createSitemap(config.pagesDir);                 // page routes from the pages/ tree
const catalog = createCatalog(config.componentsDir, sitemap);   // co-located .md docs + page sitemap → /catalog
const accepts = createAccepts(config.componentsDir);            // harvest data-kind/data-accepts → AI manifest

// drift guard: every action a component declares must be a real, allowed verb (§4).
for (const [kind, names] of Object.entries(accepts.byKind()))
  for (const n of names)
    if (!Object.hasOwn(ACTIONS, n))
      console.warn(`[accepts] component kind "${kind}" declares unknown action "${n}" (not in ACTIONS)`);

// --- AI interaction layer: the single door (docs/AI-INTERFACE.md) ---
const stream = createStream();                                  // generic per-session SSE push
const reasoner = makeStubReasoner({ failRate: Number(Bun.env.AI_FAIL_RATE ?? 0) });   // stub: AI_FAIL_RATE=1 → rollback
const renderSurface = async (surface: Surface): Promise<string> => {
  const item = await service.getItem(surfaceId(surface));       // committed (clean) fragment for a surface
  return item ? LoopCard(toLoopCardView(item)) : "";
};
const aiLayer = createInteractionLayer({
  reasoner, stream,
  archiveItem: (id) => service.archiveItem(id).then(() => undefined),   // the scoped write capability
  renderSurface,
});

// hot reload drops component-derived caches; a page edit refreshes the sitemap + catalog
if (config.hotReload) {
  watchComponents(config.componentsDir, () => { refresh(); styles.refresh(); catalog.refresh(); accepts.refresh(); });
  watchComponents(config.pagesDir, () => { sitemap.refresh(); catalog.refresh(); });
}

// Binary static (fonts): Bun.file preserves bytes; makeStatic's text read would corrupt woff2.
const FRONTEND_ROOT = resolve(config.frontendDir);
async function serveFont(p: string): Promise<Response> {
  const fp = resolve(normalize(join(FRONTEND_ROOT, p)));
  if (fp !== FRONTEND_ROOT && !fp.startsWith(FRONTEND_ROOT + sep)) return new Response("Forbidden", { status: 403 });
  const file = Bun.file(fp);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  return new Response(file, { headers: { "Content-Type": "font/woff2", "Cache-Control": "public, max-age=31536000, immutable" } });
}

Bun.serve({
  port: config.port,
  routes: {
    ...buildRoutes(service),                         // native router (path params, methods)
    ...buildAiRoutes(service, stream, aiLayer, accepts),   // /intent, /stream, /ai/manifest, /ui/loop
    // one bundle of every component's co-located .css (design-system styles are static in /styles)
    "/components.css": async () =>
      new Response(await styles.css(), { headers: { "Content-Type": "text/css" } }),
    // the component catalog, generated from co-located .md docs + the page sitemap (§13a)
    "/catalog": async () =>
      new Response(await catalog.html(), { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    // SEO: one sitemap from the pages/ tree, plus robots pointing at it
    // global search index (⌘K palette). Pages from the sitemap, components from the
    // catalog — one source each, no drift. Seam for tasks/knowledge/commands later.
    "/search.json": async () => {
      const titleOf = (p: string) => { const s = p === "/" ? "home" : p.replace(/^\//, ""); return s.charAt(0).toUpperCase() + s.slice(1); };
      const pages = sitemap.routes().map((p) => ({ title: titleOf(p), url: p }));
      const components = (await catalog.entries()).map((c) => ({ title: c.name, subtitle: c.layer, url: `/catalog#${c.slug}` }));
      return Response.json({ pages, components });
    },
    "/sitemap.xml": (req: Request) =>
      new Response(sitemap.xml(new URL(req.url).origin), { headers: { "Content-Type": "application/xml" } }),
    "/robots.txt": (req: Request) =>
      new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(req.url).origin}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain" } }),
  },
  fetch(req) {
    const p = new URL(req.url).pathname;
    // global assets live at the frontend root; everything else is a page (or its co-located asset)
    if (p.startsWith("/fonts/")) return serveFont(p);   // binary: bytes preserved (makeStatic reads text)
    if (p.startsWith("/styles/") || p.startsWith("/vendor/") || p.startsWith("/scripts/")) return serveAsset(p);
    return servePage(p);
  },
});

console.log(`Running on http://localhost:${config.port} (${config.isDev ? "dev" : "prod"})`);
