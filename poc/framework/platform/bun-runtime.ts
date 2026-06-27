// /framework/platform/bun-runtime.ts — the only Bun adapter for file access
import type { Runtime } from "./runtime.ts";

export const bunRuntime: Runtime = {
  readFile: (p) => Bun.file(p).text(),
  fileExists: (p) => Bun.file(p).exists(),
};
