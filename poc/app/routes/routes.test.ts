import { expect, test, beforeAll, afterAll } from "bun:test";
import { InMemoryItemRepository } from "../data/in-memory-item-repository.ts";
import { ItemService } from "../services/item-service.ts";
import { buildRoutes } from "./routes.ts";

let server: ReturnType<typeof Bun.serve>; let base: string;
beforeAll(() => {
  const service = new ItemService(new InMemoryItemRepository());
  server = Bun.serve({ port: 0, routes: buildRoutes(service), fetch: () => new Response("404", { status: 404 }) });
  base = `http://localhost:${server.port}`;
});
afterAll(() => server.stop());

test("/ui/items returns an HTML fragment", async () => {
  const res = await fetch(`${base}/ui/items`);
  expect(res.headers.get("content-type")).toContain("text/html");
});
test("/api/items returns JSON", async () => {
  const res = await fetch(`${base}/api/items`);
  expect(res.headers.get("content-type")).toContain("application/json");
  expect(Array.isArray(await res.json())).toBe(true);
});
test("/api POST validates (400) then creates (201)", async () => {
  expect((await fetch(`${base}/api/items`, { method:"POST", body:"{}" })).status).toBe(400);
  const ok = await fetch(`${base}/api/items`, { method:"POST", body: JSON.stringify({ name:"X", description:"d" }) });
  expect(ok.status).toBe(201);
});
test("/ui POST accepts htmx form encoding (not JSON)", async () => {
  const res = await fetch(`${base}/ui/items`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: "X", description: "d" }),
  });
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/html");
});
test("native :id param + 404", async () => {
  expect((await fetch(`${base}/api/items/nope`)).status).toBe(404);
});
