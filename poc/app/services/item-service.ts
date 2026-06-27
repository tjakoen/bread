// /app/services/item-service.ts
import type { Item } from "../domain/item.ts";
import type { ItemRepository } from "../data/item-repository.ts";
import { type ItemCardView, toItemCardView } from "./item-views.ts";

export class ItemService {
  private items: ItemRepository;
  constructor(items: ItemRepository) { this.items = items; }   // explicit field (erasable)

  // domain-returning — the basis for BOTH representations
  listItems(): Promise<Item[]> { return this.items.list(); }
  getItem(id: string): Promise<Item | null> { return this.items.findById(id); }
  createItem(name: string, description: string): Promise<Item> {
    return this.items.create({ name, description, status: "active" });
  }
  archiveItem(id: string): Promise<Item> { return this.items.update(id, { status: "archived" }); }
  deleteItem(id: string): Promise<void> { return this.items.remove(id); }

  // view-returning convenience for /ui reads
  async listCardViews(): Promise<ItemCardView[]> {
    return (await this.items.list()).map(toItemCardView);
  }
  async getCardView(id: string): Promise<ItemCardView> {
    const item = await this.items.findById(id);
    if (!item) throw new Error("Item not found");
    return toItemCardView(item);
  }
}
