// e2e/loop.spec.ts — the /loop demo, exercised through a real browser. This is the only
// tier that validates the CLIENT dispatcher (grain/scripts/ai-dispatch.js): a real click /
// keypress → POST /intent → SSE op → DOM mutation, plus the native <dialog> palette.
import { test, expect } from "@playwright/test";

test.describe("/loop — the desk", () => {
  test("human: typing a request + Enter makes the desk reply in the reflection line", async ({ page }) => {
    await page.goto("/loop");
    const input = page.locator('input[data-surface="ask-input"]');
    await input.fill("plan my thursday");
    await input.press("Enter");
    // round-trip: dispatcher → /intent → reasoner → SSE type ops → applyType writes the line
    await expect(page.locator('[data-surface="reflection"]')).toContainText("Noted");
  });

  test("⌘K opens the command palette <dialog>, Escape closes it", async ({ page }) => {
    await page.goto("/loop");
    const palette = page.locator("dialog.cmdk");
    await expect(palette).toBeHidden();
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();
    await expect(page.locator("dialog.cmdk input")).toBeFocused();   // native focus-trap moved focus in
    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();                              // native Escape-to-close
  });

  test('"Watch the desk work" raises the spotlight and writes the plan list', async ({ page }) => {
    await page.goto("/loop");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();          // the desk is acting
    await expect(page.locator('[data-surface="plan-item:1"]'))               // it drafts the plan…
      .toContainText("Deep-work", { timeout: 20_000 });
    await expect(page.locator(".ai-backdrop")).not.toHaveClass(/is-on/, { timeout: 30_000 });   // …then hands back
  });
});
