// /framework/assets/style-bundle.ts — concatenate every component's co-located
// .css into one cached bundle. No build step: read once, cache, refresh on change.
import { readdirSync } from "fs";
import { join } from "path";

export function createStyleBundle(componentsDir: string) {
  let cache: string | null = null;

  function collect(dir: string, out: string[]) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) collect(full, out);
      else if (e.name.endsWith(".css")) out.push(full);
    }
  }

  async function css(): Promise<string> {
    if (cache != null) return cache;
    const files: string[] = [];
    collect(componentsDir, files);
    files.sort();   // deterministic order across hosts
    const parts = await Promise.all(files.map(f =>
      Bun.file(f).text().then(s => `/* ${f} */\n${s}`)));
    cache = parts.join("\n");
    return cache;
  }

  function refresh() { cache = null; }   // hook the dev watcher calls on change

  return { css, refresh };
}
