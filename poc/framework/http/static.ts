// /framework/http/static.ts — generic static serving; root is INJECTED
import type { Runtime } from "../platform/runtime.ts";
import { join, normalize, resolve, sep } from "path";

export function makeStatic(rt: Runtime, root: string) {
  const ROOT = resolve(root);                            // absolute → traversal guard is reliable
  return async (pathname: string): Promise<Response> => {
    const rel = pathname === "/" ? "/index.html" : pathname;
    const path = resolve(normalize(join(ROOT, rel)));
    // separator-aware containment: "/p/frontend-secret" must NOT pass for ROOT "/p/frontend"
    if (path !== ROOT && !path.startsWith(ROOT + sep)) return new Response("Forbidden", { status: 403 });
    if (!(await rt.fileExists(path))) return new Response("Not found", { status: 404 });
    const type = path.endsWith(".css") ? "text/css"
      : path.endsWith(".js") ? "text/javascript"
      : path.endsWith(".woff2") ? "font/woff2"
      : path.endsWith(".woff") ? "font/woff"
      : path.endsWith(".svg") ? "image/svg+xml"
      : "text/html";
    return new Response(await rt.readFile(path), { headers: { "Content-Type": type } });
  };
}
