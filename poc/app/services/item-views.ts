// /app/services/item-views.ts — view models live with the app layer
import type { Item } from "../domain/item.ts";

export interface ItemCardView {
  id: string;
  name: string;
  detailUrl: string;
  status: { label: string; tone: "active" | "archived" };   // tone → b-badge attribute
  archive: { label: string; action: string };               // button label + hx-post target
}

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
