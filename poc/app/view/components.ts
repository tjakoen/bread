// /app/view/components.ts — thin wrappers over render()
import { render } from "./renderer.ts";
import type { ItemCardView, LoopCardView } from "../services/item-views.ts";
export const ItemCard   = (view: ItemCardView) => render("item-card", view);
export const LoopCard   = (view: LoopCardView) => render("loop-card", view);
export const ItemList   = (data: { title: string; items: ItemCardView[] }) =>
  render("item-list", data);
export const EmptyState = () => render("empty-state", {});
