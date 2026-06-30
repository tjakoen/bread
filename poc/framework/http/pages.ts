// /framework/http/pages.ts — page routing over makeStatic.
//   A page is a flat file; folders only group a page with its subpages.
//     /                 → pages/index.html        (entrance)
//     /home             → pages/home.html         (flat page)
//     /profile          → pages/profile/index.html (folder: a page WITH subpages)
//     /profile/settings → pages/profile/settings.html
//     /home/x.js        → pages/home/x.js          (co-located asset, served as-is)
//
// A page's .html is run through the composition engine (renderPage) so pages can
// COMPOSE atomic component tags (<b-button>, <app-header>, …) instead of raw markup.
import { extname, join } from "path";
import type { Runtime } from "../platform/runtime.ts";
import { makeStatic } from "./static.ts";

type RenderPage = (html: string) => Promise<string>;

// `injectBeforeBodyEnd` is appended before </body> on EVERY rendered page — the seam
// for global, platform-wide assets (e.g. the command-palette island). Generic: the
// composition root decides what goes in it.
export function makePageServer(rt: Runtime, pagesRoot: string, renderPage?: RenderPage, injectBeforeBodyEnd = "") {
  const serve = makeStatic(rt, pagesRoot);    // traversal guard applies under pagesRoot
  return async (pathname: string): Promise<Response> => {
    const isPage = !extname(pathname);
    let rel = pathname;
    if (isPage) {
      if (pathname === "/") {
        rel = "/index.html";
      } else {
        const clean = pathname.replace(/\/$/, "");
        const flat = `${clean}.html`;                                   // /home → /home.html
        // never probe outside the pages root with a traversal path; let serve() 403 it
        rel = (!clean.includes("..") && await rt.fileExists(join(pagesRoot, flat)))
          ? flat : `${clean}/index.html`;
      }
    }
    const res = await serve(rel);
    // expand component tags in page HTML; assets (.js/.css/…) pass through
    if (isPage && renderPage && res.status === 200) {
      let out = await renderPage(await res.text());
      if (injectBeforeBodyEnd && out.includes("</body>")) out = out.replace("</body>", injectBeforeBodyEnd + "</body>");
      return new Response(out, { headers: res.headers });
    }
    return res;
  };
}
