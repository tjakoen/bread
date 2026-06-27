// /app/data/item-repository.ts — the port the service depends on
import type { Item, NewItem } from "../domain/item.ts";

export interface ItemRepository {
  list(): Promise<Item[]>;
  findById(id: string): Promise<Item | null>;
  create(input: NewItem): Promise<Item>;
  update(id: string, patch: Partial<NewItem>): Promise<Item>;
  remove(id: string): Promise<void>;
}
