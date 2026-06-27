// /app/view/renderer.ts — the app's renderer, framework factory + app config
import { createRenderer } from "../../framework/render/render.ts";
import { config } from "../config.ts";
export const { render, renderPage, refresh } = createRenderer({
  componentsDir: config.componentsDir,
  missing: config.missingBindings,           // "warn" in dev, "ignore" in prod
});
