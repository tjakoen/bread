// /app/data/in-memory-item-repository.ts — wired-in placeholder, zero deps
import type { Item, NewItem } from "../domain/item.ts";
import type { ItemRepository } from "./item-repository.ts";

export class InMemoryItemRepository implements ItemRepository {
  private rows = new Map<string, Item>();
  private seq = 0;
  constructor(seed: Item[] = []) { for (const r of seed) this.rows.set(r.id, r); }

  async list() { return [...this.rows.values()].sort((a, b) => +b.createdAt - +a.createdAt); }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async create(input: NewItem) {
    const now = new Date();
    const item: Item = { ...input, id: `ITM-${++this.seq}`, createdAt: now, updatedAt: now };
    this.rows.set(item.id, item);
    return item;
  }
  async update(id: string, patch: Partial<NewItem>) {
    const cur = this.rows.get(id);
    if (!cur) throw new Error("Item not found");
    const next = { ...cur, ...patch, updatedAt: new Date() };
    this.rows.set(id, next);
    return next;
  }
  async remove(id: string) { this.rows.delete(id); }
}
