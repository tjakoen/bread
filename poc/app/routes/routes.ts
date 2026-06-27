// /app/routes/routes.ts — build the native routes object from the service
import type { ItemService } from "../services/item-service.ts";
import { ItemCard, ItemList, EmptyState } from "../view/components.ts";
import { requireString, HttpError } from "../../framework/http/validate.ts";
import { toItemCardView } from "../services/item-views.ts";
import { jsonError } from "../../framework/http/errors.ts";

const htmlFragment = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// htmx posts application/x-www-form-urlencoded (or multipart) by DEFAULT — never JSON.
const formFields = async (req: Request): Promise<Record<string, unknown>> => {
  const fd = await req.formData();
  return Object.fromEntries(fd.entries());
};

// parse a JSON body as an object, turning malformed/non-object bodies into 400s (not 500s)
const jsonBody = async (req: Request): Promise<Record<string, unknown>> => {
  let b: unknown;
  try { b = await req.json(); }
  catch { throw new HttpError(400, "Invalid JSON body"); }
  if (b == null || typeof b !== "object") throw new HttpError(400, "Body must be a JSON object");
  return b as Record<string, unknown>;
};

export function buildRoutes(service: ItemService) {
  return {
    // ---- /ui : HTML fragments (htmx targets these; bodies are form-encoded) ----
    "/ui/items": {
      GET: async () => {
        const views = await service.listCardViews();
        return htmlFragment(views.length ? await ItemList({ title: "Items", items: views }) : await EmptyState());
      },
      POST: async (req: Request) => {
        try {
          const b = await formFields(req);
          const item = await service.createItem(requireString(b.name, "name"), requireString(b.description, "description"));
          return htmlFragment(await ItemCard(toItemCardView(item)));   // map domain → view
        } catch (e) {
          // htmx swaps 2xx by default; keep 200 with an error fragment. Escape the message.
          if (e instanceof HttpError) return htmlFragment(`<p class="error">${escHtml(e.message)}</p>`);
          console.error(e); return htmlFragment(`<p class="error">Something went wrong.</p>`);
        }
      },
    },
    "/ui/items/:id": {
      GET: async (req: Request & { params: { id: string } }) => {
        const item = await service.getItem(req.params.id);
        if (!item) return htmlFragment(`<p class="error">Not found</p>`, 404);
        return htmlFragment(await ItemCard(toItemCardView(item)));
      },
    },
    "/ui/items/:id/archive": {
      POST: async (req: Request & { params: { id: string } }) => {
        const existing = await service.getItem(req.params.id);
        if (!existing) return htmlFragment(`<p class="error">Not found</p>`, 404);
        const updated = await service.archiveItem(req.params.id);
        return htmlFragment(await ItemCard(toItemCardView(updated)));
      },
    },

    // ---- /api : JSON (other consumers; same service, one consistent shape) ----
    "/api/items": {
      GET: async () => Response.json(await service.listItems()),
      POST: async (req: Request) => {
        try {
          const b = await jsonBody(req);
          const item = await service.createItem(requireString(b.name, "name"), requireString(b.description, "description"));
          return Response.json(item, { status: 201 });          // domain shape — same as GET
        } catch (e) { return jsonError(e); }
      },
    },
    "/api/items/:id": {
      GET: async (req: Request & { params: { id: string } }) => {
        const item = await service.getItem(req.params.id);
        return item ? Response.json(item) : Response.json({ error: "not found" }, { status: 404 });
      },
      DELETE: async (req: Request & { params: { id: string } }) => {
        await service.deleteItem(req.params.id);
        return new Response(null, { status: 204 });
      },
    },
  };
}
