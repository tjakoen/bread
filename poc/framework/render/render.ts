// /framework/render/render.ts — generic composition engine (createRenderer)
import { readdirSync } from "fs";
import { join } from "path";

export type MissingMode = "ignore" | "warn" | "throw";
export interface RenderConfig { componentsDir: string; missing: MissingMode; }

interface Resolved { found: boolean; value: unknown; }
function resolvePath(obj: any, path: string): Resolved {
  if (path === "" || path === ".") return { found: true, value: obj };  // self: the scope itself
  let cur = obj;
  for (const key of path.split(".")) {
    if (cur == null || !Object.hasOwn(Object(cur), key)) return { found: false, value: undefined };
    cur = cur[key];                            // own-prop only: no __proto__/constructor reach
  }
  return { found: true, value: cur };          // found:true even when value is null
}
function format(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();   // deterministic across host locale/tz
  return String(v);
}

// Attributes whose VALUE is a URL — a data-driven `javascript:` / `data:` scheme
// is an XSS vector that HTML-quote-escaping does NOT neutralize. Block it.
const URL_ATTRS = new Set([
  "href", "src", "action", "formaction", "xlink:href", "poster", "background", "ping",
  "hx-get", "hx-post", "hx-put", "hx-patch", "hx-delete",   // htmx request targets are URLs too
]);
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|\?)/i;
function safeAttr(attr: string, value: string): string {
  if (!URL_ATTRS.has(attr.toLowerCase())) return value;
  const trimmed = value.trim();
  if (trimmed === "" || SAFE_URL.test(trimmed)) return value;
  return "";   // unknown/unsafe scheme (javascript:, data:, vbscript:, …) → drop
}

export function createRenderer(config: RenderConfig) {
  const registry = new Map<string, string>();
  const cache = new Map<string, { html: string; bindAttrs: string[] }>();
  let names: string[] = [];
  let selfCloseRe: RegExp | null = null;   // rebuilt on refresh() (names change only then)

  function discover(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) discover(full);
      else if (e.name.endsWith(".html")) {
        const n = e.name.slice(0, -5);
        if (n.includes("-")) registry.set(n, full);   // hyphenated = component
      }
    }
  }
  function refresh() {
    registry.clear(); cache.clear();
    discover(config.componentsDir);
    names = [...registry.keys()];
    selfCloseRe = names.length ? new RegExp(`<(${names.join("|")})((?:\\s[^>]*?)?)\\s*/>`, "g") : null;
  }

  function onMissing(component: string, path: string) {
    if (config.missing === "ignore") return;
    const msg = `[render] unknown binding "${path}" in <${component}>`;
    if (config.missing === "throw") throw new Error(msg);
    console.warn(msg);
  }
  async function template(name: string): Promise<{ html: string; bindAttrs: string[] }> {
    const hit = cache.get(name);
    if (hit) return hit;
    const path = registry.get(name);
    if (!path) throw new Error(`Component not found: <${name}>`);
    const html = await Bun.file(path).text();          // platform seam
    const bindAttrs = [...new Set([...html.matchAll(/data-bind-([\w-]+)=/g)].map(m => m[1]))];
    const tpl = { html, bindAttrs };
    cache.set(name, tpl);
    return tpl;
  }

  // PASS 0 — resolve config props (literal attrs a component was used with).
  function applyProps(html: string, props: Record<string, string>): string {
    const slot = html.match(/<slot-tag\b[^>]*?\bprop-as="([^"]*)"/);
    if (slot) {
      const tag = (props["as"] ?? slot[1] ?? "span").replace(/[^a-zA-Z0-9-]/g, "");
      html = html.replace(/<slot-tag\b/g, `<${tag}`)
                 .replace(/<\/slot-tag>/g, `</${tag}>`)
                 .replace(/\sprop-as="[^"]*"/g, "");
    }
    return html.replace(/\sprop-attr-([\w-]+)="([^"]*)"/g, (_m, attr, propName) => {
      const v = props[propName];
      if (v == null) return "";                       // prop not supplied → drop the attribute
      if (v === "") return ` ${attr}`;                // bare boolean attr (e.g. `required`)
      return ` ${attr}="${v.replace(/"/g, "&quot;")}"`;
    });
  }

  // HTML forbids self-closing custom elements (`<b-input />` is parsed as an
  // UNCLOSED tag that swallows its siblings). Normalize self-closing component
  // tags to an explicit open/close so authors can write `<b-input />`.
  function expandSelfClosing(html: string): string {
    if (!selfCloseRe) return html;
    selfCloseRe.lastIndex = 0;                          // reset shared global regex
    return html.replace(selfCloseRe, (_m, tag, attrs) => `<${tag}${attrs}></${tag}>`);
  }

  // The core two-pass transform — shared by render() (a registered component) and
  // renderPage() (an arbitrary HTML document that may contain component tags).
  async function transform(
    rawTpl: string, data: any, props: Record<string, string>, name: string, bindAttrs: string[],
  ): Promise<string> {
    const tpl = expandSelfClosing(rawTpl);
    const r = (p: string) => resolvePath(data, p);

    // PASS 1 — text via data-field, literal text via prop-text, attributes via data-bind-<attr>.
    let rw = new HTMLRewriter().on("[prop-text]", {
      element(el) {
        const propName = el.getAttribute("prop-text")!;
        el.removeAttribute("prop-text");
        const v = props[propName];
        if (v != null) el.setInnerContent(v);          // literal prop → escaped text content
      },
    }).on("[data-field]", {
      element(el) {
        const path = el.getAttribute("data-field")!;
        const res = r(path);
        if (!res.found) onMissing(name, path);
        el.setInnerContent(format(res.value));
      },
    });
    for (const attr of bindAttrs) {
      rw = rw.on(`[data-bind-${attr}]`, {
        element(el) {
          const path = el.getAttribute(`data-bind-${attr}`)!;
          const res = r(path);
          if (!res.found) onMissing(name, path);
          const v = safeAttr(attr, format(res.value));   // scheme guard for URL attrs
          // empty/absent value → omit the attribute entirely (e.g. no inert hx-post="")
          if (v !== "") el.setAttribute(attr, v);
        },
      });
    }
    let html = await rw.transform(new Response(tpl)).text();

    // PASS 2 — expand every known component tag.
    const jobs: Array<Promise<string>> = [];
    let rw2 = new HTMLRewriter();
    for (const comp of names) {
      rw2 = rw2.on(comp, {
        element(el) {
          const eachPath = el.getAttribute("each");
          const dataPath = el.getAttribute("data");
          const childProps: Record<string, string> = {};
          for (const [n, v] of el.attributes) if (n !== "each" && n !== "data") childProps[n] = v;
          const idx = jobs.length;
          if (eachPath != null) {
            const eachRes = r(eachPath);
            if (!eachRes.found) onMissing(name, eachPath);     // typo'd each= is a dev signal, not silent ""
            const arr = eachRes.value;
            jobs.push(Array.isArray(arr)
              ? Promise.all(arr.map(d => render(comp, d, childProps))).then(a => a.join(""))
              : Promise.resolve(""));                          // found-but-null/empty → intentional blank
          } else {
            const slice = dataPath != null ? r(dataPath).value : data;
            jobs.push(render(comp, slice, childProps));
          }
          el.replace(`<!--slot:${idx}-->`, { html: true });
        },
      });
    }
    html = await rw2.transform(new Response(html)).text();
    const parts = await Promise.all(jobs);
    // function replacement: child HTML may contain $& / $` / $' / $$ — a string
    // replacement would treat those as patterns and corrupt the output.
    parts.forEach((p, i) => { html = html.replace(`<!--slot:${i}-->`, () => p); });
    return html;
  }

  async function render(name: string, data: any, props: Record<string, string> = {}): Promise<string> {
    const { html: rawTpl, bindAttrs } = await template(name);
    const tpl = applyProps(rawTpl, props);             // PASS 0 — config
    return transform(tpl, data, props, name, bindAttrs);
  }

  // Render an arbitrary HTML document (a page), expanding any component tags it
  // contains. Pages carry no props of their own; component tags inside supply theirs.
  async function renderPage(html: string, data: any = {}): Promise<string> {
    const bindAttrs = [...new Set([...html.matchAll(/data-bind-([\w-]+)=/g)].map(m => m[1]))];
    return transform(html, data, {}, "page", bindAttrs);
  }

  refresh();
  return { render, renderPage, refresh };
}
