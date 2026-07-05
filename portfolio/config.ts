// portfolio/config.ts — env-driven switches + where each concern lives on disk.
// Paths are relative to the repo root (we run `bun portfolio/server.ts` from there).
const isDev = (Bun.env.NODE_ENV ?? "development") !== "production";
export const config = {
  isDev,
  port: Number(Bun.env.PORT ?? 3000),

  // components come from the GRAIN design system (b-*) and the portfolio (its own
  // frame + bespoke surfaces + the /loop demo's task-card/loop-card/task-list).
  componentRoots: ["./grain/components", "./portfolio/components"],
  // the /components.css bundle = per-component CSS + (since this app uses the AI
  // interface) GRAIN's optional AI module CSS (grain/ai/ai.css). GRAIN's page-level
  // stylesheets (tokens / base / grade mechanism) are LINKED, not bundled — see /styles.
  // A no-AI app would simply drop "./grain/ai" here.
  styleRoots: ["./grain/components", "./portfolio/components", "./grain/ai"],
  // ONE pages tree now: the portfolio IS the app (the composition root folded in here).
  // It owns "/" (home), "/grain"·"/batch" (showcases), and the /loop + /about demo pages.
  pagesDir: "./portfolio/pages",

  // static asset prefixes → their dir. GRAIN ships the design system's styles, fonts,
  // and islands; the portfolio keeps only its vendored libs and its own island(s).
  assetDirs: {
    "/styles": "./grain/styles",      // GRAIN's default theme: variables (tokens) + global (base) + grain (grade mechanism)
    "/vendor": "./portfolio/vendor",
    "/scripts": "./grain/scripts",
    "/assets": "./grain/assets",      // GRAIN's shared static assets (the icon sprite → b-icon)
    "/site": "./portfolio/scripts",   // the portfolio's own island(s): site.js (THE EDITOR chrome behaviors)
  } as Record<string, string>,
  fontsDir: "./grain/fonts",          // the Redaction grades — GRAIN's signature (grain = AI)

  missingBindings: (isDev ? "warn" : "ignore") as "ignore" | "warn" | "throw",
  hotReload: isDev,
};
