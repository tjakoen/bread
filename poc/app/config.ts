// /app/config.ts — env-driven dev/prod switches
const isDev = (Bun.env.NODE_ENV ?? "development") !== "production";
export const config = {
  isDev,
  port: Number(Bun.env.PORT ?? 3000),
  componentsDir: "./frontend/components",
  frontendDir: "./frontend",                 // root for global assets (styles, vendor)
  pagesDir: "./frontend/pages",              // root for the folder-per-page tree
  missingBindings: (isDev ? "warn" : "ignore") as "ignore" | "warn" | "throw",
  hotReload: isDev,
};
