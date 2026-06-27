// /framework/platform/watch.ts — dev hot-reload watcher
import { watch } from "fs";

// Fires on .html (templates), .css (co-located styles), .md (catalog docs) edits.
export function watchComponents(dir: string, onChange: () => void): void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  watch(dir, { recursive: true }, (_event, file) => {
    const name = file ? String(file) : "";
    if (!name.endsWith(".html") && !name.endsWith(".css") && !name.endsWith(".md")) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { onChange(); console.log(`↻ reloaded components (${name})`); }, 50);
  });
}
