// /framework/http/sitemap.ts — derive the site's page routes from the pages/ tree.
// One source of truth, reused three ways: the catalog's Pages nav, /sitemap.xml,
// and /robots.txt. Mirrors the page-routing convention in pages.ts.
import { readdirSync } from "fs";
import { join, relative, sep } from "path";

export function createSitemap(pagesRoot: string) {
  let cache: string[] | null = null;

  function walk(dir: string, out: string[]) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (e.name.endsWith(".html")) out.push(full);
    }
  }

  // file path → clean route:  index.html → "/",  home.html → "/home",
  //                           profile/index.html → "/profile",  profile/settings.html → "/profile/settings"
  function routes(): string[] {
    if (cache) return cache;
    const files: string[] = [];
    walk(pagesRoot, files);
    const set = new Set(
      files.map(f => {
        let r = "/" + relative(pagesRoot, f).split(sep).join("/");
        r = r.replace(/\.html$/, "").replace(/\/index$/, "");
        return r === "" ? "/" : r;
      }),
    );
    cache = [...set].sort();
    return cache;
  }

  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  function xml(origin: string): string {
    const urls = routes().map(p => `  <url><loc>${escXml(origin + p)}</loc></url>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  }

  function refresh() { cache = null; }
  return { routes, xml, refresh };
}
