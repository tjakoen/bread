// /app/domain/item.ts — models, ZERO dependencies
export interface Item {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";   // union, not enum (erasable)
  createdAt: Date;
  updatedAt: Date;
}

// Input for creation — the fields a caller supplies.
export type NewItem = Omit<Item, "id" | "createdAt" | "updatedAt">;
