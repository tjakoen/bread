// /server.ts — the ONLY place /framework and /app meet
import { config } from "./app/config.ts";
import { bunRuntime } from "./framework/platform/bun-runtime.ts";
import { watchComponents } from "./framework/platform/watch.ts";
import { makeStatic } from "./framework/http/static.ts";
import { makePageServer } from "./framework/http/pages.ts";
import { createSitemap } from "./framework/http/sitemap.ts";
import { createStyleBundle } from "./framework/assets/style-bundle.ts";
import { createCatalog } from "./framework/catalog/catalog.ts";
import { InMemoryItemRepository } from "./app/data/in-memory-item-repository.ts";
import { ItemService } from "./app/services/item-service.ts";
import { renderPage, refresh } from "./app/view/renderer.ts";
import { buildRoutes } from "./app/routes/routes.ts";
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
const servePage = makePageServer(bunRuntime, config.pagesDir, renderPage);   // folder-per-page tree, rendered through the engine
const styles = createStyleBundle(config.componentsDir);          // co-located component CSS → one bundle
const sitemap = createSitemap(config.pagesDir);                 // page routes from the pages/ tree
const catalog = createCatalog(config.componentsDir, sitemap);   // co-located .md docs + page sitemap → /catalog

// hot reload drops component-derived caches; a page edit refreshes the sitemap + catalog
if (config.hotReload) {
  watchComponents(config.componentsDir, () => { refresh(); styles.refresh(); catalog.refresh(); });
  watchComponents(config.pagesDir, () => { sitemap.refresh(); catalog.refresh(); });
}

Bun.serve({
  port: config.port,
  routes: {
    ...buildRoutes(service),                         // native router (path params, methods)
    // one bundle of every component's co-located .css (design-system styles are static in /styles)
    "/components.css": async () =>
      new Response(await styles.css(), { headers: { "Content-Type": "text/css" } }),
    // the component catalog, generated from co-located .md docs + the page sitemap (§13a)
    "/catalog": async () =>
      new Response(await catalog.html(), { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    // SEO: one sitemap from the pages/ tree, plus robots pointing at it
    "/sitemap.xml": (req: Request) =>
      new Response(sitemap.xml(new URL(req.url).origin), { headers: { "Content-Type": "application/xml" } }),
    "/robots.txt": (req: Request) =>
      new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(req.url).origin}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain" } }),
  },
  fetch(req) {
    const p = new URL(req.url).pathname;
    // global assets live at the frontend root; everything else is a page (or its co-located asset)
    if (p.startsWith("/styles/") || p.startsWith("/vendor/")) return serveAsset(p);
    return servePage(p);
  },
});

console.log(`Running on http://localhost:${config.port} (${config.isDev ? "dev" : "prod"})`);
