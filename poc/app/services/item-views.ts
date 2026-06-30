// /app/services/item-views.ts — view models live with the app layer
import type { Item } from "../domain/item.ts";
import { surface, type ActionName, type Surface } from "../ai/contract.ts";

export interface ItemCardView {
  id: string;
  name: string;
  detailUrl: string;
  status: { label: string; tone: "active" | "archived" };   // tone → b-badge attribute
  archive: { label: string; action: string };               // button label + hx-post target
}

// View for the AI-loop demo card (docs/AI-INTERFACE.md §7). Carries its SURFACE
// address and an action verb; `commit` is always "committed" server-side — the
// client stamps "pending" (grain) optimistically, the confirmed re-render is clean.
export interface LoopCardView {
  surface: Surface;                          // surface("item", id)
  commit: "committed";
  name: string;
  status: { label: string };
  action: { name: ActionName | ""; label: string };   // typed verb; "" → inert (no data-action)
}

export const toLoopCardView = (item: Item): LoopCardView => ({
  surface: surface("item", item.id),
  commit: "committed",
  name: item.name,
  status: { label: item.status === "active" ? "Active" : "Archived" },
  action: item.status === "active"
    ? { name: "item.archive", label: "Archive" }
    : { name: "", label: "Archived" },
});

export const toItemCardView = (item: Item): ItemCardView => ({
  id: item.id,
  name: item.name,
  detailUrl: `/items/${item.id}`,
  status: item.status === "active"
    ? { label: "Active",   tone: "active" }
    : { label: "Archived", tone: "archived" },
  archive: item.status === "active"
    ? { label: "Archive",  action: `/ui/items/${item.id}/archive` }
    : { label: "Archived", action: "" },          // empty action → engine omits hx-post (inert)
});
