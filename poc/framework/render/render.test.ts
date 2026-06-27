import { expect, test } from "bun:test";
import { createRenderer } from "./render.ts";
const r = createRenderer({ componentsDir: "./frontend/components", missing: "ignore" });

const view = (over: Record<string, unknown> = {}) => ({
  id: "X1", name: "Plain", detailUrl: "/x1",
  status: { label: "Active", tone: "active" },
  archive: { label: "Archive", action: "/ui/items/X1/archive" },
  ...over,
});

test("escapes hostile text", async () => {
  const out = await r.render("item-list",
    { title: "T", items: [view({ name: "<script>alert(1)</script>" })] });
  expect(out).toContain("&lt;script&gt;");
  expect(out).not.toContain("<script>alert");
});

test("drops javascript: scheme in a data-bound URL attribute", async () => {
  // item-card's archive button binds hx-post from data — the scheme guard applies there
  const bad = await r.render("item-card", {
    id: "X", name: "n", status: { tone: "active", label: "A" },
    archive: { action: "javascript:alert(1)", label: "go" },
  });
  expect(bad).not.toContain("javascript:");        // unsafe scheme stripped to empty
});

test("child HTML with $ sequences splices verbatim (no $&/$$ corruption)", async () => {
  const out = await r.render("item-list",
    { title: "Pay $5 & up", items: [view({ name: "$& $$ $1" })] });
  expect(out).toContain("$&amp; $$ $1");           // literal, not pattern-substituted
});

test("strict mode catches a binding the data does not provide", async () => {
  const strict = createRenderer({ componentsDir: "./frontend/components", missing: "throw" });
  await expect(strict.render("b-badge", { lbel: "typo", cssClass: "b" }))
    .rejects.toThrow(/unknown binding "label"/);
});
