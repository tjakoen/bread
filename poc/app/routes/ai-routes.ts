// /app/routes/ai-routes.ts — the AI interaction surface:
//   GET  /ui/loop          initial card list (htmx loads it; the demo screen)
//   POST /intent           THE ONE DOOR — every human/AI interaction enters here
//   GET  /stream           per-session SSE channel (server→client push)
//   GET  /ai/manifest      the AI's instruction manual for a screen
import type { ItemService } from "../services/item-service.ts";
import type { Stream } from "../../framework/http/stream.ts";
import type { Accepts } from "../../framework/render/accepts.ts";
import type { InteractionLayer } from "../ai/interaction-layer.ts";
import type { Intent, ActionName } from "../ai/contract.ts";
import { isAction, actionsForKind, surface } from "../ai/contract.ts";
import { LoopCard } from "../view/components.ts";
import { toLoopCardView } from "../services/item-views.ts";
import { buildManifest, type ManifestTarget } from "../ai/manifest.ts";

const htmlFragment = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

// A well-formed Intent, or null. The door never trusts the client's shape.
function parseIntent(b: unknown, sessionFallback: string): Intent | null {
  if (b == null || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  if (typeof o.surface !== "string" || typeof o.action !== "string") return null;
  if (!isAction(o.action)) return null;
  return {
    source: o.source === "ai" ? "ai" : "user",
    session: typeof o.session === "string" && o.session ? o.session : sessionFallback,
    screen: typeof o.screen === "string" ? o.screen : "",
    surface: o.surface,
    action: o.action,
    payload: o.payload && typeof o.payload === "object" ? (o.payload as Record<string, unknown>) : {},
  };
}

export function buildAiRoutes(service: ItemService, stream: Stream, layer: InteractionLayer, accepts: Accepts) {
  return {
    "/ui/loop": {
      GET: async () => {
        const items = await service.listItems();
        const cards = await Promise.all(items.map((i) => LoopCard(toLoopCardView(i))));
        return htmlFragment(cards.join("") || `<p class="muted">No items.</p>`);
      },
    },

    "/intent": {
      POST: async (req: Request) => {
        let body: unknown;
        try { body = await req.json(); } catch { return Response.json({ error: "invalid JSON" }, { status: 400 }); }
        const intent = parseIntent(body, "anon");
        if (!intent) return Response.json({ error: "invalid intent" }, { status: 400 });
        // Fire-and-forget: the door acknowledges immediately; the confirmation (or
        // rollback) lands over SSE. That's the proof the push channel is real.
        void layer.handleIntent(intent).catch((e) => console.error("[/intent]", e));
        return new Response(null, { status: 202 });
      },
    },

    "/stream": {
      GET: (req: Request) => {
        const session = new URL(req.url).searchParams.get("session") ?? "anon";
        return stream.subscribe(session);
      },
    },

    "/ai/manifest": {
      GET: async (req: Request) => {
        const screen = new URL(req.url).searchParams.get("screen") ?? "loop";
        const items = await service.listItems();
        // accepts are DERIVED, never hand-typed (AI-INTERFACE §4):
        //  - regions: inverted from the action registry (actionsForKind)
        //  - items: harvested from the loop-card component (data-accepts), narrowed by state
        const itemAccepts = (accepts.byKind()["item"] ?? []) as ActionName[];
        const targets: ManifestTarget[] = [
          { id: surface("say-line"), kind: "say-line", accepts: actionsForKind("say-line") },
          { id: surface("say-stream"), kind: "say-stream", accepts: actionsForKind("say-stream") },
          ...items.map((i) => ({
            id: surface("item", i.id),
            kind: "item",
            accepts: i.status === "active" ? itemAccepts : [],
          })),
        ];
        return Response.json(buildManifest(screen, targets, { itemCount: items.length }));
      },
    },
  };
}
