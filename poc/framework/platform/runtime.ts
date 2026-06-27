// /framework/platform/runtime.ts — the runtime port (file access)
export interface Runtime {
  readFile(path: string): Promise<string>;
  fileExists(path: string): Promise<boolean>;
}
